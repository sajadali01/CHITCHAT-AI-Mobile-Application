const { chatWithGroq } = require("../aiService");
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

const resolveUserId = async (req) => {
  // Try to get MongoDB _id from req.user (if already populated)
  if (req.user && req.user._id) return req.user._id;
  // If Firebase UID is present, look up the user
  if (req.user && req.user.uid) {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (user) return user._id;
  }
  // Fallback: try userId in body/query
  if (req.body && req.body.userId) return req.body.userId;
  if (req.query && req.query.userId) return req.query.userId;
  return null;
};

// @desc    Get all chat messages
// @route   GET /api/chat/messages
// @access  Private (requires authentication)
exports.getMessages = async (req, res) => {
  try {
    const { groupId } = req.query;
    const userId = await resolveUserId(req);
    const filter = groupId ? { groupId } : {};
    // Exclude messages deleted for this user
    if (userId) {
      filter.deletedFor = { $ne: userId };
    }
    const messages = await ChatMessage
      .find(filter)
      .sort({ createdAt: 1 });

    const mapped = messages.map(msg => {
      // Handle AI messages
      if (msg.isAI) {
        return {
          id: msg._id,
          text: msg.content,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: msg.createdAt,
          isAI: true,
        };
      }
      
      // Handle user messages - populate user data only for user messages
      const messageData = {
        id: msg._id,
        text: msg.content,
        senderId: msg.user,
        senderName: 'Unknown', // Will be updated below
        timestamp: msg.createdAt,
        isAI: false,
      };

      // Add forwarded message information if applicable
      if (msg.isForwarded) {
        messageData.isForwarded = true;
        messageData.forwardedFrom = msg.forwardedFrom || 'Unknown';
        messageData.forwardedFromGroup = msg.forwardedFromGroup || 'Unknown Group';
      }

      return messageData;
    });

    // Get user data for user messages only
    const userMessageIds = messages
      .filter(msg => !msg.isAI)
      .map(msg => msg.user)
      .filter(userId => userId && typeof userId === 'object'); // Only ObjectIds

    if (userMessageIds.length > 0) {
      const users = await User.find({ _id: { $in: userMessageIds } });
      const userMap = new Map(users.map(user => [user._id.toString(), user]));

      // Update sender names for user messages
      mapped.forEach((msg, index) => {
        if (!msg.isAI && messages[index].user) {
          const user = userMap.get(messages[index].user.toString());
          if (user) {
            msg.senderName = user.name;
          }
        }
      });
    }

    res.status(200).json(mapped);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send new chat message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { content, groupId, replyTo, userId } = req.body;
  const uid = userId;

  if (!content || !groupId) {
    return res.status(400).json({ message: 'Content and groupId are required' });
  }

  try {
    const user = await User.findOne({ _id: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMsg = new ChatMessage({
      user: uid,
      content,
      groupId,
      createdAt: new Date(),
    });
    await newMsg.save();
    await newMsg.populate('user', 'name profileImage');

    const messageData = {
      id: newMsg._id,
      text: newMsg.content,
      senderId: newMsg.user?._id,
      senderName: newMsg.user?.name || 'Unknown',
      timestamp: newMsg.createdAt,
      isAI: false,
      groupId,
    };

    // Add forwarded message information if applicable
    if (newMsg.isForwarded) {
      messageData.isForwarded = true;
      messageData.forwardedFrom = newMsg.forwardedFrom || 'Unknown';
      messageData.forwardedFromGroup = newMsg.forwardedFromGroup || 'Unknown Group';
    }

    const io = getIO();
    io.to(groupId).emit('newMessage', messageData);

    res.status(201).json(messageData);
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as seen
// @route   PATCH /api/chat/messages/seen
// @access  Private
exports.markMessageSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    await ChatMessage.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Soft delete a message for the current user
// @route   POST /api/chat/messages/:id/delete
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = await resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    // Only add if not already present
    if (!message.deletedFor) message.deletedFor = [];
    // Convert all IDs to string for comparison, but store as ObjectId
    if (!message.deletedFor.map(id => id.toString()).includes(userId.toString())) {
      message.deletedFor.push(userId);
      await message.save();
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message to AI and get response (only on @AI mention)
// @route   POST /api/chat/ai-message
// @access  Private

// @desc    Generate chat summary
// @route   POST /api/chat/summary
// @access  Private
exports.generateSummary = async (req, res) => {
  try {
    const { groupId, days, messageCount } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: "GroupId is required" });
    }

    let filter = { groupId };
    let limit = null;

    // Handle time-based summary (days)
    if (days && days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filter.createdAt = { $gte: cutoffDate };
    }
    // Handle message-count-based summary
    else if (messageCount && messageCount > 0) {
      limit = messageCount;
    }

    // Fetch messages from database
    let query = ChatMessage.find(filter).sort({ createdAt: -1 });
    if (limit) {
      query = query.limit(limit);
    }

    const messages = await query.exec();

    if (messages.length === 0) {
      return res.status(200).json({ 
        summary: "No messages found for the specified criteria." 
      });
    }

    // Format messages for AI
    const formattedMessages = messages.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: `${msg.isAI ? 'AI Assistant' : 'User'}: ${msg.content}`
    }));

    // Create custom prompt for summary
    const summaryPrompt = [
      {
        role: 'system',
        content: `You are a helpful assistant that generates concise summaries of chat conversations. 
        Create a well-structured summary that includes:
        - Key topics discussed
        - Important decisions made
        - Action items mentioned
        - Overall conversation tone
        Keep the summary clear and organized.`
      },
      {
        role: 'user',
        content: `Please provide a summary of the following chat conversation:\n\n${formattedMessages.map(msg => msg.content).join('\n')}`
      }
    ];

    console.log("📊 Generating summary for", messages.length, "messages");
    const summary = await chatWithGroq(summaryPrompt);

    const aiMessage = new ChatMessage({
          user: 'ai-assistant',
          content: summary,
          groupId: groupId,
          createdAt: new Date(),
          isAI: true,
        });
        await aiMessage.save();
    
    res.json({ 
      summary: summary,
      messageCount: messages.length,
      timeRange: days ? `${days} day(s)` : 'recent messages'
    });

  } catch (error) {
    console.error("❌ Summary generation error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

// @desc    Forward a message to another group
// @route   POST /api/chat/messages/:id/forward
// @access  Private
exports.forwardMessage = async (req, res) => {
  try {
    // FIX: Use req.params.id to match the route
    const originalMessageId = req.params.id;
    const { targetGroupId, userId } = req.body;

    if (!targetGroupId || !userId) {
      return res.status(400).json({ message: 'Target group ID and user ID are required' });
    }

    // Find the original message
    const originalMessage = await ChatMessage.findById(originalMessageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    // Get the user who is forwarding
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the original sender's name
    let originalSenderName = 'Unknown';
    if (originalMessage.isAI) {
      originalSenderName = 'AI Assistant';
    } else if (originalMessage.user) {
      const originalUser = await User.findById(originalMessage.user);
      if (originalUser) {
        originalSenderName = originalUser.name;
      }
    }

    // Get the original group name
    const Group = require('../models/Group');
    const originalGroup = await Group.findById(originalMessage.groupId);
    const originalGroupName = originalGroup ? originalGroup.name : 'Unknown Group';

    // Create the forwarded message
    const forwardedMessage = new ChatMessage({
      user: userId,
      content: originalMessage.content,
      groupId: targetGroupId,
      createdAt: new Date(),
      isAI: false,
      isForwarded: true,
      originalMessageId: originalMessage._id,
      forwardedFrom: originalSenderName,
      forwardedFromGroup: originalGroupName,
    });

    await forwardedMessage.save();
    await forwardedMessage.populate('user', 'name profileImage');

    const messageData = {
      id: forwardedMessage._id,
      text: forwardedMessage.content,
      senderId: forwardedMessage.user?._id,
      senderName: forwardedMessage.user?.name || 'Unknown',
      timestamp: forwardedMessage.createdAt,
      isAI: false,
      isForwarded: true,
      forwardedFrom: originalSenderName,
      forwardedFromGroup: originalGroupName,
      groupId: targetGroupId,
    };

    // Emit to the target group
    const io = getIO();
    io.to(targetGroupId).emit('newMessage', messageData);

    res.status(201).json(messageData);
  } catch (error) {
    console.error('❌ Error forwarding message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.sendAIMessage = async (req, res) => {
  try {
    const { groupId, messages, userId } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const lastMessage = messages[messages.length - 1]?.text || "";
    const hasMention = /@ai/i.test(lastMessage);

    if (!hasMention) {
      return res.status(200).json({ response: "" });
    }

    // --- Handle @AI summary ---
    const summaryMatch = lastMessage.match(/@ai\s+summary\s*(\d+)?/i);
    if (summaryMatch) {
      const days = summaryMatch[1];

      if (!days) {
        console.log("🔍 No days specified for summary, sending instruction message");
        // No days specified, send instructional message and store as AI message
        const instruction = `To generate a summary, please specify the number of days.\n\nFor example:\n@AI summary 3\n\nThis will generate a summary of the last 3 days of messages.`;
        const aiMessage = new ChatMessage({
          user: 'ai-assistant',
          content: instruction,
          groupId: groupId,
          createdAt: new Date(),
          isAI: true,
        });
        await aiMessage.save();

        // Emit to group
        const io = getIO();
        io.to(groupId).emit('newMessage', {
          id: aiMessage._id,
          text: aiMessage.content,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: aiMessage.createdAt,
          isAI: true,
          groupId,
        });

        return res.status(200).json({ response: instruction });
      }

      // Generate summary for specified days
      // Fetch messages from DB for the given group and days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days, 10));
      const filter = { groupId, createdAt: { $gte: cutoffDate } };
      const chatMessages = await ChatMessage.find(filter).sort({ createdAt: 1 });

      if (chatMessages.length === 0) {
        const noMsg = `No messages found in the last ${days} day(s) to summarize.`;
        const aiMessage = new ChatMessage({
          user: 'ai-assistant',
          content: noMsg,
          groupId: groupId,
          createdAt: new Date(),
          isAI: true,
        });
        await aiMessage.save();

        // Emit to group
        const io = getIO();
        io.to(groupId).emit('newMessage', {
          id: aiMessage._id,
          text: aiMessage.content,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: aiMessage.createdAt,
          isAI: true,
          groupId,
        });

        return res.status(200).json({ response: noMsg });
      }

      // Format messages for AI
      const formattedMessages = chatMessages.map(msg => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: `${msg.isAI ? 'AI Assistant' : 'User'}: ${msg.content}`
      }));

      const summaryPrompt = [
        {
          role: 'system',
          content: `You are a helpful assistant that generates concise summaries of chat conversations. 
          Create a well-structured summary that includes:
          - Key topics discussed
          - Important decisions made
          - Action items mentioned
          - Overall conversation tone
          Keep the summary clear and organized.`
        },
        {
          role: 'user',
          content: `Please provide a summary of the following chat conversation:\n\n${formattedMessages.map(msg => msg.content).join('\n')}`
        }
      ];

      const summary = await chatWithGroq(summaryPrompt);
      console.log("📊 Generated summary:", summary);
      // Store summary as AI message (persist in DB and emit to group) -- use same logic as normal AI response
      if (typeof summary === 'string' && summary.trim() !== "") {
        try {
          const aiMessage = new ChatMessage({
            user: 'ai-assistant',
            content: summary,
            groupId: groupId,
            createdAt: new Date(),
            isAI: true,
          });
          await aiMessage.save();

          // Emit to group
          const io = getIO();
          io.to(groupId).emit('newMessage', {
            id: aiMessage._id,
            text: aiMessage.content,
            senderId: 'ai-assistant',
            senderName: 'AI Assistant',
            timestamp: aiMessage.createdAt,
            isAI: true,
            groupId,
          });

          // Log for debug
          console.log("💾 AI response saved to database");
        } catch (err) {
          console.error('❌ Failed to save AI summary message:', err);
        }
        return res.status(200).json({ response: summary });
      } else {
        // If summary is empty, return a message but do not store
        console.error('❌ AI summary is empty or not a string:', summary);
        return res.status(200).json({ response: "No summary could be generated." });
      }
    }
    // --- End @AI summary handling ---

    // Prepare messages for AI (normal @AI mention)
    const formattedMessages = [
      {
        role: "system",
        content: "You are ChitChat AI, a helpful assistant that only replies when '@AI' is mentioned in a message.",
      },
      ...messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text?.trim() || msg.content?.trim() || "[empty]",
      }))
    ];

    console.log("📦 Raw messages:", messages);
    console.log("📦 Formatted messages:", formattedMessages);

    const aiResponse = await chatWithGroq(formattedMessages);
    // console.log("✅ AI Response:", aiResponse);

    // Save AI response to database for persistence
    if (aiResponse && aiResponse !== "*no response*") {
      try {
        const aiMessage = new ChatMessage({
          user: 'ai-assistant', // String ID for AI
          content: aiResponse,
          groupId: groupId,
          createdAt: new Date(),
          isAI: true,
        });

        await aiMessage.save();

        // Emit to group
        const io = getIO();
        io.to(groupId).emit('newMessage', {
          id: aiMessage._id,
          text: aiMessage.content,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: aiMessage.createdAt,
          isAI: true,
          groupId,
        });

        console.log("💾 AI response saved to database");
      } catch (dbError) {
        console.error("❌ Failed to save AI response to database:", dbError);
        // Continue without saving - frontend will handle it locally
      }
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ AI error full:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

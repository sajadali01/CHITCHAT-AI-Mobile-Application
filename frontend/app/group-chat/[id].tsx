import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, CornerDownLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import {
  getMessages,
  sendMessage,
  getGroups,
  getGroup,
  sendAIMessage,
  generateSummary,
  deleteMessage as deleteMessageAPI,
  forwardMessage as forwardMessageAPI,
  togglePinMessage as togglePinMessageAPI,
} from '@/services/api';
import { Message, Group } from '@/types';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';

// Socket connection
const SOCKET_URL = 'http://10.138.62.96:5000'; // Change to your backend URL
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
});

// Add connection status handling
socket.on('connect', () => {
  console.log('✅ Socket connected');
});

socket.on('connect_error', (error) => {
  console.log('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 Socket disconnected:', reason);
});

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('ID : ', id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true); // Only for group data
  const [loadingMessages, setLoadingMessages] = useState(false); // For messages (non-blocking)
  const [aiTyping, setAiTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    subtitle: '',
    onConfirm: () => {},
  });

  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedForwardMessage, setSelectedForwardMessage] =
    useState<Message | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const storageKey = `${user?.id}_group_${id}_messages`;

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Socket.IO setup
  useEffect(() => {
    if (user?.id && id) {
      // Connect user and join group when socket is ready
      const handleSocketReady = () => {
        socket.emit('userConnected', user.id);
        socket.emit('joinGroup', id);
        console.log('✅ Joined group:', id);
      };

      if (socket.connected) {
        handleSocketReady();
      } else {
        socket.on('connect', handleSocketReady);
      }

      // Listen for new messages
      socket.on('newMessage', (message: Message) => {
        console.log('📨 Received new message via Socket.IO:', message);
        setMessages((prev) => {
          // Deduplicate: Check if message already exists by ID
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (messageExists) {
            console.log('⚠️ Message already exists, skipping:', message.id);
            return prev;
          }
          
          // Skip if this is a message from the current user (we already added it optimistically)
          // The server response will update the temp message, so we don't need Socket.IO for our own messages
          if (message.senderId === user?.id && !message.isAI) {
            console.log('⚠️ Skipping own message from Socket.IO (already handled):', message.id);
            return prev;
          }
          
          // Add new message
          const updatedMessages = [...prev, message];
          
          // Save the last message when receiving new messages
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          AsyncStorage.setItem(
            `@lastMessage_${id}`,
            JSON.stringify({ lastMessage })
          ).catch(() => console.warn('Failed to save last message'));
          
          return updatedMessages;
        });
      });

      return () => {
        socket.emit('leaveGroup', id);
        socket.off('connect', handleSocketReady);
        socket.off('newMessage');
      };
    }
  }, [user?.id, id]);

  useEffect(() => {
    // Load group data first (needed for header)
    fetchGroupData();
    // Load messages in background (non-blocking)
    loadMessagesFromStorage();
    fetchAllGroups();
  }, [id]);

  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      saveMessagesToStorage(messages);
      // Scroll to bottom when messages finish loading
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [loadingMessages, messages, scrollToBottom]);

  // Add logging for debugging duplicate keys
  useEffect(() => {
    console.log(
      'Messages:',
      messages.map((m) => m.id)
    );
    console.log(
      'AllGroups:',
      allGroups.map((g) => g._id || g.id)
    );
  }, [messages, allGroups]);

  const fetchGroupData = async () => {
    try {
      setLoadingGroup(true);
      const groupData = await getGroup(id!);
      setGroup(groupData);
      
      // Load pinned message if group has one
      if (groupData.pinnedMessageId) {
        // Find the pinned message in the messages array
        // This will be set after messages are loaded
        const pinnedMsgId = typeof groupData.pinnedMessageId === 'object' 
          ? (groupData.pinnedMessageId._id || String(groupData.pinnedMessageId))
          : String(groupData.pinnedMessageId);
        // Store for later use when messages load
        setPinnedMessageId(pinnedMsgId);
      } else {
        setPinnedMessageId(null);
      }
    } catch {
      setConfirmationModal({
        visible: true,
        title: 'Error',
        subtitle: 'Failed to load group',
        onConfirm: () =>
          setConfirmationModal({ ...confirmationModal, visible: false }),
      });
    } finally {
      setLoadingGroup(false);
    }
  };

  const fetchAllGroups = async () => {
    const groups = await getGroups();
    const filtered = groups.filter((g) => (g._id || g.id) !== id);
    setAllGroups(filtered);
  };

  const loadMessagesFromStorage = async () => {
    try {
      setLoadingMessages(true);
      
      // Try to load from local storage first for instant display
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.messages && parsed.messages.length > 0) {
            // Show cached messages immediately
            setMessages(parsed.messages);
            setPinnedMessage(parsed.pinnedMessage || null);
            setReplyTo(null);
            console.log('✅ Loaded cached messages:', parsed.messages.length);
          }
        } catch (parseError) {
          console.log('Failed to parse stored messages');
        }
      }

      // Fetch fresh messages from backend in background
      console.log('📡 Fetching messages from backend for group:', id);
      const fetched = await getMessages(id!);
      let mapped = fetched.map((msg) => ({
        id: msg.id,
        text: msg.text,
        senderId: msg.senderId,
        senderName: msg.senderName,
        timestamp: msg.timestamp,
        isAI: msg.isAI,
        isForwarded: msg.isForwarded,
        forwardedFrom: msg.forwardedFrom,
        forwardedFromGroup: msg.forwardedFromGroup,
        pinned: msg.pinned || false,
      }));

      // Filter out messages sent before the user's clear time
      const clearKey = `${user?.id}_group_${id}_clearedAt`;
      const clearedAt = await AsyncStorage.getItem(clearKey);
      if (clearedAt) {
        mapped = mapped.filter(
          (msg) => new Date(msg.timestamp).getTime() > Number(clearedAt)
        );
      }

      // Update with fresh messages from backend
      setMessages(mapped);
      setReplyTo(null);
      
      // Set pinned message if group has one
      if (pinnedMessageId) {
        const pinned = mapped.find((msg) => msg.id === pinnedMessageId || msg.id === pinnedMessageId.toString());
        if (pinned) {
          setPinnedMessage(pinned);
        } else {
          setPinnedMessage(null);
        }
      } else {
        setPinnedMessage(null);
      }
      
      console.log('✅ Loaded fresh messages:', mapped.length);
    } catch (err: any) {
      console.error('❌ Error loading messages:', err);
      // Don't show error modal for message loading - just log it
      // User can still use the chat and receive real-time messages via Socket.IO
    } finally {
      setLoadingMessages(false);
    }
  };

  const saveMessagesToStorage = async (msgs: Message[]) => {
    try {
      const data = { messages: msgs, pinnedMessage };
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      console.warn('Failed to save messages locally.');
    }
  };

  const handleSendMessage = async (text: string) => {
    // Generate a unique temp ID
    const tempId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const tempMessage: Message = {
      id: tempId,
      text,
      senderId: user!.id,
      senderName: user!.name,
      timestamp: new Date().toISOString(),
      isAI: false,
      replyTo: replyTo
        ? { senderName: replyTo.senderName, text: replyTo.text }
        : undefined,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setReplyTo(null);

    try {
      // Always pass groupId (id!) to sendMessage
      const serverMessage = await sendMessage(id!, text, tempMessage.replyTo); // ✅ real backend
      
      // Replace temp message with server message (which has the real ID)
      // Socket.IO will also emit this, but we filter out our own messages in the Socket listener
      setMessages((prev) => {
        // Check if message already exists (from Socket.IO, though unlikely for our own message)
        const existingIndex = prev.findIndex((msg) => msg.id === serverMessage.id);
        if (existingIndex !== -1) {
          // Message already exists, just update it
          const updated = [...prev];
          updated[existingIndex] = {
            ...serverMessage,
            senderId: user!.id,
            senderName: user!.name,
            replyTo: tempMessage.replyTo,
          };
          return updated;
        }
        
        // Replace temp message with server message
        return prev.map((msg) =>
          msg.id === tempId
            ? {
                ...serverMessage,
                senderId: user!.id,
                senderName: user!.name,
                replyTo: tempMessage.replyTo,
              }
            : msg
        );
      });
      // Save the actual last message from the conversation (not just the user's sent message)
      const allMessages = [...messages, serverMessage];
      const lastMessage = allMessages[allMessages.length - 1];
      await AsyncStorage.setItem(
        `@lastMessage_${id}`,
        JSON.stringify({ lastMessage })
      );
      // Only trigger AI response if message contains @AI
      if (text.toLowerCase().includes('@ai')) {
        // Check for summary command first
        const isSummary = await handleSummaryGeneration(text);

        // If not a summary command, proceed with regular AI response
        if (!isSummary) {
          setTimeout(() => handleAIResponse(text), 1000);
        }
      }
    } catch (error) {
      console.log('❌ Error sending message:', error);
      // Don't remove the temp message on error - let it stay
      // The message was likely sent successfully to the backend
      // setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setConfirmationModal({
        visible: true,
        title: 'Warning',
        subtitle:
          'Message may not have been delivered to all users, but it was sent to the server.',
        onConfirm: () =>
          setConfirmationModal({ ...confirmationModal, visible: false }),
      });
    }
  };

  const handleAIResponse = async (userMessage: string) => {
    setAiTyping(true);
    try {
      // Format messages for backend AI function
      const formattedMessages = messages.map((msg) => ({
        sender: msg.senderId === 'ai-assistant' ? 'ai' : 'user',
        text: msg.text,
        content: msg.text,
      }));

      // Add the current user message
      formattedMessages.push({
        sender: 'user',
        text: userMessage,
        content: userMessage,
      });

      const aiResponse = await sendAIMessage(id!, formattedMessages);

      // AI response is saved to database, reload messages to show it
      if (aiResponse && aiResponse !== '*no response*') {
        console.log('🤖 AI Response received via API:', aiResponse);
        console.log('💡 AI message will be delivered via socket connection');
        // The socket listener will automatically add the AI message to the chat

        // console.log('🤖 AI Response received:', aiResponse);
        // // Reload messages from database to show AI response
        // setTimeout(() => {
        //   loadMessagesFromStorage();
        // }, 1000); // Give database time to save
      }
    } catch (err) {
      console.error('Failed to fetch AI response:', err);
    } finally {
      setAiTyping(false);
    }
  };

  const handleSummaryGeneration = async (text: string) => {
    try {
      // Extract days from text like "@AI summary 3" or "@AI summary 7 days"
      const summaryMatch = text.match(/@ai\s+summary\s+(\d+)/i);
      if (summaryMatch) {
        const days = parseInt(summaryMatch[1]);
        console.log('📊 Generating summary for last', days, 'days');

        const summaryData = await generateSummary(id!, days);

        // Create AI message with summary
        const summaryMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: `📊 **Chat Summary (Last ${days} days)**\n\n${summaryData.summary}\n\n*Based on ${summaryData.messageCount} messages*`,
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          timestamp: new Date().toISOString(),
          isAI: true,
        };

        setMessages((prev) => [...prev, summaryMessage]);

        // Update last message
        await AsyncStorage.setItem(
          `@lastMessage_${id}`,
          JSON.stringify({ lastMessage: summaryMessage })
        );

        return true; // Summary was generated
      }
      return false; // No summary command
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return false;
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    setConfirmationModal({
      visible: true,
      title: 'Delete Message',
      subtitle: 'Are you sure?',
      onConfirm: async () => {
        try {
          await deleteMessageAPI(msgId);
          setMessages((prev) => prev.filter((m) => m.id !== msgId));
        } catch (error) {
          alert('Failed to delete message. Please try again.');
        } finally {
          setConfirmationModal({ ...confirmationModal, visible: false });
        }
      },
    });
  };

  const handleClearChat = () => {
    setConfirmationModal({
      visible: true,
      title: 'Clear Chat',
      subtitle: 'Are you sure?',
      onConfirm: async () => {
        setMessages([]);
        setPinnedMessage(null);
        setReplyTo(null);

        // Store the clear timestamp for this user and group
        const clearKey = `${user?.id}_group_${id}_clearedAt`;
        await AsyncStorage.setItem(clearKey, Date.now().toString());

        // Remove local message storage as before
        await AsyncStorage.removeItem(storageKey);
        await AsyncStorage.removeItem(`@lastMessage_${id}`);

        setConfirmationModal({ ...confirmationModal, visible: false });
      },
    });
  };

  const handlePinMessage = async (msg: Message) => {
    try {
      const result = await togglePinMessageAPI(msg.id);
      
      if (result.pinned) {
        setPinnedMessage(msg);
      } else {
        setPinnedMessage(null);
      }
      
      // Update the group's pinned message ID
      if (group) {
        setGroup({
          ...group,
          pinnedMessageId: result.pinnedMessageId,
        });
      }
    } catch (error) {
      console.error('Failed to toggle message pin:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to pin/unpin message',
      });
    }
  };

  const handleForwardMessage = (msg: Message) => {
    setSelectedForwardMessage(msg);
    setForwardModalVisible(true);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const confirmForwarding = async () => {
    if (!selectedForwardMessage || selectedGroups.length === 0) {
      Alert.alert('Error', 'Please select at least one group to forward to.');
      return;
    }

    try {
      // Show loading state
      setForwardModalVisible(false);

      // Forward to each selected group
      for (const groupId of selectedGroups) {
        try {
          await forwardMessageAPI(selectedForwardMessage.id, groupId);
        } catch (error) {
          console.error(
            '❌ Error forwarding message to group:',
            groupId,
            error
          );
          Alert.alert(
            'Error',
            `Failed to forward message to ${
              allGroups.find((g) => (g._id || g.id) === groupId)?.name ||
              'group'
            }`
          );
        }
      }

      // Show success message
      Alert.alert(
        'Success',
        `Message forwarded to ${selectedGroups.length} group(s)`
      );

      // Reset state
      setSelectedGroups([]);
      setSelectedForwardMessage(null);
    } catch (error) {
      console.error('❌ Error in confirmForwarding:', error);
      Alert.alert('Error', 'Failed to forward message. Please try again.');
    }
  };

  // Show minimal loader only for group data (needed for header)
  // Messages load in background without blocking UI
  if (loadingGroup) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>
              {group?.name || 'Group Chat'}
            </Text>
            <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
              {group?.members.length || 0} members + AI Assistant
            </Text>
          </View>
          <TouchableOpacity
            style={styles.groupIconButton}
            onPress={() => router.push(`/group-members/group-members?id=${id}`)}
          >
            <Users size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Pinned Message */}
        {pinnedMessage && (
          <View
            style={[
              styles.pinnedContainer,
              {
                backgroundColor: colors.surface,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.pinnedTitle, { color: colors.primary }]}>
                📌 Pinned Message
              </Text>
              <Text
                style={[styles.pinnedSender, { color: colors.textSecondary }]}
              >
                {pinnedMessage.senderName}
              </Text>
              <Text
                style={[styles.pinnedText, { color: colors.text }]}
                numberOfLines={2}
              >
                {pinnedMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setPinnedMessage(null)}>
              <Text style={[styles.unpinText, { color: colors.primary }]}>
                Unpin
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reply Banner */}

        {replyTo && (
          <View
            style={[
              styles.replyBanner,
              {
                backgroundColor: colors.surface,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <CornerDownLeft size={16} color={colors.primary} />
            <View style={styles.replyBannerTextContainer}>
              <Text style={[styles.replyBannerText, { color: colors.text }]}>
                Replying to {replyTo.senderName}
              </Text>
              <Text
                style={[
                  styles.replyBannerSubtext,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {replyTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}

        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            subtitle="Start the conversation and say something!"
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isCurrentUser={item.senderId === user?.id}
                onReply={(msg) => setReplyTo(msg)}
                onDelete={(msg) => handleDeleteMessage(msg.id)}
                onPin={handlePinMessage}
                onClearAll={handleClearChat}
                pinnedMessageId={pinnedMessage?.id}
                useLongPressReply={true}
                onForward={handleForwardMessage}
              />
            )}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {aiTyping && (
          <View style={styles.typingContainer}>
            <View
              style={[styles.typingBubble, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[styles.typingText, { color: colors.textSecondary }]}
              >
                AI Assistant is typing...
              </Text>
            </View>
          </View>
        )}

        <ChatInput
          onSend={handleSendMessage}
          disabled={aiTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />

        {/* Confirmation Modal */}
        <Modal
          visible={confirmationModal.visible}
          transparent
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() =>
              setConfirmationModal({ ...confirmationModal, visible: false })
            }
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {confirmationModal.title}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {confirmationModal.subtitle}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setConfirmationModal({
                        ...confirmationModal,
                        visible: false,
                      })
                    }
                  >
                    <Text style={[styles.cancelBtn, { color: colors.primary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmationModal.onConfirm}>
                    <Text
                      style={[
                        styles.confirmBtn,
                        { color: colors.error || '#D11A2A' },
                      ]}
                    >
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Forward Modal */}
        <Modal visible={forwardModalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback
            onPress={() => setForwardModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Forward Message
                  </Text>

                  {selectedForwardMessage && (
                    <View
                      style={[
                        styles.forwardPreview,
                        { backgroundColor: colors.inputBackground },
                      ]}
                    >
                      <Text
                        style={[
                          styles.forwardPreviewText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Forwarding: "
                        {selectedForwardMessage.text.substring(0, 50)}..."
                      </Text>
                    </View>
                  )}

                  <Text
                    style={[
                      styles.modalSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Select groups to forward to:
                  </Text>

                  <ScrollView
                    style={styles.groupsList}
                    showsVerticalScrollIndicator={false}
                  >
                    {allGroups
                      .filter((grp) => (grp._id || grp.id) !== id) // Exclude current group
                      .map((grp) => (
                        <TouchableOpacity
                          key={grp._id || grp.id}
                          onPress={() =>
                            toggleGroupSelection(grp._id || grp.id)
                          }
                          style={[
                            styles.groupItem,
                            {
                              backgroundColor: selectedGroups.includes(
                                grp._id || grp.id
                              )
                                ? colors.primary + '20'
                                : 'transparent',
                              borderColor: selectedGroups.includes(
                                grp._id || grp.id
                              )
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.groupItemText,
                              {
                                color: selectedGroups.includes(
                                  grp._id || grp.id
                                )
                                  ? colors.primary
                                  : colors.text,
                              },
                            ]}
                          >
                            {grp.name}
                          </Text>
                          {selectedGroups.includes(grp._id || grp.id) && (
                            <Check size={16} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      onPress={() => setForwardModalVisible(false)}
                      style={[
                        styles.modalButton,
                        { backgroundColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[styles.modalButtonText, { color: colors.text }]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={confirmForwarding}
                      style={[
                        styles.modalButton,
                        {
                          backgroundColor:
                            selectedGroups.length > 0
                              ? colors.primary
                              : colors.border,
                          opacity: selectedGroups.length > 0 ? 1 : 0.5,
                        },
                      ]}
                      disabled={selectedGroups.length === 0}
                    >
                      <Text
                        style={[
                          styles.modalButtonText,
                          {
                            color:
                              selectedGroups.length > 0
                                ? '#fff'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        Forward ({selectedGroups.length})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, marginLeft: 8 },
  groupName: { fontSize: 18, fontWeight: '600' },
  memberCount: { fontSize: 14, marginTop: 2 },
  groupIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  replyBannerTextContainer: { flex: 1 },
  replyBannerText: { fontSize: 12, fontWeight: '600' },
  replyBannerSubtext: { fontSize: 12 },
  messagesContainer: { padding: 16, flexGrow: 1 },
  typingContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: {
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  typingText: { fontSize: 14, fontStyle: 'italic' },
  pinnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    padding: 12,
    margin: 12,
    borderRadius: 12,
    gap: 8,
  },
  pinnedTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  pinnedSender: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  pinnedText: { fontSize: 14, maxWidth: '95%' },
  unpinText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, textAlign: 'center' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forwardPreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  forwardPreviewText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  groupsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
  },
  groupItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  confirmBtn: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});

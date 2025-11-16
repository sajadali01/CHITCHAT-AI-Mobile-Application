import { Message } from '@/types';

// Replace with your machine's IP address if using mobile device
const API_URL = 'http://192.168.0.34:5000/api/chat/ai-message';

export async function generateAIResponse(
  userMessage: string,
  context: Message[]
): Promise<string> {
  try {
    // Format messages to match backend expectations
    const formattedMessages = context.map(msg => ({
      sender: msg.senderId === 'ai-assistant' ? 'ai' : 'user',
      text: msg.text,
      content: msg.text
    }));
    
    // Add current user message
    formattedMessages.push({
      sender: 'user',
      text: userMessage,
      content: userMessage
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: 'ai-group',
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server returned error:', response.status, errorText);
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response from server:', data);

    return data.response || '⚠️ No response from AI';
  } catch (error) {
    console.error('AI API error:', error);
    return '❌ Failed to connect to AI service.';
  }
}


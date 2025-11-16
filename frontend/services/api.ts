import { Group, Message, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.0.34:5000/api'; // replace with your backend IP

// Helper to get stored Firebase token
async function getAuthToken(): Promise<string | null> {
  const token = await SecureStore.getItemAsync('userToken');
  console.log('Token being sent:', token);
  return token;
}

// ====================
// 👤 Get user profile
// ====================
export async function getProfile(): Promise<User> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}



// ====================
// 🏠 Get all groups
// ====================
export async function getGroups(): Promise<Group[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to fetch groups');
  }
  return res.json();
}

// ====================
// ➕ Create a new group
// ====================
export async function createGroup(name: string, members: string[]): Promise<Group> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, members }),
  });
  if (!res.ok) throw new Error('Failed to create group');
  return res.json();
}

// ====================
// 📦 Get group by ID
// ====================
export async function getGroup(groupId: string): Promise<Group> {
  const token = await getAuthToken();
  // console.log('Token being sent:', token);
  console.log("Group ID : ", groupId);
  const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to fetch group');
  }
  return res.json();
}

// ====================
// 💬 Get messages for a group
// ====================
export async function getMessages(groupId: string): Promise<Message[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/chat/messages?groupId=${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to fetch messages');
  }
  return res.json();
}

// ====================
// 📤 Send message to a group
// ====================
export async function sendMessage(groupId: string, text: string, replyTo?: { senderName: string, text: string }): Promise<Message> {
  const token = await getAuthToken();
  const user = await SecureStore.getItemAsync('user');
  const userData:User = JSON.parse(user || '{}');
  console.log("User Data :",userData);
  const res = await fetch(`${API_BASE_URL}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ groupId, content: text, replyTo,userId:userData.id}),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to send message');
  }
  return res.json();
}

// ====================
// 🤖 Send message to AI
// ====================
export async function sendAIMessage(groupId: string, messages: any[]): Promise<string> {
  const token = await getAuthToken();
  const user = await SecureStore.getItemAsync('user');
  const userData: User = JSON.parse(user || '{}');
  
  const res = await fetch(`${API_BASE_URL}/chat/ai-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ groupId, messages, userId: userData.id }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to get AI response');
  }
  const data = await res.json();
  return data.response;
}

// ====================
// 📊 Generate chat summary
// ====================
export async function generateSummary(groupId: string, days?: number, messageCount?: number): Promise<any> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/chat/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ groupId, days, messageCount }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to generate summary');
  }
  return res.json();
}

// ====================
// ✏️ Update user profile
// ====================
export async function updateProfile(data: Partial<User>): Promise<User> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to ...');
  }
  return res.json();
}

// ====================
// 👥 Get all users
// ====================
export async function getAllUsers(): Promise<User[]> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to fetch users');
  }
  return res.json();
}

// ====================
// 🚪 Leave group
// ====================
export async function leaveGroup(groupId: string): Promise<void> {
  const token = await getAuthToken();
  
  const res = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to leave group');
  }
}

// ====================
// 🗑️ Delete message for current user (soft delete)
// ====================
export async function deleteMessage(messageId: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/delete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to delete message');
  }
}

// ====================
// 📤 Forward message to another group
// ====================
export async function forwardMessage(originalMessageId: string, targetGroupId: string): Promise<Message> {
  const token = await getAuthToken();
  const user = await SecureStore.getItemAsync('user');
  const userData: User = JSON.parse(user || '{}');
  
  const res = await fetch(`${API_BASE_URL}/chat/messages/${originalMessageId}/forward`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetGroupId, userId: userData.id }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log('API error:', res.status, errorText);
    throw new Error('Failed to forward message');
  }
  
  return res.json();
}



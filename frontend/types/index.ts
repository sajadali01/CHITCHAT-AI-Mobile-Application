export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

export type AuthResponse = User & { token: string };

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isAI: boolean;
  replyTo?: {
    senderName: string;
    text: string; 
  };
  isForwarded?: boolean;
  forwardedFrom?: string;
  forwardedFromGroup?: string;
}

export interface Group {
  id: string;
  _id?: string;
  name: string;
  members: string[];
  createdAt: string;
  pinned?: boolean;
  lastMessage?: Message;
}
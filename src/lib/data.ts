export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: any; // Can be Firestore Timestamp or a string
  messageType?: 'text' | 'image' | 'audio' | 'video' | 'sticker' | 'unsupported';
  mediaUrl?: string | null;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: any; // Can be Firestore Timestamp
  unreadCount?: number;
  "data-ai-hint"?: string;
  instanceId?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  instanceIds: string[];
  avatar?: string;
};

export type Instance = {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  webhookUrl: string;
  isActive: boolean;
  lastActivity?: any; // Firestore Timestamp
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
};

export const NGROK_URL = 'https://d6b6cfd5f1c2.ngrok-free.app';


export const conversations: Conversation[] = [
  {
    id: 'admin',
    name: 'Painel do Administrador',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Gerenciar usuários e instâncias',
    timestamp: '',
    "data-ai-hint": "gear settings",
  },
];

export const messages: Record<string, Message[]> = {};

// This is now a placeholder, the actual user data will be fetched via authentication
export const currentUser = {
  id: 'user-1',
  name: 'Admin Sistema',
  email: 'admin@sistema.com',
  avatar: 'https://placehold.co/40x40.png',
  role: 'admin',
  instance: 'Sistema',
  "data-ai-hint": "person avatar",
};

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  "data-ai-hint"?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  instanceId: string;
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


export const conversations: Conversation[] = [
  {
    id: 'admin',
    name: 'Painel do Administrador',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Gerenciar usuários e instâncias',
    timestamp: '',
    "data-ai-hint": "gear settings",
  },
  {
    id: '1',
    name: '5511931996806 (WhatsApp)',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Ei, parceiro! 😉 Apenas um aviso rápido...',
    timestamp: '08:22',
    unreadCount: 0,
    "data-ai-hint": "person smiling",
  },
  {
    id: '2',
    name: 'Thiago Toffanetto (WhatsApp)',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Foto',
    timestamp: 'ontem',
    "data-ai-hint": "man portrait",
  },
  {
    id: '3',
    name: 'Audio Tester (WhatsApp)',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Áudio',
    timestamp: 'ontem',
    "data-ai-hint": "abstract audio",
  },
  {
    id: '4',
    name: 'Test Audio User (WhatsApp)',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Áudio',
    timestamp: 'ontem',
    "data-ai-hint": "abstract technology",
  },
];

export const messages: Record<string, Message[]> = {
  '1': [
    { id: '1-1', text: 'Oi, tudo bem? Conseguiu ver o relatório que enviei?', sender: 'them', timestamp: '10:30' },
    { id: '1-2', text: 'Oi, tudo sim! Vi agora, parece ótimo. Só tenho uma dúvida na seção 3.', sender: 'me', timestamp: '10:32' },
    { id: '1-3', text: 'Claro, qual a sua dúvida?', sender: 'them', timestamp: '10:33' },
    { id: '1-4', text: 'Sobre o KPI de engajamento, não entendi como foi calculado.', sender: 'me', timestamp: '10:35' },
    { id: '1-5', text: 'Ah, sim. É a soma das curtidas e comentários dividida pelo alcance. Podemos ajustar se achar melhor.', sender: 'them', timestamp: '10:38' },
    { id: '1-6', text: 'Entendi. Não, perfeito. Só queria confirmar mesmo. Obrigada!', sender: 'me', timestamp: '10:39' },
    { id: '1-7', text: 'Ok, combinado! Te vejo lá.', sender: 'them', timestamp: '10:40' },
  ],
  '2': [
    { id: '2-1', text: 'Pessoal, a nova campanha de outono precisa ser finalizada até amanhã.', sender: 'them', timestamp: '10:30' },
    { id: '2-2', text: 'Carlos: Alguém pode revisar o copy?', sender: 'them', timestamp: '10:35' },
  ],
};

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

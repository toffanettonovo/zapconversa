import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Conversation, type User } from '@/lib/data';
import { CircleDashed, MessageSquarePlus, MoreVertical, Search, Settings } from 'lucide-react';
import ConversationItem from './conversation-item';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

type ConversationListProps = {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: (Pick<User, 'id' | 'name' | 'role' | 'instanceIds'> & { avatar: string; 'data-ai-hint': string }) | null;
  selectedInstanceId: string | null;
};

const adminConversation = {
    id: 'admin',
    name: 'Painel do Administrador',
    avatar: 'https://placehold.co/40x40.png',
    lastMessage: 'Gerenciar usuários e instâncias',
    timestamp: '',
    "data-ai-hint": "gear settings",
};

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
  currentUser,
  selectedInstanceId
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const conversationsCollection = collection(db, 'conversations');
    
    let q;
    if (selectedInstanceId && selectedInstanceId !== 'all') {
        q = query(conversationsCollection, where('instanceId', '==', selectedInstanceId), orderBy('timestamp', 'desc'));
    } else if (currentUser.role === 'admin') {
        q = query(conversationsCollection, orderBy('timestamp', 'desc'));
    } else {
        q = query(conversationsCollection, where('instanceId', 'in', currentUser.instanceIds || []), orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Conversation);
      setConversations(convos);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching conversations:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedInstanceId]);


  if (!currentUser) {
    return (
        <div className="flex flex-col h-full bg-[#111b21] text-gray-300 items-center justify-center">
            <p>Carregando dados do usuário...</p>
        </div>
    );
  }

  const instanceName = currentUser.role === 'admin' ? 'Todas as Instâncias' : 'Instâncias do Usuário';
  
  const allConversations = [adminConversation, ...conversations];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-gray-300">
      <header className="flex items-center justify-between p-3 border-b border-[#1f2c33] bg-[#202c33]">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint={currentUser['data-ai-hint']} />
            <AvatarFallback className="bg-[#00a884] text-white">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
           <div>
              <h3 className="font-semibold text-white">{currentUser.name}</h3>
              <p className="text-sm text-gray-400">{instanceName}</p>
              {currentUser.role === 'admin' && <p className="text-xs text-gray-500">Administrador</p>}
            </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#2a3942]">
            <CircleDashed className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#2a3942]">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="p-2 bg-[#111b21]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Pesquisar ou começar nova conversa" className="pl-10 bg-[#202c33] border-none text-sm h-9 rounded-lg" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : (
            <div className="flex flex-col">
            {allConversations.map((convo) => (
                <ConversationItem
                key={convo.id}
                conversation={convo}
                isSelected={selectedConversationId === convo.id}
                onSelect={() => onSelectConversation(convo.id)}
                />
            ))}
            </div>
        )}
      </ScrollArea>
    </div>
  );
}

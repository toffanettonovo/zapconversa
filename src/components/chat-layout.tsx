'use client';

import { useState, useEffect } from 'react';
import ConversationList from './conversation-list';
import MessagePanel from './message-panel';
import { conversations, type User, type Instance } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<User | null>(null);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loadingData, setLoadingData] = useState(true);


  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          // User might have been created in console, but not in our 'users' collection
          setUserData(null);
        }
      });

      const instancesCollectionRef = collection(db, 'instances');
       const unsubInstances = onSnapshot(instancesCollectionRef, (snapshot) => {
        const instancesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Instance));
        setInstances(instancesList);
      });

      setLoadingData(false);

      return () => {
        unsubUser();
        unsubInstances();
      };
    }
  }, [user]);


  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  const displayUser = userData ? {
    name: userData.name,
    avatar: 'https://placehold.co/40x40.png',
    'data-ai-hint': 'person avatar',
    role: userData.role,
    instanceIds: userData.instanceIds,
  } : null;

  const handleAdminClick = () => {
    if (userData?.role === 'admin') {
      setSelectedConversationId('admin');
    }
  };

  const handleSettingsClick = () => {
    // Placeholder for settings navigation
    console.log('Settings clicked');
  };

  if (authLoading || loadingData) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const userInstances = userData?.role === 'admin' 
    ? instances 
    : instances.filter(inst => userData?.instanceIds?.includes(inst.id));

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b141a]">
        <header className="flex items-center justify-between px-6 py-2 bg-[#2a3942] text-white border-b border-[#1f2c33]">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">WhatsApp Business</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Instância:</span>
                    <Select defaultValue="all">
                        <SelectTrigger className="bg-[#1f2c33] border-none w-[180px] h-8 text-sm">
                            <SelectValue placeholder="Selecione uma instância" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todas as Instâncias</SelectItem>
                            {userInstances.map(inst => (
                               <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
                 {userData?.role === 'admin' && (
                  <Button variant="link" onClick={handleAdminClick} className="text-gray-300 hover:text-white p-0 h-auto">Admin Sistema</Button>
                )}
                <Button variant="link" onClick={handleSettingsClick} className="text-gray-300 hover:text-white p-0 h-auto">Configurações</Button>
            </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <div className="w-full max-w-sm lg:max-w-md border-r border-[#1f2c33] flex-none">
                <ConversationList
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
                currentUser={displayUser}
                />
            </div>
            <div className="flex-1 flex flex-col">
                <MessagePanel conversation={selectedConversation} />
            </div>
        </div>
    </div>
  );
}

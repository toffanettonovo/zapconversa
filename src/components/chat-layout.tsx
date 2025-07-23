'use client';

import { useState, useEffect } from 'react';
import ConversationList from './conversation-list';
import MessagePanel from './message-panel';
import { conversations, type User, type Instance } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Loader2, UserCircle, LogOut, Settings, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


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
          setUserData({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || 'Usuário sem Perfil',
            role: 'user',
            instanceIds: [],
          });
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };


  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  const displayUser = userData ? {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar || 'https://placehold.co/40x40.png',
    'data-ai-hint': 'person avatar',
    role: userData.role,
    instanceIds: userData.instanceIds,
  } : null;

  const handleAdminClick = () => {
      setSelectedConversationId('admin');
  };

  const handleSettingsClick = () => {
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
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-2 h-auto hover:bg-[#1f2c33]">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={displayUser?.avatar} alt={displayUser?.name} data-ai-hint={displayUser?.['data-ai-hint']} />
                            <AvatarFallback>{displayUser?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                         <span className="font-medium">{displayUser?.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>{displayUser?.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleAdminClick}>
                           <Shield className="mr-2 h-4 w-4" />
                           <span>Admin Sistema</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSettingsClick}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                           <LogOut className="mr-2 h-4 w-4" />
                           <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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

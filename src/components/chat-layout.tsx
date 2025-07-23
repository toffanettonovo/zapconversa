'use client';

import { useState } from 'react';
import ConversationList from './conversation-list';
import MessagePanel from './message-panel';
import { conversations } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  // Placeholder for user data until auth is fully integrated
  const displayUser = user ? {
    name: user.email?.split('@')[0] || 'Usuário',
    avatar: 'https://placehold.co/40x40.png',
    'data-ai-hint': 'person avatar',
    // These would come from your user data model
    role: 'admin' as const, 
    instance: 'Sistema'
  } : {
    name: 'Admin Sistema',
    avatar: 'https://placehold.co/40x40.png',
    'data-ai-hint': 'person avatar',
    role: 'admin' as const,
    instance: 'Sistema'
  };

  const handleAdminClick = () => {
    setSelectedConversationId('admin');
  };

  const handleSettingsClick = () => {
    // Placeholder for settings navigation
    console.log('Settings clicked');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b141a]">
        <header className="flex items-center justify-between px-6 py-2 bg-[#2a3942] text-white border-b border-[#1f2c33]">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">WhatsApp Business</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Instância:</span>
                    <Select defaultValue="all">
                        <SelectTrigger className="bg-[#1f2c33] border-none w-[180px] h-8 text-sm">
                            <SelectValue placeholder="Todas as Instâncias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Instâncias</SelectItem>
                            <SelectItem value="main">Principal</SelectItem>
                            <SelectItem value="secondary">Secundária</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <Button variant="link" onClick={handleAdminClick} className="text-gray-300 hover:text-white p-0 h-auto">Admin Sistema</Button>
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
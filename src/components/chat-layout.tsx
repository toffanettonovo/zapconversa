'use client';

import { useState } from 'react';
import ConversationList from './conversation-list';
import MessagePanel from './message-panel';
import { conversations, currentUser } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { WhatsappLogo } from './icons';

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

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
                <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Admin Sistema</Button>
                <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Configurações</Button>
            </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <div className="w-full max-w-sm lg:max-w-md border-r border-[#1f2c33] flex-none">
                <ConversationList
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId}
                currentUser={currentUser}
                />
            </div>
            <div className="flex-1 flex flex-col">
                <MessagePanel conversation={selectedConversation} />
            </div>
        </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import ConversationList from './conversation-list';
import MessagePanel from './message-panel';
import { conversations, currentUser } from '@/lib/data';

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-screen w-full bg-[#0b141a]">
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg border-r border-border flex-none">
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
  );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ImageIcon, Mic, Settings, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

type ConversationItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
};

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';
  if (typeof timestamp === 'string' && timestamp !== '') return timestamp;
  if (!timestamp.toDate) return '';

  const date = timestamp.toDate();
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (isYesterday) {
    return 'ontem';
  }

  return date.toLocaleDateString('pt-BR');
}

const getIconForLastMessage = (conversation: Conversation) => {
    if (conversation.id === 'admin') return <Settings className="h-4 w-4 mr-1 text-gray-400" />;
    if (!conversation.lastMessage) return null;
    if (conversation.lastMessage.toLowerCase().includes('foto')) return <ImageIcon className="h-4 w-4 mr-1 text-gray-400" />;
    if (conversation.lastMessage.toLowerCase().includes('áudio')) return <Mic className="h-4 w-4 mr-1 text-gray-400" />;
    if (conversation.lastMessage.toLowerCase().startsWith('documento:')) return <FileText className="h-4 w-4 mr-1 text-gray-400" />;
    return null;
}

export default function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  const [displayTimestamp, setDisplayTimestamp] = useState('');

  useEffect(() => {
    // This code runs only on the client, after hydration.
    // This prevents the server-rendered timestamp from mismatching the client-rendered one.
    setDisplayTimestamp(formatTimestamp(conversation.timestamp));
  }, [conversation.timestamp]);

  const lastMessageText = conversation.lastMessage.toLowerCase().startsWith('documento:') 
    ? conversation.lastMessage.substring(10).trim()
    : conversation.lastMessage;

  return (
    <div
      className={cn("flex items-start gap-3 p-3 border-b border-[#1f2c33] cursor-pointer transition-colors relative",
        isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#1f2c33]'
      )}
      onClick={onSelect}
    >
      {isSelected && <div className="absolute left-0 top-0 h-full w-1 bg-[#01a870]" />}
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']} />
        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className={cn("font-semibold truncate", isSelected ? 'text-white' : 'text-gray-300')}>{conversation.name}</h3>
          <span className={cn(
            "text-xs",
             isSelected ? 'text-white/90' : 'text-gray-400'
          )}>
            {displayTimestamp}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm truncate max-w-[80%] flex items-center">
            {getIconForLastMessage(conversation)}
            <span className={cn(isSelected ? 'text-white/90' : 'text-gray-400')}>{lastMessageText}</span>
          </div>
          {conversation.unreadCount != null && conversation.unreadCount > 0 && !isSelected && (
            <Badge className="bg-[#00a884] text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
          {conversation.unreadCount === 0 && isSelected && (
             <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs border-gray-500 text-gray-400">
                0
             </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

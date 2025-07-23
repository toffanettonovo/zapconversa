import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, ImageIcon, Mic } from 'lucide-react';

type ConversationItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
};

const getIconForLastMessage = (message: string) => {
    if (message.includes('Foto')) return <ImageIcon className="h-4 w-4 mr-1" />;
    if (message.includes('Áudio')) return <Mic className="h-4 w-4 mr-1" />;
    return null;
}

export default function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <div
      className={cn("flex items-start gap-3 p-3 border-b border-[#1f2c33] cursor-pointer transition-colors",
        isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#1f2c33]'
      )}
      onClick={onSelect}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']} />
        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white">{conversation.name}</h3>
          <span className="text-xs text-gray-400">{conversation.timestamp}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-400 truncate max-w-[80%] flex items-center">
            {getIconForLastMessage(conversation.lastMessage)}
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <Badge className="bg-[#00a884] text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

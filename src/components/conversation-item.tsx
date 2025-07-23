import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ImageIcon, Mic } from 'lucide-react';

type ConversationItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
};

const getIconForLastMessage = (message: string) => {
    if (message.toLowerCase().includes('foto')) return <ImageIcon className="h-4 w-4 mr-1 text-gray-400" />;
    if (message.toLowerCase().includes('áudio')) return <Mic className="h-4 w-4 mr-1 text-gray-400" />;
    return null;
}

export default function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <div
      className={cn("flex items-start gap-3 p-3 border-b border-[#1f2c33] cursor-pointer transition-colors relative",
        isSelected ? 'bg-[#363c3e]' : 'hover:bg-[#1f2c33]'
      )}
      onClick={onSelect}
    >
      {isSelected && <div className="absolute right-0 top-0 h-full w-px bg-[#01a870]" />}
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']} />
        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-white truncate">{conversation.name}</h3>
          <span className={cn(
            "text-xs",
             isSelected ? 'text-white/80' : 'text-gray-400'
          )}>
            {conversation.timestamp}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-gray-400 truncate max-w-[80%] flex items-center">
            {getIconForLastMessage(conversation.lastMessage)}
            <span className={cn(isSelected ? 'text-white/80' : 'text-gray-400')}>{conversation.lastMessage}</span>
          </div>
          {conversation.unreadCount && conversation.unreadCount > 0 && !isSelected && (
            <Badge className="bg-[#00a884] text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/data';

type ConversationItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
};

export default function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <div
      className={`p-3 border-b border-border cursor-pointer transition-colors ${
        isSelected ? 'bg-secondary' : 'hover:bg-secondary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']} />
          <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{conversation.name}</h3>
            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-muted-foreground truncate max-w-[80%]">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <Badge variant="default" className="bg-primary h-5 w-5 p-0 flex items-center justify-center text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { type Message } from '@/lib/data';
import { cn } from '@/lib/utils';

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.sender === 'me';
  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-md rounded-lg px-3 py-2 shadow',
          isMine ? 'bg-primary/90 text-primary-foreground' : 'bg-card'
        )}
      >
        <p className="text-sm">{message.text}</p>
        <p className={cn('text-xs mt-1', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground/70', 'text-right')}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

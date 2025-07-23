import { type Message } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.sender === 'me';
  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xl rounded-lg px-3 py-1.5 shadow-md',
          isMine ? 'bg-[#005c4b]' : 'bg-[#202c33]'
        )}
      >
        <p className="text-sm text-white">{message.text}</p>
        <div className={cn('flex items-center justify-end text-xs mt-1', isMine ? 'text-gray-400' : 'text-gray-500')}>
          <span>{message.timestamp}</span>
          {isMine && <CheckCheck className="h-4 w-4 ml-1 text-[#53bdeb]" />}
        </div>
      </div>
    </div>
  );
}

import { type Message } from '@/lib/data';
import { cn } from '@/lib/utils';
import { CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';


type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.sender === 'me';
  
  const renderMessageContent = () => {
    if (message.messageType === 'audio' && message.mediaUrl) {
      return (
        <audio controls src={message.mediaUrl} className="w-64 h-12">
          Seu navegador não suporta o elemento de áudio.
        </audio>
      );
    }

    if (message.messageType === 'image' && message.mediaUrl) {
      return (
         <Dialog>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer w-64 h-64">
                <Image
                    src={message.mediaUrl}
                    alt={message.text || 'Imagem enviada'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-auto bg-transparent border-none shadow-none">
             <img src={message.mediaUrl} alt={message.text || 'Imagem enviada'} className="w-full h-full object-contain" />
          </DialogContent>
        </Dialog>
      );
    }

    return <p className="text-sm text-white">{message.text}</p>;
  };
  
  const renderCaption = () => {
    if ((message.messageType === 'image' || message.messageType === 'video') && message.text) {
        return <p className="text-sm text-white mt-1">{message.text}</p>;
    }
    return null;
  }

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xl rounded-lg px-2 py-1.5 shadow-md',
          isMine ? 'bg-[#005c4b]' : 'bg-[#202c33]'
        )}
      >
        {renderMessageContent()}
        {renderCaption()}
        <div className={cn('flex items-center justify-end text-xs mt-1', isMine ? 'text-gray-400' : 'text-gray-500')}>
          <span>{message.timestamp as string}</span>
          {isMine && <CheckCheck className="h-4 w-4 ml-1 text-[#53bdeb]" />}
        </div>
      </div>
    </div>
  );
}

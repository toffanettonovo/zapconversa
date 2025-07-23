import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Conversation, messages as allMessages } from '@/lib/data';
import { MoreVertical, Paperclip, Search, SendHorizontal, Smile } from 'lucide-react';
import MessageBubble from './message-bubble';
import SmartReply from './smart-reply';
import AdminPanel from './admin-panel';
import ConversationSummary from './conversation-summary';
import { WhatsappLogo } from './icons';

type MessagePanelProps = {
  conversation: Conversation | undefined;
};

export default function MessagePanel({ conversation }: MessagePanelProps) {
  if (conversation?.id === 'admin') {
    return <AdminPanel />;
  }
  
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-center text-gray-400 border-t-8 border-[#25d366]">
        <WhatsappLogo className="h-24 w-24 text-[#43d583] mb-4" />
        <h2 className="mt-6 text-3xl font-light text-gray-200">WhatsApp Web</h2>
        <p className="mt-4 text-sm text-gray-400 max-w-sm">
          Selecione uma conversa para começar
        </p>
        <div className="mt-8 border-t border-gray-700 w-full"></div>
      </div>
    );
  }

  const conversationMessages = allMessages[conversation.id] || [];
  const conversationText = conversationMessages.map(m => `${m.sender === 'me' ? 'Eu' : conversation.name}: ${m.text}`).join('\n');

  return (
    <div className="flex flex-col h-full bg-[#0b141a]">
      <header className="flex items-center justify-between p-3 border-b border-[#1f2c33] bg-[#202c33]">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']}/>
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">{conversation.name}</h3>
            <p className="text-xs text-gray-400">online</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#2a3942]">
            <Search className="h-5 w-5" />
          </Button>
          <ConversationSummary conversationText={conversationText} />
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-[#2a3942]">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 bg-[#0b141a]">
        <div className="flex flex-col gap-4">
          {conversationMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
      <SmartReply messages={conversationMessages} />
      <footer className="p-3 bg-[#202c33] border-t border-[#1f2c33]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-[#2a3942]">
            <Smile className="h-6 w-6 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-[#2a3942]">
            <Paperclip className="h-6 w-6 text-gray-400" />
          </Button>
          <Input placeholder="Digite uma mensagem" className="flex-1 bg-[#2a3942] border-none rounded-lg text-sm" />
          <Button size="icon" className="bg-[#00a884] hover:bg-[#008f71]">
            <SendHorizontal className="h-5 w-5 text-white" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
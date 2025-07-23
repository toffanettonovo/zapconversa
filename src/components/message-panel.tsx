import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Conversation, messages as allMessages, currentUser } from '@/lib/data';
import { MoreVertical, Paperclip, Phone, Search, SendHorizontal, Smile, Video } from 'lucide-react';
import MessageBubble from './message-bubble';
import SmartReply from './smart-reply';
import { Logo } from './icons';
import AdminPanel from './admin-panel';
import ConversationSummary from './conversation-summary';

type MessagePanelProps = {
  conversation: Conversation | undefined;
};

export default function MessagePanel({ conversation }: MessagePanelProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 text-center">
        <Logo className="h-24 w-24 text-muted-foreground/20" />
        <h2 className="mt-6 text-2xl font-semibold text-foreground">WA Manager</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Envie e receba mensagens sem precisar manter o celular conectado.
          <br />
          Use o WA Manager em até quatro aparelhos e um celular ao mesmo tempo.
        </p>
        <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Criptografia de ponta a ponta
        </div>
      </div>
    );
  }

  if (conversation.id === 'admin') {
    return <AdminPanel />;
  }

  const conversationMessages = allMessages[conversation.id] || [];
  const conversationText = conversationMessages.map(m => `${m.sender === 'me' ? 'Eu' : conversation.name}: ${m.text}`).join('\n');

  return (
    <div className="flex flex-col h-full bg-secondary/30">
      <header className="flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.avatar} alt={conversation.name} data-ai-hint={conversation['data-ai-hint']}/>
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{conversation.name}</h3>
            <p className="text-xs text-muted-foreground">online</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
          <ConversationSummary conversationText={conversationText} />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 bg-[url('https://placehold.co/1000x1000/122929/122929.png')] bg-repeat">
        <div className="flex flex-col gap-4">
          {conversationMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
      <SmartReply messages={conversationMessages} />
      <footer className="p-3 bg-card border-t border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Smile className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-6 w-6 text-muted-foreground" />
          </Button>
          <Input placeholder="Digite uma mensagem" className="flex-1" />
          <Button size="icon" className="bg-primary hover:bg-primary/90">
            <SendHorizontal className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Conversation, type Message } from '@/lib/data';
import { MoreVertical, Paperclip, Search, SendHorizontal, Smile, Loader2 } from 'lucide-react';
import MessageBubble from './message-bubble';
import SmartReply from './smart-reply';
import AdminPanel from './admin-panel';
import ConversationSummary from './conversation-summary';
import { WhatsappLogo } from './icons';
import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendTextMessageAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

type MessagePanelProps = {
  conversation: Conversation | undefined;
};

function formatMessageTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function MessagePanel({ conversation }: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (conversation?.id && conversation.id !== 'admin') {
      setLoading(true);
      const conversationRef = doc(db, 'conversations', conversation.id);
      const messagesCollectionRef = collection(conversationRef, 'messages');
      const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                timestamp: formatMessageTimestamp(data.timestamp),
            } as Message
        });
        setMessages(msgs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
        setMessages([]);
    }
  }, [conversation]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation || !conversation.instanceId) return;

    setIsSending(true);

    const optimisticMessage: Message = {
      id: `local-${Date.now()}`,
      text: messageText,
      sender: 'me',
      timestamp: formatMessageTimestamp(new Date()),
      messageType: 'text',
    };

    try {
      // Temporarily add the message to the UI
      // setMessages(prevMessages => [...prevMessages, optimisticMessage]);

      const result = await sendTextMessageAction(conversation.instanceId, conversation.id, messageText);
      
      if (result.success) {
        // Clear the input field
        setMessageText('');
        // The webhook will handle adding the message to Firestore, which will then update the UI.
        // If we want instant UI update without waiting for webhook, we can add it here.
        // But let's rely on webhook for consistency.
      } else {
        toast({
          title: 'Erro ao Enviar Mensagem',
          description: result.error || 'Não foi possível enviar a mensagem.',
          variant: 'destructive'
        });
        // Remove the optimistic message if sending failed
        // setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
      }
    } catch (error: any) {
      toast({
          title: 'Erro de Rede',
          description: 'Ocorreu um erro ao tentar se comunicar com o servidor.',
          variant: 'destructive'
      });
      // Remove the optimistic message if sending failed
     // setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
    } finally {
      setIsSending(false);
    }
  };

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

  const conversationText = messages.map(m => `${m.sender === 'me' ? 'Eu' : conversation.name}: ${m.text}`).join('\n');

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
        {loading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : (
             <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>
        )}
      </ScrollArea>
      <SmartReply messages={messages} />
      <footer className="p-3 bg-[#202c33] border-t border-[#1f2c33]">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-[#2a3942]" type="button">
            <Smile className="h-6 w-6 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-[#2a3942]" type="button">
            <Paperclip className="h-6 w-6 text-gray-400" />
          </Button>
          <Input 
            placeholder="Digite uma mensagem" 
            className="flex-1 bg-[#2a3942] border-none rounded-lg text-sm"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isSending}
          />
          <Button size="icon" className="bg-[#00a884] hover:bg-[#008f71]" type="submit" disabled={isSending || !messageText.trim()}>
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5 text-white" />}
          </Button>
        </form>
      </footer>
    </div>
  );
}

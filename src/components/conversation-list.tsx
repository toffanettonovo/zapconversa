import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations, type User } from '@/lib/data';
import { CircleDashed, MessageSquarePlus, MoreVertical, Search, Settings, Users } from 'lucide-react';
import ConversationItem from './conversation-item';

type ConversationListProps = {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: Pick<User, 'name' | 'avatar' | 'role'> & { 'data-ai-hint': string };
};

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
  currentUser,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-card">
      <header className="flex items-center justify-between p-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint={currentUser['data-ai-hint']} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <CircleDashed className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar ou começar uma nova conversa" className="pl-9" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {currentUser.role === 'admin' && (
            <div
                className={`p-3 border-b border-border cursor-pointer transition-colors ${
                    selectedConversationId === 'admin' ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
                onClick={() => onSelectConversation('admin')}
            >
                <div className="flex items-center gap-3">
                    <Avatar className="bg-primary text-primary-foreground">
                        <Settings className="h-6 w-6 m-2"/>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Painel do Administrador</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                            Gerenciar usuários e instâncias
                        </p>
                    </div>
                </div>
            </div>
          )}
          {conversations.map((convo) => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              isSelected={selectedConversationId === convo.id}
              onSelect={() => onSelectConversation(convo.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { generateSmartReplies } from '@/ai/flows/smart-reply';
import type { Message } from '@/lib/data';
import { Sparkles } from 'lucide-react';

type SmartReplyProps = {
  messages: Message[];
};

export default function SmartReply({ messages }: SmartReplyProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      const fetchSuggestions = async () => {
        setLoading(true);
        try {
          const conversationHistory = messages.slice(-5).map(m => `${m.sender === 'me' ? 'Eu' : 'Outro'}: ${m.text}`).join('\n');
          const result = await generateSmartReplies({ conversationHistory });
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error('Erro ao gerar respostas inteligentes:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSuggestions();
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="p-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
         <Sparkles className="h-4 w-4 animate-pulse" />
        Gerando respostas...
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="p-2 flex items-center gap-2 border-t border-border overflow-x-auto">
      <Sparkles className="h-5 w-5 text-accent flex-shrink-0" />
      {suggestions.map((reply, index) => (
        <Button key={index} variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
          {reply}
        </Button>
      ))}
    </div>
  );
}

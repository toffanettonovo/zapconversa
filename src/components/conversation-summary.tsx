'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { conversationSummary } from '@/ai/flows/conversation-summary';
import { Loader2, BookText } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type ConversationSummaryProps = {
  conversationText: string;
};

export default function ConversationSummary({ conversationText }: ConversationSummaryProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerateSummary = async (summaryType: 'curto' | 'detalhado') => {
    setLoading(true);
    setSummary('');
    try {
      const result = await conversationSummary({ conversationText, summaryType });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Desculpe, não foi possível gerar o resumo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <BookText className="h-5 w-5" />
          <span className="sr-only">Resumir Conversa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Resumo da Conversa</DialogTitle>
          <DialogDescription>
            Gere um resumo dos pontos-chave e itens de ação desta conversa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-4">
            <Button onClick={() => handleGenerateSummary('curto')} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Resumo Curto
            </Button>
            <Button onClick={() => handleGenerateSummary('detalhado')} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Resumo Detalhado
            </Button>
          </div>
          {(loading || summary) && (
            <div className="mt-4 p-4 border rounded-lg bg-secondary/50 min-h-[100px]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <span>Gerando resumo...</span>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-64">
                    <p className="text-sm whitespace-pre-wrap">{summary}</p>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

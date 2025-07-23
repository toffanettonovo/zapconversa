// src/components/webhook-logs.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface LogEntry {
  id: string;
  instanceId: string;
  payload: any;
  receivedAt: Date | null;
  isError: boolean;
}

function formatTimestamp(timestamp: any): string {
    if (!timestamp) return '...';
    // a data do firestore pode vir como um objeto com seconds e nanoseconds
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
     return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function renderPayload(payload: any) {
  let content;
  let isError = false;
  if (payload && payload.error) {
    isError = true;
    content = payload.rawBody ? `ERRO: ${payload.error}\n\nConteúdo Recebido:\n${payload.rawBody}` : JSON.stringify(payload, null, 2);
  } else {
    content = JSON.stringify(payload, null, 2);
  }
  
  return (
    <pre className={`text-xs text-gray-300 bg-black/30 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all ${isError ? 'border border-red-500/50' : ''}`}>
      {content}
    </pre>
  );
}


export default function WebhookLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsCollection = collection(db, 'webhook_logs');
    const q = query(logsCollection, orderBy('receivedAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        receivedAt: doc.data().receivedAt ? doc.data().receivedAt.toDate() : new Date(),
      })) as LogEntry[];
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching logs from Firestore: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const getStatusBadge = () => {
    if (loading) {
        return <Badge variant="secondary" className="animate-pulse">Carregando...</Badge>;
    }
    return <Badge variant="default" className="bg-blue-600 text-white">Monitorando Firestore</Badge>;
  };


  return (
    <Card className="bg-[#111b21] border-[#1f2c33]">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-white">Logs do Webhook</CardTitle>
                <CardDescription>Visualização dos últimos 50 eventos recebidos (via Firestore).</CardDescription>
            </div>
            {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] w-full pr-4">
          <div className="space-y-4">
            <AnimatePresence>
            {loading ? (
                <div className="flex items-center justify-center text-center text-gray-400 py-8 h-full">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <p>Carregando logs do Firestore...</p>
                </div>
            ) : logs.length > 0 ? logs.map((log) => (
              <motion.div 
                key={log.id} 
                className="p-4 rounded-lg border border-[#2a3942] bg-[#202c33] origin-top"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center text-sm mb-2">
                  <div className="flex items-center gap-2">
                     <Badge variant={log.isError ? 'destructive': 'default'} className={log.isError ? '' : 'bg-green-600'}>{log.isError ? 'Erro' : 'Sucesso'}</Badge>
                    <span className="font-semibold text-white">Instância: {log.instanceId}</span>
                  </div>
                  <span className="text-gray-400">{formatTimestamp(log.receivedAt)}</span>
                </div>
                {renderPayload(log.payload)}
              </motion.div>
            )) : (
              <div className="flex items-center justify-center text-center text-gray-400 py-8 h-full">
                <p>Nenhum log encontrado. Envie uma mensagem ou use o botão de teste.</p>
              </div>
            )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

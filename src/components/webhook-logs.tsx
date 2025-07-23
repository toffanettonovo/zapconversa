// src/components/webhook-logs.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface WebhookLog extends DocumentData {
  id: string;
  instanceId: string;
  payload: any;
  receivedAt: Timestamp;
  isError?: boolean;
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsCollectionRef = collection(db, 'webhook_logs');
    const q = query(logsCollectionRef, orderBy('receivedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WebhookLog[];
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching webhook logs: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'No timestamp';
    return timestamp.toDate().toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  }

  return (
    <Card className="bg-[#111b21] border-[#1f2c33]">
      <CardHeader>
        <CardTitle className="text-white">Logs do Webhook</CardTitle>
        <CardDescription>Visualização em tempo real das notificações recebidas.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="space-y-4">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className={`p-4 rounded-lg border ${log.isError ? 'border-red-500/50 bg-red-900/20' : 'border-[#2a3942] bg-[#202c33]'}`}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-semibold text-white">Instância: {log.instanceId}</span>
                    <span className="text-gray-400">{formatTimestamp(log.receivedAt)}</span>
                  </div>
                  <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              )) : (
                <div className="text-center text-gray-400 py-8">
                  Nenhum log de webhook encontrado. Aguardando mensagens...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

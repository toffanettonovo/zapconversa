// src/components/webhook-logs.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { AnimatePresence, motion } from 'framer-motion';

interface LiveLog {
  id: string;
  data: string;
  timestamp: string;
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const eventSource = new EventSource('/api/live-log');

    eventSource.onopen = () => {
      setStatus('connected');
    };

    eventSource.onerror = () => {
      setStatus('disconnected');
      eventSource.close();
    };

    eventSource.onmessage = (event) => {
      try {
        const timestamp = new Date().toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        
        // Try to parse the data to see if it's our initial connection message
        try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.status === 'connected') {
                // This is the connection confirmation, do nothing with it in the log view.
                return;
            }
        } catch (e) {
            // It's not the status message, so it's a real log.
        }

        const newLog: LiveLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          data: event.data,
          timestamp: timestamp,
        };

        setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50)); // Keep only the last 50 logs
      } catch (error) {
        console.error("Failed to process event data:", error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600 text-white">Conectado</Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="animate-pulse">Conectando...</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
    }
  };

  return (
    <Card className="bg-[#111b21] border-[#1f2c33]">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-white">Log ao Vivo do Webhook</CardTitle>
                <CardDescription>Visualização instantânea das requisições recebidas.</CardDescription>
            </div>
            {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] w-full pr-4">
          <div className="space-y-4">
            <AnimatePresence>
            {logs.length > 0 ? logs.map((log) => (
              <motion.div 
                key={log.id} 
                className="p-4 rounded-lg border border-[#2a3942] bg-[#202c33] origin-top"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold text-white">Requisição Recebida</span>
                  <span className="text-gray-400">{log.timestamp}</span>
                </div>
                <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                  {log.data}
                </pre>
              </motion.div>
            )) : (
              <div className="flex items-center justify-center text-center text-gray-400 py-8 h-full">
                <p>Aguardando requisições... Envie uma mensagem ou use o botão de teste.</p>
              </div>
            )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

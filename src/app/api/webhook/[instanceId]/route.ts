// src/app/api/webhook/[instanceId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { broadcast } from '../live-log/route'; // Importa a função de broadcast diretamente

type RouteContext = {
  params: {
    instanceId: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const { instanceId } = context.params;
  let rawBody: string = '';

  try {
    rawBody = await request.text();
    
    // AÇÃO Nº 1: Notificar o log ao vivo IMEDIATAMENTE com o corpo bruto.
    // Isso é síncrono e direto, sem `fetch` ou chamadas de rede.
    broadcast(`Instance: ${instanceId}\n\n${rawBody}`);
    
    // O resto da lógica para salvar no Firestore continua como antes.
    let payload;
    let dataToLog;

    try {
      const parsedBody = JSON.parse(rawBody);
      
      if (Array.isArray(parsedBody) && parsedBody.length > 0) {
        dataToLog = parsedBody[0];
      } else {
        dataToLog = parsedBody;
      }
      payload = dataToLog;

    } catch (e) {
      payload = {
        error: "Corpo recebido não é um JSON válido ou está em formato inesperado.",
        rawBody: rawBody,
      };
    }

    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
      isError: !!payload.error,
    });

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });

  } catch (error: unknown) {
    let errorPayload: any = { message: 'Ocorreu um erro desconhecido ao processar o webhook.' };

    if (error instanceof Error) {
        errorPayload = { 
            message: error.message, 
            stack: error.stack,
            name: error.name,
        };
    } else {
        errorPayload.details = String(error);
    }
    
    // Notifica o log ao vivo também em caso de erro.
    broadcast(`CRITICAL ERROR on instance ${instanceId}:\n\n${JSON.stringify(errorPayload, null, 2)}`);

    try {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: instanceId,
            payload: { 
              error: "Erro Crítico no Endpoint do Webhook",
              details: errorPayload,
              rawBody: rawBody || "Não foi possível ler o corpo da requisição.",
            },
            receivedAt: serverTimestamp(),
            isError: true,
        });
    } catch (dbError) {
        console.error('FALHA CRÍTICA: Não foi possível salvar o log de erro do webhook no Firestore:', dbError);
    }
    
    return new Response('Erro interno ao processar o webhook.', {
      status: 500,
    });
  }
}

export async function GET(request: Request, context: RouteContext) {
    const { instanceId } = context.params;
    return NextResponse.json({ message: `Endpoint do webhook para a instância ${instanceId} está ativo.` });
}

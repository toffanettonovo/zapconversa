// src/app/api/webhook/[instanceId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RouteContext = {
  params: {
    instanceId: string;
  };
};

function getLiveLogUrl() {
  // Prefer the production Vercel URL if available
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/live-log`;
  }
  // Fallback to the preview URL for development environments
  if (process.env.NEXT_PUBLIC_WEB_PREVIEW_URL) {
    return `${process.env.NEXT_PUBLIC_WEB_PREVIEW_URL}/api/live-log`;
  }
  // Default for local development
  return 'http://localhost:9002/api/live-log';
}

async function notifyLiveLog(data: string) {
    // Fire-and-forget POST to the live log endpoint. No need to wait for it.
    const liveLogUrl = getLiveLogUrl();
    fetch(liveLogUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: data,
    }).catch(console.error);
}

export async function POST(request: Request, context: RouteContext) {
  const { instanceId } = context.params;
  let rawBody: string = '';

  try {
    rawBody = await request.text();
    // Notify the live log immediately, before any processing.
    await notifyLiveLog(`Instance: ${instanceId}\n\n${rawBody}`);
    
    let payload;

    try {
      const parsedBody = JSON.parse(rawBody);
      
      if (Array.isArray(parsedBody) && parsedBody.length > 0) {
        payload = parsedBody[0];
      } else {
        payload = parsedBody;
      }

    } catch (e) {
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: {
          error: "Corpo recebido não é um JSON válido ou está em formato inesperado.",
          rawBody: rawBody,
        },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com corpo não-JSON.` });
    }

    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
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

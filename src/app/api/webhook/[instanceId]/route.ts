// src/app/api/webhook/[instanceId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RouteContext = {
  params: {
    instanceId: string;
  };
};

export async function POST(request: Request, context: RouteContext) {
  const { instanceId } = context.params;
  let rawBody: string | undefined;

  try {
    // Attempt to get the raw body text. This itself can fail.
    rawBody = await request.text();
    let body;

    try {
      // Try to parse it as JSON.
      body = JSON.parse(rawBody);
    } catch (e) {
      // If parsing fails, we log the raw text and a parsing error message.
      // This is a "controlled" failure, we still received something.
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: {
          error: "Corpo recebido não é um JSON válido.",
          rawBody: rawBody,
        },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      // Return a 200 OK so the webhook service doesn't keep retrying.
      return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com corpo não-JSON.` });
    }

    // If parsing was successful, log the payload.
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: body,
      receivedAt: serverTimestamp(),
    });

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });

  } catch (error: unknown) {
    // This is the critical catch block. It will catch errors from request.text()
    // or any other unexpected issue.
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
    
    // Attempt to log this critical failure to Firestore
    try {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: instanceId,
            payload: { 
              error: errorPayload, 
              // Include the raw body if we managed to read it before the error.
              rawBody: rawBody ?? "Não foi possível ler o corpo da requisição.",
            },
            receivedAt: serverTimestamp(),
            isError: true,
        });
    } catch (dbError) {
        // If even logging to Firestore fails, log to the server console.
        console.error('FALHA CRÍTICA: Não foi possível salvar o log de erro do webhook no Firestore:', dbError);
        console.error('Erro original do Webhook:', error);
    }
    
    // Respond with an error status, as something went fundamentally wrong.
    return new Response('Erro interno ao processar o webhook.', {
      status: 500,
    });
  }
}

// Endpoint para verificar se a rota está funcionando
export async function GET(request: Request, context: RouteContext) {
    const { instanceId } = context.params;
    return NextResponse.json({ message: `Endpoint do webhook para a instância ${instanceId} está ativo.` });
}

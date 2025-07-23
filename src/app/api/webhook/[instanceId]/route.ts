// src/app/api/webhook/evolution/[instanceId]/route.ts
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
  
  // First, get the raw text of the body to avoid JSON parsing errors
  const rawBody = await request.text();

  try {
    // Now, try to parse it as JSON. If it fails, we'll log the raw text.
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      // If parsing fails, we log the raw text and a parsing error message.
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: {
          error: "Failed to parse JSON body.",
          rawBody: rawBody,
        },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      // Still return a 200 OK so the webhook service doesn't keep retrying.
      return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com corpo não-JSON.` });
    }

    console.log(`Webhook recebido para a instância ${instanceId}:`, JSON.stringify(body, null, 2));

    // Salva o log do webhook no Firestore
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: body,
      receivedAt: serverTimestamp(),
    });


    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });
  } catch (error: unknown) {
    console.error(`Erro ao processar webhook para ${instanceId}:`, error);
    
    let errorPayload: any = { message: 'An unknown error occurred.' };
    if (error instanceof Error) {
        errorPayload = { 
            message: error.message, 
            stack: error.stack,
            name: error.name,
        };
    } else {
        errorPayload.details = error;
    }
    
    // Fallback to log any other unexpected errors
    try {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: instanceId,
            payload: { error: errorPayload, rawBody: rawBody }, // Include rawBody here too
            receivedAt: serverTimestamp(),
            isError: true,
        });
    } catch (dbError) {
        console.error('Falha ao salvar o log de erro no Firestore:', dbError);
    }
    
    return new Response('Erro ao processar o webhook.', {
      status: 400,
    });
  }
}

// Endpoint para verificar se a rota está funcionando
export async function GET(request: Request, context: RouteContext) {
    const { instanceId } = context.params;
    return NextResponse.json({ message: `Endpoint do webhook para a instância ${instanceId} está ativo.` });
}

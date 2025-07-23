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
  try {
    const { instanceId } = context.params;
    const body = await request.json();
    
    console.log(`Webhook recebido para a instância ${instanceId}:`, JSON.stringify(body, null, 2));

    // Salva o log do webhook no Firestore
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: body,
      receivedAt: serverTimestamp(),
    });


    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    if (error instanceof Error) {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: context.params.instanceId,
            payload: { error: error.message, stack: error.stack },
            receivedAt: serverTimestamp(),
            isError: true,
        });
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

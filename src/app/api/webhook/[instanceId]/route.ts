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
    rawBody = await request.text();
    let payload;

    try {
      // A Evolution API envia um array com um único objeto.
      const parsedBody = JSON.parse(rawBody);
      
      // Verificamos se é um array e pegamos o primeiro elemento.
      if (Array.isArray(parsedBody) && parsedBody.length > 0) {
        payload = parsedBody[0];
      } else {
        // Se não for um array, usamos o corpo como está (para o botão de teste).
        payload = parsedBody;
      }

    } catch (e) {
      // Se a análise JSON falhar, registramos o corpo de texto bruto.
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: {
          error: "Corpo recebido não é um JSON válido ou está em formato inesperado.",
          rawBody: rawBody,
        },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      // Ainda retornamos 200 para evitar novas tentativas do webhook.
      return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com corpo não-JSON.` });
    }

    // Se o payload foi processado com sucesso, salve-o.
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
    });

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });

  } catch (error: unknown) {
    // Este bloco captura erros mais graves, como falha ao ler a requisição.
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
              rawBody: rawBody ?? "Não foi possível ler o corpo da requisição.",
            },
            receivedAt: serverTimestamp(),
            isError: true,
        });
    } catch (dbError) {
        console.error('FALHA CRÍTICA: Não foi possível salvar o log de erro do webhook no Firestore:', dbError);
        console.error('Erro original do Webhook:', error);
    }
    
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

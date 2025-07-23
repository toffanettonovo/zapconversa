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
  let rawBody: string = '';

  try {
    // Passo 1: Tenta ler o corpo da requisição como texto.
    try {
      rawBody = await request.text();
    } catch (readError: any) {
      // Se nem mesmo ler o corpo como texto funcionar, registra um erro crítico.
      console.error('CRITICAL: Failed to read request body.', readError);
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: {
          error: "Falha crítica ao ler o corpo da requisição.",
          details: readError.message,
          rawBody: "Corpo ilegível",
        },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      return new Response('Error reading request body', { status: 400 });
    }

    // Passo 2: Tenta analisar o texto bruto como JSON.
    let payload;
    let isError = false;
    try {
      const parsedData = JSON.parse(rawBody);
      
      // Verifica se é um array e pega o primeiro elemento, como no exemplo do n8n.
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        payload = parsedData[0];
      } else {
        payload = parsedData;
      }
    } catch (jsonError) {
      // Se a análise do JSON falhar, registra o corpo bruto como payload.
      isError = true;
      payload = {
        error: "Corpo recebido não é um JSON válido ou está em formato inesperado.",
        rawBody: rawBody,
      };
    }

    // Passo 3: Salva o resultado (seja o JSON analisado ou o erro com o corpo bruto) no Firestore.
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
      isError: isError,
    });

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });

  } catch (error: any) {
    // Captura de erro geral para problemas inesperados durante o processo.
    console.error('FATAL: Unknown error processing webhook.', error);
    try {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: instanceId,
            payload: { 
              error: "Erro Fatal no Endpoint do Webhook",
              details: error.message,
              stack: error.stack,
              rawBodyAttempt: rawBody || "Não foi possível ler o corpo da requisição.",
            },
            receivedAt: serverTimestamp(),
            isError: true,
        });
    } catch (dbError) {
        console.error('CRITICAL FAILURE: Could not save webhook error log to Firestore:', dbError);
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

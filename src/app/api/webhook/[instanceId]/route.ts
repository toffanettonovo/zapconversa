// src/app/api/webhook/evolution/[instanceId]/route.ts
import { NextResponse } from 'next/server';

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

    // Aqui você pode adicionar lógica para processar a mensagem
    // com base no instanceId. Por exemplo, encontrar a instância no banco de dados
    // e associar a mensagem a ela.

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} recebido com sucesso` });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
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

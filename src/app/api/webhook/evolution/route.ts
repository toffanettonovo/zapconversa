// src/app/api/webhook/evolution/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Aqui você processará a mensagem recebida.
    // Por exemplo, salvar no banco de dados, encaminhar para um chat, etc.

    return NextResponse.json({ status: 'ok', message: 'Webhook recebido com sucesso' });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return new Response('Erro ao processar o webhook.', {
      status: 400,
    });
  }
}

// Endpoint para verificar se a rota está funcionando
export async function GET() {
  return NextResponse.json({ message: 'Endpoint do webhook da Evolution API está ativo.' });
}

'use server';

import { NGROK_URL } from "./data";

export async function testWebhookAction(instanceId: string, instanceName: string) {
  if (!NGROK_URL) {
    return { success: false, error: 'A URL fixa do ngrok não está definida no sistema.' };
  }

  const finalWebhookUrl = `${NGROK_URL}/api/webhook/${instanceId}`;

  try {
    const response = await fetch(finalWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        event: `testFromServerAction-${instanceId}`,
        data: { message: `Este é um teste do painel de administração para a instância ${instanceName}.` },
        instance: instanceName
      }]),
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorBody = 'Falha ao ler o corpo do erro.';
      try {
        errorBody = await response.text();
      } catch {
        // ignore
      }
      throw new Error(`O servidor respondeu com status ${response.status}. Detalhes: ${errorBody}`);
    }

    const result = await response.json();
    return { success: true, message: JSON.stringify(result) };

  } catch (error: any) {
    console.error('Error in testWebhookAction:', error);
    return { success: false, error: error.message };
  }
}

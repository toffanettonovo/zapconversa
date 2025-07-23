// src/services/evolution-api.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Instance } from '@/lib/data';

async function getInstance(instanceId: string): Promise<Instance | null> {
  const instanceRef = doc(db, 'instances', instanceId);
  const instanceSnap = await getDoc(instanceRef);

  if (!instanceSnap.exists()) {
    console.error(`Instância com ID ${instanceId} não encontrada no Firestore.`);
    return null;
  }
  return { id: instanceSnap.id, ...instanceSnap.data() } as Instance;
}

export async function getProfilePicUrl(instanceId: string, remoteJid: string): Promise<string | null> {
  const instance = await getInstance(instanceId);
  if (!instance || !instance.isActive) {
    console.error(`Não foi possível obter os detalhes da instância ou ela está inativa: ${instanceId}`);
    return null;
  }

  const { apiUrl, apiKey, name: instanceName } = instance;
  const endpoint = `${apiUrl}/chat/fetchProfilePictureUrl/${instanceName}`;
  const phoneNumber = remoteJid.split('@')[0];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: phoneNumber }),
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Foto de perfil não encontrada para ${remoteJid} na instância ${instanceId}.`);
        return null;
      }
      const errorData = await response.text();
      throw new Error(`Erro ${response.status} ao buscar foto de perfil: ${errorData}`);
    }
    
    const data = await response.json();
    return data?.profilePictureUrl || null;

  } catch (error) {
    console.error('Erro na chamada da API da Evolution para buscar foto de perfil:', error);
    return null;
  }
}

export async function getMediaAsDataUri(instanceId: string, messageKey: any, messageData: any): Promise<{ dataUri: string | null; mimeType: string | null }> {
  const instance = await getInstance(instanceId);
  if (!instance || !instance.isActive) {
    console.error(`Não foi possível obter os detalhes da instância ou ela está inativa: ${instanceId}`);
    return { dataUri: null, mimeType: null };
  }

  const { apiUrl, apiKey, name: instanceName } = instance;
  const endpoint = `${apiUrl}/chat/getBase64FromMediaMessage/${instanceName}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: { key: messageKey } }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro ${response.status} ao buscar mídia: ${errorData}`);
    }

    const result = await response.json();
    if (result.base64) {
      let mimeType = 'application/octet-stream';
      if (messageData.audioMessage) {
        mimeType = messageData.audioMessage.mimetype || 'audio/ogg';
      } else if (messageData.imageMessage) {
        mimeType = messageData.imageMessage.mimetype || 'image/jpeg';
      } else if (messageData.documentMessage) {
        mimeType = messageData.documentMessage.mimetype || 'application/pdf';
      } else if (messageData.stickerMessage) {
        mimeType = messageData.stickerMessage.mimetype || 'image/webp';
      }

      const dataUri = `data:${mimeType};base64,${result.base64}`;
      return { dataUri, mimeType };
    }
    return { dataUri: null, mimeType: null };

  } catch (error) {
    console.error('Erro na chamada da API da Evolution para buscar mídia:', error);
    return { dataUri: null, mimeType: null };
  }
}

export async function sendTextMessage(instanceId: string, number: string, text: string) {
  const instance = await getInstance(instanceId);
  if (!instance || !instance.isActive) {
    throw new Error(`Instância ${instanceId} não encontrada ou inativa.`);
  }

  const { apiUrl, apiKey, name: instanceName } = instance;
  const endpoint = `${apiUrl}/message/sendText/${instanceName}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: number.split('@')[0],
        textMessage: {
          text: text,
        },
      }),
      cache: 'no-store',
    });
    
    if (!response.ok) {
        let errorBody = 'Falha ao ler o corpo do erro da API.';
        try {
            // Clona a resposta para poder ler o corpo duas vezes se necessário
            const clonedResponse = response.clone();
            // Tenta ler como JSON primeiro
            const jsonError = await clonedResponse.json().catch(() => null);
            if (jsonError && (jsonError.message || jsonError.error)) {
                errorBody = `API Error: ${jsonError.message || jsonError.error}`;
            } else {
                 // Se não for JSON ou não tiver um campo de mensagem, lê como texto
                 errorBody = await response.text();
            }
        } catch (e) {
            console.error("Could not parse error response body:", e);
        }
        console.error(`API Error Response [${response.status}]:`, errorBody);
        throw new Error(`Falha ao enviar mensagem. Status: ${response.status}. Detalhes: ${errorBody}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('Erro fatal na chamada da API da Evolution para enviar texto:', error);
    // Re-lança o erro para que a Server Action possa capturá-lo com a mensagem completa
    throw error;
  }
}

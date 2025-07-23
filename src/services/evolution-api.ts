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
  // Endpoint e método corretos, conforme o curl funcional
  const endpoint = `${apiUrl}/chat/fetchProfilePictureUrl/${instanceName}`;
  const phoneNumber = remoteJid.split('@')[0]; // Remove o sufixo @s.whatsapp.net

  try {
    const response = await fetch(endpoint, {
      method: 'POST', // Método correto é POST
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json', // Header necessário para o POST
      },
      body: JSON.stringify({ number: phoneNumber }), // Corpo da requisição com o número
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
    // A resposta contém a URL no campo profilePictureUrl
    return data?.profilePictureUrl || null;

  } catch (error) {
    console.error('Erro na chamada da API da Evolution para buscar foto de perfil:', error);
    return null;
  }
}

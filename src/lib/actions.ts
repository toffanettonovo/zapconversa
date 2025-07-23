'use server';

import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getProfilePicUrl, sendTextMessage } from "@/services/evolution-api";
import type { Conversation } from "./data";

export async function testWebhookAction(instanceId: string, instanceName: string, ngrokUrl: string) {
  if (!ngrokUrl) {
    return { success: false, error: 'A URL do ngrok não foi fornecida.' };
  }

  const finalWebhookUrl = `${ngrokUrl}/api/webhook/${instanceId}`;

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

export async function updateProfilePicturesAction() {
    console.log('Iniciando a sincronização de fotos de perfil...');
    const conversationsRef = collection(db, 'conversations');
    const snapshot = await getDocs(conversationsRef);

    if (snapshot.empty) {
        console.log('Nenhuma conversa encontrada.');
        return { success: true, message: 'Nenhuma conversa para verificar.' };
    }

    let updatedCount = 0;
    let checkedCount = 0;
    const promises = [];

    for (const docSnap of snapshot.docs) {
        checkedCount++;
        const conversation = { id: docSnap.id, ...docSnap.data() } as Conversation;

        // Tenta atualizar se o avatar não existir ou se for um placeholder
        if ((!conversation.avatar || conversation.avatar.includes('placehold.co')) && conversation.instanceId && conversation.id) {
            const promise = getProfilePicUrl(conversation.instanceId, conversation.id)
                .then(newAvatarUrl => {
                    if (newAvatarUrl) {
                        const conversationDocRef = doc(db, 'conversations', conversation.id);
                        updatedCount++;
                        return updateDoc(conversationDocRef, { avatar: newAvatarUrl });
                    }
                })
                .catch(error => {
                    console.error(`Erro ao buscar foto para ${conversation.id}:`, error);
                });
            promises.push(promise);
        }
    }

    await Promise.all(promises);

    const message = `Verificação concluída. ${updatedCount} de ${checkedCount} fotos de perfil foram atualizadas.`;
    console.log(message);
    return { success: true, message };
}


export async function sendTextMessageAction(instanceId: string, number: string, text: string) {
  try {
    const result = await sendTextMessage(instanceId, number, text);
    if (result.key && result.key.id) {
      return { success: true, messageId: result.key.id };
    }
    // Se a chave não estiver presente, mas a API não retornou erro, algo inesperado aconteceu.
    return { success: false, error: 'A API não retornou um ID de mensagem, mas não indicou um erro.', details: result };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem de texto via Server Action:', error);
    return { success: false, error: error.message };
  }
}

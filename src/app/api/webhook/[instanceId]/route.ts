// src/app/api/webhook/[instanceId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { getProfilePicUrl, getMediaAsDataUri } from '@/services/evolution-api';

type RouteContext = {
  params: {
    instanceId: string;
  };
};

async function handleMessageReaction(instanceId: string, data: any) {
  const reactionData = data.message.reactionMessage;
  const conversationId = data.key.remoteJid;
  const targetMessageId = reactionData.key.id;
  const reactionEmoji = reactionData.text;

  if (!conversationId || !targetMessageId) {
    console.warn('Reação recebida sem conversationId ou targetMessageId. Ignorando.');
    return;
  }

  const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCollectionRef, where("messageId", "==", targetMessageId), limit(1));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const messageDoc = querySnapshot.docs[0];
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageDoc.id);
      
      // Se a reação for uma string vazia, o usuário removeu a reação.
      const newReaction = reactionEmoji || null;
      
      await updateDoc(messageRef, { reaction: newReaction });
      console.log(`Reação "${newReaction}" atualizada para a mensagem ${targetMessageId}`);
    } else {
      console.warn(`Mensagem original com ID ${targetMessageId} não encontrada para adicionar reação.`);
    }
  } catch (error) {
    console.error('Erro ao processar reação da mensagem:', error);
  }
}

async function handleMessageUpsert(instanceId: string, data: any) {
  const messageData = data.message;
  const key = data.key;
  
  if (!messageData || !key || !key.remoteJid) {
    console.warn('Webhook "messages.upsert" recebido sem dados de mensagem ou chave válidos. Ignorando.', data);
    return;
  }

  // Se for uma reação, processa e encerra o fluxo aqui.
  if (messageData.reactionMessage) {
    console.log(`Reação recebida: "${messageData.reactionMessage.text}" para a mensagem ${messageData.reactionMessage.key.id}.`);
    await handleMessageReaction(instanceId, data);
    return;
  }
  
  const conversationId = key.remoteJid;
  const conversationRef = doc(db, 'conversations', conversationId);
  const messagesCollectionRef = collection(conversationRef, 'messages');

  let messageText = '[Mídia não suportada]';
  let messageType = 'unsupported';
  let mediaUrl = null;
  let mediaName: string | null = null;

  if (messageData.conversation) {
    messageText = messageData.conversation;
    messageType = 'text';
  } else if (messageData.extendedTextMessage?.text) {
    messageText = messageData.extendedTextMessage.text;
    messageType = 'text';
  } else if (messageData.audioMessage) {
    messageText = '';
    messageType = 'audio';
    const mediaResult = await getMediaAsDataUri(instanceId, key, messageData);
    if(mediaResult.dataUri) {
      mediaUrl = mediaResult.dataUri;
    }
  } else if (messageData.imageMessage) {
    messageText = messageData.imageMessage.caption || '';
    messageType = 'image';
    const mediaResult = await getMediaAsDataUri(instanceId, key, messageData);
    if(mediaResult.dataUri) {
      mediaUrl = mediaResult.dataUri;
    }
  } else if (messageData.documentMessage) {
    messageText = messageData.documentMessage.caption || '';
    messageType = 'document';
    mediaName = messageData.documentMessage.fileName || 'document.pdf';
    const mediaResult = await getMediaAsDataUri(instanceId, key, messageData);
    if (mediaResult.dataUri) {
      mediaUrl = mediaResult.dataUri;
    }
  } else if (messageData.videoMessage) {
    messageText = messageData.videoMessage.caption || 'Vídeo';
    messageType = 'video';
  } else if (messageData.stickerMessage) {
    messageText = '';
    messageType = 'sticker';
    mediaName = null;
    const mediaResult = await getMediaAsDataUri(instanceId, key, messageData);
    if(mediaResult.dataUri) {
        mediaUrl = mediaResult.dataUri;
    }
  }

  // Label para a lista de conversas
  let lastMessageLabel = messageText;
  if (messageType === 'audio') lastMessageLabel = 'Áudio';
  if (messageType === 'image') lastMessageLabel = 'Foto';
  if (messageType === 'video') lastMessageLabel = 'Vídeo';
  if (messageType === 'sticker') lastMessageLabel = 'Figurinha';
  if (messageType === 'document' && mediaName) lastMessageLabel = `Documento: ${mediaName}`;


  await addDoc(messagesCollectionRef, {
    text: messageText,
    sender: key.fromMe ? 'me' : 'them',
    timestamp: serverTimestamp(),
    messageTimestamp: data.messageTimestamp ? new Date(data.messageTimestamp * 1000) : new Date(),
    fromMe: key.fromMe,
    messageId: key.id,
    instanceId: instanceId,
    messageType: messageType,
    mediaUrl: mediaUrl,
    mediaName: mediaName,
  });

  const conversationDocSnap = await getDoc(conversationRef);

  if (!conversationDocSnap.exists()) {
    const profilePicUrl = await getProfilePicUrl(instanceId, conversationId);
    await setDoc(conversationRef, {
      id: conversationId,
      name: data.pushName || conversationId,
      avatar: profilePicUrl || 'https://placehold.co/40x40.png',
      'data-ai-hint': 'person avatar',
      lastMessage: lastMessageLabel,
      timestamp: serverTimestamp(),
      unreadCount: key.fromMe ? 0 : 1,
      instanceId: instanceId,
    });
  } else {
    const updateData: any = {
      lastMessage: lastMessageLabel,
      timestamp: serverTimestamp(),
    };
    const currentData = conversationDocSnap.data();
    if (currentData && (!currentData.avatar || currentData.avatar.includes('placehold.co'))) {
        const newAvatarUrl = await getProfilePicUrl(instanceId, conversationId);
        if (newAvatarUrl) {
            updateData.avatar = newAvatarUrl;
        }
    }
    await updateDoc(conversationRef, updateData);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { instanceId } = context.params;
  let payload;

  try {
    const rawBody = await request.text();

    try {
      const parsedData = JSON.parse(rawBody);
      payload = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : parsedData;
    } catch (jsonError) {
      console.error('Webhook payload is not valid JSON. Raw body:', rawBody);
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: { error: "Corpo recebido não é um JSON válido.", rawBody: rawBody },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      return new Response('Invalid JSON format', { status: 400 });
    }

    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
      isError: false,
    });

    if (payload.event === 'messages.upsert') {
      // O 'data' pode ser um array, mas geralmente queremos o primeiro item para uma única mensagem
      const messageData = Array.isArray(payload.data) ? payload.data[0] : payload.data;
      await handleMessageUpsert(instanceId, messageData);
    }

    return NextResponse.json({ status: 'ok', message: `Webhook para ${instanceId} processado com sucesso` });

  } catch (error: any) {
    console.error('FATAL: Unknown error processing webhook.', error);
     try {
        await addDoc(collection(db, 'webhook_logs'), {
            instanceId: instanceId,
            payload: { 
              error: "Erro Fatal no Endpoint do Webhook",
              details: error.message,
              stack: error.stack,
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

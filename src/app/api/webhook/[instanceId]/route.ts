// src/app/api/webhook/[instanceId]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { getProfilePicUrl } from '@/services/evolution-api';

type RouteContext = {
  params: {
    instanceId: string;
  };
};

async function handleMessageUpsert(instanceId: string, data: any) {
  const messageData = data.message;
  const key = data.key;
  
  if (!messageData || !key || !key.remoteJid) {
    console.warn('Webhook "messages.upsert" recebido sem dados de mensagem ou chave válidos.', data);
    return; // Ignora se não for uma mensagem válida
  }
  
  // A "conversa" é com o contato externo.
  const conversationId = key.remoteJid;
  const conversationRef = doc(db, 'conversations', conversationId);
  const messagesCollectionRef = collection(conversationRef, 'messages');

  // Extrai o texto da mensagem (pode estar em `conversation` ou `extendedTextMessage.text`)
  const messageText = messageData.conversation || messageData.extendedTextMessage?.text || '[Mídia não suportada]';

  // 1. Salvar a nova mensagem na subcoleção
  await addDoc(messagesCollectionRef, {
    text: messageText,
    sender: key.fromMe ? 'me' : 'them',
    timestamp: serverTimestamp(), // Usar o timestamp do servidor para ordenação
    messageTimestamp: data.messageTimestamp ? new Date(data.messageTimestamp * 1000) : new Date(), // Timestamp original
    fromMe: key.fromMe,
    messageId: key.id,
    instanceId: instanceId, // Associa a mensagem à instância
  });

  // 2. Criar ou atualizar o documento da conversa principal
  const conversationDocSnap = await getDoc(conversationRef);

  if (!conversationDocSnap.exists()) {
    // Se a conversa não existe, primeiro busca a foto de perfil
    const profilePicUrl = await getProfilePicUrl(instanceId, conversationId);

    // Depois, cria o documento com a foto (ou um placeholder)
    await setDoc(conversationRef, {
      id: conversationId,
      name: data.pushName || conversationId, // Usa o pushName se disponível
      avatar: profilePicUrl || 'https://placehold.co/40x40.png',
      'data-ai-hint': 'person avatar',
      lastMessage: messageText,
      timestamp: serverTimestamp(),
      unreadCount: key.fromMe ? 0 : 1, // Só incrementa se a mensagem não for minha
      instanceId: instanceId, // Associa a conversa à instância
    });
  } else {
    // Se a conversa já existe, prepara a atualização
    const updateData: any = {
      lastMessage: messageText,
      timestamp: serverTimestamp(),
    };

    // Verifica se o avatar atual é um placeholder antes de tentar buscar um novo
    const currentData = conversationDocSnap.data();
    if (currentData && currentData.avatar && currentData.avatar.includes('placehold.co')) {
        const newAvatarUrl = await getProfilePicUrl(instanceId, conversationId);
        if (newAvatarUrl) {
            updateData.avatar = newAvatarUrl;
        }
    }
    
    // Atualiza o documento
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
       // O payload pode vir como um array ou um objeto único
      payload = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : parsedData;
    } catch (jsonError) {
      console.error('Webhook payload is not valid JSON. Raw body:', rawBody);
      // Ainda salva o log de erro, mas não tenta processar mais
      await addDoc(collection(db, 'webhook_logs'), {
        instanceId: instanceId,
        payload: { error: "Corpo recebido não é um JSON válido.", rawBody: rawBody },
        receivedAt: serverTimestamp(),
        isError: true,
      });
      return new Response('Invalid JSON format', { status: 400 });
    }

    // Salva o log original (útil para depuração)
    await addDoc(collection(db, 'webhook_logs'), {
      instanceId: instanceId,
      payload: payload,
      receivedAt: serverTimestamp(),
      isError: false,
    });

    // Processa o evento específico
    if (payload.event === 'messages.upsert') {
      await handleMessageUpsert(instanceId, payload.data);
    }
    // Outros eventos como 'connection.update' podem ser tratados aqui com 'else if'

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

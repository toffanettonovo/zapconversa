// src/app/api/live-log/route.ts

// Esta é a nossa fila de clientes conectados.
// Usamos `export` para que a rota do webhook possa acessá-la diretamente.
export const clients = new Map<string, (data: string) => void>();

// Esta função agora é exportada para ser chamada diretamente de qualquer lugar do servidor.
export function broadcast(data: string) {
  for (const send of clients.values()) {
    // Envia os dados brutos. Sem `JSON.stringify` ou qualquer formatação.
    send(data);
  }
}

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const id = Date.now().toString() + Math.random();
      const send = (data: string) => {
        // Envia os dados no formato EventStream: `data: <content>\n\n`.
        controller.enqueue(`data: ${data}\n\n`);
      };

      clients.set(id, send);

      // Confirmação de conexão para o cliente
      send(JSON.stringify({ status: 'connected', message: 'Live log stream started.'}));

      req.signal.addEventListener('abort', () => {
        clients.delete(id);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// O POST aqui ainda pode ser útil para testes futuros, mas nosso webhook não o usará mais.
export async function POST(req: Request) {
  try {
    const data = await req.text();
    broadcast(data);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error("Error in live-log POST:", error);
    return new Response('Error reading request body', { status: 400 });
  }
}

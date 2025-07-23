// src/app/api/live-log/route.ts

// This is a simple in-memory message bus.
// In a real-world scenario, you'd use a more robust solution like Redis Pub/Sub.
const clients = new Map<string, (data: string) => void>();

function broadcast(data: string) {
  for (const send of clients.values()) {
    send(data);
  }
}

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const id = Date.now().toString();
      const send = (data: string) => {
        controller.enqueue(`data: ${data}\n\n`);
      };

      clients.set(id, send);
      
      // Send a confirmation message on connection
      send(JSON.stringify({ status: 'connected' }));

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

export async function POST(req: Request) {
  try {
    const data = await req.text();
    broadcast(data);
    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error reading request body', { status: 400 });
  }
}

// src/app/api/live-log/route.ts

// This is a simple in-memory message bus.
// In a real-world scenario, you'd use a more robust solution like Redis Pub/Sub.
const clients = new Map<string, (data: string) => void>();

function broadcast(data: string) {
  for (const send of clients.values()) {
    // IMPORTANT: Send the raw data without trying to parse/format it.
    // This makes the logger robust against any type of webhook body.
    send(data);
  }
}

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const id = Date.now().toString() + Math.random();
      const send = (data: string) => {
        // The data is now a simple string, no need to stringify.
        // It's sent in the EventStream format `data: <content>\n\n`.
        controller.enqueue(`data: ${data}\n\n`);
      };

      clients.set(id, send);
      
      // Send a simple confirmation message on connection
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

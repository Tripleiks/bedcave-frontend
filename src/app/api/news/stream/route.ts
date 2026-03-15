import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Simple in-memory store for connected clients
const clients = new Set<ReadableStreamDefaultController>();

// Broadcast message to all connected clients
export function broadcastNewsUpdate(newsData: any) {
  const message = `data: ${JSON.stringify(newsData)}\n\n`;
  clients.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch {
      // Client disconnected
      clients.delete(controller);
    }
  });
}

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      
      // Send initial connection message
      const welcome = { type: "connected", timestamp: new Date().toISOString() };
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(welcome)}\n\n`));
      
      // Keep connection alive with ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`:ping\n\n`));
        } catch {
          clearInterval(keepAlive);
          clients.delete(controller);
        }
      }, 30000);
      
      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        clients.delete(controller);
      });
    },
    cancel() {
      // Cleanup handled by abort listener
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

import { NextResponse } from 'next/server'

// Store active connections
const connections = new Set()

export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the set
      connections.add(controller)
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Real-time pricing stream connected',
        timestamp: new Date().toISOString()
      })
      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      
      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        try {
          const ping = JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          })
          controller.enqueue(encoder.encode(`data: ${ping}\n\n`))
        } catch (error) {
          clearInterval(pingInterval)
          connections.delete(controller)
        }
      }, 30000) // Ping every 30 seconds
    },
    
    cancel() {
      // Clean up when connection is closed
      connections.delete(controller)
    }
  })
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Function to broadcast price updates to all connected clients
export function broadcastPriceUpdate(priceData) {
  const encoder = new TextEncoder()
  const data = JSON.stringify({
    type: 'priceUpdate',
    data: priceData,
    timestamp: new Date().toISOString()
  })
  
  const message = `data: ${data}\n\n`
  
  // Send to all connected clients
  connections.forEach(controller => {
    try {
      controller.enqueue(encoder.encode(message))
    } catch (error) {
      // Remove failed connections
      connections.delete(controller)
    }
  })
}

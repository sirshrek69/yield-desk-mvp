import { NextResponse } from 'next/server'
import { addConnection, removeConnection } from '../../../../lib/streamUtils'

// Force runtime execution - prevent static generation
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the set
      addConnection(controller)
      
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
          removeConnection(controller)
        }
      }, 30000) // Ping every 30 seconds
    },
    
    cancel() {
      // Clean up when connection is closed
      removeConnection(controller)
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

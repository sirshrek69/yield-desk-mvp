// Store active connections for Server-Sent Events
const connections = new Set()

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

// Add connection to the set
export function addConnection(controller) {
  connections.add(controller)
}

// Remove connection from the set
export function removeConnection(controller) {
  connections.delete(controller)
}

// Get all connections
export function getConnections() {
  return connections
}

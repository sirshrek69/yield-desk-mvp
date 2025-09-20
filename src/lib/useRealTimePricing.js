import { useState, useEffect, useCallback } from 'react'

export function useRealTimePricing() {
  const [prices, setPrices] = useState(new Map())
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  // Fetch initial prices
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/prices')
      const data = await response.json()
      
      const priceMap = new Map()
      data.prices.forEach(price => {
        priceMap.set(price.instrumentKey, price)
      })
      
      setPrices(priceMap)
      setLastUpdate(data.lastUpdate)
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }, [])

  // Set up real-time connection
  useEffect(() => {
    let eventSource = null
    
    const connectToStream = () => {
      try {
        eventSource = new EventSource('/api/prices/stream')
        
        eventSource.onopen = () => {
          setIsConnected(true)
          setConnectionStatus('connected')
          console.log('Real-time pricing connected')
        }
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'priceUpdate') {
              const priceMap = new Map()
              data.data.prices.forEach(price => {
                priceMap.set(price.instrumentKey, price)
              })
              
              setPrices(priceMap)
              setLastUpdate(data.data.lastUpdate)
            } else if (data.type === 'ping') {
              // Keep connection alive
              console.log('Ping received:', data.timestamp)
            }
          } catch (error) {
            console.error('Error parsing price update:', error)
          }
        }
        
        eventSource.onerror = (error) => {
          console.error('EventSource error:', error)
          setIsConnected(false)
          setConnectionStatus('error')
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource) {
              eventSource.close()
            }
            connectToStream()
          }, 5000)
        }
      } catch (error) {
        console.error('Error connecting to price stream:', error)
        setConnectionStatus('error')
      }
    }
    
    // Fetch initial prices
    fetchPrices()
    
    // Connect to real-time stream
    connectToStream()
    
    // Cleanup
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [fetchPrices])

  // Get price for a specific instrument
  const getPrice = useCallback((instrumentKey) => {
    return prices.get(instrumentKey)
  }, [prices])

  // Get all prices
  const getAllPrices = useCallback(() => {
    return Array.from(prices.values())
  }, [prices])

  // Get price change for an instrument
  const getPriceChange = useCallback((instrumentKey) => {
    const price = prices.get(instrumentKey)
    return price ? price.change24h : 0
  }, [prices])

  return {
    prices,
    lastUpdate,
    isConnected,
    connectionStatus,
    getPrice,
    getAllPrices,
    getPriceChange,
    refreshPrices: fetchPrices
  }
}

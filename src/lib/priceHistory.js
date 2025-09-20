// Price history storage and management for trading charts
import { readFileSync } from 'fs'
import { join } from 'path'

// Load instrument data
const instrumentsPath = join(process.cwd(), 'src/app/api/price-service/instrument-seed.json')
const instruments = JSON.parse(readFileSync(instrumentsPath, 'utf8'))

// In-memory price history storage
// Structure: { [instrumentKey]: { [timeframe]: [{ timestamp, price, ytm, volume }] } }
let priceHistory = new Map()

// Timeframe definitions in milliseconds
const TIMEFRAMES = {
  '1H': 60 * 60 * 1000,        // 1 hour
  '4H': 4 * 60 * 60 * 1000,    // 4 hours  
  '1D': 24 * 60 * 60 * 1000,   // 1 day
  '1W': 7 * 24 * 60 * 60 * 1000, // 1 week
  '1M': 30 * 24 * 60 * 60 * 1000, // 1 month
}

// Maximum data points per timeframe to prevent memory issues
const MAX_DATA_POINTS = {
  '1H': 60,   // 60 minutes
  '4H': 90,   // 90 * 4-hour periods (15 days)
  '1D': 90,   // 90 days
  '1W': 52,   // 52 weeks (1 year)
  '1M': 24,   // 24 months (2 years)
}

// Initialize price history for all instruments
function initializePriceHistory() {
  instruments.forEach(instrument => {
    if (!priceHistory.has(instrument.instrumentKey)) {
      priceHistory.set(instrument.instrumentKey, new Map())
      
      // Initialize each timeframe
      Object.keys(TIMEFRAMES).forEach(timeframe => {
        priceHistory.get(instrument.instrumentKey).set(timeframe, [])
      })
    }
  })
}

// Add price data point to history
export function addPriceDataPoint(instrumentKey, priceData) {
  const now = Date.now()
  
  // Initialize if needed
  if (!priceHistory.has(instrumentKey)) {
    priceHistory.set(instrumentKey, new Map())
    Object.keys(TIMEFRAMES).forEach(timeframe => {
      priceHistory.get(instrumentKey).set(timeframe, [])
    })
  }
  
  const instrumentHistory = priceHistory.get(instrumentKey)
  
  // Add to all timeframes
  Object.keys(TIMEFRAMES).forEach(timeframe => {
    const history = instrumentHistory.get(timeframe)
    const timeframeMs = TIMEFRAMES[timeframe]
    const maxPoints = MAX_DATA_POINTS[timeframe]
    
    // Create data point
    const dataPoint = {
      timestamp: now,
      price: priceData.price,
      ytm: priceData.ytm,
      volume: priceData.volume || 0,
      change24h: priceData.change24h || 0
    }
    
    // Add to history
    history.push(dataPoint)
    
    // Clean up old data points
    const cutoffTime = now - (timeframeMs * maxPoints)
    const filteredHistory = history.filter(point => point.timestamp >= cutoffTime)
    
    // Update history
    instrumentHistory.set(timeframe, filteredHistory)
  })
}

// Get price history for a specific instrument and timeframe
export function getPriceHistory(instrumentKey, timeframe = '1D') {
  if (!priceHistory.has(instrumentKey)) {
    return []
  }
  
  const instrumentHistory = priceHistory.get(instrumentKey)
  if (!instrumentHistory.has(timeframe)) {
    return []
  }
  
  return instrumentHistory.get(timeframe)
}

// Get all available timeframes
export function getAvailableTimeframes() {
  return Object.keys(TIMEFRAMES)
}

// Generate sample historical data for demonstration
export function generateSampleHistory(instrumentKey, basePrice = 100, baseYTM = 4.5) {
  const now = Date.now()
  const history = []
  
  // Generate 30 days of hourly data points
  for (let i = 720; i >= 0; i--) { // 30 days * 24 hours
    const timestamp = now - (i * 60 * 60 * 1000) // Each hour
    
    // Generate realistic price movement
    const randomWalk = (Math.random() - 0.5) * 0.02 // ±1% max movement
    const trend = Math.sin(i / 100) * 0.01 // Slight trend
    const price = basePrice * (1 + randomWalk + trend)
    const ytm = baseYTM + (Math.random() - 0.5) * 0.5 // ±0.25% YTM variation
    
    history.push({
      timestamp,
      price: Number(price.toFixed(2)),
      ytm: Number(ytm.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      change24h: (Math.random() - 0.5) * 2
    })
  }
  
  return history
}

// Initialize sample data for all instruments
function initializeSampleData() {
  instruments.forEach(instrument => {
    const instrumentKey = instrument.instrumentKey
    
    // Generate sample data for each timeframe
    Object.keys(TIMEFRAMES).forEach(timeframe => {
      const basePrice = 100 + (Math.random() - 0.5) * 20 // 90-110 range
      const baseYTM = 4.5 + (Math.random() - 0.5) * 2   // 3.5-5.5% range
      
      const sampleData = generateSampleHistory(instrumentKey, basePrice, baseYTM)
      
      // Initialize history if needed
      if (!priceHistory.has(instrumentKey)) {
        priceHistory.set(instrumentKey, new Map())
      }
      
      const instrumentHistory = priceHistory.get(instrumentKey)
      instrumentHistory.set(timeframe, sampleData)
    })
  })
}

// Initialize everything
initializePriceHistory()
initializeSampleData()

// Export for API use
export function getAllPriceHistory() {
  const result = {}
  
  priceHistory.forEach((instrumentHistory, instrumentKey) => {
    result[instrumentKey] = {}
    
    instrumentHistory.forEach((history, timeframe) => {
      result[instrumentKey][timeframe] = history
    })
  })
  
  return result
}

// Get chart data formatted for Recharts
export function getChartData(instrumentKey, timeframe = '1D') {
  const history = getPriceHistory(instrumentKey, timeframe)
  
  return history.map(point => ({
    timestamp: point.timestamp,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    date: new Date(point.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    price: point.price,
    ytm: point.ytm,
    volume: point.volume,
    change24h: point.change24h
  }))
}

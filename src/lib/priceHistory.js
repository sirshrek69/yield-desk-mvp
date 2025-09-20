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

// Generate sample historical OHLC data for demonstration
export function generateSampleOHLCData(instrumentKey, basePrice = 100, baseYTM = 4.5, timeframe = '1D') {
  const now = Date.now()
  const history = []
  
  // Determine interval and data points based on timeframe
  let intervalMs, dataPoints, startOffset
  
  switch (timeframe) {
    case '1H':
      intervalMs = 60 * 60 * 1000 // 1 hour
      dataPoints = 168 // 7 days of hourly data
      startOffset = 168 * intervalMs
      break
    case '4H':
      intervalMs = 4 * 60 * 60 * 1000 // 4 hours
      dataPoints = 90 // 15 days of 4-hour data
      startOffset = 90 * intervalMs
      break
    case '1D':
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      dataPoints = 90 // 90 days
      startOffset = 90 * intervalMs
      break
    case '1W':
      intervalMs = 7 * 24 * 60 * 60 * 1000 // 1 week
      dataPoints = 52 // 52 weeks (1 year)
      startOffset = 52 * intervalMs
      break
    case '1M':
      intervalMs = 30 * 24 * 60 * 60 * 1000 // 1 month (approximate)
      dataPoints = 24 // 24 months (2 years)
      startOffset = 24 * intervalMs
      break
    default:
      intervalMs = 24 * 60 * 60 * 1000
      dataPoints = 90
      startOffset = 90 * intervalMs
  }
  
  let currentPrice = basePrice
  let currentYTM = baseYTM
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - startOffset + (i * intervalMs)
    
    // Generate realistic OHLC data
    const volatility = 0.01 + (Math.random() * 0.02) // 1-3% volatility
    
    // Generate open, high, low, close prices
    const open = currentPrice
    const change = (Math.random() - 0.5) * volatility * currentPrice
    const close = Math.max(50, Math.min(150, open + change))
    
    // High and low are based on the range between open and close
    const range = Math.abs(close - open) * (0.5 + Math.random() * 1.5) // 0.5x to 2x the range
    const high = Math.max(open, close) + (Math.random() * range)
    const low = Math.min(open, close) - (Math.random() * range)
    
    // Ensure high >= max(open, close) and low <= min(open, close)
    const actualHigh = Math.max(open, close, high)
    const actualLow = Math.min(open, close, low)
    
    // YTM changes more slowly than price
    const ytmChange = (Math.random() - 0.5) * 0.1 // ±0.05% YTM change
    currentYTM = Math.max(0.1, Math.min(15, currentYTM + ytmChange))
    
    // Volume varies based on price movement
    const baseVolume = 1000000
    const volumeMultiplier = 0.5 + Math.random() * 2 // 0.5x to 2.5x base volume
    const volume = Math.floor(baseVolume * volumeMultiplier)
    
    // Calculate change from previous period
    const change24h = i > 0 ? ((close - history[i-1].close) / history[i-1].close) * 100 : 0
    
    history.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(actualHigh.toFixed(2)),
      low: Number(actualLow.toFixed(2)),
      close: Number(close.toFixed(2)),
      ytm: Number(currentYTM.toFixed(2)),
      volume,
      change24h: Number(change24h.toFixed(2))
    })
    
    // Update current price for next iteration
    currentPrice = close
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
      
      const sampleData = generateSampleOHLCData(instrumentKey, basePrice, baseYTM, timeframe)
      
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
  
  return history.map(point => {
    const date = new Date(point.timestamp)
    
    // Format timestamp based on timeframe
    let timeLabel, dateLabel
    switch (timeframe) {
      case '1H':
        timeLabel = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        dateLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        break
      case '4H':
        timeLabel = `${date.getHours().toString().padStart(2, '0')}:00`
        dateLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        break
      case '1D':
        timeLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        dateLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        })
        break
      case '1W':
        timeLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        dateLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit'
        })
        break
      case '1M':
        timeLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })
        dateLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        })
        break
      default:
        timeLabel = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        dateLabel = timeLabel
    }
    
    return {
      timestamp: point.timestamp,
      time: timeLabel,
      date: dateLabel,
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      ytm: point.ytm,
      volume: point.volume,
      change24h: point.change24h,
      // For candlestick color determination
      isPositive: point.close >= point.open
    }
  })
}

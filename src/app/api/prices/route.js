import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load real data from JSON files
const instrumentsPath = join(process.cwd(), 'src/app/api/price-service/instrument-seed.json')
const instruments = JSON.parse(readFileSync(instrumentsPath, 'utf8'))

const ratingsPath = join(process.cwd(), 'src/app/api/price-service/ratings-data.json')
const ratingsData = JSON.parse(readFileSync(ratingsPath, 'utf8'))

// In-memory price cache with real-time updates
let priceCache = new Map()
let lastUpdate = Date.now()

// Currency conversion rates
const CURRENCY_RATES = {
  'USD': 1.0,
  'EUR': 1.08,
  'GBP': 1.27,
  'JPY': 0.0067,
  'CAD': 0.74,
  'AUD': 0.66,
  'NZD': 0.61,
  'CHF': 1.12,
  'SEK': 0.093,
  'DKK': 0.145,
  'NOK': 0.093,
  'PLN': 0.25,
  'MXN': 0.059,
  'BRL': 0.20,
  'CLP': 0.0011,
  'ILS': 0.27,
}

// Helper function to get rating for instrument
function getRatingForInstrument(instrument) {
  const { group, countryCode, issuerTicker } = instrument
  
  let ratingScope, ratingKey
  
  if (group === 'gov' || group === 'infl') {
    ratingScope = 'sovereign'
    ratingKey = countryCode
  } else if (group === 'corp') {
    ratingScope = 'corporate'
    ratingKey = issuerTicker
  } else {
    return null
  }
  
  const rating = ratingsData[ratingScope]?.[ratingKey]
  return rating || null
}

// Generate realistic price movement based on bond characteristics
function generatePriceMovement(instrument, currentPrice, currentYTM) {
  const { group, currency, couponPct, maturityDate } = instrument
  
  // Base volatility based on bond type
  let volatility = 0.1 // Default 0.1%
  
  if (group === 'gov') {
    volatility = 0.05 // Government bonds: lower volatility
  } else if (group === 'corp') {
    volatility = 0.2 // Corporate bonds: higher volatility
  } else if (group === 'infl') {
    volatility = 0.15 // Inflation-protected: medium volatility
  }
  
  // Currency risk adjustment
  if (currency !== 'USD') {
    volatility *= 1.5 // Higher volatility for non-USD bonds
  }
  
  // Maturity risk adjustment
  const maturity = new Date(maturityDate)
  const yearsToMaturity = (maturity - new Date()) / (365.25 * 24 * 60 * 60 * 1000)
  if (yearsToMaturity > 10) {
    volatility *= 1.3 // Longer maturity = higher volatility
  }
  
  // Generate random movement
  const randomWalk = (Math.random() - 0.5) * 2 // -1 to +1
  const priceChange = randomWalk * volatility
  const ytmChange = randomWalk * volatility * 0.5 // YTM changes less than price
  
  return {
    priceChange,
    ytmChange
  }
}

// Initialize price cache with realistic starting values
function initializePriceCache() {
  instruments.forEach(instrument => {
    const rating = getRatingForInstrument(instrument)
    
    // Base price calculation
    let basePrice = 100
    
    // Adjust based on coupon rate
    if (instrument.couponPct > 0) {
      basePrice = 100 + (instrument.couponPct - 3) * 2 // Higher coupon = higher price
    }
    
    // Adjust based on rating
    if (rating?.composite) {
      if (rating.composite.includes('AAA') || rating.composite.includes('Aaa')) {
        basePrice += 2 // Premium for highest rated bonds
      } else if (rating.composite.includes('BB') || rating.composite.includes('Ba')) {
        basePrice -= 3 // Discount for lower rated bonds
      }
    }
    
    // Add some random variation
    basePrice += (Math.random() - 0.5) * 4
    
    // Calculate base YTM
    let baseYTM = instrument.couponPct || 0
    if (instrument.couponPct === 0) {
      // Discount bonds (T-bills)
      baseYTM = 4.5 + Math.random() * 1 // 4.5-5.5% for T-bills
    } else {
      // Adjust YTM based on rating and maturity
      const maturity = new Date(instrument.maturityDate)
      const yearsToMaturity = (maturity - new Date()) / (365.25 * 24 * 60 * 60 * 1000)
      
      if (rating?.composite?.includes('AAA')) {
        baseYTM += 0.5 // Lower yield for highest rated
      } else if (rating?.composite?.includes('BB')) {
        baseYTM += 2.0 // Higher yield for lower rated
      }
      
      // Term structure adjustment
      if (yearsToMaturity > 10) {
        baseYTM += 1.0 // Higher yield for longer maturity
      }
    }
    
    priceCache.set(instrument.instrumentKey, {
      price: Number(basePrice.toFixed(2)),
      ytm: Number(baseYTM.toFixed(2)),
      lastUpdate: Date.now(),
      change24h: (Math.random() - 0.5) * 2, // Random 24h change
      volume: Math.floor(Math.random() * 10000000) + 1000000 // Random volume
    })
  })
}

// Update all prices with realistic movements
function updateAllPrices() {
  const now = Date.now()
  
  instruments.forEach(instrument => {
    const cached = priceCache.get(instrument.instrumentKey)
    if (!cached) return
    
    const movement = generatePriceMovement(instrument, cached.price, cached.ytm)
    
    // Apply price movement
    const newPrice = Math.max(50, Math.min(150, cached.price + movement.priceChange))
    const newYTM = Math.max(0.1, Math.min(15, cached.ytm + movement.ytmChange))
    
    // Calculate 24h change
    const change24h = ((newPrice - cached.price) / cached.price) * 100
    
    priceCache.set(instrument.instrumentKey, {
      price: Number(newPrice.toFixed(2)),
      ytm: Number(newYTM.toFixed(2)),
      lastUpdate: now,
      change24h: Number(change24h.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    })
  })
  
  lastUpdate = now
}

// Initialize cache on first load
if (priceCache.size === 0) {
  initializePriceCache()
}

// Update prices every 2 seconds and broadcast to connected clients
setInterval(() => {
  updateAllPrices()
  broadcastUpdates()
}, 2000)

// Broadcast price updates to connected clients
function broadcastUpdates() {
  try {
    const prices = Array.from(priceCache.entries()).map(([instrumentKey, data]) => ({
      instrumentKey,
      ...data
    }))
    
    // Import and use the broadcast function
    const { broadcastPriceUpdate } = require('./stream/route.js')
    if (broadcastPriceUpdate) {
      broadcastPriceUpdate({
        prices,
        lastUpdate: new Date(lastUpdate).toISOString(),
        totalInstruments: prices.length
      })
    }
  } catch (error) {
    // Silently handle broadcast errors
  }
}

export async function GET() {
  const now = Date.now()
  
  // Ensure cache is initialized
  if (priceCache.size === 0) {
    initializePriceCache()
  }
  
  // Update prices if it's been more than 2 seconds
  if (now - lastUpdate > 2000) {
    updateAllPrices()
  }
  
  // Convert cache to array format
  const prices = Array.from(priceCache.entries()).map(([instrumentKey, data]) => ({
    instrumentKey,
    ...data
  }))
  
  return NextResponse.json({
    prices,
    lastUpdate: new Date(lastUpdate).toISOString(),
    totalInstruments: prices.length,
    updateFrequency: '2 seconds'
  })
}

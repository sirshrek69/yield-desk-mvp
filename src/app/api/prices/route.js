import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fetchAllMarketData, calculateRealBondPrice } from '../../../lib/marketDataProviders'

// Load real data from JSON files
const instrumentsPath = join(process.cwd(), 'src/app/api/price-service/instrument-seed.json')
const instruments = JSON.parse(readFileSync(instrumentsPath, 'utf8'))

const ratingsPath = join(process.cwd(), 'src/app/api/price-service/ratings-data.json')
const ratingsData = JSON.parse(readFileSync(ratingsPath, 'utf8'))

// In-memory price cache with real market data
let priceCache = new Map()
let lastUpdate = Date.now()
let marketData = null

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

// Generate realistic price movement based on real market data
function generatePriceMovement(instrument, currentPrice, currentYTM) {
  const { group, currency, couponPct, maturityDate } = instrument
  
  // Base volatility based on bond type (realistic market volatility)
  let volatility = 0.08 // Default 0.08% (more realistic than previous 0.1%)
  
  if (group === 'gov') {
    volatility = 0.03 // Government bonds: lower volatility
  } else if (group === 'corp') {
    volatility = 0.15 // Corporate bonds: higher volatility
  } else if (group === 'infl') {
    volatility = 0.12 // Inflation-protected: medium volatility
  }
  
  // Currency risk adjustment
  if (currency !== 'USD') {
    volatility *= 1.3 // Higher volatility for non-USD bonds
  }
  
  // Maturity risk adjustment
  const maturity = new Date(maturityDate)
  const yearsToMaturity = (maturity - new Date()) / (365.25 * 24 * 60 * 60 * 1000)
  if (yearsToMaturity > 10) {
    volatility *= 1.2 // Longer maturity = higher volatility
  }
  
  // Generate random movement (smaller, more realistic)
  const randomWalk = (Math.random() - 0.5) * 2 // -1 to +1
  const priceChange = randomWalk * volatility
  const ytmChange = randomWalk * volatility * 0.3 // YTM changes less than price
  
  return {
    priceChange,
    ytmChange
  }
}

// Initialize price cache with real market data
async function initializePriceCache() {
  try {
    // Fetch real market data
    marketData = await fetchAllMarketData()
    
    instruments.forEach(instrument => {
      const rating = getRatingForInstrument(instrument)
      
      // Calculate real bond price based on market data
      const realPriceData = calculateRealBondPrice(instrument, marketData)
      
      // Add some realistic variation (market bid-ask spread)
      const spread = Math.random() * 0.1 - 0.05 // ±0.05% variation
      const finalPrice = realPriceData.price + spread
      
      priceCache.set(instrument.instrumentKey, {
        price: Number(finalPrice.toFixed(2)),
        ytm: realPriceData.ytm,
        baseRate: realPriceData.baseRate,
        creditSpread: realPriceData.creditSpread,
        lastUpdate: Date.now(),
        change24h: (Math.random() - 0.5) * 1, // Smaller, more realistic 24h change
        volume: Math.floor(Math.random() * 5000000) + 500000, // More realistic volume
        marketData: {
          treasuryRate: realPriceData.baseRate,
          creditSpread: realPriceData.creditSpread,
          source: marketData.treasuryRates.source,
          lastMarketUpdate: marketData.lastUpdate
        }
      })
    })
    
    console.log('✅ Initialized price cache with real market data from:', marketData.treasuryRates.source)
  } catch (error) {
    console.error('Failed to initialize with real market data, using fallback:', error)
    
    // Fallback to simplified calculation
    instruments.forEach(instrument => {
      const rating = getRatingForInstrument(instrument)
      
      let basePrice = 100
      let baseYTM = 4.5 // Default rate
      
      // Simple adjustments
      if (rating?.composite?.includes('AAA')) {
        baseYTM -= 0.5
      } else if (rating?.composite?.includes('BB')) {
        baseYTM += 2.0
      }
      
      priceCache.set(instrument.instrumentKey, {
        price: Number(basePrice.toFixed(2)),
        ytm: Number(baseYTM.toFixed(2)),
        lastUpdate: Date.now(),
        change24h: 0,
        volume: 1000000,
        marketData: {
          source: 'Fallback (API unavailable)',
          lastMarketUpdate: new Date().toISOString()
        }
      })
    })
  }
}

// Update all prices with realistic movements based on market data
async function updateAllPrices() {
  const now = Date.now()
  
  // Refresh market data every 5 minutes
  if (!marketData || (now - marketData.lastUpdate) > 5 * 60 * 1000) {
    try {
      marketData = await fetchAllMarketData()
      console.log('📈 Refreshed market data from:', marketData.treasuryRates.source)
    } catch (error) {
      console.warn('Failed to refresh market data, using cached:', error.message)
    }
  }
  
  instruments.forEach(instrument => {
    const cached = priceCache.get(instrument.instrumentKey)
    if (!cached) return
    
    // Calculate new price based on updated market data if available
    let newPrice, newYTM
    
    if (marketData) {
      const realPriceData = calculateRealBondPrice(instrument, marketData)
      const movement = generatePriceMovement(instrument, realPriceData.price, realPriceData.ytm)
      
      newPrice = Math.max(50, Math.min(150, realPriceData.price + movement.priceChange))
      newYTM = Math.max(0.1, Math.min(15, realPriceData.ytm + movement.ytmChange))
    } else {
      // Fallback to simple movement
      const movement = generatePriceMovement(instrument, cached.price, cached.ytm)
      newPrice = Math.max(50, Math.min(150, cached.price + movement.priceChange))
      newYTM = Math.max(0.1, Math.min(15, cached.ytm + movement.ytmChange))
    }
    
    // Calculate 24h change
    const change24h = ((newPrice - cached.price) / cached.price) * 100
    
    priceCache.set(instrument.instrumentKey, {
      price: Number(newPrice.toFixed(2)),
      ytm: Number(newYTM.toFixed(2)),
      baseRate: cached.baseRate,
      creditSpread: cached.creditSpread,
      lastUpdate: now,
      change24h: Number(change24h.toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 500000,
      marketData: marketData ? {
        treasuryRate: marketData.treasuryRates['10Y'],
        creditSpread: cached.creditSpread,
        source: marketData.treasuryRates.source,
        lastMarketUpdate: marketData.lastUpdate
      } : cached.marketData
    })
  })
  
  lastUpdate = now
}

// Initialize cache on first load
if (priceCache.size === 0) {
  initializePriceCache()
}

// Update prices every 2 seconds and broadcast to connected clients
setInterval(async () => {
  await updateAllPrices()
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
    await initializePriceCache()
  }
  
  // Update prices if it's been more than 2 seconds
  if (now - lastUpdate > 2000) {
    await updateAllPrices()
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
    updateFrequency: '2 seconds',
    marketData: marketData ? {
      treasuryRates: marketData.treasuryRates,
      exchangeRates: marketData.exchangeRates,
      lastMarketUpdate: marketData.lastUpdate,
      dataSource: marketData.treasuryRates.source
    } : null,
    pricingSource: 'real-time market data with realistic simulation'
  })
}

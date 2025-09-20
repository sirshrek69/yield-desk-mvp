// Real market data providers and API integrations
import { NextResponse } from 'next/server'

// Configuration for different data providers
const DATA_PROVIDERS = {
  // Federal Reserve Economic Data (FRED) - Free
  FRED: {
    baseUrl: 'https://api.stlouisfed.org/fred',
    apiKey: process.env.FRED_API_KEY || 'demo', // Get free key from https://fred.stlouisfed.org/docs/api/api_key.html
    endpoints: {
      treasury10Y: '/series/observations?series_id=GS10&api_key=',
      treasury30Y: '/series/observations?series_id=GS30&api_key=',
      treasury2Y: '/series/observations?series_id=GS2&api_key=',
      treasury3M: '/series/observations?series_id=GS3M&api_key=',
      fedFundsRate: '/series/observations?series_id=FEDFUNDS&api_key='
    }
  },
  
  // Exchange Rates API - Free tier available
  EXCHANGE_RATES: {
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
    freeTier: true,
    endpoints: {
      usd: '/USD',
      eur: '/EUR',
      gbp: '/GBP'
    }
  },
  
  // Alpha Vantage - Free tier available
  ALPHA_VANTAGE: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo', // Get free key from https://www.alphavantage.co/support/#api-key
    endpoints: {
      treasury: '?function=TREASURY_YIELD&interval=daily&apikey=',
      fx: '?function=FX_DAILY&from_symbol=USD&to_symbol='
    }
  },
  
  // Yahoo Finance - Free but unofficial
  YAHOO_FINANCE: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    freeTier: true,
    endpoints: {
      bonds: '/BND',
      treasury: '/TLT'
    }
  }
}

// Cache for storing fetched data
let dataCache = {
  treasuryRates: null,
  exchangeRates: null,
  lastUpdate: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
}

// Helper function to make API requests with error handling
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'YieldDesk/1.0',
          ...options.headers
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn(`API request failed (attempt ${i + 1}/${retries}):`, error.message)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
    }
  }
}

// Fetch Treasury rates from Federal Reserve
export async function fetchTreasuryRates() {
  try {
    const baseUrl = DATA_PROVIDERS.FRED.baseUrl
    const apiKey = DATA_PROVIDERS.FRED.apiKey
    
    // Fetch multiple treasury rates in parallel
    const [rate10Y, rate30Y, rate2Y, rate3M] = await Promise.all([
      fetchWithRetry(`${baseUrl}${DATA_PROVIDERS.FRED.endpoints.treasury10Y}${apiKey}`),
      fetchWithRetry(`${baseUrl}${DATA_PROVIDERS.FRED.endpoints.treasury30Y}${apiKey}`),
      fetchWithRetry(`${baseUrl}${DATA_PROVIDERS.FRED.endpoints.treasury2Y}${apiKey}`),
      fetchWithRetry(`${baseUrl}${DATA_PROVIDERS.FRED.endpoints.treasury3M}${apiKey}`)
    ])
    
    return {
      '10Y': parseFloat(rate10Y.observations[0]?.value) || 4.5,
      '30Y': parseFloat(rate30Y.observations[0]?.value) || 4.7,
      '2Y': parseFloat(rate2Y.observations[0]?.value) || 4.2,
      '3M': parseFloat(rate3M.observations[0]?.value) || 4.8,
      lastUpdate: new Date().toISOString(),
      source: 'Federal Reserve Economic Data (FRED)'
    }
  } catch (error) {
    console.error('Failed to fetch treasury rates:', error)
    // Fallback to reasonable defaults
    return {
      '10Y': 4.5,
      '30Y': 4.7,
      '2Y': 4.2,
      '3M': 4.8,
      lastUpdate: new Date().toISOString(),
      source: 'Fallback (API unavailable)'
    }
  }
}

// Fetch exchange rates
export async function fetchExchangeRates() {
  try {
    const response = await fetchWithRetry(`${DATA_PROVIDERS.EXCHANGE_RATES.baseUrl}/USD`)
    
    return {
      USD: 1.0,
      EUR: response.rates.EUR || 1.08,
      GBP: response.rates.GBP || 1.27,
      JPY: response.rates.JPY || 0.0067,
      CAD: response.rates.CAD || 0.74,
      AUD: response.rates.AUD || 0.66,
      NZD: response.rates.NZD || 0.61,
      CHF: response.rates.CHF || 1.12,
      SEK: response.rates.SEK || 0.093,
      DKK: response.rates.DKK || 0.145,
      NOK: response.rates.NOK || 0.093,
      PLN: response.rates.PLN || 0.25,
      MXN: response.rates.MXN || 0.059,
      BRL: response.rates.BRL || 0.20,
      lastUpdate: new Date().toISOString(),
      source: 'ExchangeRate-API'
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback to static rates
    return {
      USD: 1.0,
      EUR: 1.08,
      GBP: 1.27,
      JPY: 0.0067,
      CAD: 0.74,
      AUD: 0.66,
      NZD: 0.61,
      CHF: 1.12,
      SEK: 0.093,
      DKK: 0.145,
      NOK: 0.093,
      PLN: 0.25,
      MXN: 0.059,
      BRL: 0.20,
      lastUpdate: new Date().toISOString(),
      source: 'Fallback (API unavailable)'
    }
  }
}

// Fetch corporate bond spreads (using Alpha Vantage or similar)
export async function fetchCorporateBondSpreads() {
  try {
    // For now, we'll use realistic spreads based on credit ratings
    // In production, you'd integrate with a bond data provider
    return {
      'AAA': 0.3,  // 30 bps over treasury
      'AA': 0.5,   // 50 bps over treasury
      'A': 0.8,    // 80 bps over treasury
      'BBB': 1.5,  // 150 bps over treasury
      'BB': 3.0,   // 300 bps over treasury
      'B': 5.0,    // 500 bps over treasury
      lastUpdate: new Date().toISOString(),
      source: 'Market consensus (estimated)'
    }
  } catch (error) {
    console.error('Failed to fetch corporate spreads:', error)
    return {
      'AAA': 0.3,
      'AA': 0.5,
      'A': 0.8,
      'BBB': 1.5,
      'BB': 3.0,
      'B': 5.0,
      lastUpdate: new Date().toISOString(),
      source: 'Fallback (API unavailable)'
    }
  }
}

// Main function to fetch all market data
export async function fetchAllMarketData() {
  const now = Date.now()
  
  // Check if we have recent cached data
  if (dataCache.lastUpdate && (now - dataCache.lastUpdate) < dataCache.cacheExpiry) {
    return {
      treasuryRates: dataCache.treasuryRates,
      exchangeRates: dataCache.exchangeRates,
      corporateSpreads: dataCache.corporateSpreads,
      lastUpdate: dataCache.lastUpdate,
      cached: true
    }
  }
  
  try {
    // Fetch all data in parallel
    const [treasuryRates, exchangeRates, corporateSpreads] = await Promise.all([
      fetchTreasuryRates(),
      fetchExchangeRates(),
      fetchCorporateBondSpreads()
    ])
    
    // Update cache
    dataCache = {
      treasuryRates,
      exchangeRates,
      corporateSpreads,
      lastUpdate: now
    }
    
    return {
      treasuryRates,
      exchangeRates,
      corporateSpreads,
      lastUpdate: new Date().toISOString(),
      cached: false
    }
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    
    // Return cached data if available, otherwise fallback
    if (dataCache.treasuryRates) {
      return {
        ...dataCache,
        cached: true,
        error: 'Using cached data due to API failure'
      }
    }
    
    throw error
  }
}

// Calculate real bond prices based on market data
export function calculateRealBondPrice(instrument, marketData) {
  const { treasuryRates, exchangeRates, corporateSpreads } = marketData
  const { group, currency, couponPct, maturityDate, rating, countryCode } = instrument
  
  // Get base treasury rate based on maturity
  const maturity = new Date(maturityDate)
  const yearsToMaturity = (maturity - new Date()) / (365.25 * 24 * 60 * 60 * 1000)
  
  let baseRate = treasuryRates['10Y'] // Default to 10Y
  
  if (yearsToMaturity <= 0.25) {
    baseRate = treasuryRates['3M']
  } else if (yearsToMaturity <= 2) {
    baseRate = treasuryRates['2Y']
  } else if (yearsToMaturity <= 10) {
    baseRate = treasuryRates['10Y']
  } else {
    baseRate = treasuryRates['30Y']
  }
  
  // Add credit spread for corporate bonds
  let yieldRate = baseRate
  if (group === 'corp' && rating?.composite) {
    const spread = corporateSpreads[rating.composite] || 1.0
    yieldRate = baseRate + (spread / 100)
  }
  
  // Calculate bond price using present value formula
  const faceValue = 100
  const couponPayment = (couponPct / 100) * faceValue / 2 // Semi-annual
  const periods = Math.ceil(yearsToMaturity * 2) // Semi-annual periods
  const discountRate = yieldRate / 200 // Semi-annual rate
  
  let price = 0
  
  // Present value of coupon payments
  for (let i = 1; i <= periods; i++) {
    price += couponPayment / Math.pow(1 + discountRate, i)
  }
  
  // Present value of face value
  price += faceValue / Math.pow(1 + discountRate, periods)
  
  // Convert to USD if needed
  if (currency !== 'USD') {
    const exchangeRate = exchangeRates[currency] || 1.0
    price = price / exchangeRate
  }
  
  return {
    price: Number(price.toFixed(2)),
    ytm: Number(yieldRate.toFixed(2)),
    baseRate: Number(baseRate.toFixed(2)),
    creditSpread: group === 'corp' ? corporateSpreads[rating?.composite] || 0 : 0
  }
}

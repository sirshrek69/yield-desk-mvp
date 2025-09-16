import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load real data from JSON files
const instrumentsPath = join(process.cwd(), 'src/app/api/price-service/instrument-seed.json')
const instruments = JSON.parse(readFileSync(instrumentsPath, 'utf8'))

const ratingsPath = join(process.cwd(), 'src/app/api/price-service/ratings-data.json')
const ratingsData = JSON.parse(readFileSync(ratingsPath, 'utf8'))

// Platform minimum in USD (fallback when issuer minimum is unknown)
const PLATFORM_MIN_USD = 1000

// Currency conversion rates (simplified - in production would use live FX)
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

// Helper function to convert currency to USD
function convertToUSD(amount, fromCurrency) {
  const rate = CURRENCY_RATES[fromCurrency] || 1.0
  return amount * rate
}

// Helper function to calculate minimum investment display
function calculateMinInvestmentDisplay(instrument) {
  if (instrument.issuerMinFace && instrument.faceIncrement) {
    // Has issuer minimum
    const issuerMinUSD = convertToUSD(instrument.issuerMinFace, instrument.faceCurrency)
    const incrementUSD = convertToUSD(instrument.faceIncrement, instrument.faceCurrency)
    
    return {
      type: 'issuer',
      issuerMinUSD: Number(issuerMinUSD.toFixed(2)),
      incrementUSD: Number(incrementUSD.toFixed(2)),
      issuerMinFace: instrument.issuerMinFace,
      faceIncrement: instrument.faceIncrement,
      faceCurrency: instrument.faceCurrency
    }
  } else {
    // Use platform minimum
    return {
      type: 'platform',
      platformMinUSD: PLATFORM_MIN_USD
    }
  }
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

// Transform instruments to match frontend Product interface
function transformInstruments(instruments) {
  return instruments.map(instrument => {
    const rating = getRatingForInstrument(instrument)
    const minInvestmentDisplay = calculateMinInvestmentDisplay(instrument)
    
    // Determine category based on group
    let category
    switch (instrument.group) {
      case 'gov':
        category = 'Government Bonds'
        break
      case 'corp':
        category = 'Corporate Bonds'
        break
      case 'infl':
        category = 'Inflation-Protected'
        break
      default:
        category = 'Other'
    }
    
    // Calculate YTM (simplified - in production would use real pricing)
    const baseYTM = instrument.couponPct || 0
    const ytmPct = baseYTM + (Math.random() - 0.5) * 2 // Add some variation
    
    // Calculate clean price (simplified)
    const priceClean = 100 + (Math.random() - 0.5) * 10
    
    return {
      id: instrument.instrumentKey,
      category: category,
      name: instrument.displayName,
      issuer: instrument.countryOrIssuer,
      currency: instrument.currency,
      rating: rating,
      couponType: instrument.couponPct > 0 ? 'Fixed' : 'Discount',
      couponRatePct: instrument.couponPct || 0,
      couponFrequency: instrument.couponPct > 0 ? 'Semi-Annual' : 'N/A',
      maturityDate: instrument.maturityDate,
      priceClean: Number(priceClean.toFixed(2)),
      ytmPct: Number(ytmPct.toFixed(2)),
      minInvestment: minInvestmentDisplay.type === 'issuer' ? minInvestmentDisplay.issuerMinUSD : PLATFORM_MIN_USD,
      increment: minInvestmentDisplay.type === 'issuer' ? minInvestmentDisplay.incrementUSD : 1000,
      faceCurrency: instrument.faceCurrency || instrument.currency,
      issuerMinFace: instrument.issuerMinFace,
      faceIncrement: instrument.faceIncrement,
      countryCode: instrument.countryCode,
      minInvestmentDisplay: minInvestmentDisplay,
      tenor: instrument.tenor || 'N/A',
      isOnTheRun: instrument.instrumentKey?.includes('OTR') || false,
      issuerTicker: instrument.issuerTicker,
      raise: {
        status: 'open',
        softCap: 1000000000,
        hardCap: 5000000000,
        amountCommitted: Math.floor(Math.random() * 3000000000),
        start: '2024-01-01',
        end: '2024-12-31'
      },
      docs: [
        { label: 'Prospectus', url: '#' },
        { label: 'Risk Factors', url: '#' }
      ]
    }
  })
}

// Transform instruments to products
const products = transformInstruments(instruments)

export async function GET() {
  return NextResponse.json({ products: products })
}

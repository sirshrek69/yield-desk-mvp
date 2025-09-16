import { NextResponse } from 'next/server'

// Mock data for demonstration
const instruments = [
  {
    id: 'US-TB-3M',
    category: 'Government Bonds',
    name: 'U.S. Treasury Bills 3M',
    issuer: 'U.S. Treasury',
    currency: 'USD',
    rating: { 
      sp: 'AAA', 
      moodys: 'Aaa', 
      fitch: 'AAA',
      composite: 'AAA',
      asOf: '2024-01-15',
      scope: 'Stable'
    },
    couponType: 'Discount',
    couponRatePct: 0,
    couponFrequency: 'N/A',
    maturityDate: '2024-04-15',
    priceClean: 98.50,
    ytmPct: 4.85,
    minInvestment: 100,
    increment: 100,
    faceCurrency: 'USD',
    issuerMinFace: 100,
    faceIncrement: 100,
    countryCode: 'US',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 100,
      incrementUSD: 100,
      issuerMinFace: 100,
      faceIncrement: 100,
      faceCurrency: 'USD'
    },
    tenor: '3M',
    isOnTheRun: true,
    issuerTicker: 'US',
    raise: {
      status: 'open',
      softCap: 1000000000,
      hardCap: 5000000000,
      amountCommitted: 2500000000,
      start: '2024-01-01',
      end: '2024-04-01'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  },
  {
    id: 'AAPL-5Y',
    category: 'Corporate Bonds',
    name: 'Apple 5Y 4.25%',
    issuer: 'Apple Inc.',
    currency: 'USD',
    rating: { 
      sp: 'AA+', 
      moodys: 'Aa1', 
      fitch: 'AA+',
      composite: 'AA+',
      asOf: '2024-01-15',
      scope: 'Stable'
    },
    couponType: 'Fixed',
    couponRatePct: 4.25,
    couponFrequency: 'Semi-Annual',
    maturityDate: '2029-01-15',
    priceClean: 102.75,
    ytmPct: 4.68,
    minInvestment: 1000,
    increment: 1000,
    faceCurrency: 'USD',
    issuerMinFace: 1000,
    faceIncrement: 1000,
    countryCode: 'US',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 1000,
      incrementUSD: 1000,
      issuerMinFace: 1000,
      faceIncrement: 1000,
      faceCurrency: 'USD'
    },
    tenor: '5Y',
    isOnTheRun: false,
    issuerTicker: 'AAPL',
    raise: {
      status: 'upcoming',
      softCap: 1000000000,
      hardCap: 2000000000,
      amountCommitted: 0,
      start: '2024-02-01',
      end: '2024-05-01'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  },
  {
    id: 'US-TIPS-10Y',
    category: 'Inflation-Protected',
    name: 'U.S. TIPS 10Y',
    issuer: 'U.S. Treasury',
    currency: 'USD',
    rating: { 
      sp: 'AAA', 
      moodys: 'Aaa', 
      fitch: 'AAA',
      composite: 'AAA',
      asOf: '2024-01-15',
      scope: 'Stable'
    },
    couponType: 'Fixed',
    couponRatePct: 1.10,
    couponFrequency: 'Semi-Annual',
    maturityDate: '2034-01-15',
    priceClean: 99.25,
    ytmPct: 1.10,
    minInvestment: 100,
    increment: 100,
    faceCurrency: 'USD',
    issuerMinFace: 100,
    faceIncrement: 100,
    countryCode: 'US',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 100,
      incrementUSD: 100,
      issuerMinFace: 100,
      faceIncrement: 100,
      faceCurrency: 'USD'
    },
    tenor: '10Y',
    isOnTheRun: true,
    issuerTicker: 'US',
    raise: {
      status: 'open',
      softCap: 2000000000,
      hardCap: 10000000000,
      amountCommitted: 7500000000,
      start: '2024-01-01',
      end: '2024-12-31'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  },
  {
    id: 'DE-BUND-10Y',
    category: 'Government Bonds',
    name: 'Germany Bund 10Y',
    issuer: 'German Government',
    currency: 'EUR',
    rating: { 
      sp: 'AAA', 
      moodys: 'Aaa', 
      fitch: 'AAA',
      composite: 'AAA',
      asOf: '2024-01-15',
      scope: 'Stable'
    },
    couponType: 'Fixed',
    couponRatePct: 2.45,
    couponFrequency: 'Annual',
    maturityDate: '2034-01-15',
    priceClean: 101.50,
    ytmPct: 2.45,
    minInvestment: 1000,
    increment: 1000,
    faceCurrency: 'EUR',
    issuerMinFace: 1000,
    faceIncrement: 1000,
    countryCode: 'DE',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 1080,
      incrementUSD: 1080,
      issuerMinFace: 1000,
      faceIncrement: 1000,
      faceCurrency: 'EUR'
    },
    tenor: '10Y',
    isOnTheRun: true,
    issuerTicker: 'DE',
    raise: {
      status: 'open',
      softCap: 1000000000,
      hardCap: 5000000000,
      amountCommitted: 3000000000,
      start: '2024-01-01',
      end: '2024-06-30'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  },
  {
    id: 'TSLA-7Y',
    category: 'Corporate Bonds',
    name: 'Tesla 7Y 5.5%',
    issuer: 'Tesla Inc.',
    currency: 'USD',
    rating: { 
      sp: 'BB+', 
      moodys: 'Ba1', 
      fitch: 'BB+',
      composite: 'BB+',
      asOf: '2024-01-15',
      scope: 'Positive'
    },
    couponType: 'Fixed',
    couponRatePct: 5.5,
    couponFrequency: 'Semi-Annual',
    maturityDate: '2031-01-15',
    priceClean: 98.75,
    ytmPct: 5.25,
    minInvestment: 1000,
    increment: 1000,
    faceCurrency: 'USD',
    issuerMinFace: 1000,
    faceIncrement: 1000,
    countryCode: 'US',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 1000,
      incrementUSD: 1000,
      issuerMinFace: 1000,
      faceIncrement: 1000,
      faceCurrency: 'USD'
    },
    tenor: '7Y',
    isOnTheRun: false,
    issuerTicker: 'TSLA',
    raise: {
      status: 'open',
      softCap: 500000000,
      hardCap: 1500000000,
      amountCommitted: 800000000,
      start: '2024-01-01',
      end: '2024-03-31'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  },
  {
    id: 'UK-GILT-10Y',
    category: 'Government Bonds',
    name: 'UK Gilt 10Y',
    issuer: 'UK Government',
    currency: 'GBP',
    rating: { 
      sp: 'AA', 
      moodys: 'Aa2', 
      fitch: 'AA',
      composite: 'AA',
      asOf: '2024-01-15',
      scope: 'Stable'
    },
    couponType: 'Fixed',
    couponRatePct: 3.85,
    couponFrequency: 'Semi-Annual',
    maturityDate: '2034-01-15',
    priceClean: 99.50,
    ytmPct: 3.85,
    minInvestment: 100,
    increment: 100,
    faceCurrency: 'GBP',
    issuerMinFace: 100,
    faceIncrement: 100,
    countryCode: 'GB',
    minInvestmentDisplay: {
      type: 'issuer',
      issuerMinUSD: 127,
      incrementUSD: 127,
      issuerMinFace: 100,
      faceIncrement: 100,
      faceCurrency: 'GBP'
    },
    tenor: '10Y',
    isOnTheRun: true,
    issuerTicker: 'GB',
    raise: {
      status: 'open',
      softCap: 1000000000,
      hardCap: 3000000000,
      amountCommitted: 1800000000,
      start: '2024-01-01',
      end: '2024-09-30'
    },
    docs: [
      { label: 'Prospectus', url: '#' },
      { label: 'Risk Factors', url: '#' }
    ]
  }
]

// Health check endpoint
export async function GET(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (pathname.endsWith('/health')) {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      instruments: instruments.length,
      prices: instruments.length,
      priceMode: 'live',
      validation: {
        isValid: true,
        warnings: []
      },
      sources: ['Mock Data']
    })
  }

  if (pathname.endsWith('/instruments')) {
    return NextResponse.json(instruments)
  }

  if (pathname.endsWith('/prices')) {
    const prices = instruments.map(instrument => ({
      instrumentId: instrument.id,
      price: 100 + Math.random() * 10, // Mock price
      yield: instrument.ytm,
      timestamp: new Date().toISOString()
    }))
    return NextResponse.json(prices)
  }

  if (pathname.endsWith('/products')) {
    return NextResponse.json({ products: instruments })
  }

  if (pathname.endsWith('/primary-deals')) {
    const primaryDeals = [
      {
        id: 'AAPL-5Y',
        issuerName: 'Apple Inc.',
        issuerLogoSlug: 'AAPL',
        currency: 'USD',
        couponPct: 4.25,
        tenorYears: 5,
        targetAmountUSD: 1000000000,
        raisedSoFarUSD: 0,
        status: 'upcoming',
        asOf: new Date().toISOString(),
        minOrderUSD: 100000
      },
      {
        id: 'TSLA-7Y',
        issuerName: 'Tesla Inc.',
        issuerLogoSlug: 'TSLA',
        currency: 'USD',
        couponPct: 5.5,
        tenorYears: 7,
        targetAmountUSD: 2000000000,
        raisedSoFarUSD: 500000000,
        status: 'open',
        asOf: new Date().toISOString(),
        minOrderUSD: 250000
      }
    ]
    return NextResponse.json({ deals: primaryDeals })
  }

  // Default response
  return NextResponse.json({ message: 'Yield Desk API' })
}

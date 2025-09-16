import express from 'express'
import cors from 'cors'

const app = express()

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Mock data for demonstration
const instruments = [
  {
    id: 'US-TB-3M',
    name: 'U.S. Treasury Bills 3M',
    issuer: 'U.S. Treasury',
    rating: 'AAA',
    ytm: 4.85,
    minInvestment: 100,
    currency: 'USD',
    status: 'Open'
  },
  {
    id: 'AAPL-5Y',
    name: 'Apple 5Y 4.25%',
    issuer: 'Apple Inc.',
    rating: 'AA+',
    ytm: 4.68,
    minInvestment: 1000,
    currency: 'USD',
    status: 'Upcoming'
  },
  {
    id: 'US-TIPS-10Y',
    name: 'U.S. TIPS 10Y',
    issuer: 'U.S. Treasury',
    rating: 'AAA',
    ytm: 1.10,
    minInvestment: 100,
    currency: 'USD',
    status: 'Open'
  },
  {
    id: 'DE-BUND-10Y',
    name: 'Germany Bund 10Y',
    issuer: 'German Government',
    rating: 'AAA',
    ytm: 2.45,
    minInvestment: 1000,
    currency: 'EUR',
    status: 'Open'
  },
  {
    id: 'TSLA-7Y',
    name: 'Tesla 7Y 5.5%',
    issuer: 'Tesla Inc.',
    rating: 'BB+',
    ytm: 5.25,
    minInvestment: 1000,
    currency: 'USD',
    status: 'Open'
  },
  {
    id: 'UK-GILT-10Y',
    name: 'UK Gilt 10Y',
    issuer: 'UK Government',
    rating: 'AA',
    ytm: 3.85,
    minInvestment: 100,
    currency: 'GBP',
    status: 'Open'
  }
]

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
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
})

// Get all instruments
app.get('/instruments', (req, res) => {
  res.json(instruments)
})

// Get instrument by ID
app.get('/instruments/:id', (req, res) => {
  const instrument = instruments.find(i => i.id === req.params.id)
  if (!instrument) {
    return res.status(404).json({ error: 'Instrument not found' })
  }
  res.json(instrument)
})

// Get prices
app.get('/prices', (req, res) => {
  const prices = instruments.map(instrument => ({
    instrumentId: instrument.id,
    price: 100 + Math.random() * 10, // Mock price
    yield: instrument.ytm,
    timestamp: new Date().toISOString()
  }))
  res.json(prices)
})

// Primary deals endpoint
app.get('/primary-deals', (req, res) => {
  res.json({
    deals: instruments.filter(i => i.status === 'Upcoming'),
    total: instruments.filter(i => i.status === 'Upcoming').length
  })
})

// Express.js handler for Vercel
export default app

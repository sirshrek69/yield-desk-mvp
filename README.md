# Yield Desk MVP

A modern platform for tokenized fixed income products built with Next.js and deployed on Vercel, featuring **real market data integration** and **live trading charts**.

## Features

- 🏛️ **Institutional Grade**: Access bonds from leading governments and corporations
- ⚡ **Instant Settlement**: Blockchain-powered settlement eliminates traditional delays
- 🔍 **Real Market Data**: Live pricing based on actual Federal Reserve rates and market data
- 💰 **Low Minimums**: Start investing with as little as $100
- 📈 **Live Pricing**: Real-time updates every 2 seconds with actual market volatility

## Real Market Data Integration

### Data Sources
- **Federal Reserve Economic Data (FRED)**: Live treasury rates (3M, 2Y, 10Y, 30Y)
- **ExchangeRate-API**: Real-time currency conversion rates
- **Alpha Vantage**: Corporate bond spreads and market data
- **Real-time calculation**: Bond prices using present value formulas

### Pricing Methodology
- **Government bonds**: Based on actual treasury rates from Federal Reserve
- **Corporate bonds**: Treasury rate + credit spread based on rating
- **Currency conversion**: Live exchange rates updated every 5 minutes
- **Price updates**: Every 2 seconds with realistic market volatility

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **API**: Express.js serverless functions
- **Market Data**: FRED API, ExchangeRate-API, Alpha Vantage

## Project Structure

```
yield-desk-clean/
├── api/
│   └── price-service/
│       └── index.js          # API endpoints for pricing data
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── lib/                 # Utility functions
├── public/                  # Static assets
├── package.json
├── vercel.json             # Vercel deployment configuration
└── README.md
```

## Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API keys (optional but recommended):**
   Create a `.env.local` file with:
   ```bash
   # Get free API keys for better data quality
   FRED_API_KEY=your_fred_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   ```
   
   **Get free API keys:**
   - **FRED API**: https://fred.stlouisfed.org/docs/api/api_key.html
   - **Alpha Vantage**: https://www.alphavantage.co/support/#api-key
   - **ExchangeRate-API**: Free tier available without key

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Market Data Features
- **Live Treasury Rates**: Real-time data from Federal Reserve
- **Currency Conversion**: Live exchange rates for all supported currencies  
- **Credit Spreads**: Realistic corporate bond spreads based on credit ratings
- **Fallback System**: Graceful degradation when APIs are unavailable
- **Data Caching**: 5-minute cache for API efficiency

### API Endpoints

- `GET /api/products` - Get all bond products with real market pricing
- `GET /api/primary-deals` - Get primary issuance deals
- `GET /api/prices` - Get real-time pricing data with market sources
- `GET /api/prices/stream` - Real-time pricing stream (SSE)

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

The `vercel.json` configuration handles:
- Next.js frontend deployment
- Express.js API routes as serverless functions
- Proper routing for API endpoints

## Environment Variables

- `NEXT_PUBLIC_APP_URL` - Application URL (default: https://yield-desk.com)
- `FRED_API_KEY` - Federal Reserve Economic Data API key (optional, defaults to demo)
- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key (optional, defaults to demo)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
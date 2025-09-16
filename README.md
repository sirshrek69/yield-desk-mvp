# Yield Desk MVP

A modern platform for tokenized fixed income products built with Next.js and deployed on Vercel.

## Features

- 🏛️ **Institutional Grade**: Access bonds from leading governments and corporations
- ⚡ **Instant Settlement**: Blockchain-powered settlement eliminates traditional delays
- 🔍 **Transparent Pricing**: Real-time pricing with full transparency
- 💰 **Low Minimums**: Start investing with as little as $100

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **API**: Express.js serverless functions

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

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/instruments` - Get all available instruments
- `GET /api/instruments/:id` - Get specific instrument
- `GET /api/prices` - Get current prices
- `GET /api/primary-deals` - Get upcoming primary deals

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
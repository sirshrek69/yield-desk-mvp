import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Force runtime execution - prevent static generation
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Load real data from JSON files
const primaryDealsPath = join(process.cwd(), 'src/app/api/price-service/primary-deals.json')
const primaryDeals = JSON.parse(readFileSync(primaryDealsPath, 'utf8'))

export async function GET() {
  return NextResponse.json({ deals: primaryDeals })
}

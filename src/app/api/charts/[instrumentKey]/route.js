import { NextResponse } from 'next/server'
import { getChartData, getAvailableTimeframes } from '../../../../lib/priceHistory'

// Force runtime execution - prevent static generation
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { instrumentKey } = params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1D'
    
    // Validate timeframe
    const availableTimeframes = getAvailableTimeframes()
    if (!availableTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Available: ' + availableTimeframes.join(', ') },
        { status: 400 }
      )
    }
    
    // Get chart data
    const chartData = getChartData(instrumentKey, timeframe)
    
    if (chartData.length === 0) {
      return NextResponse.json(
        { error: 'No chart data available for this instrument' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      instrumentKey,
      timeframe,
      chartData,
      dataPoints: chartData.length,
      availableTimeframes,
      lastUpdate: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}

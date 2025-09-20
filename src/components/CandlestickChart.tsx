'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface OHLCData {
  timestamp: number
  time: string
  date: string
  open: number
  high: number
  low: number
  close: number
  ytm: number
  volume: number
  change24h: number
  isPositive: boolean
}

interface CandlestickChartProps {
  instrumentKey: string
  instrumentName: string
  currentPrice?: number
  currentYTM?: number
}

const TIMEFRAMES = [
  { key: '1H', label: '1H' },
  { key: '4H', label: '4H' },
  { key: '1D', label: '1D' },
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' }
]

export default function CandlestickChart({ 
  instrumentKey, 
  instrumentName, 
  currentPrice = 0,
  currentYTM = 0 
}: CandlestickChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [chartData, setChartData] = useState<OHLCData[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/charts/${instrumentKey}?timeframe=${selectedTimeframe}`)
        const data = await response.json()
        setChartData(data.chartData || [])
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [instrumentKey, selectedTimeframe])

  // Calculate price change and color
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0
    const firstPrice = chartData[0].close
    const lastPrice = chartData[chartData.length - 1].close
    return ((lastPrice - firstPrice) / firstPrice) * 100
  }, [chartData])

  const priceChangeColor = priceChange >= 0 ? '#10b981' : '#ef4444' // green or red

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{data.date} {data.time}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Open:</span> 
              <span className="ml-1">${data.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">High:</span> 
              <span className="ml-1">${data.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">Low:</span> 
              <span className="ml-1">${data.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium">Close:</span> 
              <span className="ml-1">${data.close.toFixed(2)}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">YTM:</span> 
              <span className="ml-1">{data.ytm.toFixed(2)}%</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Volume:</span> 
              <span className="ml-1">{data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          <p className="text-sm text-gray-600">{instrumentName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: priceChangeColor }}>
            ${currentPrice.toFixed(2)}
          </div>
          <div className="text-sm" style={{ color: priceChangeColor }}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-4">
        {TIMEFRAMES.map((timeframe) => (
          <button
            key={timeframe.key}
            onClick={() => setSelectedTimeframe(timeframe.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe.key
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Current price reference line */}
            {currentPrice > 0 && (
              <ReferenceLine 
                y={currentPrice} 
                stroke="#6366f1" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}
            
            {/* Close price line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke={priceChangeColor}
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <span>Data source: Historical simulation (OHLC data available in tooltips)</span>
      </div>
    </div>
  )
}
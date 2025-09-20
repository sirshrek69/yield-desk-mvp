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

interface PriceData {
  timestamp: number
  time: string
  date: string
  price: number
  ytm: number
  volume: number
  change24h: number
}

interface TradingChartProps {
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

export default function TradingChart({ 
  instrumentKey, 
  instrumentName, 
  currentPrice = 0,
  currentYTM = 0 
}: TradingChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D')
  const [chartData, setChartData] = useState<PriceData[]>([])
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
    const firstPrice = chartData[0].price
    const lastPrice = chartData[chartData.length - 1].price
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
          <p className="text-sm">
            <span className="font-medium">Price:</span> 
            <span className="ml-1">${data.price.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">YTM:</span> 
            <span className="ml-1">{data.ytm.toFixed(2)}%</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Volume:</span> 
            <span className="ml-1">{data.volume.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Format X-axis labels based on timeframe
  const formatXAxisLabel = (tickItem: any) => {
    if (!tickItem) return ''
    
    const dataPoint = chartData.find(d => d.time === tickItem || d.date === tickItem)
    if (!dataPoint) return tickItem

    const date = new Date(dataPoint.timestamp)
    
    switch (selectedTimeframe) {
      case '1H':
      case '4H':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      case '1D':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      case '1W':
      case '1M':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      default:
        return tickItem
    }
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
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
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
            
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChangeColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: priceChangeColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <span>Data source: Historical simulation</span>
      </div>
    </div>
  )
}

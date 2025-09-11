import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Icon from '../Icon'

interface RevenueData {
  current: number
  target: number
  trend: number
  forecast: Array<{ date: string; value: number }>
}

interface RevenueGaugeProps {
  data: RevenueData
}

const RevenueGauge: React.FC<RevenueGaugeProps> = ({ data }) => {
  const [showTrendChart, setShowTrendChart] = useState(false)
  const [selectedDataPoint, setSelectedDataPoint] = useState<{ date: string; value: number } | null>(null)
  
  const percentage = Math.min((data.current / data.target) * 100, 100)
  const isOverTarget = data.current > data.target
  const isNearTarget = percentage >= 90 && percentage < 100
  
  const getGaugeColor = () => {
    if (isOverTarget) return 'text-green-500'
    if (isNearTarget) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getGaugeBgColor = () => {
    if (isOverTarget) return 'bg-green-100 dark:bg-green-900/20'
    if (isNearTarget) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getStatusText = () => {
    if (isOverTarget) return 'Above Target'
    if (isNearTarget) return 'Near Target'
    return 'Below Target'
  }

  const getStatusIcon = () => {
    if (isOverTarget) return 'check-circle'
    if (isNearTarget) return 'alert-circle'
    return 'x-circle'
  }

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload
      setSelectedDataPoint(payload)
    }
  }

  const formatChartData = () => {
    return data.forecast.map((item, index) => ({
      ...item,
      target: data.target,
      month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
    }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="revenue-gauge-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="revenue-gauge-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="revenue-gauge-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
          <p className="revenue-gauge-tooltip-target text-sm text-gray-500 dark:text-gray-400">
            Target: ${payload[0].payload.target.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="revenue-gauge-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="revenue-gauge-header flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="revenue-gauge-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Revenue Performance
        </h3>
        <div className={`revenue-gauge-status revenue-gauge-status-${isOverTarget ? 'over' : isNearTarget ? 'near' : 'under'} flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getGaugeBgColor()} ${getGaugeColor()}`}>
          <Icon name={getStatusIcon() as any} size={14} />
          <span className="hidden sm:inline">{getStatusText()}</span>
          <span className="sm:hidden">{getStatusText().split(' ')[0]}</span>
        </div>
      </div>

      {/* Circular Progress Gauge */}
      <div className="revenue-gauge-chart-container relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4 sm:mb-6">
        <svg className="revenue-gauge-svg w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="revenue-gauge-background text-gray-200 dark:text-gray-700"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            className={`revenue-gauge-progress transition-all duration-1000 ease-out ${getGaugeColor()}`}
          />
        </svg>
        
        {/* Center Content */}
        <div className="revenue-gauge-center-content absolute inset-0 flex flex-col items-center justify-center">
          <div className="revenue-gauge-percentage text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {percentage.toFixed(0)}%
          </div>
          <div className="revenue-gauge-label text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            of target
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      {showTrendChart && (
        <div className="revenue-gauge-trend-chart mb-4 sm:mb-6">
          <div className="revenue-gauge-chart-header flex items-center justify-between mb-3">
            <h4 className="revenue-gauge-chart-title text-sm font-medium text-gray-700 dark:text-gray-300">
              Revenue Trend
            </h4>
            <button 
              onClick={() => setShowTrendChart(false)}
              className="revenue-gauge-chart-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <div className="revenue-gauge-chart-container h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatChartData()} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {selectedDataPoint && (
            <div className="revenue-gauge-selected-point mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="revenue-gauge-selected-label text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected: {selectedDataPoint.month}
              </p>
              <p className="revenue-gauge-selected-value text-sm text-blue-700 dark:text-blue-300">
                Revenue: ${selectedDataPoint.value.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Revenue Details */}
      <div className="revenue-gauge-details space-y-3 sm:space-y-4">
        <div className="revenue-gauge-detail-item flex justify-between items-center">
          <span className="revenue-gauge-detail-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Revenue</span>
          <span className="revenue-gauge-detail-value text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            ${data.current.toLocaleString()}
          </span>
        </div>
        
        <div className="revenue-gauge-detail-item flex justify-between items-center">
          <span className="revenue-gauge-detail-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Target Revenue</span>
          <span className="revenue-gauge-detail-value text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            ${data.target.toLocaleString()}
          </span>
        </div>
        
        <div className="revenue-gauge-detail-item flex justify-between items-center">
          <span className="revenue-gauge-detail-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Variance</span>
          <span className={`revenue-gauge-variance text-sm sm:text-base md:text-lg font-semibold ${isOverTarget ? 'text-green-600' : 'text-red-600'}`}>
            {isOverTarget ? '+' : ''}${(data.current - data.target).toLocaleString()}
          </span>
        </div>
        
        <div className="revenue-gauge-detail-item flex justify-between items-center">
          <span className="revenue-gauge-detail-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Trend</span>
          <div className="revenue-gauge-trend flex items-center space-x-1">
            <Icon 
              name={data.trend > 0 ? 'trending-up' : 'trending-down'} 
              size={14} 
              className={data.trend > 0 ? 'text-green-500' : 'text-red-500'} 
            />
            <span className={`revenue-gauge-trend-value text-xs sm:text-sm font-medium ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(data.trend)}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="revenue-gauge-actions mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="revenue-gauge-action-buttons flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => setShowTrendChart(!showTrendChart)}
            className="revenue-gauge-trend-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Icon name={showTrendChart ? "chart-line" : "trending-up"} size={14} />
            <span>{showTrendChart ? 'Hide Trend' : 'Show Trend'}</span>
          </button>
          <button className="revenue-gauge-view-details-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            View Details
          </button>
          <button className="revenue-gauge-export-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

export default RevenueGauge

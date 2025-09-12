import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Icon from '../../Icon'

interface ExecutiveData {
  revenueProjection: number
  patientVolumeForecast: number
  marketPosition: number
  growthRate: number
  efficiencyScore: number
}

interface ExecutiveOverviewProps {
  data: ExecutiveData
}

const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getGrowthColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (rate >= 10) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (rate >= 5) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getMarketPositionColor = (position: number) => {
    if (position >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (position >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (position >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  // Mock data for the trend chart
  const trendData = [
    { month: 'Jan', revenue: 2200000, patients: 1100 },
    { month: 'Feb', revenue: 2350000, patients: 1150 },
    { month: 'Mar', revenue: 2500000, patients: 1200 },
    { month: 'Apr', revenue: 2650000, patients: 1250 },
    { month: 'May', revenue: 2750000, patients: 1300 },
    { month: 'Jun', revenue: 2850000, patients: 1350 }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="executive-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="executive-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="executive-tooltip-revenue text-sm text-blue-600 dark:text-blue-400">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="executive-tooltip-patients text-sm text-green-600 dark:text-green-400">
            Patients: {payload[1].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="executive-overview-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="executive-overview-header flex items-center justify-between mb-6">
        <div className="executive-overview-title-section">
          <h2 className="executive-overview-title text-xl font-bold text-gray-900 dark:text-white">
            Executive Overview
          </h2>
          <p className="executive-overview-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
            Key strategic metrics and performance indicators
          </p>
        </div>
        <div className="executive-overview-status flex items-center space-x-2">
          <div className="executive-status-indicator w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="executive-status-text text-sm text-gray-600 dark:text-gray-400">
            On Track
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="executive-metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Projection */}
        <div className="executive-metric-card executive-revenue-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="executive-metric-header flex items-center justify-between mb-2">
            <Icon name="dollar-sign" size={20} className="text-green-600" />
            <span className="executive-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Revenue Projection
            </span>
          </div>
          <div className="executive-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(data.revenueProjection)}
          </div>
          <div className="executive-metric-subtitle text-xs text-gray-500 dark:text-gray-400">
            Next 12 months
          </div>
        </div>

        {/* Patient Volume */}
        <div className="executive-metric-card executive-patients-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="executive-metric-header flex items-center justify-between mb-2">
            <Icon name="users" size={20} className="text-blue-600" />
            <span className="executive-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Patient Volume
            </span>
          </div>
          <div className="executive-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.patientVolumeForecast.toLocaleString()}
          </div>
          <div className="executive-metric-subtitle text-xs text-gray-500 dark:text-gray-400">
            Projected monthly
          </div>
        </div>

        {/* Growth Rate */}
        <div className="executive-metric-card executive-growth-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="executive-metric-header flex items-center justify-between mb-2">
            <Icon name="trending-up" size={20} className="text-purple-600" />
            <span className="executive-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Growth Rate
            </span>
          </div>
          <div className="executive-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.growthRate}%
          </div>
          <div className={`executive-metric-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(data.growthRate)}`}>
            {data.growthRate >= 15 ? 'Excellent' : data.growthRate >= 10 ? 'Strong' : data.growthRate >= 5 ? 'Moderate' : 'Low'}
          </div>
        </div>

        {/* Market Position */}
        <div className="executive-metric-card executive-market-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="executive-metric-header flex items-center justify-between mb-2">
            <Icon name="target" size={20} className="text-orange-600" />
            <span className="executive-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Market Position
            </span>
          </div>
          <div className="executive-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.marketPosition}%
          </div>
          <div className={`executive-metric-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMarketPositionColor(data.marketPosition)}`}>
            {data.marketPosition >= 80 ? 'Leader' : data.marketPosition >= 60 ? 'Strong' : data.marketPosition >= 40 ? 'Competitive' : 'Developing'}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="executive-chart-section">
        <div className="executive-chart-header flex items-center justify-between mb-4">
          <h3 className="executive-chart-title text-lg font-semibold text-gray-900 dark:text-white">
            Performance Trends
          </h3>
          <div className="executive-chart-legend flex items-center space-x-4">
            <div className="executive-legend-item flex items-center space-x-2">
              <div className="executive-legend-color w-3 h-3 bg-blue-500 rounded"></div>
              <span className="executive-legend-label text-sm text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
            <div className="executive-legend-item flex items-center space-x-2">
              <div className="executive-legend-color w-3 h-3 bg-green-500 rounded"></div>
              <span className="executive-legend-label text-sm text-gray-600 dark:text-gray-400">Patients</span>
            </div>
          </div>
        </div>
        
        <div className="executive-chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis 
                yAxisId="patients"
                orientation="right"
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                yAxisId="patients"
                type="monotone"
                dataKey="patients"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficiency Score */}
      <div className="executive-efficiency-section mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="executive-efficiency-header flex items-center justify-between mb-3">
          <div className="executive-efficiency-title-section">
            <h4 className="executive-efficiency-title text-lg font-semibold text-gray-900 dark:text-white">
              Operational Efficiency
            </h4>
            <p className="executive-efficiency-subtitle text-sm text-gray-600 dark:text-gray-400">
              Overall efficiency score based on multiple factors
            </p>
          </div>
          <div className={`executive-efficiency-score px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(data.efficiencyScore)}`}>
            {data.efficiencyScore}%
          </div>
        </div>
        
        <div className="executive-efficiency-progress-container w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="executive-efficiency-progress h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${data.efficiencyScore}%` }}
          ></div>
        </div>
        
        <div className="executive-efficiency-details flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

export default ExecutiveOverview

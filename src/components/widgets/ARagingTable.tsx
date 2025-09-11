import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import Icon from '../Icon'

interface ARAgingData {
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
}

interface ARagingTableProps {
  data: ARAgingData
}

const ARagingTable: React.FC<ARagingTableProps> = ({ data }) => {
  const [showInteractiveChart, setShowInteractiveChart] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'area'>('bar')
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)

  const totalAR = data.current + data.days30 + data.days60 + data.days90 + data.over90
  
  const agingBuckets = [
    { label: 'Current (0-30 days)', amount: data.current, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: '31-60 days', amount: data.days30, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { label: '61-90 days', amount: data.days60, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    { label: '91+ days', amount: data.days90, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    { label: 'Over 90 days', amount: data.over90, color: 'text-red-700 bg-red-100 dark:bg-red-900/30' }
  ]

  const getAgingStatus = () => {
    const over90Percentage = (data.over90 / totalAR) * 100
    const over60Percentage = ((data.days90 + data.over90) / totalAR) * 100
    
    if (over90Percentage > 10) return { status: 'Critical', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' }
    if (over60Percentage > 20) return { status: 'Warning', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' }
    return { status: 'Good', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' }
  }

  const agingStatus = getAgingStatus()

  const getChartData = () => {
    return agingBuckets.map(bucket => ({
      name: bucket.label.split(' ')[0], // Short name for chart
      fullName: bucket.label,
      amount: bucket.amount,
      percentage: totalAR > 0 ? (bucket.amount / totalAR) * 100 : 0,
      color: bucket.color.split(' ')[0].replace('text-', '').replace('-600', '')
    }))
  }

  const getChartColors = () => {
    return ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#DC2626'] // Green, Yellow, Orange, Red, Dark Red
  }

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload
      setSelectedBucket(selectedBucket === payload.fullName ? null : payload.fullName)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="ar-aging-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="ar-aging-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].payload.fullName}
          </p>
          <p className="ar-aging-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Amount: ${payload[0].value.toLocaleString()}
          </p>
          <p className="ar-aging-tooltip-percentage text-sm text-gray-500 dark:text-gray-400">
            {payload[0].payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="ar-aging-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="ar-aging-header flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="ar-aging-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          A/R Aging Analysis
        </h3>
        <div className={`ar-aging-status ar-aging-status-${agingStatus.status.toLowerCase().replace(/\s+/g, '-')} flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${agingStatus.color}`}>
          <Icon name="clock" size={14} />
          <span className="hidden sm:inline">{agingStatus.status}</span>
          <span className="sm:hidden">{agingStatus.status.charAt(0)}</span>
        </div>
      </div>

      {/* Total A/R */}
      <div className="ar-aging-total-section mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="ar-aging-total-header flex items-center justify-between">
          <span className="ar-aging-total-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total A/R</span>
          <span className="ar-aging-total-value text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            ${totalAR.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Aging Buckets */}
      <div className="ar-aging-buckets-section space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {agingBuckets.map((bucket, index) => {
          const percentage = totalAR > 0 ? (bucket.amount / totalAR) * 100 : 0
          
          return (
            <div key={bucket.label} className={`ar-aging-bucket ar-aging-bucket-${bucket.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')} flex items-center space-x-2 sm:space-x-3`}>
              <div className="ar-aging-bucket-indicator w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="ar-aging-bucket-content flex-1">
                <div className="ar-aging-bucket-header flex items-center justify-between mb-1">
                  <span className="ar-aging-bucket-label text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {bucket.label}
                  </span>
                  <div className="ar-aging-bucket-values flex items-center space-x-1 sm:space-x-2">
                    <span className="ar-aging-bucket-amount text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      ${bucket.amount.toLocaleString()}
                    </span>
                    <span className={`ar-aging-bucket-percentage px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${bucket.color}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="ar-aging-bucket-progress-container w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                  <div 
                    className="ar-aging-bucket-progress h-1.5 sm:h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Key Metrics */}
      <div className="ar-aging-metrics-section grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="ar-aging-metric-card ar-aging-current-metric bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
          <div className="ar-aging-metric-label text-xs text-gray-600 dark:text-gray-400 mb-1">Current %</div>
          <div className="ar-aging-metric-value text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            {((data.current / totalAR) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="ar-aging-metric-card ar-aging-over60-metric bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
          <div className="ar-aging-metric-label text-xs text-gray-600 dark:text-gray-400 mb-1">Over 60 Days %</div>
          <div className="ar-aging-metric-value text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            {(((data.days60 + data.days90 + data.over90) / totalAR) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="ar-aging-recommendations-section mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="ar-aging-recommendations-header flex items-start space-x-2">
          <Icon name="lightbulb" size={14} className="ar-aging-recommendations-icon text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="ar-aging-recommendations-content">
            <h4 className="ar-aging-recommendations-title text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Recommendations
            </h4>
            <ul className="ar-aging-recommendations-list text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Focus on collecting 31-60 day balances first</li>
              <li>• Implement automated follow-up for 60+ day accounts</li>
              <li>• Consider payment plans for large over-90 day balances</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Chart Section */}
      {showInteractiveChart && (
        <div className="ar-aging-interactive-chart mb-4 sm:mb-6">
          <div className="ar-aging-chart-header flex items-center justify-between mb-4">
            <h4 className="ar-aging-chart-title text-sm font-medium text-gray-700 dark:text-gray-300">
              A/R Aging Visualization
            </h4>
            <div className="ar-aging-chart-controls flex items-center space-x-2">
              <div className="ar-aging-chart-type-selector flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`ar-aging-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`ar-aging-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`ar-aging-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'area' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Area
                </button>
              </div>
              <button 
                onClick={() => setShowInteractiveChart(false)}
                className="ar-aging-chart-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
          
          <div className="ar-aging-chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={getChartData()} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColors()[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <AreaChart data={getChartData()} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
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
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {selectedBucket && (
            <div className="ar-aging-selected-bucket mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="ar-aging-selected-label text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected: {selectedBucket}
              </p>
              <p className="ar-aging-selected-amount text-sm text-blue-700 dark:text-blue-300">
                Amount: ${getChartData().find(item => item.fullName === selectedBucket)?.amount.toLocaleString()}
              </p>
              <p className="ar-aging-selected-percentage text-sm text-blue-600 dark:text-blue-400">
                Percentage: {getChartData().find(item => item.fullName === selectedBucket)?.percentage.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="ar-aging-actions pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="ar-aging-action-buttons flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => setShowInteractiveChart(!showInteractiveChart)}
            className="ar-aging-chart-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Icon name={showInteractiveChart ? "chart-bar" : "bar-chart-3"} size={14} />
            <span>{showInteractiveChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
          <button className="ar-aging-view-details-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            View Aging Details
          </button>
          <button className="ar-aging-export-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default ARagingTable

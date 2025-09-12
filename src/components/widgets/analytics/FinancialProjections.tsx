import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Icon from '../../Icon'

interface FinancialData {
  cashFlow: Array<{ month: string; projected: number; actual?: number }>
  roi: Array<{ investment: string; current: number; projected: number }>
  costStructure: Array<{ category: string; current: number; projected: number; trend: number }>
}

interface FinancialProjectionsProps {
  data: FinancialData
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getROIColor = (roi: number) => {
    if (roi >= 150) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (roi >= 120) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (roi >= 100) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-red-600'
    if (trend < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return 'trending-up'
    if (trend < 0) return 'trending-down'
    return 'minus'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="financial-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="financial-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="financial-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Projected: {formatCurrency(data.projected)}
          </p>
          {data.actual && (
            <p className="financial-tooltip-actual text-sm text-green-600 dark:text-green-400">
              Actual: {formatCurrency(data.actual)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const roiChartData = data.roi.map(investment => ({
    name: investment.investment.split(' ')[0], // Short name for chart
    fullName: investment.investment,
    current: investment.current,
    projected: investment.projected
  }))

  return (
    <div className="financial-projections-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="financial-projections-header mb-6">
        <h2 className="financial-projections-title text-lg font-bold text-gray-900 dark:text-white mb-2">
          Financial Projections
        </h2>
        <p className="financial-projections-subtitle text-sm text-gray-600 dark:text-gray-400">
          Cash flow, ROI, and cost structure analysis
        </p>
      </div>

      {/* Cash Flow Chart */}
      <div className="financial-cashflow-section mb-6">
        <h4 className="financial-cashflow-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Cash Flow Projection
        </h4>
        <div className="financial-cashflow-chart h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.cashFlow}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              {data.cashFlow.some(item => item.actual) && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="financial-roi-section mb-6">
        <h4 className="financial-roi-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Investment ROI
        </h4>
        <div className="financial-roi-chart h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name === 'current' ? 'Current' : 'Projected']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Bar 
                dataKey="current" 
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="projected" 
                fill="#10B981"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROI List */}
      <div className="financial-roi-list mb-6">
        <div className="financial-roi-items space-y-3">
          {data.roi.map((investment, index) => (
            <div key={index} className="financial-roi-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="financial-roi-info flex-1">
                <h5 className="financial-roi-name text-sm font-medium text-gray-900 dark:text-white">
                  {investment.investment}
                </h5>
                <div className="financial-roi-metrics flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Current: {investment.current}%</span>
                  <span>Projected: {investment.projected}%</span>
                </div>
              </div>
              <div className={`financial-roi-score px-2 py-1 rounded-full text-xs font-medium ${getROIColor(investment.projected)}`}>
                {investment.projected}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Structure */}
      <div className="financial-cost-structure-section">
        <h4 className="financial-cost-structure-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Cost Structure Analysis
        </h4>
        <div className="financial-cost-structure-list space-y-3">
          {data.costStructure.map((category, index) => (
            <div key={index} className="financial-cost-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="financial-cost-info flex-1">
                <h5 className="financial-cost-name text-sm font-medium text-gray-900 dark:text-white">
                  {category.category}
                </h5>
                <div className="financial-cost-metrics flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Current: {category.current}%</span>
                  <span>Projected: {category.projected}%</span>
                </div>
              </div>
              <div className="financial-cost-trend flex items-center space-x-2">
                <Icon 
                  name={getTrendIcon(category.trend) as any} 
                  size={14} 
                  className={getTrendColor(category.trend)} 
                />
                <span className={`financial-cost-trend-value text-xs font-medium ${getTrendColor(category.trend)}`}>
                  {category.trend > 0 ? '+' : ''}{category.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FinancialProjections

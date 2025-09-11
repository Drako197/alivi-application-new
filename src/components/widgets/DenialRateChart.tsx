import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import Icon from '../Icon'

interface DenialData {
  rate: number
  byCategory: Array<{ category: string; count: number; percentage: number }>
  byInsurance: Array<{ insurance: string; count: number; percentage: number }>
}

interface DenialRateChartProps {
  data: DenialData
}

const DenialRateChart: React.FC<DenialRateChartProps> = ({ data }) => {
  const [showInteractiveChart, setShowInteractiveChart] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')
  const [selectedView, setSelectedView] = useState<'category' | 'insurance'>('category')
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)

  const getRateColor = (rate: number) => {
    if (rate <= 3) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
    if (rate <= 5) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
  }

  const getRateStatus = (rate: number) => {
    if (rate <= 3) return 'Excellent'
    if (rate <= 5) return 'Good'
    return 'Needs Attention'
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      'text-green-600 bg-green-50 dark:bg-green-900/20',
      'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
      'text-red-600 bg-red-50 dark:bg-red-900/20',
      'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
      'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
      'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    ]
    return colors[index % colors.length]
  }

  const getChartData = () => {
    return selectedView === 'category' ? data.byCategory : data.byInsurance
  }

  const getChartColors = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#F97316']
    return colors
  }

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const payload = data.activePayload[0].payload
      setSelectedDataPoint(payload)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="denial-rate-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="denial-rate-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="denial-rate-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Denials: {payload[0].value.toLocaleString()}
          </p>
          <p className="denial-rate-tooltip-percentage text-sm text-gray-500 dark:text-gray-400">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="denial-rate-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="denial-rate-header flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="denial-rate-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Denial Rate Analysis
        </h3>
        <div className={`denial-rate-status denial-rate-status-${data.rate <= 3 ? 'excellent' : data.rate <= 5 ? 'good' : 'needs-attention'} flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRateColor(data.rate)}`}>
          <Icon name="alert-triangle" size={14} />
          <span className="hidden sm:inline">{getRateStatus(data.rate)}</span>
          <span className="sm:hidden">{getRateStatus(data.rate).charAt(0)}</span>
        </div>
      </div>

      {/* Overall Denial Rate */}
      <div className="denial-rate-overall-section mb-4 sm:mb-6">
        <div className="denial-rate-overall-header flex items-center justify-between mb-2">
          <span className="denial-rate-overall-label text-xs sm:text-sm text-gray-600 dark:text-gray-400">Overall Denial Rate</span>
          <span className="denial-rate-overall-value text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {data.rate}%
          </span>
        </div>
        <div className="denial-rate-overall-progress-container w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
          <div 
            className={`denial-rate-overall-progress h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out ${
              data.rate <= 3 ? 'bg-green-500' : 
              data.rate <= 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(data.rate * 10, 100)}%` }}
          ></div>
        </div>
        <div className="denial-rate-overall-scale flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0%</span>
          <span>5%</span>
          <span>10%</span>
        </div>
      </div>

      {/* Denials by Category */}
      <div className="denial-rate-category-section mb-4 sm:mb-6">
        <h4 className="denial-rate-category-title text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
          Denials by Category
        </h4>
        <div className="denial-rate-category-list space-y-2 sm:space-y-3">
          {data.byCategory.map((category, index) => (
            <div key={category.category} className={`denial-rate-category-item denial-rate-category-${category.category.toLowerCase().replace(/\s+/g, '-')} flex items-center space-x-2 sm:space-x-3`}>
              <div className={`denial-rate-category-indicator w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600`}></div>
              <div className="denial-rate-category-content flex-1">
                <div className="denial-rate-category-header flex items-center justify-between">
                  <span className="denial-rate-category-name text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {category.category}
                  </span>
                  <div className="denial-rate-category-values flex items-center space-x-1 sm:space-x-2">
                    <span className="denial-rate-category-count text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {category.count}
                    </span>
                    <span className={`denial-rate-category-percentage px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getCategoryColor(index)}`}>
                      {category.percentage}%
                    </span>
                  </div>
                </div>
                <div className="denial-rate-category-progress-container w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mt-1">
                  <div 
                    className="denial-rate-category-progress h-1.5 sm:h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Denials by Insurance */}
      <div className="denial-rate-insurance-section mb-4 sm:mb-6">
        <h4 className="denial-rate-insurance-title text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
          Denials by Insurance
        </h4>
        <div className="denial-rate-insurance-list space-y-2 sm:space-y-3">
          {data.byInsurance.map((insurance, index) => (
            <div key={insurance.insurance} className={`denial-rate-insurance-item denial-rate-insurance-${insurance.insurance.toLowerCase().replace(/\s+/g, '-')} flex items-center space-x-2 sm:space-x-3`}>
              <div className={`denial-rate-insurance-indicator w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600`}></div>
              <div className="denial-rate-insurance-content flex-1">
                <div className="denial-rate-insurance-header flex items-center justify-between">
                  <span className="denial-rate-insurance-name text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {insurance.insurance}
                  </span>
                  <div className="denial-rate-insurance-values flex items-center space-x-1 sm:space-x-2">
                    <span className="denial-rate-insurance-count text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {insurance.count}
                    </span>
                    <span className={`denial-rate-insurance-percentage px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getCategoryColor(index + 4)}`}>
                      {insurance.percentage}%
                    </span>
                  </div>
                </div>
                <div className="denial-rate-insurance-progress-container w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 mt-1">
                  <div 
                    className="denial-rate-insurance-progress h-1.5 sm:h-2 rounded-full bg-gray-400 dark:bg-gray-500"
                    style={{ width: `${insurance.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Chart Section */}
      {showInteractiveChart && (
        <div className="denial-rate-interactive-chart mb-4 sm:mb-6">
          <div className="denial-rate-chart-header flex items-center justify-between mb-4">
            <h4 className="denial-rate-chart-title text-sm font-medium text-gray-700 dark:text-gray-300">
              Interactive Analysis
            </h4>
            <div className="denial-rate-chart-controls flex items-center space-x-2">
              <div className="denial-rate-view-selector flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('category')}
                  className={`denial-rate-view-btn px-2 py-1 text-xs rounded ${selectedView === 'category' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Category
                </button>
                <button
                  onClick={() => setSelectedView('insurance')}
                  className={`denial-rate-view-btn px-2 py-1 text-xs rounded ${selectedView === 'insurance' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Insurance
                </button>
              </div>
              <div className="denial-rate-chart-type-selector flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`denial-rate-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`denial-rate-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`denial-rate-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'line' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Line
                </button>
              </div>
              <button 
                onClick={() => setShowInteractiveChart(false)}
                className="denial-rate-chart-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
          
          <div className="denial-rate-chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={getChartData()} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey={selectedView === 'category' ? 'category' : 'insurance'} 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
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
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColors()[index % getChartColors().length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <LineChart data={getChartData()} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey={selectedView === 'category' ? 'category' : 'insurance'} 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {selectedDataPoint && (
            <div className="denial-rate-selected-point mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="denial-rate-selected-label text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected: {selectedDataPoint[selectedView === 'category' ? 'category' : 'insurance']}
              </p>
              <p className="denial-rate-selected-value text-sm text-blue-700 dark:text-blue-300">
                Denials: {selectedDataPoint.count.toLocaleString()}
              </p>
              <p className="denial-rate-selected-percentage text-sm text-blue-600 dark:text-blue-400">
                Percentage: {selectedDataPoint.percentage}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="denial-rate-actions pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="denial-rate-action-buttons flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => setShowInteractiveChart(!showInteractiveChart)}
            className="denial-rate-chart-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Icon name={showInteractiveChart ? "chart-pie" : "bar-chart-3"} size={14} />
            <span>{showInteractiveChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
          <button className="denial-rate-view-details-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            View Denial Details
          </button>
          <button className="denial-rate-export-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default DenialRateChart

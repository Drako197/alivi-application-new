import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Icon from '../Icon'

interface ClaimsData {
  total: number
  processed: number
  pending: number
  denied: number
  pipeline: Array<{ stage: string; count: number; percentage: number }>
}

interface ClaimsPipelineProps {
  data: ClaimsData
}

const ClaimsPipeline: React.FC<ClaimsPipelineProps> = ({ data }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [showDetailedChart, setShowDetailedChart] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-500'
      case 'under review':
        return 'bg-yellow-500'
      case 'pending payment':
        return 'bg-orange-500'
      case 'paid':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'submitted':
        return 'upload'
      case 'under review':
        return 'search'
      case 'pending payment':
        return 'clock'
      case 'paid':
        return 'check-circle'
      default:
        return 'file'
    }
  }

  const processingRate = ((data.processed / data.total) * 100).toFixed(1)
  const denialRate = ((data.denied / data.total) * 100).toFixed(1)

  const handleStageClick = (stage: string) => {
    setSelectedStage(selectedStage === stage ? null : stage)
    setShowDetailedChart(true)
  }

  const formatChartData = () => {
    return data.pipeline.map(stage => ({
      name: stage.stage,
      count: stage.count,
      percentage: stage.percentage,
      color: getStageColor(stage.stage).replace('bg-', '').replace('-500', '')
    }))
  }

  const getPieChartColors = () => {
    return data.pipeline.map(stage => {
      switch (stage.stage.toLowerCase()) {
        case 'submitted': return '#3B82F6'
        case 'under review': return '#F59E0B'
        case 'pending payment': return '#F97316'
        case 'paid': return '#10B981'
        default: return '#6B7280'
      }
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="claims-pipeline-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="claims-pipeline-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="claims-pipeline-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Claims: {payload[0].value.toLocaleString()}
          </p>
          <p className="claims-pipeline-tooltip-percentage text-sm text-gray-500 dark:text-gray-400">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="claims-pipeline-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="claims-pipeline-header flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="claims-pipeline-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Claims Pipeline
        </h3>
        <div className="claims-pipeline-stats flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div className="claims-pipeline-processed-stat flex items-center space-x-1">
            <Icon name="check-circle" size={14} className="text-green-500" />
            <span>{processingRate}% processed</span>
          </div>
          <div className="claims-pipeline-denied-stat flex items-center space-x-1">
            <Icon name="x-circle" size={14} className="text-red-500" />
            <span>{denialRate}% denied</span>
          </div>
        </div>
      </div>

      {/* Pipeline Flow */}
      <div className="claims-pipeline-flow mb-4 sm:mb-6">
        <div className="claims-pipeline-stages flex items-center justify-between overflow-x-auto pb-4 pt-4 px-2">
          {data.pipeline.map((stage, index) => (
            <div 
              key={stage.stage} 
              className={`claims-pipeline-stage claims-pipeline-stage-${stage.stage.toLowerCase().replace(/\s+/g, '-')} flex flex-col items-center space-y-2 flex-1 min-w-0 cursor-pointer transition-all duration-200 relative ${selectedStage === stage.stage ? 'border-2 border-blue-500 rounded-lg p-2 bg-blue-50 dark:bg-blue-900/10 hover:scale-105' : 'hover:scale-105'}`}
              onClick={() => handleStageClick(stage.stage)}
            >
              {/* Stage Circle */}
              <div className="claims-pipeline-stage-circle-container relative">
                <div className={`claims-pipeline-stage-circle w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${getStageColor(stage.stage)} flex items-center justify-center text-white shadow-lg transition-all duration-200 ${selectedStage === stage.stage ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}`}>
                  <Icon name={getStageIcon(stage.stage) as any} size={16} />
                </div>
                {/* Connection Line */}
                {index < data.pipeline.length - 1 && (
                  <div className="claims-pipeline-connection-line absolute top-4 sm:top-5 md:top-6 left-8 sm:left-10 md:left-12 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>
                )}
              </div>
              
              {/* Stage Info */}
              <div className="claims-pipeline-stage-info text-center">
                <div className="claims-pipeline-stage-count text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {stage.count}
                </div>
                <div className="claims-pipeline-stage-name text-xs text-gray-500 dark:text-gray-400 truncate">
                  {stage.stage}
                </div>
                <div className="claims-pipeline-stage-percentage text-xs text-gray-400 dark:text-gray-500">
                  {stage.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="claims-pipeline-summary-stats grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="claims-pipeline-stat-card claims-pipeline-total-card bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="claims-pipeline-stat-header flex items-center space-x-1 sm:space-x-2 mb-2">
            <Icon name="file-text" size={14} className="text-blue-500" />
            <span className="claims-pipeline-stat-label text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Claims</span>
          </div>
          <div className="claims-pipeline-stat-value text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {data.total.toLocaleString()}
          </div>
        </div>
        
        <div className="claims-pipeline-stat-card claims-pipeline-processed-card bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="claims-pipeline-stat-header flex items-center space-x-1 sm:space-x-2 mb-2">
            <Icon name="check-circle" size={14} className="text-green-500" />
            <span className="claims-pipeline-stat-label text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Processed</span>
          </div>
          <div className="claims-pipeline-stat-value text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {data.processed.toLocaleString()}
          </div>
        </div>
        
        <div className="claims-pipeline-stat-card claims-pipeline-pending-card bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="claims-pipeline-stat-header flex items-center space-x-1 sm:space-x-2 mb-2">
            <Icon name="clock" size={14} className="text-yellow-500" />
            <span className="claims-pipeline-stat-label text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <div className="claims-pipeline-stat-value text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {data.pending.toLocaleString()}
          </div>
        </div>
        
        <div className="claims-pipeline-stat-card claims-pipeline-denied-card bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="claims-pipeline-stat-header flex items-center space-x-1 sm:space-x-2 mb-2">
            <Icon name="x-circle" size={14} className="text-red-500" />
            <span className="claims-pipeline-stat-label text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Denied</span>
          </div>
          <div className="claims-pipeline-stat-value text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {data.denied.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Interactive Detailed Chart */}
      {showDetailedChart && (
        <div className="claims-pipeline-detailed-chart mt-4 sm:mt-6">
          <div className="claims-pipeline-chart-header flex items-center justify-between mb-4">
            <h4 className="claims-pipeline-chart-title text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedStage ? `${selectedStage} Details` : 'Pipeline Overview'}
            </h4>
            <div className="claims-pipeline-chart-controls flex items-center space-x-2">
              <button
                onClick={() => setChartType('bar')}
                className={`claims-pipeline-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`claims-pipeline-chart-type-btn px-2 py-1 text-xs rounded ${chartType === 'pie' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Pie
              </button>
              <button 
                onClick={() => setShowDetailedChart(false)}
                className="claims-pipeline-chart-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
          
          <div className="claims-pipeline-chart-container h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
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
              ) : (
                <PieChart>
                  <Pie
                    data={formatChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {formatChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPieChartColors()[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="claims-pipeline-progress-section mt-4 sm:mt-6">
        <div className="claims-pipeline-progress-header flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="claims-pipeline-progress-label">Processing Progress</span>
          <span className="claims-pipeline-progress-percentage">{processingRate}%</span>
        </div>
        <div className="claims-pipeline-progress-bar-container w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="claims-pipeline-progress-bar bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${processingRate}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="claims-pipeline-actions mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="claims-pipeline-action-buttons flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => setShowDetailedChart(!showDetailedChart)}
            className="claims-pipeline-chart-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Icon name={showDetailedChart ? "chart-bar" : "bar-chart-3"} size={14} />
            <span>{showDetailedChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
          <button className="claims-pipeline-view-details-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            View Pipeline Details
          </button>
          <button className="claims-pipeline-export-btn flex-1 px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClaimsPipeline

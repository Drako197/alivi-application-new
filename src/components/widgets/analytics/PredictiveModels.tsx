import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Icon from '../../Icon'

interface PredictiveData {
  revenueForecast: Array<{ month: string; projected: number; actual?: number; confidence: number }>
  patientVolume: Array<{ month: string; projected: number; actual?: number; confidence: number }>
  riskScore: number
  opportunities: Array<{ title: string; impact: number; effort: number; priority: 'high' | 'medium' | 'low' }>
}

interface PredictiveModelsProps {
  data: PredictiveData
}

const PredictiveModels: React.FC<PredictiveModelsProps> = ({ data }) => {
  const [selectedModel, setSelectedModel] = useState<'revenue' | 'patients'>('revenue')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score <= 50) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getRiskLevel = (score: number) => {
    if (score <= 25) return 'Low Risk'
    if (score <= 50) return 'Medium Risk'
    return 'High Risk'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-triangle'
      case 'medium': return 'clock'
      case 'low': return 'check-circle'
      default: return 'info'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="predictive-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="predictive-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="predictive-tooltip-value text-sm text-blue-600 dark:text-blue-400">
            Projected: {selectedModel === 'revenue' ? formatCurrency(data.projected) : data.projected.toLocaleString()}
          </p>
          {data.actual && (
            <p className="predictive-tooltip-actual text-sm text-green-600 dark:text-green-400">
              Actual: {selectedModel === 'revenue' ? formatCurrency(data.actual) : data.actual.toLocaleString()}
            </p>
          )}
          <p className="predictive-tooltip-confidence text-sm text-gray-500 dark:text-gray-400">
            Confidence: {data.confidence}%
          </p>
        </div>
      )
    }
    return null
  }

  const currentData = selectedModel === 'revenue' ? data.revenueForecast : data.patientVolume

  return (
    <div className="predictive-models-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="predictive-models-header mb-6">
        <div className="predictive-models-title-section mb-4">
          <h2 className="predictive-models-title text-lg font-bold text-gray-900 dark:text-white">
            Predictive Models
          </h2>
          <p className="predictive-models-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-powered forecasting and risk assessment
          </p>
        </div>
        <div className="predictive-models-toggle flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
          <button
            onClick={() => setSelectedModel('revenue')}
            className={`predictive-model-btn px-3 py-1 text-xs rounded transition-colors ${
              selectedModel === 'revenue' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedModel('patients')}
            className={`predictive-model-btn px-3 py-1 text-xs rounded transition-colors ${
              selectedModel === 'patients' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Patients
          </button>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="predictive-chart-section mb-6">
        <div className="predictive-chart-container h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => 
                  selectedModel === 'revenue' 
                    ? `$${(value / 1000).toFixed(0)}K` 
                    : value.toLocaleString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {currentData.some(item => item.actual) && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="predictive-risk-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="predictive-risk-header flex items-center justify-between mb-3">
          <h4 className="predictive-risk-title text-base font-semibold text-gray-900 dark:text-white">
            Risk Assessment
          </h4>
          <div className={`predictive-risk-score px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(data.riskScore)}`}>
            {data.riskScore}% Risk
          </div>
        </div>
        
        <div className="predictive-risk-content">
          <div className="predictive-risk-level text-sm text-gray-600 dark:text-gray-400 mb-2">
            {getRiskLevel(data.riskScore)}
          </div>
          <div className="predictive-risk-progress-container w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="predictive-risk-progress h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-out"
              style={{ width: `${data.riskScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="predictive-opportunities-section">
        <h4 className="predictive-opportunities-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Growth Opportunities
        </h4>
        <div className="predictive-opportunities-list space-y-3">
          {data.opportunities.map((opportunity, index) => (
            <div key={index} className="predictive-opportunity-item flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="predictive-opportunity-icon flex-shrink-0 mt-1">
                <Icon 
                  name={getPriorityIcon(opportunity.priority) as any} 
                  size={16} 
                  className="text-gray-600 dark:text-gray-400" 
                />
              </div>
              <div className="predictive-opportunity-content flex-1 min-w-0">
                <div className="predictive-opportunity-header flex items-center justify-between mb-1">
                  <h5 className="predictive-opportunity-title text-sm font-medium text-gray-900 dark:text-white truncate">
                    {opportunity.title}
                  </h5>
                  <div className={`predictive-opportunity-priority px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority}
                  </div>
                </div>
                <div className="predictive-opportunity-metrics flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Impact: {opportunity.impact}%</span>
                  <span>Effort: {opportunity.effort}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PredictiveModels

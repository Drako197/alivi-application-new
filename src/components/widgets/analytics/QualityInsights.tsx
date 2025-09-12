import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Icon from '../../Icon'

interface QualityData {
  hedisScore: { current: number; projected: number; trend: number }
  patientSatisfaction: { current: number; projected: number; trend: number }
  complianceRisk: number
}

interface QualityInsightsProps {
  data: QualityData
}

const QualityInsights: React.FC<QualityInsightsProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Needs Improvement'
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 20) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (risk <= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getRiskLevel = (risk: number) => {
    if (risk <= 20) return 'Low Risk'
    if (risk <= 40) return 'Medium Risk'
    return 'High Risk'
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return 'trending-up'
    if (trend < 0) return 'trending-down'
    return 'minus'
  }

  // Mock historical data for trends
  const hedisTrendData = [
    { month: 'Jan', score: 82, target: 85 },
    { month: 'Feb', score: 84, target: 85 },
    { month: 'Mar', score: 85, target: 85 },
    { month: 'Apr', score: 86, target: 87 },
    { month: 'May', score: 87, target: 87 },
    { month: 'Jun', score: 87, target: 90 }
  ]

  const satisfactionTrendData = [
    { month: 'Jan', score: 4.0, target: 4.2 },
    { month: 'Feb', score: 4.1, target: 4.2 },
    { month: 'Mar', score: 4.1, target: 4.2 },
    { month: 'Apr', score: 4.2, target: 4.3 },
    { month: 'May', score: 4.2, target: 4.3 },
    { month: 'Jun', score: 4.2, target: 4.5 }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="quality-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="quality-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="quality-tooltip-score text-sm text-blue-600 dark:text-blue-400">
            Score: {payload[0].value}
          </p>
          <p className="quality-tooltip-target text-sm text-gray-500 dark:text-gray-400">
            Target: {payload[0].payload.target}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="quality-insights-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="quality-insights-header mb-6">
        <h2 className="quality-insights-title text-lg font-bold text-gray-900 dark:text-white mb-2">
          Quality Insights
        </h2>
        <p className="quality-insights-subtitle text-sm text-gray-600 dark:text-gray-400">
          HEDIS scores, patient satisfaction, and compliance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="quality-metrics-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* HEDIS Score */}
        <div className="quality-metric-card quality-hedis-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="quality-metric-header flex items-center justify-between mb-3">
            <Icon name="shield-check" size={20} className="text-blue-600" />
            <span className="quality-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              HEDIS Score
            </span>
          </div>
          <div className="quality-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.hedisScore.current}
          </div>
          <div className="quality-metric-details flex items-center justify-between">
            <span className="quality-metric-projected text-sm text-gray-600 dark:text-gray-400">
              Target: {data.hedisScore.projected}
            </span>
            <div className={`quality-metric-trend flex items-center space-x-1 ${getTrendColor(data.hedisScore.trend)}`}>
              <Icon name={getTrendIcon(data.hedisScore.trend) as any} size={14} />
              <span className="text-xs font-medium">
                {data.hedisScore.trend > 0 ? '+' : ''}{data.hedisScore.trend}
              </span>
            </div>
          </div>
          <div className={`quality-metric-level mt-2 px-2 py-1 rounded-full text-xs font-medium text-center ${getScoreColor(data.hedisScore.current)}`}>
            {getScoreLevel(data.hedisScore.current)}
          </div>
        </div>

        {/* Patient Satisfaction */}
        <div className="quality-metric-card quality-satisfaction-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="quality-metric-header flex items-center justify-between mb-3">
            <Icon name="heart" size={20} className="text-green-600" />
            <span className="quality-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Patient Satisfaction
            </span>
          </div>
          <div className="quality-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.patientSatisfaction.current}
          </div>
          <div className="quality-metric-details flex items-center justify-between">
            <span className="quality-metric-projected text-sm text-gray-600 dark:text-gray-400">
              Target: {data.patientSatisfaction.projected}
            </span>
            <div className={`quality-metric-trend flex items-center space-x-1 ${getTrendColor(data.patientSatisfaction.trend)}`}>
              <Icon name={getTrendIcon(data.patientSatisfaction.trend) as any} size={14} />
              <span className="text-xs font-medium">
                {data.patientSatisfaction.trend > 0 ? '+' : ''}{data.patientSatisfaction.trend}
              </span>
            </div>
          </div>
          <div className="quality-satisfaction-stars flex items-center justify-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= Math.floor(data.patientSatisfaction.current) ? 'star' : 'star'}
                size={16}
                className={star <= Math.floor(data.patientSatisfaction.current) ? 'text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>

        {/* Compliance Risk */}
        <div className="quality-metric-card quality-compliance-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="quality-metric-header flex items-center justify-between mb-3">
            <Icon name="alert-triangle" size={20} className="text-orange-600" />
            <span className="quality-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Compliance Risk
            </span>
          </div>
          <div className="quality-metric-value text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {data.complianceRisk}%
          </div>
          <div className="quality-metric-details">
            <div className={`quality-metric-level px-2 py-1 rounded-full text-xs font-medium text-center ${getRiskColor(data.complianceRisk)}`}>
              {getRiskLevel(data.complianceRisk)}
            </div>
          </div>
          <div className="quality-compliance-progress-container w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-3">
            <div 
              className="quality-compliance-progress h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-out"
              style={{ width: `${data.complianceRisk}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* HEDIS Trend Chart */}
      <div className="quality-hedis-trend-section mb-6">
        <h4 className="quality-hedis-trend-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          HEDIS Score Trend
        </h4>
        <div className="quality-hedis-trend-chart h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hedisTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                domain={[70, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
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
      </div>

      {/* Patient Satisfaction Trend */}
      <div className="quality-satisfaction-trend-section">
        <h4 className="quality-satisfaction-trend-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Patient Satisfaction Trend
        </h4>
        <div className="quality-satisfaction-trend-chart h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={satisfactionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                domain={[3.5, 5.0]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default QualityInsights

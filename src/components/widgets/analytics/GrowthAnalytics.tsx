import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Icon from '../../Icon'

interface GrowthData {
  serviceLines: Array<{ name: string; current: number; projected: number; growth: number }>
  marketPenetration: number
  expansionOpportunities: Array<{ area: string; potential: number; feasibility: number }>
}

interface GrowthAnalyticsProps {
  data: GrowthData
}

const GrowthAnalytics: React.FC<GrowthAnalyticsProps> = ({ data }) => {
  const getGrowthColor = (growth: number) => {
    if (growth >= 20) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (growth >= 15) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (growth >= 10) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getPenetrationColor = (penetration: number) => {
    if (penetration >= 50) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (penetration >= 30) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (penetration >= 20) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getOpportunityColor = (potential: number, feasibility: number) => {
    const score = (potential + feasibility) / 2
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (score >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getOpportunityScore = (potential: number, feasibility: number) => {
    return Math.round((potential + feasibility) / 2)
  }

  const chartData = data.serviceLines.map(line => ({
    name: line.name.split(' ')[0], // Short name for chart
    fullName: line.name,
    current: line.current,
    projected: line.projected,
    growth: line.growth
  }))

  const pieData = data.expansionOpportunities.map(opp => ({
    name: opp.area,
    value: opp.potential,
    feasibility: opp.feasibility
  }))

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="growth-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="growth-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {data.fullName}
          </p>
          <p className="growth-tooltip-current text-sm text-blue-600 dark:text-blue-400">
            Current: {data.current.toLocaleString()}
          </p>
          <p className="growth-tooltip-projected text-sm text-green-600 dark:text-green-400">
            Projected: {data.projected.toLocaleString()}
          </p>
          <p className="growth-tooltip-growth text-sm text-gray-500 dark:text-gray-400">
            Growth: {data.growth}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="growth-analytics-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="growth-analytics-header mb-6">
        <h2 className="growth-analytics-title text-lg font-bold text-gray-900 dark:text-white mb-2">
          Growth Analytics
        </h2>
        <p className="growth-analytics-subtitle text-sm text-gray-600 dark:text-gray-400">
          Service line performance and expansion opportunities
        </p>
      </div>

      {/* Market Penetration */}
      <div className="growth-penetration-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="growth-penetration-header flex items-center justify-between mb-3">
          <h4 className="growth-penetration-title text-base font-semibold text-gray-900 dark:text-white">
            Market Penetration
          </h4>
          <div className={`growth-penetration-score px-3 py-1 rounded-full text-sm font-medium ${getPenetrationColor(data.marketPenetration)}`}>
            {data.marketPenetration}%
          </div>
        </div>
        
        <div className="growth-penetration-progress-container w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
          <div 
            className="growth-penetration-progress h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${data.marketPenetration}%` }}
          ></div>
        </div>
        
        <div className="growth-penetration-details flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Service Lines Chart */}
      <div className="growth-chart-section mb-6">
        <h4 className="growth-chart-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Service Line Performance
        </h4>
        <div className="growth-chart-container h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-xs"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-xs"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="current" 
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
                name="Current"
              />
              <Bar 
                dataKey="projected" 
                fill="#10B981"
                radius={[2, 2, 0, 0]}
                name="Projected"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Lines List */}
      <div className="growth-service-lines-section mb-6">
        <h4 className="growth-service-lines-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Growth by Service Line
        </h4>
        <div className="growth-service-lines-list space-y-3">
          {data.serviceLines.map((line, index) => (
            <div key={index} className="growth-service-line-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="growth-service-line-info flex-1">
                <h5 className="growth-service-line-name text-sm font-medium text-gray-900 dark:text-white">
                  {line.name}
                </h5>
                <div className="growth-service-line-metrics flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Current: {line.current.toLocaleString()}</span>
                  <span>Projected: {line.projected.toLocaleString()}</span>
                </div>
              </div>
              <div className={`growth-service-line-growth px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(line.growth)}`}>
                +{line.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expansion Opportunities */}
      <div className="growth-opportunities-section">
        <h4 className="growth-opportunities-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Expansion Opportunities
        </h4>
        <div className="growth-opportunities-list space-y-3">
          {data.expansionOpportunities.map((opportunity, index) => {
            const score = getOpportunityScore(opportunity.potential, opportunity.feasibility)
            return (
              <div key={index} className="growth-opportunity-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="growth-opportunity-info flex-1">
                  <h5 className="growth-opportunity-name text-sm font-medium text-gray-900 dark:text-white">
                    {opportunity.area}
                  </h5>
                  <div className="growth-opportunity-metrics flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <span>Potential: {opportunity.potential}%</span>
                    <span>Feasibility: {opportunity.feasibility}%</span>
                  </div>
                </div>
                <div className="growth-opportunity-score flex items-center space-x-2">
                  <div className={`growth-opportunity-badge px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(opportunity.potential, opportunity.feasibility)}`}>
                    {score}%
                  </div>
                  <Icon name="arrow-right" size={14} className="text-gray-400" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GrowthAnalytics

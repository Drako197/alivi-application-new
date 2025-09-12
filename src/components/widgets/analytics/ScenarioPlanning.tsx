import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Icon from '../../Icon'

interface ScenarioPlanningProps {
  data: any
  selectedScenario: 'conservative' | 'realistic' | 'optimistic'
  selectedTimeframe: '3M' | '6M' | '1Y' | '2Y'
}

const ScenarioPlanning: React.FC<ScenarioPlanningProps> = ({ data, selectedScenario, selectedTimeframe }) => {
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'conservative': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'realistic': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'optimistic': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'conservative': return 'shield'
      case 'realistic': return 'target'
      case 'optimistic': return 'trending-up'
      default: return 'info'
    }
  }

  // Mock scenario data
  const scenarioData = {
    conservative: {
      revenue: [
        { month: 'Jan', value: 2200000 },
        { month: 'Feb', value: 2250000 },
        { month: 'Mar', value: 2300000 },
        { month: 'Apr', value: 2350000 },
        { month: 'May', value: 2400000 },
        { month: 'Jun', value: 2450000 }
      ],
      patients: [
        { month: 'Jan', value: 1000 },
        { month: 'Feb', value: 1020 },
        { month: 'Mar', value: 1040 },
        { month: 'Apr', value: 1060 },
        { month: 'May', value: 1080 },
        { month: 'Jun', value: 1100 }
      ],
      description: 'Conservative growth with minimal market expansion',
      keyFactors: ['Reduced marketing spend', 'Focus on existing clients', 'Minimal new hires']
    },
    realistic: {
      revenue: [
        { month: 'Jan', value: 2400000 },
        { month: 'Feb', value: 2500000 },
        { month: 'Mar', value: 2600000 },
        { month: 'Apr', value: 2700000 },
        { month: 'May', value: 2750000 },
        { month: 'Jun', value: 2850000 }
      ],
      patients: [
        { month: 'Jan', value: 1100 },
        { month: 'Feb', value: 1150 },
        { month: 'Mar', value: 1200 },
        { month: 'Apr', value: 1250 },
        { month: 'May', value: 1300 },
        { month: 'Jun', value: 1350 }
      ],
      description: 'Realistic growth based on current trends and market conditions',
      keyFactors: ['Moderate marketing investment', 'Selective expansion', 'Strategic hiring']
    },
    optimistic: {
      revenue: [
        { month: 'Jan', value: 2600000 },
        { month: 'Feb', value: 2750000 },
        { month: 'Mar', value: 2900000 },
        { month: 'Apr', value: 3050000 },
        { month: 'May', value: 3200000 },
        { month: 'Jun', value: 3350000 }
      ],
      patients: [
        { month: 'Jan', value: 1200 },
        { month: 'Feb', value: 1280 },
        { month: 'Mar', value: 1360 },
        { month: 'Apr', value: 1440 },
        { month: 'May', value: 1520 },
        { month: 'Jun', value: 1600 }
      ],
      description: 'Optimistic growth with aggressive market expansion',
      keyFactors: ['Increased marketing spend', 'Rapid expansion', 'Aggressive hiring']
    }
  }

  const currentScenario = scenarioData[activeScenario]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="scenario-tooltip bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="scenario-tooltip-label text-sm font-medium text-gray-900 dark:text-white">
            {label} - {activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)}
          </p>
          <p className="scenario-tooltip-revenue text-sm text-blue-600 dark:text-blue-400">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="scenario-tooltip-patients text-sm text-green-600 dark:text-green-400">
            Patients: {payload[1].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="scenario-planning-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="scenario-planning-header mb-6">
        <h2 className="scenario-planning-title text-lg font-bold text-gray-900 dark:text-white mb-2">
          Scenario Planning
        </h2>
        <p className="scenario-planning-subtitle text-sm text-gray-600 dark:text-gray-400">
          What-if analysis and strategic planning scenarios
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="scenario-selector mb-6">
        <div className="scenario-selector-tabs flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['conservative', 'realistic', 'optimistic'] as const).map((scenario) => (
            <button
              key={scenario}
              onClick={() => setActiveScenario(scenario)}
              className={`scenario-tab flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeScenario === scenario
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon name={getScenarioIcon(scenario) as any} size={16} />
              <span className="capitalize">{scenario}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Description */}
      <div className="scenario-description mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="scenario-description-content">
          <h4 className="scenario-description-title text-base font-semibold text-gray-900 dark:text-white mb-2">
            {activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)} Scenario
          </h4>
          <p className="scenario-description-text text-sm text-gray-600 dark:text-gray-400 mb-3">
            {currentScenario.description}
          </p>
          <div className="scenario-key-factors">
            <h5 className="scenario-key-factors-title text-sm font-medium text-gray-900 dark:text-white mb-2">
              Key Factors:
            </h5>
            <ul className="scenario-key-factors-list space-y-1">
              {currentScenario.keyFactors.map((factor, index) => (
                <li key={index} className="scenario-key-factor flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icon name="check" size={14} className="text-green-500" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Chart */}
      <div className="scenario-chart-section mb-6">
        <h4 className="scenario-chart-title text-base font-semibold text-gray-900 dark:text-white mb-4">
          Revenue & Patient Projections
        </h4>
        <div className="scenario-chart-container h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentScenario.revenue}>
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
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                yAxisId="patients"
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Metrics */}
      <div className="scenario-metrics-grid grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Projection */}
        <div className="scenario-metric-card scenario-revenue-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="scenario-metric-header flex items-center justify-between mb-2">
            <Icon name="dollar-sign" size={20} className="text-green-600" />
            <span className="scenario-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Revenue Projection
            </span>
          </div>
          <div className="scenario-metric-value text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentScenario.revenue[currentScenario.revenue.length - 1].value)}
          </div>
          <div className="scenario-metric-subtitle text-xs text-gray-500 dark:text-gray-400">
            End of period
          </div>
        </div>

        {/* Patient Volume */}
        <div className="scenario-metric-card scenario-patients-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="scenario-metric-header flex items-center justify-between mb-2">
            <Icon name="users" size={20} className="text-blue-600" />
            <span className="scenario-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Patient Volume
            </span>
          </div>
          <div className="scenario-metric-value text-xl font-bold text-gray-900 dark:text-white">
            {currentScenario.patients[currentScenario.patients.length - 1].value.toLocaleString()}
          </div>
          <div className="scenario-metric-subtitle text-xs text-gray-500 dark:text-gray-400">
            Monthly projection
          </div>
        </div>

        {/* Growth Rate */}
        <div className="scenario-metric-card scenario-growth-card bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="scenario-metric-header flex items-center justify-between mb-2">
            <Icon name="trending-up" size={20} className="text-purple-600" />
            <span className="scenario-metric-label text-sm font-medium text-gray-600 dark:text-gray-400">
              Growth Rate
            </span>
          </div>
          <div className="scenario-metric-value text-xl font-bold text-gray-900 dark:text-white">
            {activeScenario === 'conservative' ? '8%' : activeScenario === 'realistic' ? '12%' : '18%'}
          </div>
          <div className="scenario-metric-subtitle text-xs text-gray-500 dark:text-gray-400">
            Annual growth
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioPlanning

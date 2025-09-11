import React from 'react'
import Icon from '../Icon'

interface KPICard {
  id: string
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

interface KPICardsProps {
  data: KPICard[]
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up'
      case 'down':
        return 'trending-down'
      case 'stable':
        return 'minus'
      default:
        return 'minus'
    }
  }

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') {
      return change > 0 ? 'text-green-600' : 'text-red-600'
    } else if (trend === 'down') {
      return change < 0 ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-600'
  }

  return (
    <div className="kpi-cards-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {data.map((kpi) => (
        <div
          key={kpi.id}
          className={`kpi-card kpi-card-${kpi.id} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow`}
        >
          <div className="kpi-card-header flex items-center justify-between mb-2">
            <h3 className="kpi-card-title text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {kpi.title}
            </h3>
            <div className={`kpi-card-status kpi-card-status-${kpi.status} inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)} flex-shrink-0 ml-1`}>
              <span className="hidden sm:inline">{kpi.status}</span>
              <span className="sm:hidden">{kpi.status.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          
          <div className="kpi-card-content flex flex-col sm:flex-row sm:items-baseline sm:justify-between space-y-1 sm:space-y-0">
            <p className="kpi-card-value text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
              {kpi.value}
            </p>
            
            <div className={`kpi-card-trend kpi-card-trend-${kpi.trend} flex items-center space-x-1 text-xs sm:text-sm ${getTrendColor(kpi.trend, kpi.change)}`}>
              <Icon name={getTrendIcon(kpi.trend) as any} size={12} />
              <span className="kpi-card-change font-medium">
                {Math.abs(kpi.change)}%
              </span>
            </div>
          </div>
          
          <div className="kpi-card-footer mt-2">
            <div className="kpi-card-period flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>vs last period</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default KPICards

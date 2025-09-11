import React from 'react'
import Icon from '../Icon'

interface ActivityItem {
  id: string
  type: 'claim' | 'payment' | 'denial' | 'compliance'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

interface RecentActivityProps {
  data: ActivityItem[]
}

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim':
        return 'file-text'
      case 'payment':
        return 'dollar-sign'
      case 'denial':
        return 'x-circle'
      case 'compliance':
        return 'check-circle'
      default:
        return 'activity'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'claim':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'payment':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'denial':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20'
      case 'compliance':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'check-circle'
      case 'warning':
        return 'alert-triangle'
      case 'error':
        return 'x-circle'
      default:
        return 'minus'
    }
  }

  return (
    <div className="recent-activity-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="recent-activity-header flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="recent-activity-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="recent-activity-view-all-btn text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {data.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3">
            {/* Activity Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
              <Icon name={getActivityIcon(activity.type) as any} size={16} />
            </div>
            
            {/* Activity Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <div className={`flex items-center space-x-1 ${getStatusColor(activity.status)}`}>
                  <Icon name={getStatusIcon(activity.status) as any} size={14} />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.filter(a => a.status === 'success').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.filter(a => a.status === 'warning').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Warnings</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.filter(a => a.status === 'error').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Errors</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            View All Activity
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export Log
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentActivity

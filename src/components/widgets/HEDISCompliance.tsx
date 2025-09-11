import React from 'react'
import Icon from '../Icon'

interface HEDISData {
  overallScore: number
  measures: Array<{ name: string; score: number; target: number; status: 'met' | 'not_met' | 'at_risk' }>
}

interface HEDISComplianceProps {
  data: HEDISData
}

const HEDISCompliance: React.FC<HEDISComplianceProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'at_risk':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'not_met':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return 'check-circle'
      case 'at_risk':
        return 'alert-triangle'
      case 'not_met':
        return 'x-circle'
      default:
        return 'minus'
    }
  }

  const getOverallStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' }
    if (score >= 80) return { status: 'Good', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' }
    return { status: 'Needs Improvement', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' }
  }

  const overallStatus = getOverallStatus(data.overallScore)
  const metMeasures = data.measures.filter(m => m.status === 'met').length
  const totalMeasures = data.measures.length

  return (
    <div className="hedis-compliance-widget bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="hedis-compliance-header flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="hedis-compliance-title text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          HEDIS Compliance
        </h3>
        <div className={`hedis-compliance-status hedis-compliance-status-${overallStatus.status.toLowerCase().replace(/\s+/g, '-')} flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${overallStatus.color}`}>
          <Icon name="shield-check" size={14} />
          <span className="hidden sm:inline">{overallStatus.status}</span>
          <span className="sm:hidden">{overallStatus.status.charAt(0)}</span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Overall Score</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.overallScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
              data.overallScore >= 90 ? 'bg-green-500' : 
              data.overallScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${data.overallScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Measures Summary */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Measures Met</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {metMeasures} of {totalMeasures}
          </span>
        </div>
      </div>

      {/* Individual Measures */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {data.measures.map((measure, index) => (
          <div key={measure.name} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {measure.name}
                </span>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {measure.score}%
                  </span>
                  <span className={`hedis-measure-status-badge px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(measure.status)}`}>
                    {measure.status === 'met' ? 'Met' : measure.status === 'at_risk' ? 'At Risk' : 'Not Met'}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2">
                <div 
                  className="h-1.5 sm:h-2 rounded-full transition-all duration-1000 ease-out bg-gray-400 dark:bg-gray-500"
                  style={{ width: `${Math.min((measure.score / measure.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Insights */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="lightbulb" size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
              Compliance Insights
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Focus on improving breast cancer screening rates</li>
              <li>• Monitor colorectal cancer screening closely</li>
              <li>• Maintain excellent diabetes and hypertension care</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            View HEDIS Details
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default HEDISCompliance

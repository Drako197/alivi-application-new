import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import HelperButton from './HelperButton'

const HEDISLandingPage = (): ReactElement => {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<string>('Healthcare Provider')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleTaskClick = (taskType: string) => {
    console.log('Task clicked:', taskType)
  }

  return (
    <div className="hedis-landing-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="hedis-page-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="hedis-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hedis-header-main flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 space-y-4 sm:space-y-0">
            <div className="hedis-header-title-section w-full sm:w-auto">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome to your HEDIS Patient Screening, Demo User!
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                HEDIS Quality Measures
              </div>
              <div className="hedis-role-badge px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full inline-block mt-2">
                {userRole}
              </div>
            </div>
            <div className="hedis-header-right w-full sm:w-auto">
              <div className="flex flex-row sm:flex-row sm:items-center space-x-2 sm:space-x-4">
                <div className="hedis-date-section">
                  <div className="hedis-date-card">
                    <div className="hedis-date-icon">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="hedis-date-content">
                      <div className="hedis-date-label">Today</div>
                      <div className="hedis-date-value">{formatDate(currentTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            HEDIS Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is a minimal working version of the HEDIS page.
          </p>
        </div>
      </div>

      {/* M.I.L.A. Assistant Button */}
      <HelperButton
        currentForm="NewScreeningForm"
        currentField="diabetesMellitus"
        currentStep={1}
        onNavigate={(destination) => {
          console.log('HEDIS navigation requested:', destination)
          if (destination === 'hedis-screening') {
            handleTaskClick('screening')
          } else if (destination === 'hedis-dashboard') {
            console.log('Already on HEDIS dashboard')
          }
        }}
      />
    </div>
  )
}

export default HEDISLandingPage

import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import HelperButton from './HelperButton'

// TypeScript Interfaces
interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  pcpName: string
  pcpLocation: string
  lastVisit: string
  status: 'active' | 'inactive'
}

interface ScreeningDetails {
  dateOfScreening: string
  placeOfService: string
  pcpLocation: string
  practicePhone: string
  practiceFax: string
  practiceEmail: string
  practiceName: string
  practiceLocation: string
  officeContact: string
  diabetesMellitus: 'yes' | 'no' | ''
  diabetesType: 'type1' | 'type2' | ''
  lastEyeExam: string
  ocularHistory: string[]
  ocularSurgery: string[]
  ocularHistoryOther: string
  ocularSurgeryOther: string
}

interface RetinalImages {
  rightEyeMissing: boolean
  leftEyeMissing: boolean
  rightEyeImages: File[]
  leftEyeImages: File[]
}

const HEDISLandingPage = (): ReactElement => {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<string>('Healthcare Provider')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Main view state
  const [currentView, setCurrentView] = useState<'dashboard' | 'screening'>('dashboard')
  
  // Modal states
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false)
  const [showCompletedScreeningListModal, setShowCompletedScreeningListModal] = useState(false)
  const [showSavedScreeningListModal, setShowSavedScreeningListModal] = useState(false)
  
  // Alert states
  const [showSaveAlert, setShowSaveAlert] = useState(false)

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
    if (taskType === 'screening') {
      setShowPatientSearchModal(true)
    } else if (taskType === 'completed') {
      setShowCompletedScreeningListModal(true)
    } else if (taskType === 'saved') {
      setShowSavedScreeningListModal(true)
    }
  }

  // Mock dashboard cards
  const dashboardCards = [
    {
      id: 'completed',
      icon: 'check-circle',
      number: 12,
      label: 'Completed Patient Forms',
      description: 'Successfully completed and submitted forms'
    },
    {
      id: 'saved',
      icon: 'save',
      number: 3,
      label: 'Saved Draft Forms',
      description: 'Forms in progress that have been saved'
    },
    {
      id: 'screening',
      icon: 'plus-circle',
      number: 0,
      label: 'New Patient Screening',
      description: 'Start a new patient screening form'
    }
  ]

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
        {/* Integrated Alerts */}
        {showSaveAlert && (
          <div className="hedis-integrated-alert show mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="hedis-integrated-alert-content flex items-center">
              <div className="hedis-integrated-alert-icon mr-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="hedis-integrated-alert-text">
                <div className="hedis-integrated-alert-title text-green-800 dark:text-green-200 font-medium">
                  Changes Saved Successfully
                </div>
                <div className="hedis-integrated-alert-message text-green-700 dark:text-green-300 text-sm">
                  Your screening data has been saved and can be continued later.
                </div>
              </div>
              <button
                onClick={() => setShowSaveAlert(false)}
                className="hedis-integrated-alert-close ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Card */}
        <div className="hedis-primary-action-card bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Start New Patient Screening</h2>
              <p className="text-blue-100 mb-4">Begin a comprehensive HEDIS quality measure screening for a patient</p>
              <button
                onClick={() => handleTaskClick('screening')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Start Screening
              </button>
            </div>
            <div className="hidden sm:block">
              <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="hedis-dashboard-section mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <div 
                key={card.id}
                className="hedis-dashboard-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleTaskClick(card.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="hedis-card-icon w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {card.icon === 'check-circle' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                      {card.icon === 'save' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      )}
                      {card.icon === 'plus-circle' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      )}
                    </svg>
                  </div>
                  <span className="hedis-card-number text-2xl font-bold text-gray-900 dark:text-white">{card.number}</span>
                </div>
                <div className="hedis-card-content">
                  <div className="hedis-card-label text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {card.label}
                  </div>
                  <div className="hedis-card-description text-xs text-gray-600 dark:text-gray-400">
                    {card.description}
                  </div>
                </div>
                <div className="hedis-card-badge mt-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {card.id === 'completed' ? 'View Only' : card.id === 'saved' ? 'Continue Editing' : 'Start New'}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
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

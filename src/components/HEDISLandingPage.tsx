import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import HelperButton from './HelperButton'

// Mock components for now to avoid syntax issues
const PatientSearchModal = ({ ...props }: any) => null
const CompletedScreeningListModal = ({ ...props }: any) => null  
const SavedScreeningListModal = ({ ...props }: any) => null

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

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      'check-circle': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'save': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      'plus-circle': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      'eye': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return icons[iconName] || icons['chart-bar']
  }

  const handleTaskClick = (taskType: string) => {
    console.log('Task clicked:', taskType)
    if (taskType === 'screening') {
      setShowPatientSearchModal(true)
    } else if (taskType === 'reports') {
      // Navigate to reports tab
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigateToReports'))
      }
    }
  }

  const handleFormCardClick = (cardId: string) => {
    console.log('Form card clicked:', cardId)
    if (cardId === 'completed') {
      setShowCompletedScreeningListModal(true)
    } else if (cardId === 'saved') {
      setShowSavedScreeningListModal(true)
    }
  }

  const handlePatientSelect = (patient: any) => {
    console.log('Patient selected:', patient)
    setShowPatientSearchModal(false)
  }

  const handleCompletedFormSelect = (formId: string) => {
    console.log('Completed form selected:', formId)
    setShowCompletedScreeningListModal(false)
  }

  const handleSavedFormSelect = (formId: string) => {
    console.log('Saved form selected:', formId)
    setShowSavedScreeningListModal(false)
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

        {/* Primary Action - New Patient Screening */}
        <div className="hedis-primary-action-section mb-8">
          <div className="hedis-primary-action-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="hedis-primary-action-header p-6 pb-4">
              <div className="hedis-primary-action-icon flex items-center mb-4">
                <div className="hedis-icon-badge w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                {getIcon('eye')}
              </div>
              <div className="hedis-primary-action-content">
                <h2 className="hedis-primary-action-title text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  New Patient Screening
                </h2>
                <p className="hedis-primary-action-description text-gray-600 dark:text-gray-400">
                  Start a new patient screening form to collect comprehensive health data and assessments. 
                  This is your primary workflow for patient evaluation and documentation.
                </p>
              </div>
            </div>
            <div className="hedis-primary-action-button px-6 pb-6">
              <button 
                className="hedis-hero-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                onClick={() => handleTaskClick('screening')}
              >
                Start New Screening
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Actions and Quick Access - Horizontal Layout */}
        <div className="hedis-secondary-actions-section">
          <div className="hedis-secondary-actions-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* HEDIS Reports */}
            <div className="hedis-secondary-action-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="hedis-secondary-action-header p-6 pb-4">
                <div className="hedis-secondary-action-icon flex items-center mb-4">
                  {getIcon('chart-bar')}
                </div>
                <div className="hedis-secondary-action-content">
                  <h3 className="hedis-secondary-action-title text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    HEDIS Reports
                  </h3>
                  <p className="hedis-secondary-action-description text-gray-600 dark:text-gray-400">
                    Access comprehensive HEDIS reports and analytics for quality measurement and compliance tracking.
                  </p>
                </div>
              </div>
              <div className="hedis-secondary-action-button px-6 pb-6">
                <button 
                  className="hedis-secondary-btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => handleTaskClick('reports')}
                >
                  View Reports
                </button>
              </div>
            </div>

            {/* Quick Access */}
            <div className="hedis-dashboard-compact bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
              <h3 className="hedis-compact-title text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h3>
              <div className="hedis-compact-grid space-y-3">
                {dashboardCards.map((card) => (
                  <div 
                    key={card.id}
                    className={`hedis-compact-card hedis-${card.id}-card group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-3 border border-gray-100 dark:border-gray-600`}
                    onClick={() => handleFormCardClick(card.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="hedis-compact-content flex items-center space-x-3">
                        <div className={`hedis-compact-icon hedis-${card.id}-icon w-10 h-10 rounded-lg flex items-center justify-center ${
                          card.id === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                          card.id === 'saved' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                          'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          <div className={`${
                            card.id === 'completed' ? 'text-green-600 dark:text-green-400' : 
                            card.id === 'saved' ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {getIcon(card.icon)}
                          </div>
                        </div>
                        <div className="hedis-compact-header">
                          <div className="flex items-center space-x-2">
                            <span className="hedis-compact-number text-lg font-bold text-gray-900 dark:text-white">{card.number}</span>
                            <span className="hedis-compact-label text-sm font-medium text-gray-900 dark:text-white">{card.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`hedis-compact-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        card.id === 'completed' ? 'hedis-badge-view-only bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                        'hedis-badge-continue-editing bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        <span>{card.id === 'completed' ? 'View Only' : 'Continue Editing'}</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Components */}
      {showPatientSearchModal && (
        <PatientSearchModal
          isOpen={showPatientSearchModal}
          onClose={() => setShowPatientSearchModal(false)}
          onPatientSelect={handlePatientSelect}
        />
      )}

      {showCompletedScreeningListModal && (
        <CompletedScreeningListModal
          isOpen={showCompletedScreeningListModal}
          onClose={() => setShowCompletedScreeningListModal(false)}
          onFormSelect={handleCompletedFormSelect}
        />
      )}

      {showSavedScreeningListModal && (
        <SavedScreeningListModal
          isOpen={showSavedScreeningListModal}
          onClose={() => setShowSavedScreeningListModal(false)}
          onFormSelect={handleSavedFormSelect}
          savedScreenings={[]}
        />
      )}

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

import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import MobileSideMenu from './MobileSideMenu'
import MobileProfile from './MobileProfile'
import PICLandingPage from './PICLandingPage'
import HEDISLandingPage from './HEDISLandingPage'
import MILAEnhancedDemo from './MILAEnhancedDemo'
import Icon from './Icon'
import ScreeningDataService, { type CompletedScreening, type SavedScreening } from '../services/ScreeningDataService'
import PatientEligibilityForm from './PatientEligibilityForm'
import ClaimsSubmissionForm from './ClaimsSubmissionForm'
import PrescriptionForm from './PrescriptionForm'
import ManualEligibilityRequestForm from './ManualEligibilityRequestForm'
import HealthPlanDetailsPage from './HealthPlanDetailsPage'
import FramesAndLensesPage from './FramesAndLensesPage'
import HelperButton from './HelperButton'
import PatientSearchModal from './PatientSearchModal'
import NewScreeningForm from './NewScreeningForm'
import { getDemoUserFirstName } from '../utils/nameGenerator'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Initialize tab state from localStorage or default to 'dashboard'
  const [activeMobileTab, setActiveMobileTab] = useState(() => {
    const saved = localStorage.getItem('activeMobileTab')
    return saved || 'dashboard'
  })
  
  const [mobileTabChangeCount, setMobileTabChangeCount] = useState(0)
  
  const [activeDesktopTab, setActiveDesktopTab] = useState(() => {
    const saved = localStorage.getItem('activeDesktopTab')
    return saved || 'dashboard'
  })
  
  const [breadcrumbPath, setBreadcrumbPath] = useState(['Dashboard'])
  const [picResetCounter, setPICResetCounter] = useState(0)
  const [hedisResetCounter, setHEDISResetCounter] = useState(0)
  const [mobileSearchTerm, setMobileSearchTerm] = useState('')
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState('all')
  
  // Mobile form state management
  const [mobilePICView, setMobilePICView] = useState<'landing' | 'patient-eligibility' | 'claims-submission' | 'prescription' | 'manual-eligibility-request' | 'health-plan-details' | 'frames-and-lenses'>('landing')
  const [mobileHEDISView, setMobileHEDISView] = useState<'landing' | 'patient-search' | 'screening-form'>('landing')

  // Real data state
  const [dashboardStats, setDashboardStats] = useState({
    completedScreenings: 0,
    savedScreenings: 0,
    recentCompletedScreenings: [] as CompletedScreening[],
    recentSavedScreenings: [] as SavedScreening[]
  })

  // Load real data on component mount
  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const stats = ScreeningDataService.getDashboardStats()
        const completedScreenings = ScreeningDataService.getCompletedScreenings()
        const savedScreenings = ScreeningDataService.getSavedScreenings()
        
        setDashboardStats({
          completedScreenings: stats.completedPatientForms,
          savedScreenings: stats.savedPatientForms,
          recentCompletedScreenings: completedScreenings.slice(0, 3), // Last 3 completed
          recentSavedScreenings: savedScreenings.slice(0, 3) // Last 3 saved
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  // Save tab state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeMobileTab', activeMobileTab)
  }, [activeMobileTab])

  useEffect(() => {
    localStorage.setItem('activeDesktopTab', activeDesktopTab)
  }, [activeDesktopTab])

  // Initialize breadcrumb path based on restored tab
  useEffect(() => {
    updateBreadcrumbPath(activeDesktopTab)
  }, [activeDesktopTab])

  // Mobile action handlers
  const handleMobileAction = (actionId: string) => {
    switch (actionId) {
      case 'request-patient-eligibility':
        setMobilePICView('patient-eligibility')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'claims-submission':
        setMobilePICView('claims-submission')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'prescription':
        setMobilePICView('prescription')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'manual-eligibility-request':
        setMobilePICView('manual-eligibility-request')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'health-plan-details':
        setMobilePICView('health-plan-details')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'frames-and-lenses':
        setMobilePICView('frames-and-lenses')
        // Scroll to top when navigating to form views
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'claim-status':
      case 'claim-summary':
      case 'job-status-online':
      case 'job-status-paper':
      case 'explanation-of-payments':
      case 'payment-summary-report':
      case 'frame-collections':
      case 'lens-price-list':
      case 'um-prior-authorization':
      case 'um-authorization-status':
      case 'provider-resources':
        // For now, these actions will show a placeholder or could be implemented later
        console.log('Action clicked:', actionId)
        alert(`The ${actionId.replace(/-/g, ' ')} feature is coming soon!`)
        break
      default:
        console.log('Mobile action clicked:', actionId)
    }
  }

  // Mobile P.I.C. Action Data - Updated to match desktop order exactly
  const mobileActions = [
    // Claims & Eligibility
    {
      id: 'request-patient-eligibility',
      title: 'Request Patient Eligibility',
      description: 'Check patient eligibility and benefits',
      icon: 'user-check',
      category: 'eligibility',
      frequency: 95
    },
    {
      id: 'claims-submission',
      title: 'Claims Submission',
      description: 'Submit new claims for processing',
      icon: 'upload',
      category: 'claims',
      frequency: 92
    },
    {
      id: 'prescription',
      title: 'Prescription Entry',
      description: 'Enter detailed prescription parameters',
      icon: 'eye',
      category: 'claims',
      frequency: 89
    },
    {
      id: 'claim-status',
      title: 'Claim Status',
      description: 'View real-time claim processing status',
      icon: 'search',
      category: 'claims',
      frequency: 88
    },
    {
      id: 'claim-summary',
      title: 'Claim Summary',
      description: 'View detailed claim summaries and reports',
      icon: 'file-text',
      category: 'claims',
      frequency: 82
    },
    {
      id: 'job-status-online',
      title: 'Job Status Online Entry',
      description: 'Enter job status information online',
      icon: 'monitor',
      category: 'claims',
      frequency: 55
    },
    {
      id: 'job-status-paper',
      title: 'Job Status Paper Claim',
      description: 'Submit job status via paper claim',
      icon: 'file-text',
      category: 'claims',
      frequency: 45
    },
    
    // Health Plans & Payments
    {
      id: 'health-plan-details',
      title: 'Health Plan Details',
      description: 'View health plan information and coverage',
      icon: 'info',
      category: 'plans',
      frequency: 85
    },
    {
      id: 'explanation-of-payments',
      title: 'Explanation of Payments',
      description: 'View detailed payment explanations',
      icon: 'dollar-sign',
      category: 'plans',
      frequency: 78
    },
    {
      id: 'payment-summary-report',
      title: 'Payment Summary Report',
      description: 'Generate payment summary reports',
      icon: 'bar-chart-3',
      category: 'plans',
      frequency: 72
    },
    {
      id: 'frames-and-lenses',
      title: 'Frames and Lenses',
      description: 'Access frame collections and lens pricing information',
      icon: 'eye',
      category: 'plans',
      frequency: 75
    },
    
    // Authorization & Management
    {
      id: 'um-prior-authorization',
      title: 'UM Prior Authorization',
      description: 'Submit utilization management authorizations',
      icon: 'shield-check',
      category: 'authorization',
      frequency: 82
    },
    {
      id: 'um-authorization-status',
      title: 'UM Authorization Status',
      description: 'Check authorization request status',
      icon: 'clock',
      category: 'authorization',
      frequency: 75
    },
    
    // Resources & Tools
    {
      id: 'manual-eligibility-request',
      title: 'Manual Eligibility Request',
      description: 'Submit manual eligibility requests',
      icon: 'edit-3',
      category: 'resources',
      frequency: 68
    },
    {
      id: 'provider-resources',
      title: 'Provider Resources',
      description: 'Access provider tools and resources',
      icon: 'graduation-cap',
      category: 'resources',
      frequency: 35
    }
  ]

  // Mobile filtering logic - Maintain desktop order instead of frequency sorting
  const filteredMobileActions = mobileActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
                         action.category.toLowerCase().includes(mobileSearchTerm.toLowerCase())
    const matchesCategory = mobileSelectedCategory === 'all' || action.category === mobileSelectedCategory
    return matchesSearch && matchesCategory
  }) // Removed frequency sorting to maintain desktop order

  // Mobile icon helper function - Updated to use Icon component
  const getMobileIcon = (iconName: string) => {
    return <Icon name={iconName} size={24} className="text-gray-600 dark:text-gray-300" />
  }

  const getMobileFrequentIcon = (iconName: string) => {
    return <Icon name={iconName} size={24} className="text-white" />
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    logout()
  }

  const handleDropdownToggle = () => {
    setShowUserDropdown(!showUserDropdown)
  }

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  const handleMobileTabChange = (tab: string) => {
    setActiveMobileTab(tab)
    setMobileTabChangeCount(prev => prev + 1)
    // Scroll to top when changing tabs on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDesktopTabChange = (tab: string) => {
    setActiveDesktopTab(tab)
    updateBreadcrumbPath(tab)
    
    // If navigating to PIC, we need to reset any active forms
    if (tab === 'pic') {
      // Force a re-render of PICLandingPage to reset its internal state
      setPICResetCounter(prev => prev + 1)
    }
    
    // If navigating to HEDIS, we need to reset any active forms
    if (tab === 'hedis') {
      // Force a re-render of HEDISLandingPage to reset its internal state
      setHEDISResetCounter(prev => prev + 1)
    }
  }

  const updateBreadcrumbPath = (tab: string) => {
    const tabNames: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'hedis': 'H.E.D.I.S.',
      'pic': 'P.I.C.',
      'reports': 'Reports',
      'analytics': 'Analytics',
      'users': 'Users',
      'roles': 'Roles & Permissions',
      'audit': 'Audit Log',
      'settings': 'Settings'
    }

    const newPath = ['Dashboard']
    if (tab !== 'dashboard') {
      newPath.push(tabNames[tab] || tab)
    }
    setBreadcrumbPath(newPath)
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setActiveDesktopTab('dashboard')
      setBreadcrumbPath(['Dashboard'])
    } else if (index === 1 && breadcrumbPath[1] === 'H.E.D.I.S.') {
      // Clicking on H.E.D.I.S. should take us back to HEDIS dashboard
      setActiveDesktopTab('hedis')
      // The HEDIS component will update the breadcrumb to show just Dashboard > H.E.D.I.S.
    } else if (index === 1 && breadcrumbPath[1] === 'P.I.C.') {
      // Clicking on P.I.C. should take us back to PIC landing page
      setActiveDesktopTab('pic')
      setBreadcrumbPath(['Dashboard', 'P.I.C.'])
    }
    // For future sub-pages, we can add more logic here
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'hedis':
        setActiveDesktopTab('hedis')
        break
      case 'pic':
        setActiveDesktopTab('pic')
        break
      case 'eligibility':
        setActiveDesktopTab('pic')
        // TODO: Navigate directly to Patient Eligibility form
        break
      case 'completed-screenings':
        setActiveDesktopTab('hedis')
        // TODO: Navigate to completed screenings view
        break
      default:
        console.log('Quick action clicked:', action)
    }
  }

  // Desktop content based on active tab
  const renderDesktopContent = () => {
    switch (activeDesktopTab) {
      case 'hedis':
        return (
          <div className="dashboard-content">
            <HEDISLandingPage 
              onUpdateBreadcrumb={setBreadcrumbPath}
              resetToLanding={hedisResetCounter}
            />
          </div>
        )
      case 'pic':
        return (
          <div className="dashboard-content">
            <PICLandingPage 
              onUpdateBreadcrumb={setBreadcrumbPath} 
              resetToLanding={picResetCounter}
            />
          </div>
        )
      case 'reports':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Reports</h1>
            <p className="welcome-subtitle">Analytics and reporting tools</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Reports content coming soon...</p>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Analytics</h1>
            <p className="welcome-subtitle">Data insights and visualizations</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Analytics content coming soon...</p>
            </div>
          </div>
        )
      case 'users':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Users</h1>
            <p className="welcome-subtitle">User management and administration</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Users content coming soon...</p>
            </div>
          </div>
        )
      case 'roles':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Roles & Permissions</h1>
            <p className="welcome-subtitle">Access control and security</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Roles & Permissions content coming soon...</p>
            </div>
          </div>
        )
      case 'audit':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Audit Log</h1>
            <p className="welcome-subtitle">System activity and security logs</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Audit Log content coming soon...</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">Settings</h1>
            <p className="welcome-subtitle">Application configuration and M.I.L.A. AI Assistant</p>
            
            {/* M.I.L.A. Demo Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">M.I.L.A. AI Assistant Demo</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <MILAEnhancedDemo />
              </div>
            </div>
            
            {/* General Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Additional settings content coming soon...</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back, {getDemoUserFirstName()}!</h1>
              <p className="welcome-subtitle">Here's what's happening with your healthcare services today.</p>
            </div>

            {/* Stats Grid - Updated with real data */}
            <div className="stats-grid">
              <div className="stat-card completed-screenings-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-green-100 dark:bg-green-900">
                      <Icon name="check-circle" size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Completed Screenings</p>
                    <p className="stat-value">{dashboardStats.completedScreenings}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card saved-screenings-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-blue-100 dark:bg-blue-900">
                      <Icon name="save" size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Saved Screenings</p>
                    <p className="stat-value">{dashboardStats.savedScreenings}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card eligibility-requests-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-purple-100 dark:bg-purple-900">
                      <Icon name="user-check" size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Eligibility Requests</p>
                    <p className="stat-value">24</p>
                  </div>
                </div>
              </div>

              <div className="stat-card pending-actions-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-yellow-100 dark:bg-yellow-900">
                      <Icon name="clock" size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Pending Actions</p>
                    <p className="stat-value">{dashboardStats.savedScreenings + 3}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Updated with real form links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* M.I.L.A. AI Assistant Card */}
              <div className="stat-card mila-ai-assistant-detail-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-lg flex items-center">
                  <Icon name="bot" size={20} className="mr-2" />
                  M.I.L.A. AI Assistant
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 px-4">
                    Your Medical Intelligence & Learning Assistant is here to help with medical billing questions, codes, and form guidance.
                  </p>
                  <div className="px-4 space-y-2">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Inline form integration for medical codes
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Contextual help across all forms
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      One-click code insertion & validation
                    </div>
                  </div>
                  <div className="px-4">
                    <HelperButton 
                      currentForm="Dashboard"
                      currentField="general"
                      currentStep={1}
                    />
                  </div>
                </div>
              </div>

              <div className="stat-card quick-actions-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('hedis')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="plus" size={16} className="inline mr-2" />
                    Start New HEDIS Screening
                  </button>
                  <button 
                    onClick={() => handleQuickAction('eligibility')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility
                  </button>
                  <button 
                    onClick={() => handleQuickAction('completed-screenings')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="file-text" size={16} className="inline mr-2" />
                    View Completed Screenings
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Submit Claims
                  </button>
                </div>
              </div>

              <div className="stat-card recent-activity-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-green-500 rounded-r-lg">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardStats.recentCompletedScreenings.length > 0 ? (
                    dashboardStats.recentCompletedScreenings.map((screening, index) => (
                      <div key={screening.id} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {screening.patientName} - Screening completed
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No recent completed screenings
                    </div>
                  )}
                  {dashboardStats.recentSavedScreenings.length > 0 && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {dashboardStats.recentSavedScreenings.length} saved screening{dashboardStats.recentSavedScreenings.length !== 1 ? 's' : ''} pending
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Patient eligibility request submitted</span>
                  </div>
                </div>
              </div>

              <div className="stat-card popular-pic-actions-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-purple-500 rounded-r-lg">Popular PIC Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility (95% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Claims Submission (92% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="search" size={16} className="inline mr-2" />
                    Claim Status (88% usage)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  // Mobile content based on active tab
  const renderMobileContent = () => {
    switch (activeMobileTab) {
      case 'dashboard':
        return (
          <div className="mobile-main-content">
            <div className="p-4">
              {/* Welcome Section */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {getDemoUserFirstName()}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's what's happening with your healthcare services today.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* M.I.L.A. AI Assistant Card - First position */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mila-ai-assistant-card-mobile">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="bot" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">M.I.L.A. AI</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">Active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 completed-screenings-card-mobile">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="check-circle" size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardStats.completedScreenings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 saved-screenings-card-mobile">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="save" size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Saved</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardStats.savedScreenings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 eligibility-requests-card-mobile">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="user-check" size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Eligibility</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">24</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 pending-actions-card-mobile">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                      <Icon name="clock" size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardStats.savedScreenings + 3}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('hedis')}
                    className="w-full text-left p-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="plus" size={16} className="inline mr-2" />
                    Start New HEDIS Screening
                  </button>
                  <button 
                    onClick={() => handleQuickAction('eligibility')}
                    className="w-full text-left p-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility
                  </button>
                  <button 
                    onClick={() => handleQuickAction('completed-screenings')}
                    className="w-full text-left p-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="file-text" size={16} className="inline mr-2" />
                    View Completed Screenings
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left p-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Submit Claims
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardStats.recentCompletedScreenings.length > 0 ? (
                    dashboardStats.recentCompletedScreenings.map((screening, index) => (
                      <div key={screening.id} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {screening.patientName} - Screening completed
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No recent completed screenings
                    </div>
                  )}
                  {dashboardStats.recentSavedScreenings.length > 0 && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {dashboardStats.recentSavedScreenings.length} saved screening{dashboardStats.recentSavedScreenings.length !== 1 ? 's' : ''} pending
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Patient eligibility request submitted</span>
                  </div>
                </div>
              </div>

              {/* Popular PIC Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular PIC Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left p-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility (95% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left p-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Claims Submission (92% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left p-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="search" size={16} className="inline mr-2" />
                    Claim Status (88% usage)
                  </button>
                </div>
              </div>

              {/* M.I.L.A. AI Assistant */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">M.I.L.A. AI Assistant</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Your Medical Intelligence & Learning Assistant is here to help with medical billing questions, codes, and form guidance.
                </p>
                <HelperButton 
                  currentForm="Dashboard"
                  currentField="mobile"
                  currentStep={1}
                />
              </div>
            </div>
          </div>
        )
      case 'profile':
        return <MobileProfile />
      case 'hedis':
        return (
          <div className="mobile-main-content">
            {mobileHEDISView === 'landing' ? (
              <HEDISLandingPage onUpdateBreadcrumb={setBreadcrumbPath} />
            ) : mobileHEDISView === 'patient-search' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setMobileHEDISView('landing')}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Search</h2>
                </div>
                <PatientSearchModal 
                  isOpen={true} 
                  onClose={() => {
                    setMobileHEDISView('landing')
                    // Scroll to top when navigating back
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onPatientSelect={(patient) => {
                    console.log('Patient selected:', patient)
                    setMobileHEDISView('screening-form')
                    // Scroll to top when navigating to form
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobileHEDISView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">HEDIS Screening</h2>
                </div>
                <NewScreeningForm 
                  patient={{ 
                    id: '1', 
                    patientId: 'P001', 
                    firstName: 'Test', 
                    lastName: 'Patient', 
                    dateOfBirth: '1990-01-01',
                    pcpName: 'Dr. Smith',
                    pcpLocation: 'Primary Care Clinic',
                    lastVisit: '2024-01-15',
                    status: 'active'
                  }}
                  isOpen={true}
                  onClose={() => {
                    setMobileHEDISView('landing')
                    // Scroll to top when navigating back
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onSave={(data) => console.log('Screening saved:', data)}
                  onComplete={(data) => {
                    console.log('Screening completed:', data)
                    setMobileHEDISView('landing')
                    // Scroll to top when completing form
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
            <HelperButton currentForm="HEDIS" currentField="mobile" currentStep={1} />
          </div>
        )
      case 'pic':
        return (
          <div className="mobile-main-content">
            {mobilePICView === 'landing' ? (
              <div className="p-4">
                {/* Mobile P.I.C. Header */}
                <div className="pic-actions-mobile-header mb-4">
                  <h2 className="pic-actions-mobile-title text-xl font-bold text-gray-900 dark:text-white mb-3">P.I.C. Actions</h2>
                  <p className="pic-actions-mobile-subtitle text-sm text-gray-600 dark:text-gray-400 mb-4">Quick access to all provider interface center actions</p>
                </div>
              
                {/* Mobile Search */}
                <div className="pic-actions-mobile-search relative mb-4">
                  <div className="pic-actions-mobile-search-icon absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={mobileSearchTerm}
                    onChange={(e) => setMobileSearchTerm(e.target.value)}
                    className="pic-actions-mobile-search-input w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {mobileSearchTerm && (
                    <button
                      onClick={() => setMobileSearchTerm('')}
                      className="pic-actions-mobile-search-clear absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Mobile Category Filter */}
                <div className="pic-actions-mobile-categories mb-4">
                  <select 
                    value={mobileSelectedCategory}
                    onChange={(e) => setMobileSelectedCategory(e.target.value)}
                    className="pic-actions-mobile-category-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="eligibility">Eligibility</option>
                    <option value="claims">Claims</option>
                    <option value="plans">Health Plans & Payments</option>
                    <option value="authorization">Authorization</option>
                    <option value="resources">Resources & Tools</option>
                  </select>
                </div>

                {/* Mobile Frequently Used Actions */}
                {mobileSearchTerm === '' && mobileSelectedCategory === 'all' && (
                  <div className="pic-actions-mobile-frequent mb-6">
                    <h3 className="pic-actions-mobile-frequent-title text-lg font-semibold text-gray-900 dark:text-white mb-3">Frequently Used Actions</h3>
                    <div className="pic-actions-mobile-frequent-list space-y-3">
                      {mobileActions
                        .filter(action => action.frequency >= 80)
                        .slice(0, 3)
                        .map((action) => (
                          <div 
                            key={action.id} 
                            className="pic-actions-mobile-frequent-card bg-blue-50 dark:bg-blue-900/10 border border-blue-300 dark:border-blue-600 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                            onClick={() => handleMobileAction(action.id)}
                          >
                            <div className="flex items-center">
                              <div className="pic-actions-mobile-frequent-icon flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                {getMobileFrequentIcon(action.icon)}
                              </div>
                              <div className="pic-actions-mobile-frequent-content flex-1">
                                <h3 className="pic-actions-mobile-frequent-title text-sm font-medium text-gray-900 dark:text-white">{action.title}</h3>
                                <p className="pic-actions-mobile-frequent-description text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                              </div>
                              <div className="pic-actions-mobile-frequent-badge flex-shrink-0">
                                <span className="pic-actions-mobile-frequent-badge-popular inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Popular
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Mobile Action Cards */}
                <div className="pic-actions-mobile-cards space-y-3">
                  {filteredMobileActions.map((action) => (
                    <div 
                      key={action.id} 
                      className="pic-actions-mobile-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleMobileAction(action.id)}
                    >
                      <div className="flex items-center">
                        <div className="pic-actions-mobile-card-icon flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                          {getMobileIcon(action.icon)}
                        </div>
                        <div className="pic-actions-mobile-card-content flex-1">
                          <h3 className="pic-actions-mobile-card-title text-sm font-medium text-gray-900 dark:text-white">{action.title}</h3>
                          <p className="pic-actions-mobile-card-description text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                        </div>
                        <div className="pic-actions-mobile-card-badge flex-shrink-0">
                          {action.frequency >= 80 ? (
                            <span className="pic-actions-mobile-card-badge-popular inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Popular
                            </span>
                          ) : action.frequency >= 60 ? (
                            <span className="pic-actions-mobile-card-badge-active inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 11-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              Active
                            </span>
                          ) : action.frequency >= 40 ? (
                            <span className="pic-actions-mobile-card-badge-regular inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Regular
                            </span>
                          ) : (
                            <span className="pic-actions-mobile-card-badge-new">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : mobilePICView === 'patient-eligibility' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Eligibility</h2>
                </div>
                <PatientEligibilityForm />
                <HelperButton currentForm="PatientEligibility" currentField="mobile" currentStep={1} />
              </div>
            ) : mobilePICView === 'claims-submission' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Claims Submission</h2>
                </div>
                <ClaimsSubmissionForm />
                <HelperButton currentForm="ClaimsSubmission" currentField="mobile" currentStep={1} />
              </div>
            ) : mobilePICView === 'prescription' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prescription Entry</h2>
                </div>
                <PrescriptionForm />
                <HelperButton currentForm="Prescription" currentField="mobile" currentStep={1} />
              </div>
            ) : mobilePICView === 'manual-eligibility-request' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Eligibility Request</h2>
                </div>
                <ManualEligibilityRequestForm />
                <HelperButton currentForm="ManualEligibilityRequest" currentField="mobile" currentStep={1} />
              </div>
            ) : mobilePICView === 'health-plan-details' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Plan Details</h2>
                </div>
                <HealthPlanDetailsPage />
                <HelperButton currentForm="HealthPlanDetails" currentField="mobile" currentStep={1} />
              </div>
            ) : mobilePICView === 'frames-and-lenses' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => {
                      setMobilePICView('landing')
                      // Scroll to top when navigating back
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Frames and Lenses</h2>
                </div>
                <FramesAndLensesPage />
                <HelperButton currentForm="FramesAndLenses" currentField="mobile" currentStep={1} />
              </div>
            ) : null}
            <HelperButton currentForm="PIC" currentField="mobile" currentStep={1} />
          </div>
        )
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reports</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Reports content coming soon...</p>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Application configuration and M.I.L.A. AI Assistant</p>
            
            {/* M.I.L.A. Demo Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">M.I.L.A. AI Assistant Demo</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <MILAEnhancedDemo />
              </div>
            </div>
            
            {/* General Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">General Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Additional settings content coming soon...</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back, {getDemoUserFirstName()}!</h1>
              <p className="welcome-subtitle">Here's what's happening with your healthcare services today.</p>
            </div>

            {/* Stats Grid - Updated with real data */}
            <div className="stats-grid">
              <div className="stat-card completed-screenings-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-green-100 dark:bg-green-900">
                      <Icon name="check-circle" size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Completed Screenings</p>
                    <p className="stat-value">{dashboardStats.completedScreenings}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card saved-screenings-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-blue-100 dark:bg-blue-900">
                      <Icon name="save" size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Saved Screenings</p>
                    <p className="stat-value">{dashboardStats.savedScreenings}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card eligibility-requests-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-purple-100 dark:bg-purple-900">
                      <Icon name="user-check" size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Eligibility Requests</p>
                    <p className="stat-value">24</p>
                  </div>
                </div>
              </div>

              <div className="stat-card pending-actions-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-yellow-100 dark:bg-yellow-900">
                      <Icon name="clock" size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Pending Actions</p>
                    <p className="stat-value">{dashboardStats.savedScreenings + 3}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Updated with real form links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* M.I.L.A. AI Assistant Card */}
              <div className="stat-card mila-ai-assistant-detail-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-lg flex items-center">
                  <Icon name="bot" size={20} className="mr-2" />
                  M.I.L.A. AI Assistant
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 px-4">
                    Your Medical Intelligence & Learning Assistant is here to help with medical billing questions, codes, and form guidance.
                  </p>
                  <div className="px-4 space-y-2">
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Inline form integration for medical codes
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                      Contextual help across all forms
                    </div>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      One-click code insertion & validation
                    </div>
                  </div>
                  <div className="px-4">
                    <HelperButton 
                      currentForm="Dashboard"
                      currentField="general"
                      currentStep={1}
                    />
                  </div>
                </div>
              </div>

              <div className="stat-card quick-actions-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('hedis')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="plus" size={16} className="inline mr-2" />
                    Start New HEDIS Screening
                  </button>
                  <button 
                    onClick={() => handleQuickAction('eligibility')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility
                  </button>
                  <button 
                    onClick={() => handleQuickAction('completed-screenings')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="file-text" size={16} className="inline mr-2" />
                    View Completed Screenings
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Submit Claims
                  </button>
                </div>
              </div>

              <div className="stat-card recent-activity-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-green-500 rounded-r-lg">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardStats.recentCompletedScreenings.length > 0 ? (
                    dashboardStats.recentCompletedScreenings.map((screening, index) => (
                      <div key={screening.id} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {screening.patientName} - Screening completed
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No recent completed screenings
                    </div>
                  )}
                  {dashboardStats.recentSavedScreenings.length > 0 && (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {dashboardStats.recentSavedScreenings.length} saved screening{dashboardStats.recentSavedScreenings.length !== 1 ? 's' : ''} pending
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Patient eligibility request submitted</span>
                  </div>
                </div>
              </div>

              <div className="stat-card popular-pic-actions-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-purple-500 rounded-r-lg">Popular PIC Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility (95% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="upload" size={16} className="inline mr-2" />
                    Claims Submission (92% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="search" size={16} className="inline mr-2" />
                    Claim Status (88% usage)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className={`app-container ${isDarkMode ? 'dark' : ''} hidden lg:flex`}>
        <div className="app-wrapper">
          <Sidebar 
            isDarkMode={isDarkMode} 
            onToggleDarkMode={toggleDarkMode}
            activeTab={activeDesktopTab}
            onTabChange={handleDesktopTabChange}
          />
          <div className="main-content">
            <header className="header">
              <div className="header-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Breadcrumb */}
                    <nav className="main-header-breadcrumb flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      {breadcrumbPath.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <span
                            onClick={() => handleBreadcrumbClick(index)}
                            className={`hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer ${
                              index === breadcrumbPath.length - 1 ? 'text-gray-900 dark:text-white font-medium' : ''
                            }`}
                          >
                            {item}
                          </span>
                          {index < breadcrumbPath.length - 1 && (
                            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>
                  <div className="header-user-section flex items-center space-x-4">
                    <div>
                      <button
                        onClick={handleDropdownToggle}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="user-avatar">
                          <span className="text-sm font-medium text-white">
                            {user?.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Clean Dropdown */}
                      {showUserDropdown && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          right: 0, 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc', 
                          padding: '10px', 
                          zIndex: 1000,
                          minWidth: '200px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ marginBottom: '10px' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.fullName}</p>
                            <p style={{ color: '#666', fontSize: '12px' }}>{user?.email}</p>
                          </div>
                          
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                            <button 
                              onClick={() => {
                                console.log('Profile clicked!')
                                // TODO: Navigate to profile page
                              }}
                              style={{ 
                                width: '100%', 
                                padding: '8px', 
                                color: '#333', 
                                border: 'none', 
                                background: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile
                            </button>
                            
                            <button 
                              onClick={() => {
                                console.log('Settings clicked!')
                                // TODO: Navigate to settings page
                              }}
                              style={{ 
                                width: '100%', 
                                padding: '8px', 
                                color: '#333', 
                                border: 'none', 
                                background: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Settings
                            </button>
                            
                            <button 
                              onClick={() => {
                                console.log('Help clicked!')
                                // TODO: Navigate to help page
                              }}
                              style={{ 
                                width: '100%', 
                                padding: '8px', 
                                color: '#333', 
                                border: 'none', 
                                background: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Help
                            </button>
                            
                            <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
                              <button 
                                onClick={handleLogout}
                                style={{ 
                                  width: '100%', 
                                  padding: '8px', 
                                  color: '#dc2626', 
                                  border: 'none', 
                                  background: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main className="dashboard-content">
              {renderDesktopContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className={`mobile-app-container ${isDarkMode ? 'dark' : ''} lg:hidden`}>
        <MobileHeader 
          onMenuToggle={handleMobileMenuToggle}
          title={activeMobileTab === 'dashboard' ? 'Dashboard' : activeMobileTab.charAt(0).toUpperCase() + activeMobileTab.slice(1)}
        />
        
        <div className="mobile-main-content">
          {renderMobileContent()}
        </div>

        <MobileBottomNav 
          activeTab={activeMobileTab}
          onTabChange={handleMobileTabChange}
        />

        <MobileSideMenu 
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>
    </>
  )
} 
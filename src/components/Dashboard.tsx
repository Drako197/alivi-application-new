import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import MobileSideMenu from './MobileSideMenu'
import MobileProfile from './MobileProfile'
import PICLandingPage from './PICLandingPage'
import HEDISLandingPage from './HEDISLandingPage'
import Icon from './Icon'
import ScreeningDataService, { type CompletedScreening, type SavedScreening } from '../services/ScreeningDataService'
import ScreeningDateService from '../services/ScreeningDateService'

// Debug import
console.log('ScreeningDateService imported:', typeof ScreeningDateService)
import PatientEligibilityForm from './PatientEligibilityForm'
import ClaimsSubmissionForm from './ClaimsSubmissionForm'
import PrescriptionForm from './PrescriptionForm'
import ManualEligibilityRequestForm from './ManualEligibilityRequestForm'
import HealthPlanDetailsPage from './HealthPlanDetailsPage'
import FramesAndLensesPage from './FramesAndLensesPage'
import HelperButton from './HelperButton'
import PatientSearchModal from './PatientSearchModal'
import NewScreeningForm from './NewScreeningForm'
import ReportsPage from './ReportsPage'
import AnalyticsPage from './AnalyticsPage'
import UsersPage from './UsersPage'
import SettingsPage from './SettingsPage'
import ProfilePage from './ProfilePage'
import RolesPage from './RolesPage'
import AuditLogPage from './AuditLogPage'
import Footer from './Footer'

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
  
  
  const [activeDesktopTab, setActiveDesktopTab] = useState(() => {
    const saved = localStorage.getItem('activeDesktopTab')
    return saved || 'dashboard'
  })
  
  const [breadcrumbPath, setBreadcrumbPath] = useState(['Dashboard'])
  const [picResetCounter, setPICResetCounter] = useState(0)
  const [hedisResetCounter, setHEDISResetCounter] = useState(0)
  const [mobileSearchTerm, setMobileSearchTerm] = useState('')
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7D')
  
  // Sample chart data based on time range
  const getChartData = (timeRange: string) => {
    switch (timeRange) {
      case '7D':
        return {
          revenue: [85, 87, 90, 88, 92, 89, 94],
          claims: [92, 89, 91, 94, 92, 90, 92],
          denials: [8, 11, 9, 6, 8, 10, 8]
        }
      case '30D':
        return {
          revenue: [82, 85, 88, 86, 90, 87, 92, 89, 94, 91, 93, 90, 95, 92, 88, 91, 89, 93, 90, 94, 87, 92, 89, 91, 88, 90, 93, 91, 94, 92],
          claims: [89, 91, 88, 92, 90, 94, 87, 91, 89, 93, 90, 88, 92, 89, 91, 88, 90, 92, 89, 94, 87, 91, 88, 90, 92, 89, 91, 88, 90, 92],
          denials: [11, 9, 12, 8, 10, 6, 13, 9, 11, 7, 10, 12, 8, 11, 9, 12, 10, 8, 11, 6, 13, 9, 12, 10, 8, 11, 9, 12, 10, 8]
        }
      case '90D':
        return {
          revenue: Array.from({length: 90}, (_, i) => 80 + Math.sin(i / 10) * 10 + Math.random() * 5),
          claims: Array.from({length: 90}, (_, i) => 85 + Math.cos(i / 8) * 8 + Math.random() * 4),
          denials: Array.from({length: 90}, (_, i) => 10 - Math.sin(i / 12) * 3 + Math.random() * 2)
        }
      default:
        return {
          revenue: [85, 87, 90, 88, 92, 89, 94],
          claims: [92, 89, 91, 94, 92, 90, 92],
          denials: [8, 11, 9, 6, 8, 10, 8]
        }
    }
  }

  const chartData = getChartData(selectedTimeRange)
  
  // Dynamic Performance Data based on time range
  const getPerformanceData = (timeRange: string) => {
    const baseData = {
      '7D': {
        data: [94, 91, 6, 2.1],
        labels: ['Clean Claims %', 'Success Rate %', 'Denial Rate %', 'Avg Days'],
        colors: [
          'from-green-400 to-green-600',
          'from-blue-400 to-blue-600', 
          'from-red-400 to-red-600',
          'from-amber-400 to-amber-600'
        ]
      },
      '30D': {
        data: [92, 89, 8, 2.3],
        labels: ['Clean Claims %', 'Success Rate %', 'Denial Rate %', 'Avg Days'],
        colors: [
          'from-green-400 to-green-600',
          'from-blue-400 to-blue-600', 
          'from-red-400 to-red-600',
          'from-amber-400 to-amber-600'
        ]
      },
      '90D': {
        data: [90, 87, 10, 2.5],
        labels: ['Clean Claims %', 'Success Rate %', 'Denial Rate %', 'Avg Days'],
        colors: [
          'from-green-400 to-green-600',
          'from-blue-400 to-blue-600', 
          'from-red-400 to-red-600',
          'from-amber-400 to-amber-600'
        ]
      }
    }
    return baseData[timeRange as keyof typeof baseData] || baseData['30D']
  }
  
  const performanceMetrics = getPerformanceData(selectedTimeRange)
  const performanceData = performanceMetrics.data
  const performanceLabels = performanceMetrics.labels
  const performanceColors = performanceMetrics.colors

  // Skeleton loading component
  const SkeletonCard = ({ className = "", height = "h-32" }: { className?: string, height?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded ${height}`}></div>
      </div>
    </div>
  )

  // Simple Line Chart Component
  const LineChart = ({ data, title, color = "blue" }: { data: number[], title: string, color?: string }) => {
    const maxValue = Math.max(...data)
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - (value / maxValue) * 100
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="w-full h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={`rgb(var(--color-${color}-500))`}
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className={`text-${color}-400`} stopOpacity="0.3" />
              <stop offset="100%" className={`text-${color}-400`} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polyline
            fill={`url(#gradient-${color})`}
            stroke="none"
            points={`0,100 ${points} 100,100`}
          />
        </svg>
        <div className="absolute top-2 left-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          {title}
        </div>
      </div>
    )
  }

  // Bar Chart Component
  const BarChart = ({ data, labels, colors }: { data: number[], labels: string[], colors: string[] }) => {
    const maxValue = Math.max(...data)
    
    return (
      <div className="w-full h-32 flex items-end justify-between space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div 
              className={`w-full bg-gradient-to-t ${colors[index]} rounded-t transition-all duration-500 hover:opacity-80 relative group-hover:shadow-lg`}
              style={{ height: `${(value / maxValue) * 100}%`, minHeight: '4px' }}
              title={`${labels[index]}: ${value}${labels[index].includes('%') ? '' : labels[index].includes('Days') ? ' days' : '%'}`}
            >
              {/* Value display on hover */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {value}{labels[index].includes('%') ? '' : labels[index].includes('Days') ? ' days' : '%'}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {labels[index]}
            </div>
            {/* Value display below bar */}
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">
              {value}{labels[index].includes('%') ? '' : labels[index].includes('Days') ? 'd' : '%'}
            </div>
          </div>
        ))}
      </div>
    )
  }
  const [mobileSelectedCategory, setMobileSelectedCategory] = useState('all')
  const [picNavigateTo, setPICNavigateTo] = useState<string | undefined>()
  
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

  // Simulate loading states and data fetching
  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Load actual data
      const completedScreenings = ScreeningDataService.getCompletedScreenings()
      const savedScreenings = ScreeningDataService.getSavedScreenings()
      
      setDashboardStats({
        completedScreenings: completedScreenings.length,
        savedScreenings: savedScreenings.length,
        recentCompletedScreenings: completedScreenings.slice(-3),
        recentSavedScreenings: savedScreenings.slice(-3)
      })
      
      setDashboardLoading(false)
    }
    
    loadDashboardData()
  }, [])

  // Function to refresh metrics with loading state
  const refreshMetrics = async () => {
    setMetricsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Reload data
    const completedScreenings = ScreeningDataService.getCompletedScreenings()
    const savedScreenings = ScreeningDataService.getSavedScreenings()
    
    setDashboardStats({
      completedScreenings: completedScreenings.length,
      savedScreenings: savedScreenings.length,
      recentCompletedScreenings: completedScreenings.slice(-3),
      recentSavedScreenings: savedScreenings.slice(-3)
    })
    
    setMetricsLoading(false)
  }

  // Export functionality
  const exportDashboardData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange: selectedTimeRange,
      metrics: {
        completedScreenings: dashboardStats.completedScreenings,
        savedScreenings: dashboardStats.savedScreenings,
        eligibilityRequests: 24,
        pendingActions: dashboardStats.savedScreenings + 3
      },
      performance: {
        cleanClaimRate: '92%',
        denialRate: '8%',
        avgDaysToPayment: 23,
        successRate: '95%'
      },
      charts: {
        revenue: chartData.revenue,
        claims: chartData.claims,
        denials: chartData.denials
      }
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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

    // Initialize the date management service
    const initializeServices = async () => {
      try {
        console.log('Starting service initialization...')
        await ScreeningDataService.initialize()
        console.log('ScreeningDataService initialized successfully')
        
        console.log('Initializing ScreeningDateService...')
        ScreeningDateService.initialize()
        console.log('ScreeningDateService initialization completed')
        
        loadDashboardData()
      } catch (error) {
        console.error('Error initializing services:', error)
        loadDashboardData() // Still load data even if services fail
      }
    }

    initializeServices()
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

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigateToReports = () => {
      setActiveDesktopTab('reports')
      setActiveMobileTab('reports')
      updateBreadcrumbPath('reports')
    }

    const handleNavigateToAnalytics = () => {
      setActiveDesktopTab('analytics')
      setActiveMobileTab('analytics')
      updateBreadcrumbPath('analytics')
    }

    window.addEventListener('navigateToReports', handleNavigateToReports)
    window.addEventListener('navigateToAnalytics', handleNavigateToAnalytics)
    
    return () => {
      window.removeEventListener('navigateToReports', handleNavigateToReports)
      window.removeEventListener('navigateToAnalytics', handleNavigateToAnalytics)
    }
  }, [])

  // Clear navigation state after it's been used
  useEffect(() => {
    if (picNavigateTo) {
      // Clear the navigation state after a short delay to allow the component to process it
      const timer = setTimeout(() => {
        setPICNavigateTo(undefined)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [picNavigateTo])

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
      'profile': 'Profile',
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
      // Reset HEDIS component to landing page
      setHEDISResetCounter(prev => prev + 1)
      // The HEDIS component will update the breadcrumb to show just Dashboard > H.E.D.I.S.
    } else if (index === 1 && breadcrumbPath[1] === 'P.I.C.') {
      // Clicking on P.I.C. should take us back to PIC landing page
      setActiveDesktopTab('pic')
      setBreadcrumbPath(['Dashboard', 'P.I.C.'])
      // Reset PIC component to landing page
      setPICResetCounter(prev => prev + 1)
    }
    // For future sub-pages, we can add more logic here
  }

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'hedis':
        setActiveDesktopTab('hedis')
        setActiveMobileTab('hedis')
        break
      case 'pic':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        break
      case 'eligibility':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('patient-eligibility')
        // Also handle mobile navigation
        setMobilePICView('patient-eligibility')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'claims-submission':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('claims-submission')
        // Also handle mobile navigation
        setMobilePICView('claims-submission')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'completed-screenings':
        setActiveDesktopTab('hedis')
        setActiveMobileTab('hedis')
        // TODO: Navigate to completed screenings view
        break
      case 'debug-date-reset':
        ScreeningDateService.forceDateReset()
        ScreeningDateService.debugCurrentState()
        console.log('Date reset debug completed - check console for details')
        break
      case 'debug-saved-screenings':
        // Debug saved screenings state
        const savedScreenings = ScreeningDataService.getSavedScreenings()
        console.log('=== Current Saved Screenings ===')
        savedScreenings.forEach(screening => {
          const savedDate = new Date(screening.dateSaved)
          const now = new Date()
          const daysSinceSaved = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24))
          const daysUntilExpiration = 30 - daysSinceSaved
          const status = daysUntilExpiration < 5 ? 'URGENT' : daysUntilExpiration < 10 ? 'WARNING' : 'SAFE'
          console.log(`${screening.patientName}: ${daysUntilExpiration} days until expiration (${status})`)
        })
        console.log('=== End Debug ===')
        break
      case 'force-date-reset':
        console.log('=== FORCING DATE RESET ===')
        ScreeningDateService.forceDateReset()
        ScreeningDateService.debugCurrentState()
        console.log('=== DATE RESET COMPLETED ===')
        // Reload the page to see the changes
        window.location.reload()
        break
      default:
        console.log('Quick action clicked:', action)
    }
  }

  // M.I.L.A. navigation handler
  const handleMILANavigation = (destination: string) => {
    console.log('Dashboard: handleMILANavigation called with destination:', destination)
    switch (destination) {
      case 'hedis-screening':
        setActiveDesktopTab('hedis')
        setActiveMobileTab('hedis')
        // TODO: Navigate to new screening form
        break
      case 'hedis-dashboard':
        setActiveDesktopTab('hedis')
        setActiveMobileTab('hedis')
        break
      case 'pic-actions':
        console.log('Dashboard: Navigating to PIC Actions')
        console.log('Dashboard: Current activeDesktopTab:', activeDesktopTab)
        console.log('Dashboard: Current activeMobileTab:', activeMobileTab)
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo(undefined) // Reset to landing
        console.log('Dashboard: Set tabs to pic, reset PICNavigateTo to undefined')
        break
      case 'patient-eligibility':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('patient-eligibility')
        // Also handle mobile navigation
        setMobilePICView('patient-eligibility')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'claims-submission':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('claims-submission')
        // Also handle mobile navigation
        setMobilePICView('claims-submission')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'frames-and-lenses':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('frames-and-lenses')
        // Also handle mobile navigation
        setMobilePICView('frames-and-lenses')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'health-plan-details':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('health-plan-details')
        // Also handle mobile navigation
        setMobilePICView('health-plan-details')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'manual-eligibility-request':
        setActiveDesktopTab('pic')
        setActiveMobileTab('pic')
        setPICNavigateTo('manual-eligibility-request')
        // Also handle mobile navigation
        setMobilePICView('manual-eligibility-request')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      default:
        console.log('M.I.L.A. navigation requested:', destination)
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
              navigateTo={picNavigateTo}
            />
          </div>
        )
      case 'reports':
        return (
          <div className="dashboard-content">
            <ReportsPage isOpen={true} />
          </div>
        )
      case 'analytics':
        return (
          <div className="dashboard-content">
            <AnalyticsPage isOpen={true} />
          </div>
        )
      case 'users':
        return (
          <div className="dashboard-content">
            <UsersPage isOpen={true} />
          </div>
        )
      case 'audit':
        return (
          <div className="dashboard-content">
            <AuditLogPage />
          </div>
        )
      case 'profile':
        return (
          <div className="dashboard-content">
            <ProfilePage />
          </div>
        )
      case 'roles':
        return (
          <div className="dashboard-content">
            <RolesPage />
          </div>
        )
      case 'settings':
        return (
          <div className="dashboard-content">
            <SettingsPage isOpen={true} />
          </div>
        )

      default:
        return (
          <div className="dashboard-main-content animate-fadeIn">
            <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Modern Welcome Section with Time-based Greeting */}
              <div className="dashboard-welcome-section mb-8">
                <div className="dashboard-welcome-header flex items-center justify-between">
                  <div className="dashboard-welcome-text">
                    <h1 className="dashboard-welcome-title text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName || 'User'}!
                    </h1>
                    <p className="dashboard-welcome-subtitle text-lg text-gray-600 dark:text-gray-400">
                      Here's your medical billing overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="dashboard-welcome-actions flex items-center space-x-4">
                    <button
                      onClick={refreshMetrics}
                      disabled={metricsLoading}
                      className="dashboard-refresh-btn flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                      <Icon name={metricsLoading ? "refresh-cw" : "refresh-ccw"} size={16} className={metricsLoading ? "animate-spin" : ""} />
                      <span className="text-sm font-medium">{metricsLoading ? 'Updating...' : 'Refresh'}</span>
                    </button>
                    <div className="dashboard-last-updated text-right">
                      <div className="dashboard-last-updated-label text-sm text-gray-500 dark:text-gray-400">Last updated</div>
                      <div className="dashboard-last-updated-time text-sm font-medium text-gray-700 dark:text-gray-300">{new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced KPI Cards with Animations */}
              <div className="dashboard-kpi-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardLoading ? (
                  <>
                    <SkeletonCard height="h-24" />
                    <SkeletonCard height="h-24" />
                    <SkeletonCard height="h-24" />
                    <SkeletonCard height="h-24" />
                  </>
                ) : (
                  <>
                    {/* Completed Screenings Card */}
                    <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg hover:scale-105 transition-all duration-300 desktop-completed-screenings-card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-700 transition-colors">
                          <Icon name="check-circle" size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-100 dark:bg-green-800 rounded-full">
                          +12% this week
                  </div>
                  </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats.completedScreenings}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed Screenings</p>
                        <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5 mr-2">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span>85% goal</span>
                        </div>
                </div>
              </div>

                {/* Saved Screenings Card */}
                <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:scale-105 transition-all duration-300 desktop-saved-screenings-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                      <Icon name="save" size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded-full">
                      {dashboardStats.savedScreenings > 0 ? 'Action needed' : 'Up to date'}
                  </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats.savedScreenings}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Saved Screenings</p>
                    <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <Icon name="clock" size={12} className="mr-1" />
                      <span>Pending completion</span>
                  </div>
                </div>
              </div>

                {/* Revenue Cycle Card */}
                <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:scale-105 transition-all duration-300 desktop-eligibility-requests-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-700 transition-colors">
                      <Icon name="user-check" size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded-full">
                      94% success
                  </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Eligibility Requests</p>
                    <div className="mt-3 flex items-center text-xs text-purple-600 dark:text-purple-400">
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5 mr-2">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '94%'}}></div>
                      </div>
                      <span>94%</span>
                    </div>
                </div>
              </div>

                {/* Claims Performance Card */}
                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 hover:shadow-lg hover:scale-105 transition-all duration-300 desktop-pending-actions-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-700 transition-colors">
                      <Icon name="clock" size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium px-2 py-1 bg-red-100 dark:bg-red-800 rounded-full">
                      {dashboardStats.savedScreenings + 3 > 5 ? 'High priority' : 'Normal'}
                  </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats.savedScreenings + 3}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Actions</p>
                    <div className="mt-3 flex items-center text-xs text-amber-600 dark:text-amber-400">
                      <Icon name="trending-up" size={12} className="mr-1" />
                      <span>Avg. 2.3 days to complete</span>
                </div>
              </div>
                </div>
                  </>
                )}
            </div>

              {/* Performance Analytics Section */}
              <div className="dashboard-analytics-section grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {dashboardLoading ? (
                  <>
                    <SkeletonCard className="lg:col-span-2" height="h-64" />
                    <SkeletonCard height="h-64" />
                  </>
                ) : (
                  <>
                {/* Revenue Cycle Chart */}
                <div className="dashboard-revenue-chart-card lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="dashboard-chart-header flex items-center justify-between mb-6">
                    <h3 className="dashboard-chart-title text-lg font-semibold text-gray-900 dark:text-white">Revenue Cycle Performance</h3>
                    <div className="dashboard-time-selector flex space-x-2">
                      {['7D', '30D', '90D'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          className={`dashboard-time-btn px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            selectedTimeRange === range
                              ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="dashboard-charts-container space-y-6">
                    {/* Interactive Revenue Trend Chart */}
                    <div className="dashboard-revenue-trend-chart p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <LineChart data={chartData.revenue} title={`Revenue Trend (${selectedTimeRange})`} color="blue" />
                    </div>
                    
                    {/* Performance Metrics Bar Chart */}
                    <div className="dashboard-performance-chart p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="dashboard-performance-chart-title text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Performance Overview</h4>
                      <BarChart data={performanceData} labels={performanceLabels} colors={performanceColors} />
                    </div>
                    
                    {/* Claims Processing Chart */}
                    <div className="dashboard-claims-chart p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <LineChart data={chartData.claims} title={`Claims Success Rate (${selectedTimeRange})`} color="green" />
                    </div>
                  </div>
                </div>

                {/* M.I.L.A. AI Assistant Card - Enhanced */}
                <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 desktop-mila-ai-assistant-card relative overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-white/20 rounded-lg mr-3">
                        <Icon name="bot" size={24} className="text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">M.I.L.A. AI Assistant</h3>
                    </div>
                    <p className="text-sm text-blue-100 mb-6">
                      Your Medical Intelligence & Learning Assistant is ready to help with medical billing, codes, and form guidance.
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-xs text-blue-100">
                        <Icon name="zap" size={12} className="mr-2" />
                        <span>Instant medical code lookup</span>
                      </div>
                      <div className="flex items-center text-xs text-blue-100">
                        <Icon name="check-circle" size={12} className="mr-2" />
                        <span>Real-time form validation</span>
                      </div>
                      <div className="flex items-center text-xs text-blue-100">
                        <Icon name="brain" size={12} className="mr-2" />
                        <span>Smart suggestions & insights</span>
                      </div>
                    </div>
                      <HelperButton 
                        currentForm="Dashboard"
                        currentField="general"
                        currentStep={1}
                        onNavigate={handleMILANavigation}
                      />
                  </div>
                  
                  {/* MILA AI Assistant Image - Full width at bottom */}
                  <div className="mila-assistant-image-container absolute bottom-0 left-0 right-0">
                    <img 
                      src="/images/mila-assistant-card.png" 
                      alt="MILA AI Assistant" 
                      className="mila-assistant-image w-full h-auto rounded-b-xl opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Primary Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* HEDIS Forms Card */}
                <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 desktop-hedis-forms-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <Icon name="eye" size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HEDIS Screenings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Diabetic retinal screening forms</p>
                      </div>
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                      {dashboardStats.completedScreenings > 99 ? '99+' : dashboardStats.completedScreenings}
                    </div>
                  </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('hedis')}
                      className="w-full flex items-center justify-between p-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group/button"
                    >
                      <div className="flex items-center">
                        <Icon name="plus" size={16} className="text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Start New Screening</span>
                      </div>
                      <Icon name="arrow-right" size={14} className="text-blue-500 dark:text-blue-400 group-hover/button:translate-x-1 transition-transform" />
                  </button>
                  <button 
                      onClick={() => handleQuickAction('completed-screenings')}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group/button"
                    >
                      <div className="flex items-center">
                        <Icon name="file-text" size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Completed Forms</span>
                      </div>
                      <Icon name="arrow-right" size={14} className="text-gray-500 dark:text-gray-400 group-hover/button:translate-x-1 transition-transform" />
                  </button>
                  </div>
                </div>

                {/* PIC Actions Card */}
                <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 desktop-pic-actions-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                        <Icon name="upload" size={24} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">P.I.C. Actions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Claims & eligibility management</p>
                      </div>
                    </div>
                    <div className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full font-medium">
                      95%
                    </div>
                  </div>
                  <div className="space-y-3">
                  <button 
                      onClick={() => handleQuickAction('eligibility')}
                      className="w-full flex items-center justify-between p-3 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors group/button"
                    >
                      <div className="flex items-center">
                        <Icon name="user-check" size={16} className="text-purple-600 dark:text-purple-400 mr-3" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Patient Eligibility</span>
                      </div>
                      <Icon name="arrow-right" size={14} className="text-purple-500 dark:text-purple-400 group-hover/button:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleQuickAction('pic')}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group/button"
                    >
                      <div className="flex items-center">
                        <Icon name="upload" size={16} className="text-gray-600 dark:text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submit Claims</span>
                      </div>
                      <Icon name="arrow-right" size={14} className="text-gray-500 dark:text-gray-400 group-hover/button:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

                {/* Recent Activity & Alerts Card */}
                <div className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 desktop-recent-activity-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                        <Icon name="activity" size={24} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates & alerts</p>
                      </div>
                    </div>
                    <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                      Live
                    </div>
                  </div>
                  <div className="space-y-4">
                  {dashboardStats.recentCompletedScreenings.length > 0 ? (
                      dashboardStats.recentCompletedScreenings.map((screening) => (
                        <div key={screening.id} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{screening.patientName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Screening completed • Just now</p>
                          </div>
                          <Icon name="check-circle" size={16} className="text-green-500" />
                      </div>
                    ))
                  ) : (
                      <div className="text-center py-4">
                        <Icon name="inbox" size={32} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                    </div>
                  )}
                  {dashboardStats.recentSavedScreenings.length > 0 && (
                      <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {dashboardStats.recentSavedScreenings.length} saved screening{dashboardStats.recentSavedScreenings.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pending completion • Action needed</p>
                        </div>
                        <Icon name="clock" size={16} className="text-yellow-500" />
                    </div>
                  )}
                    <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Eligibility request submitted</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Processing • 2 min ago</p>
                      </div>
                      <Icon name="user-check" size={16} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Insights Section */}
              <div className="dashboard-insights-section bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="dashboard-insights-header flex items-center justify-between mb-6">
                  <h3 className="dashboard-insights-title text-lg font-semibold text-gray-900 dark:text-white">Today's Insights</h3>
                  <div className="dashboard-insights-actions flex items-center space-x-3">
                  <button 
                      onClick={exportDashboardData}
                      className="dashboard-export-btn flex items-center space-x-2 px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                      <Icon name="download" size={14} />
                      <span>Export</span>
                  </button>
                    <button className="dashboard-view-reports-btn text-sm text-blue-600 dark:text-blue-400 hover:underline">View all reports</button>
                </div>
              </div>
                <div className="dashboard-insights-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top Performing Actions */}
                  <div className="dashboard-top-action-card text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="dashboard-insight-icon inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg mb-3">
                      <Icon name="trending-up" size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
                    <h4 className="dashboard-insight-title text-sm font-semibold text-gray-900 dark:text-white mb-1">Top Action</h4>
                    <p className="dashboard-insight-subtitle text-xs text-gray-600 dark:text-gray-400 mb-2">Patient Eligibility</p>
                    <p className="dashboard-insight-value text-lg font-bold text-purple-600 dark:text-purple-400">95%</p>
                    <p className="dashboard-insight-label text-xs text-gray-500 dark:text-gray-500">success rate</p>
                  </div>

                  {/* Processing Time */}
                  <div className="dashboard-processing-time-card text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="dashboard-insight-icon inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg mb-3">
                      <Icon name="clock" size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="dashboard-insight-title text-sm font-semibold text-gray-900 dark:text-white mb-1">Avg. Processing</h4>
                    <p className="dashboard-insight-subtitle text-xs text-gray-600 dark:text-gray-400 mb-2">Time to complete</p>
                    <p className="dashboard-insight-value text-lg font-bold text-green-600 dark:text-green-400">2.3</p>
                    <p className="dashboard-insight-label text-xs text-gray-500 dark:text-gray-500">days</p>
                  </div>

                  {/* Revenue Impact */}
                  <div className="dashboard-revenue-impact-card text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="dashboard-insight-icon inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg mb-3">
                      <Icon name="dollar-sign" size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="dashboard-insight-title text-sm font-semibold text-gray-900 dark:text-white mb-1">Revenue Impact</h4>
                    <p className="dashboard-insight-subtitle text-xs text-gray-600 dark:text-gray-400 mb-2">This week</p>
                    <p className="dashboard-insight-value text-lg font-bold text-blue-600 dark:text-blue-400">+12%</p>
                    <p className="dashboard-insight-label text-xs text-gray-500 dark:text-gray-500">vs. last week</p>
                  </div>
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
          <div className="mobile-dashboard-content animate-slideInUp">
            <div className="p-4">
              {/* Modern Welcome Section */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 mobile-welcome-section">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName || 'User'}! 👋
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Here's your medical billing overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <button
                    onClick={refreshMetrics}
                    disabled={metricsLoading}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 text-xs"
                  >
                    <Icon name={metricsLoading ? "refresh-cw" : "refresh-ccw"} size={12} className={metricsLoading ? "animate-spin" : ""} />
                    <span>{metricsLoading ? 'Updating...' : 'Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards with Loading */}
              <div className="grid grid-cols-2 gap-3 mb-6 mobile-stats-cards-container">
                {dashboardLoading ? (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Completed Screenings Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-300 mobile-completed-screenings-card">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mr-3">
                          <Icon name="check-circle" size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Completed</p>
                          <div className="flex items-baseline">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{dashboardStats.completedScreenings}</p>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-1">+12%</span>
                          </div>
                    </div>
                  </div>
                </div>

                    {/* Saved Screenings Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300 mobile-saved-screenings-card">
                  <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3">
                          <Icon name="save" size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Saved</p>
                          <div className="flex items-baseline">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{dashboardStats.savedScreenings}</p>
                            <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">Action</span>
                          </div>
                    </div>
                  </div>
                </div>

                    {/* Eligibility Requests Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-300 mobile-eligibility-requests-card">
                  <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3">
                          <Icon name="user-check" size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                        <div className="flex-1">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Eligibility</p>
                          <div className="flex items-baseline">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">24</p>
                            <span className="text-xs text-purple-600 dark:text-purple-400 ml-1">94%</span>
                          </div>
                    </div>
                  </div>
                </div>

                    {/* Pending Actions Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-all duration-300 mobile-pending-actions-card">
                  <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center mr-3">
                          <Icon name="clock" size={18} className="text-amber-600 dark:text-amber-400" />
                    </div>
                        <div className="flex-1">
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Pending</p>
                          <div className="flex items-baseline">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{dashboardStats.savedScreenings + 3}</p>
                            <span className="text-xs text-red-600 dark:text-red-400 ml-1">{dashboardStats.savedScreenings + 3 > 5 ? 'High' : 'Normal'}</span>
                    </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Performance Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 mobile-performance-overview-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                  <div className="flex space-x-1">
                    {['7D', '30D'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          selectedTimeRange === range
                            ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mobile Mini Chart */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mb-4">
                  <LineChart data={chartData.revenue.slice(-7)} title={`Revenue Trend (${selectedTimeRange})`} color="blue" />
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{performanceData[0]}%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Clean Claims</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{performanceData[2]}%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Denial Rate</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 mobile-quick-actions-section">
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

              {/* M.I.L.A. AI Assistant - First in second grouping */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white mb-6 mobile-mila-ai-assistant-card">
                <h3 className="text-lg font-semibold mb-2">M.I.L.A. AI Assistant</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Your Medical Intelligence & Learning Assistant is here to help with medical billing questions, codes, and form guidance.
                </p>
                <HelperButton 
                  currentForm="Dashboard"
                  currentField="mobile"
                  currentStep={1}
                  onNavigate={handleMILANavigation}
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 mobile-recent-activity-section">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {dashboardStats.recentCompletedScreenings.length > 0 ? (
                    dashboardStats.recentCompletedScreenings.map((screening) => (
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 mobile-popular-pic-actions-section">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular PIC Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleQuickAction('eligibility')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility (95% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('claims-submission')}
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
      case 'profile':
        return <MobileProfile />
      case 'hedis':
        return (
          <div className="mobile-main-content pb-0">
            {mobileHEDISView === 'landing' ? (
              <div>
                <HEDISLandingPage onUpdateBreadcrumb={setBreadcrumbPath} />
                <HelperButton currentForm="HEDIS" currentField="mobile" currentStep={1} onNavigate={handleMILANavigation} />
              </div>
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
                <HelperButton currentForm="PatientEligibility" currentField="mobile" currentStep={1} onNavigate={handleMILANavigation} />
              </div>
            ) : mobileHEDISView === 'screening-form' ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setMobileHEDISView('patient-search')}
                    className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Icon name="arrow-left" size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Screening</h2>
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
                  onClose={() => setMobileHEDISView('patient-search')}
                  onSave={(data) => console.log('Screening saved:', data)}
                  onComplete={(data) => {
                    console.log('Screening completed:', data)
                    setMobileHEDISView('landing')
                  }}
                />
                <HelperButton currentForm="ClaimsSubmission" currentField="mobile" currentStep={1} onNavigate={handleMILANavigation} />
              </div>
            ) : null}
          </div>
        )
      case 'pic':
        return (
          <PICLandingPage 
            onUpdateBreadcrumb={setBreadcrumbPath}
            resetToLanding={picResetCounter}
            navigateTo={picNavigateTo}
          />
        )
      case 'reports':
        return (
          <div className="mobile-reports-content">
            <ReportsPage isOpen={true} />
          </div>
        )
      case 'analytics':
        return (
          <div className="mobile-analytics-content">
            <AnalyticsPage isOpen={true} />
          </div>
        )
      case 'users':
        return (
          <div className="mobile-users-content">
            <UsersPage isOpen={true} />
          </div>
        )
      case 'roles':
        return (
          <div className="mobile-main-content">
            <RolesPage />
          </div>
        )
      case 'audit':
        return (
          <div className="mobile-main-content">
            <AuditLogPage />
          </div>
        )
      case 'settings':
        return (
          <div className="mobile-main-content">
            <SettingsPage isOpen={true} />
          </div>
        )
      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back, {user?.fullName || 'User'}!</h1>
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
                      onNavigate={handleMILANavigation}
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
                    dashboardStats.recentCompletedScreenings.map((screening) => (
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
                    onClick={() => handleQuickAction('eligibility')}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    <Icon name="user-check" size={16} className="inline mr-2" />
                    Request Patient Eligibility (95% usage)
                  </button>
                  <button 
                    onClick={() => handleQuickAction('claims-submission')}
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
                                handleDesktopTabChange('profile')
                                setShowUserDropdown(false)
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
          onNavigate={handleMobileTabChange}
        />
      </div>

      {/* Footer */}
      <Footer />
    </>
  )
} 
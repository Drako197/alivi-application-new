import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Icon from './Icon'
import PatientEligibilityForm from './PatientEligibilityForm'
import ClaimsSubmissionForm from './ClaimsSubmissionForm'
import PrescriptionForm from './PrescriptionForm'
import HealthPlanDetailsPage from './HealthPlanDetailsPage'
import FramesAndLensesPage from './FramesAndLensesPage'
import ManualEligibilityRequestForm from './ManualEligibilityRequestForm'
import HelperButton from './HelperButton'

interface ActionItem {
  id: string
  name: string
  description: string
  category: string
  frequency: number
  icon: string
}

interface PICLandingPageProps {
  onUpdateBreadcrumb?: (path: string[]) => void
  resetToLanding?: number
  navigateTo?: string
}

export default function PICLandingPage({ onUpdateBreadcrumb, resetToLanding = 0, navigateTo }: PICLandingPageProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentView, setCurrentView] = useState<'landing' | 'patient-eligibility' | 'claims-submission' | 'prescription' | 'health-plan-details' | 'frames-and-lenses' | 'manual-eligibility-request'>('landing')

  // Modern dashboard state
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30D')

  // Reset to landing page when resetToLanding prop changes
  useEffect(() => {
    if (resetToLanding > 0) {
      setCurrentView('landing')
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.'])
      }
    }
  }, [resetToLanding, onUpdateBreadcrumb])

  // Handle external navigation
  useEffect(() => {
    if (navigateTo) {
      setCurrentView(navigateTo as any)
      // Update breadcrumb based on navigation
      if (onUpdateBreadcrumb) {
        const breadcrumbMap: { [key: string]: string[] } = {
          'patient-eligibility': ['Dashboard', 'P.I.C.', 'Request Patient Eligibility'],
          'claims-submission': ['Dashboard', 'P.I.C.', 'Claims Submission'],
          'prescription': ['Dashboard', 'P.I.C.', 'Prescription Entry'],
          'health-plan-details': ['Dashboard', 'P.I.C.', 'Health Plan Details'],
          'frames-and-lenses': ['Dashboard', 'P.I.C.', 'Frames and Lenses'],
          'manual-eligibility-request': ['Dashboard', 'P.I.C.', 'Manual Eligibility Request']
        }
        const breadcrumb = breadcrumbMap[navigateTo]
        if (breadcrumb) {
          onUpdateBreadcrumb(breadcrumb)
        }
      }
    }
  }, [navigateTo, onUpdateBreadcrumb])

  // PIC-specific chart data based on time range
  const getPICChartData = (timeRange: string) => {
    switch (timeRange) {
      case '7D':
        return {
          claims: [42, 38, 45, 52, 48, 55, 61],
          eligibility: [35, 42, 38, 45, 52, 48, 55],
          success: [92, 89, 94, 91, 93, 90, 95]
        }
      case '30D':
        return {
          claims: [35, 42, 38, 45, 52, 48, 55, 61, 58, 65, 72, 68],
          eligibility: [28, 35, 32, 38, 45, 41, 48, 52, 49, 56, 63, 59],
          success: [89, 91, 88, 92, 90, 94, 87, 91, 89, 93, 90, 88]
        }
      case '90D':
        return {
          claims: [28, 35, 42, 38, 45, 52, 48, 55, 61, 58, 65, 72],
          eligibility: [22, 28, 35, 31, 38, 44, 40, 47, 53, 49, 56, 62],
          success: [85, 88, 91, 87, 90, 93, 89, 92, 88, 91, 87, 90]
        }
      default:
        return {
          claims: [35, 42, 38, 45, 52, 48, 55, 61, 58, 65, 72, 68],
          eligibility: [28, 35, 32, 38, 45, 41, 48, 52, 49, 56, 63, 59],
          success: [89, 91, 88, 92, 90, 94, 87, 91, 89, 93, 90, 88]
        }
    }
  }

  const picChartData = getPICChartData(selectedTimeRange)

  // PIC Dashboard stats
  const picStats = {
    claimsProcessed: 1247,
    eligibilityRequests: 892,
    successRate: 94.2,
    avgProcessingTime: 2.8,
    pendingClaims: 23,
    rejectedClaims: 15
  }

  // Chart Components for PIC Analytics
  const PICLineChart = ({ data, title, color = "blue" }: { data: number[], title: string, color?: string }) => {
    // Simplify data to max 12 points for clean visualization
    const simplifyData = (rawData: number[]) => {
      if (rawData.length <= 12) return rawData
      
      const step = Math.floor(rawData.length / 12)
      const simplified = []
      for (let i = 0; i < rawData.length; i += step) {
        const bucket = rawData.slice(i, i + step)
        const avg = Math.round(bucket.reduce((sum, val) => sum + val, 0) / bucket.length)
        simplified.push(avg)
      }
      return simplified.slice(0, 12)
    }
    
    const generateTimeRangeData = () => {
      if (selectedTimeRange === '7D') {
        return data.length === 7 ? data : [42, 38, 45, 52, 48, 55, 61]
      } else if (selectedTimeRange === '30D') {
        return data.length >= 12 ? data : [35, 42, 38, 45, 52, 48, 55, 61, 58, 65, 72, 68]
      } else {
        return data.length >= 12 ? data : [28, 35, 42, 38, 45, 52, 48, 55, 61, 58, 65, 72]
      }
    }
    
    const rawData = data && data.length > 0 ? generateTimeRangeData() : generateTimeRangeData()
    const chartData = rawData
    
    // Calculate scaling
    const maxValue = Math.max(...chartData)
    const minValue = Math.min(...chartData)
    const range = maxValue - minValue
    const chartHeight = 160
    
    // Generate smooth curve path using bezier curves
    const generateSmoothPath = (points: {x: number, y: number}[]) => {
      if (points.length < 2) return ''
      
      let path = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const next = points[i + 1]
        
        if (i === 1) {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else if (i === points.length - 1) {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y
          const cp2x = curr.x - (curr.x - prev.x) * 0.3
          const cp2y = curr.y
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        } else {
          const cp1x = prev.x + (curr.x - prev.x) * 0.3
          const cp1y = prev.y + (curr.y - prev.y) * 0.3
          const cp2x = curr.x - (next.x - prev.x) * 0.1
          const cp2y = curr.y - (next.y - prev.y) * 0.1
          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        }
      }
      
      return path
    }
    
    const points = chartData.map((value, index) => ({
      x: (index / (chartData.length - 1)) * 300,
      y: range > 0 ? ((maxValue - value) / range) * 100 + 20 : 80
    }))
    
    const smoothPath = generateSmoothPath(points)
    const areaPath = smoothPath + ` L 300 140 L 0 140 Z`
    
    const colorMap = {
      blue: { stroke: '#3B82F6', gradient: ['#3B82F6', '#3B82F6'] },
      green: { stroke: '#10B981', gradient: ['#10B981', '#10B981'] },
      purple: { stroke: '#8B5CF6', gradient: ['#8B5CF6', '#8B5CF6'] }
    }
    const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue
    
    return (
      <div className="pic-chart-container">
        <h4 className="pic-chart-title text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</h4>
        <div className="pic-chart-content relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4" style={{ height: `${chartHeight}px` }}>
          
          <svg className="absolute inset-4 w-full h-full" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id={`picChartGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.02"/>
              </linearGradient>
              <filter id="picGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {[20, 50, 80, 110].map((y) => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
            ))}
            
            <path d={areaPath} fill={`url(#picChartGradient-${color})`} />
            
            <path 
              d={smoothPath} 
              fill="none" 
              stroke={colors.stroke} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              filter="url(#picGlow)"
            />
            
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="white"
                  stroke={colors.stroke}
                  strokeWidth="2"
                  className="hover:r-5 transition-all duration-200 cursor-pointer drop-shadow-sm"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer hover:fill-blue-50 hover:fill-opacity-20"
                />
                <g className="tooltip" style={{ opacity: 0, transition: 'opacity 0.2s' }}>
                  <rect
                    x={point.x - 15}
                    y={point.y - 25}
                    width="30"
                    height="16"
                    fill="#1F2937"
                    rx="4"
                  />
                  <text
                    x={point.x}
                    y={point.y - 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                  >
                    {chartData[index]}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
        
        <div className="pic-chart-labels flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-4">
          <span>{selectedTimeRange === '7D' ? 'Week Start' : selectedTimeRange === '30D' ? 'Month Start' : 'Quarter Start'}</span>
          <span>Mid Point</span>
          <span>{selectedTimeRange === '7D' ? 'Week End' : selectedTimeRange === '30D' ? 'Month End' : 'Quarter End'}</span>
        </div>
      </div>
    )
  }

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="pic-skeleton-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="pic-skeleton-header flex items-center justify-between mb-4">
        <div className="pic-skeleton-icon w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="pic-skeleton-trend w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="pic-skeleton-content space-y-3">
        <div className="pic-skeleton-value w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="pic-skeleton-label w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  )

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Dummy data for actions
  const allActions: ActionItem[] = [
    // Claims & Eligibility
    { id: 'request-patient-eligibility', name: 'Request Patient Eligibility', description: 'Check patient eligibility and benefits', category: 'eligibility', frequency: 95, icon: 'user-check' },
    { id: 'claims-submission', name: 'Claims Submission', description: 'Submit new claims for processing', category: 'claims', frequency: 92, icon: 'upload' },
    { id: 'prescription', name: 'Prescription Entry', description: 'Enter detailed prescription parameters', category: 'claims', frequency: 89, icon: 'eye' },
    { id: 'claim-status', name: 'Claim Status', description: 'View real-time claim processing status', category: 'claims', frequency: 88, icon: 'search' },
    { id: 'claim-summary', name: 'Claim Summary', description: 'View detailed claim summaries and reports', category: 'claims', frequency: 82, icon: 'file-text' },
    { id: 'job-status-online', name: 'Job Status Online Entry', description: 'Enter job status information online', category: 'claims', frequency: 55, icon: 'monitor' },
    { id: 'job-status-paper', name: 'Job Status Paper Claim', description: 'Submit job status via paper claim', category: 'claims', frequency: 45, icon: 'file-text' },
    
    // Health Plans & Payments
    { id: 'health-plan-details', name: 'Health Plan Details', description: 'View health plan information and coverage', category: 'plans', frequency: 85, icon: 'info' },
    { id: 'explanation-of-payments', name: 'Explanation of Payments', description: 'View detailed payment explanations', category: 'plans', frequency: 78, icon: 'dollar-sign' },
    { id: 'payment-summary-report', name: 'Payment Summary Report', description: 'Generate payment summary reports', category: 'plans', frequency: 72, icon: 'bar-chart-3' },
    { id: 'frames-and-lenses', name: 'Frames and Lenses', description: 'Access frame collections and lens pricing information', category: 'plans', frequency: 75, icon: 'eye' },
    
    // Authorization & Management
    { id: 'um-prior-authorization', name: 'UM Prior Authorization', description: 'Submit utilization management authorizations', category: 'authorization', frequency: 82, icon: 'shield-check' },
    { id: 'um-authorization-status', name: 'UM Authorization Status', description: 'Check authorization request status', category: 'authorization', frequency: 75, icon: 'clock' },
    
    // Resources & Tools
    { id: 'manual-eligibility-request', name: 'Manual Eligibility Request', description: 'Submit manual eligibility requests', category: 'resources', frequency: 68, icon: 'edit-3' },
    { id: 'provider-resources', name: 'Provider Resources', description: 'Access provider tools and resources', category: 'resources', frequency: 35, icon: 'graduation-cap' }
  ]

  const categories = [
    { id: 'all', name: 'All Actions', count: allActions.length },
    { id: 'eligibility', name: 'Eligibility', count: allActions.filter(a => a.category === 'eligibility').length },
    { id: 'claims', name: 'Claims', count: allActions.filter(a => a.category === 'claims').length },
    { id: 'plans', name: 'Health Plans & Payments', count: allActions.filter(a => a.category === 'plans').length },
    { id: 'authorization', name: 'Authorization', count: allActions.filter(a => a.category === 'authorization').length },
    { id: 'resources', name: 'Resources & Tools', count: allActions.filter(a => a.category === 'resources').length }
  ]

  const getIcon = (iconName: string): ReactElement => {
    return <Icon name={iconName} size={24} className="text-gray-600 dark:text-gray-300" />
  }

  const getFrequentIcon = (iconName: string): ReactElement => {
    return <Icon name={iconName} size={24} className="text-white" />
  }

  const handleActionClick = (action: ActionItem) => {
    console.log('Action clicked:', action.name)
    
    if (action.id === 'request-patient-eligibility') {
      setCurrentView('patient-eligibility')
      // Update breadcrumb to show P.I.C. > Request Patient Eligibility
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Request Patient Eligibility'])
      }
    } else if (action.id === 'claims-submission') {
      setCurrentView('claims-submission')
      // Update breadcrumb to show P.I.C. > Claims Submission
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Claims Submission'])
      }
    } else if (action.id === 'prescription') {
      setCurrentView('prescription')
      // Update breadcrumb to show P.I.C. > Prescription Entry
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Prescription Entry'])
      }
    } else if (action.id === 'health-plan-details') {
      setCurrentView('health-plan-details')
      // Update breadcrumb to show P.I.C. > Health Plan Details
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Health Plan Details'])
      }
    } else if (action.id === 'frames-and-lenses') {
      setCurrentView('frames-and-lenses')
      // Update breadcrumb to show P.I.C. > Frames and Lenses
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Frames and Lenses'])
      }
    } else if (action.id === 'manual-eligibility-request') {
      setCurrentView('manual-eligibility-request')
      // Update breadcrumb to show P.I.C. > Manual Eligibility Request
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.', 'Manual Eligibility Request'])
      }
    } else {
      // Here you would typically navigate to the specific action or open a modal
      console.log('Navigating to:', action.name)
    }
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
    // Reset breadcrumb to show just Dashboard > P.I.C.
    if (onUpdateBreadcrumb) {
      onUpdateBreadcrumb(['Dashboard', 'P.I.C.'])
    }
  }

  const filteredActions = allActions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const frequentActions = allActions
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3)

  // Show Patient Eligibility Form if currentView is 'patient-eligibility'
  if (currentView === 'patient-eligibility') {
    return <PatientEligibilityForm onBack={handleBackToLanding} />
  }

  // Show Claims Submission Form if currentView is 'claims-submission'
  if (currentView === 'claims-submission') {
    return <ClaimsSubmissionForm onBack={handleBackToLanding} />
  }

  // Show Prescription Form if currentView is 'prescription'
  if (currentView === 'prescription') {
    return <PrescriptionForm onBack={handleBackToLanding} />
  }

  // Show Health Plan Details Page if currentView is 'health-plan-details'
  if (currentView === 'health-plan-details') {
    return <HealthPlanDetailsPage onBack={handleBackToLanding} />
  }

  // Show Frames and Lenses Page if currentView is 'frames-and-lenses'
  if (currentView === 'frames-and-lenses') {
    return <FramesAndLensesPage onBack={handleBackToLanding} />
  }

  // Show Manual Eligibility Request Form if currentView is 'manual-eligibility-request'
  if (currentView === 'manual-eligibility-request') {
    return <ManualEligibilityRequestForm onBack={handleBackToLanding} />
  }

  return (
    <div className="pic-modern-dashboard min-h-screen bg-gray-50 dark:bg-gray-900 animate-fadeIn">
      
      {/* Modern Header */}
      <div className="pic-modern-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="pic-header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pic-header-main flex items-center justify-between py-4">
            <div className="pic-header-left">
              <h1 className="pic-main-title text-2xl font-bold text-gray-900 dark:text-white">
                P.I.C. Dashboard
              </h1>
              <p className="pic-main-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                Provider Interface Center • Welcome back, {user?.fullName || 'User'}!
              </p>
            </div>
            
            <div className="pic-header-right flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="pic-time-selector flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['7D', '30D', '90D'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`pic-time-btn px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedTimeRange === range
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="pic-header-actions flex items-center space-x-2">
                <button 
                  onClick={() => setMetricsLoading(true)}
                  className="pic-refresh-btn flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Icon name="refresh-cw" size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button className="pic-export-btn flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <Icon name="download" size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="pic-desktop-content hidden lg:block">
        <div className="pic-main-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* KPI Cards Row */}
          <div className="pic-kpi-section mb-8">
            <div className="pic-kpi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {dashboardLoading ? (
                Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
              ) : (
                <>
                  {/* Claims Processed Card */}
                  <div className="pic-claims-processed-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slideInUp">
                    <div className="pic-kpi-header flex items-center justify-between mb-4">
                      <div className="pic-kpi-icon w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Icon name="file-check" size={24} className="text-white" />
                      </div>
                      <div className="pic-kpi-trend flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Icon name="trending-up" size={16} />
                        <span className="text-sm font-medium">+12%</span>
                      </div>
                    </div>
                    <div className="pic-kpi-content">
                      <div className="pic-kpi-value text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {picStats.claimsProcessed.toLocaleString()}
                      </div>
                      <div className="pic-kpi-label text-sm text-gray-600 dark:text-gray-400">
                        Claims Processed
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Requests Card */}
                  <div className="pic-eligibility-requests-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slideInUp" style={{animationDelay: '0.1s'}}>
                    <div className="pic-kpi-header flex items-center justify-between mb-4">
                      <div className="pic-kpi-icon w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Icon name="user-check" size={24} className="text-white" />
                      </div>
                      <div className="pic-kpi-trend flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Icon name="trending-up" size={16} />
                        <span className="text-sm font-medium">+8%</span>
                      </div>
                    </div>
                    <div className="pic-kpi-content">
                      <div className="pic-kpi-value text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {picStats.eligibilityRequests.toLocaleString()}
                      </div>
                      <div className="pic-kpi-label text-sm text-gray-600 dark:text-gray-400">
                        Eligibility Requests
                      </div>
                    </div>
                  </div>

                  {/* Success Rate Card */}
                  <div className="pic-success-rate-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slideInUp" style={{animationDelay: '0.2s'}}>
                    <div className="pic-kpi-header flex items-center justify-between mb-4">
                      <div className="pic-kpi-icon w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon name="target" size={24} className="text-white" />
                      </div>
                      <div className="pic-kpi-trend flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Icon name="trending-up" size={16} />
                        <span className="text-sm font-medium">+2.1%</span>
                      </div>
                    </div>
                    <div className="pic-kpi-content">
                      <div className="pic-kpi-value text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {picStats.successRate}%
                      </div>
                      <div className="pic-kpi-label text-sm text-gray-600 dark:text-gray-400">
                        Success Rate
                      </div>
                    </div>
                  </div>

                  {/* Processing Time Card */}
                  <div className="pic-processing-time-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slideInUp" style={{animationDelay: '0.3s'}}>
                    <div className="pic-kpi-header flex items-center justify-between mb-4">
                      <div className="pic-kpi-icon w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <Icon name="clock" size={24} className="text-white" />
                      </div>
                      <div className="pic-kpi-trend flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Icon name="trending-down" size={16} />
                        <span className="text-sm font-medium">-15%</span>
                      </div>
                    </div>
                    <div className="pic-kpi-content">
                      <div className="pic-kpi-value text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {picStats.avgProcessingTime}d
                      </div>
                      <div className="pic-kpi-label text-sm text-gray-600 dark:text-gray-400">
                        Avg Processing Time
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Primary Actions Section */}
          <div className="pic-primary-actions-section mb-8 animate-slideInUp" style={{animationDelay: '0.4s'}}>
            <div className="pic-section-header flex items-center justify-between mb-6">
              <div>
                <h2 className="pic-section-title text-xl font-semibold text-gray-900 dark:text-white">
                  Primary Actions
                </h2>
                <p className="pic-section-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quick access to your most used forms and tools
                </p>
              </div>
            </div>
            
            <div className="pic-primary-actions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {frequentActions.map((action, index) => (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="pic-primary-action-card group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                >
                  <div className="pic-action-header flex items-center justify-between mb-4">
                    <div className="pic-action-icon-wrapper w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon name={action.icon} size={24} className="text-white" />
                    </div>
                    <div className="pic-action-badge">
                      <span className="pic-badge-popular bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                        <Icon name="star" size={12} />
                        <span>Popular</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="pic-action-content">
                    <h3 className="pic-action-title text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {action.name}
                    </h3>
                    <p className="pic-action-description text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {action.description}
                    </p>
                    <div className="pic-action-stats flex items-center justify-between">
                      <span className="pic-usage-stat text-xs text-gray-500 dark:text-gray-400">
                        {action.frequency}% usage rate
                      </span>
                      <Icon name="arrow-right" size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Charts Section */}
          <div className="pic-analytics-section mb-8 animate-slideInUp" style={{animationDelay: '0.5s'}}>
            <div className="pic-section-header mb-6">
              <h2 className="pic-section-title text-xl font-semibold text-gray-900 dark:text-white">
                Analytics Overview
              </h2>
              <p className="pic-section-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your PIC performance metrics and trends
              </p>
            </div>
            
            <div className="pic-charts-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Claims Volume Chart */}
              <div className="pic-chart-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <PICLineChart 
                  data={picChartData.claims} 
                  title="Claims Volume" 
                  color="blue" 
                />
              </div>
              
              {/* Eligibility Requests Chart */}
              <div className="pic-chart-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <PICLineChart 
                  data={picChartData.eligibility} 
                  title="Eligibility Requests" 
                  color="green" 
                />
              </div>
              
              {/* Success Rate Chart */}
              <div className="pic-chart-card bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <PICLineChart 
                  data={picChartData.success} 
                  title="Success Rate %" 
                  color="purple" 
                />
              </div>
            </div>
          </div>

          {/* All Actions Section */}
          <div className="pic-all-actions-section animate-slideInUp" style={{animationDelay: '0.6s'}}>
            <div className="pic-section-header flex items-center justify-between mb-6">
              <div>
                <h2 className="pic-section-title text-xl font-semibold text-gray-900 dark:text-white">
                  All Actions
                </h2>
                <p className="pic-section-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Complete list of available PIC forms and tools
                </p>
              </div>
              
              {/* Search and Filter */}
              <div className="pic-controls flex items-center space-x-4">
                <div className="pic-search-wrapper relative">
                  <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pic-search-input pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
                
                <div className="pic-category-filter">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pic-category-select px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {filteredActions.length === 0 ? (
              <div className="pic-empty-state text-center py-12">
                <Icon name="search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No actions found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or category filters</p>
              </div>
            ) : (
              <div className="pic-actions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className="pic-action-card group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                  >
                    <div className="pic-action-header flex items-center justify-between mb-3">
                      <div className="pic-action-icon w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors duration-300">
                        <Icon name={action.icon} size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </div>
                      {action.frequency >= 80 && (
                        <span className="pic-badge-popular bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <div className="pic-action-content">
                      <h3 className="pic-action-title text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {action.name}
                      </h3>
                      <p className="pic-action-description text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {action.description}
                      </p>
                      <div className="pic-action-meta flex items-center justify-between">
                        <span className="pic-usage-rate text-xs text-gray-500 dark:text-gray-400">
                          {action.frequency}% usage
                        </span>
                        <Icon name="arrow-right" size={14} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="pic-mobile-content lg:hidden">
        <div className="pic-mobile-container px-4 py-6">
          
          {/* Mobile KPI Cards */}
          <div className="pic-mobile-kpi-section mb-6">
            <div className="pic-mobile-kpi-grid grid grid-cols-2 gap-4">
              {dashboardLoading ? (
                Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
              ) : (
                <>
                  <div className="pic-mobile-kpi-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="pic-mobile-kpi-icon w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center mb-3">
                      <Icon name="file-check" size={16} className="text-white" />
                    </div>
                    <div className="pic-mobile-kpi-value text-xl font-bold text-gray-900 dark:text-white">
                      {picStats.claimsProcessed.toLocaleString()}
                    </div>
                    <div className="pic-mobile-kpi-label text-xs text-gray-600 dark:text-gray-400">
                      Claims Processed
                    </div>
                  </div>
                  
                  <div className="pic-mobile-kpi-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="pic-mobile-kpi-icon w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center mb-3">
                      <Icon name="user-check" size={16} className="text-white" />
                    </div>
                    <div className="pic-mobile-kpi-value text-xl font-bold text-gray-900 dark:text-white">
                      {picStats.eligibilityRequests.toLocaleString()}
                    </div>
                    <div className="pic-mobile-kpi-label text-xs text-gray-600 dark:text-gray-400">
                      Eligibility Requests
                    </div>
                  </div>
                  
                  <div className="pic-mobile-kpi-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="pic-mobile-kpi-icon w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center mb-3">
                      <Icon name="target" size={16} className="text-white" />
                    </div>
                    <div className="pic-mobile-kpi-value text-xl font-bold text-gray-900 dark:text-white">
                      {picStats.successRate}%
                    </div>
                    <div className="pic-mobile-kpi-label text-xs text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  
                  <div className="pic-mobile-kpi-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="pic-mobile-kpi-icon w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-md flex items-center justify-center mb-3">
                      <Icon name="clock" size={16} className="text-white" />
                    </div>
                    <div className="pic-mobile-kpi-value text-xl font-bold text-gray-900 dark:text-white">
                      {picStats.avgProcessingTime}d
                    </div>
                    <div className="pic-mobile-kpi-label text-xs text-gray-600 dark:text-gray-400">
                      Avg Processing Time
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Primary Actions */}
          <div className="pic-mobile-primary-actions mb-6">
            <h2 className="pic-mobile-section-title text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Primary Actions
            </h2>
            <div className="pic-mobile-actions-grid grid grid-cols-1 gap-3">
              {frequentActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="pic-mobile-action-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                >
                  <div className="pic-mobile-action-icon w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon name={action.icon} size={20} className="text-white" />
                  </div>
                  <div className="pic-mobile-action-content flex-1">
                    <h3 className="pic-mobile-action-title text-sm font-semibold text-gray-900 dark:text-white">
                      {action.name}
                    </h3>
                    <p className="pic-mobile-action-description text-xs text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <Icon name="arrow-right" size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile All Actions */}
          <div className="pic-mobile-all-actions">
            <div className="pic-mobile-section-header flex items-center justify-between mb-4">
              <h2 className="pic-mobile-section-title text-lg font-semibold text-gray-900 dark:text-white">
                All Actions
              </h2>
            </div>
            
            {/* Mobile Search */}
            <div className="pic-mobile-search mb-4">
              <div className="pic-mobile-search-wrapper relative">
                <Icon name="search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pic-mobile-search-input w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>
            
            {filteredActions.length === 0 ? (
              <div className="pic-mobile-empty-state text-center py-8">
                <Icon name="search" size={40} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No actions found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search</p>
              </div>
            ) : (
              <div className="pic-mobile-actions-grid grid grid-cols-1 gap-3">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className="pic-mobile-action-card bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                  >
                    <div className="pic-mobile-action-icon w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <Icon name={action.icon} size={16} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="pic-mobile-action-content flex-1">
                      <h3 className="pic-mobile-action-title text-sm font-medium text-gray-900 dark:text-white">
                        {action.name}
                      </h3>
                      <p className="pic-mobile-action-meta text-xs text-gray-500 dark:text-gray-400">
                        {action.frequency}% usage
                      </p>
                    </div>
                    <Icon name="arrow-right" size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* M.I.L.A. AI Assistant */}
      <HelperButton 
        currentForm="PIC"
        currentField="landing"
        currentStep={1}
      />
    </div>
  )
} 
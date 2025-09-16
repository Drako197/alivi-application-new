import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import { useAuth } from '../contexts/AuthContext'
import HelperButton from './HelperButton'

// Import widget components (we'll create these)
import RevenueGauge from './widgets/RevenueGauge'
import ClaimsPipeline from './widgets/ClaimsPipeline'
import DenialRateChart from './widgets/DenialRateChart'
import ARagingTable from './widgets/ARagingTable'
import HEDISCompliance from './widgets/HEDISCompliance'
import KPICards from './widgets/KPICards'
import RecentActivity from './widgets/RecentActivity'

// Types for our reports data
export interface ReportData {
  revenue: {
    current: number
    target: number
    trend: number
    forecast: Array<{ date: string; value: number }>
  }
  claims: {
    total: number
    processed: number
    pending: number
    denied: number
    pipeline: Array<{ stage: string; count: number; percentage: number }>
  }
  denials: {
    rate: number
    byCategory: Array<{ category: string; count: number; percentage: number }>
    byInsurance: Array<{ insurance: string; count: number; percentage: number }>
  }
  arAging: {
    current: number
    days30: number
    days60: number
    days90: number
    over90: number
  }
  hedis: {
    overallScore: number
    measures: Array<{ name: string; score: number; target: number; status: 'met' | 'not_met' | 'at_risk' }>
  }
  kpis: Array<{
    id: string
    title: string
    value: string | number
    change: number
    trend: 'up' | 'down' | 'stable'
    status: 'good' | 'warning' | 'critical'
  }>
  recentActivity: Array<{
    id: string
    type: 'claim' | 'payment' | 'denial' | 'compliance'
    description: string
    timestamp: string
    status: 'success' | 'warning' | 'error'
  }>
}

interface ReportsPageProps {
  isOpen?: boolean
  onClose?: () => void
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'revenue' | 'claims' | 'compliance'>('overview')
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load report data
  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true)
      try {
        // Simulate API call - in real app, this would fetch from your backend
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace with real API calls
        const mockData: ReportData = {
          revenue: {
            current: 245000,
            target: 250000,
            trend: 2.3,
            forecast: [
              { date: '2024-01', value: 240000 },
              { date: '2024-02', value: 245000 },
              { date: '2024-03', value: 250000 },
              { date: '2024-04', value: 255000 },
              { date: '2024-05', value: 260000 }
            ]
          },
          claims: {
            total: 1250,
            processed: 1100,
            pending: 100,
            denied: 50,
            pipeline: [
              { stage: 'Submitted', count: 150, percentage: 12 },
              { stage: 'Under Review', count: 200, percentage: 16 },
              { stage: 'Pending Payment', count: 300, percentage: 24 },
              { stage: 'Paid', count: 600, percentage: 48 }
            ]
          },
          denials: {
            rate: 4.0,
            byCategory: [
              { category: 'Prior Authorization', count: 15, percentage: 30 },
              { category: 'Coding Errors', count: 12, percentage: 24 },
              { category: 'Missing Information', count: 10, percentage: 20 },
              { category: 'Coverage Issues', count: 8, percentage: 16 },
              { category: 'Other', count: 5, percentage: 10 }
            ],
            byInsurance: [
              { insurance: 'Medicare', count: 20, percentage: 40 },
              { insurance: 'Medicaid', count: 15, percentage: 30 },
              { insurance: 'Commercial', count: 10, percentage: 20 },
              { insurance: 'Other', count: 5, percentage: 10 }
            ]
          },
          arAging: {
            current: 45000,
            days30: 25000,
            days60: 15000,
            days90: 8000,
            over90: 5000
          },
          hedis: {
            overallScore: 87.5,
            measures: [
              { name: 'Diabetes Care', score: 92, target: 90, status: 'met' },
              { name: 'Hypertension Control', score: 88, target: 85, status: 'met' },
              { name: 'Breast Cancer Screening', score: 78, target: 80, status: 'not_met' },
              { name: 'Colorectal Cancer Screening', score: 82, target: 85, status: 'at_risk' },
              { name: 'Cholesterol Management', score: 91, target: 88, status: 'met' }
            ]
          },
          kpis: [
            { id: 'revenue', title: 'Monthly Revenue', value: '$245K', change: 2.3, trend: 'up', status: 'good' },
            { id: 'claims', title: 'Claims Processed', value: '1,100', change: 5.2, trend: 'up', status: 'good' },
            { id: 'denial', title: 'Denial Rate', value: '4.0%', change: -0.5, trend: 'down', status: 'good' },
            { id: 'ar', title: 'Days in A/R', value: '32', change: -2, trend: 'down', status: 'good' },
            { id: 'hedis', title: 'HEDIS Score', value: '87.5%', change: 1.2, trend: 'up', status: 'good' },
            { id: 'satisfaction', title: 'Patient Satisfaction', value: '4.6/5', change: 0.1, trend: 'up', status: 'good' }
          ],
          recentActivity: [
            { id: '1', type: 'claim', description: 'High-value claim processed successfully', timestamp: '2 hours ago', status: 'success' },
            { id: '2', type: 'denial', description: 'Denial rate spike detected in Medicare claims', timestamp: '4 hours ago', status: 'warning' },
            { id: '3', type: 'payment', description: 'Large payment received from Blue Cross', timestamp: '6 hours ago', status: 'success' },
            { id: '4', type: 'compliance', description: 'HEDIS measure updated for Q1', timestamp: '1 day ago', status: 'success' },
            { id: '5', type: 'claim', description: 'Batch of 50 claims submitted', timestamp: '1 day ago', status: 'success' }
          ]
        }
        
        setReportData(mockData)
      } catch (error) {
        console.error('Failed to load report data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadReportData()
  }, [selectedTimeRange])

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="reports-page-loading-container min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="reports-page-loading-content text-center">
          <div className="reports-page-loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="reports-page-loading-text text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="reports-page-error-container min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="reports-page-error-content text-center">
          <Icon name="alert-circle" size={48} className="reports-page-error-icon text-red-500 mx-auto mb-4" />
          <p className="reports-page-error-text text-gray-600 dark:text-gray-400">Failed to load report data</p>
        </div>
      </div>
    )
  }


  return (
    <div className="reports-page-container min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="reports-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="reports-page-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reports-page-header-inner flex items-center justify-between py-6">
            <div className="reports-page-header-left flex items-center space-x-4">
              <div className="reports-page-title-section">
                <h1 className="reports-page-title text-xl font-semibold text-gray-900 dark:text-white">
                  Reports
                </h1>
                <p className="reports-page-subtitle text-sm text-gray-500 dark:text-gray-400">
                  Performance Reports & Data Insights
                </p>
              </div>
            </div>
            
            <div className="reports-page-header-right flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="reports-page-time-range-selector px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              {/* View Selector */}
              <div className="reports-page-view-selector hidden sm:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'revenue', label: 'Revenue', icon: 'dollar-sign' },
                  { id: 'claims', label: 'Claims', icon: 'file-text' },
                  { id: 'compliance', label: 'Compliance', icon: 'check-circle' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setSelectedView(view.id as any)}
                    className={`reports-page-view-button reports-page-view-button-${view.id} flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view.id
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon name={view.icon as any} size={16} />
                    <span className="hidden lg:inline">{view.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Export Button */}
              <button className="reports-page-export-button flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Icon name="download" size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="reports-page-main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile View Selector - Only visible on mobile */}
        <div className="reports-page-mobile-view-selector sm:hidden mb-6">
          <div className="reports-page-mobile-view-tabs flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: 'grid' },
              { id: 'revenue', label: 'Revenue', icon: 'dollar-sign' },
              { id: 'claims', label: 'Claims', icon: 'file-text' },
              { id: 'compliance', label: 'Compliance', icon: 'check-circle' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`reports-page-mobile-view-button reports-page-mobile-view-button-${view.id} flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  selectedView === view.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon name={view.icon as any} size={14} />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="reports-page-kpi-section mb-6 sm:mb-8">
          <KPICards data={reportData.kpis} />
        </div>

        {/* Mobile-optimized content based on selected view */}
        {selectedView === 'overview' && (
          <>
            {/* Main Dashboard Grid - Mobile: Stack vertically, Desktop: 3 columns */}
            <div className="reports-page-main-grid grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Revenue Gauge - Full width on mobile, 1/3 on desktop */}
              <div className="reports-page-revenue-widget lg:col-span-1">
                <RevenueGauge data={reportData.revenue} />
              </div>
              
              {/* Claims Pipeline - Full width on mobile, 2/3 on desktop */}
              <div className="reports-page-claims-widget lg:col-span-2">
                <ClaimsPipeline data={reportData.claims} />
              </div>
            </div>

            {/* Second Row - Mobile: Stack vertically, Desktop: 2 columns */}
            <div className="reports-page-secondary-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Denial Rate Chart */}
              <div className="reports-page-denial-widget">
                <DenialRateChart data={reportData.denials} />
              </div>
              
              {/* A/R Aging Table */}
              <div className="reports-page-ar-widget">
                <ARagingTable data={reportData.arAging} />
              </div>
            </div>

            {/* Third Row - Mobile: Stack vertically, Desktop: 2 columns */}
            <div className="reports-page-tertiary-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* HEDIS Compliance */}
              <div className="reports-page-hedis-widget">
                <HEDISCompliance data={reportData.hedis} />
              </div>
              
              {/* Recent Activity */}
              <div className="reports-page-activity-widget">
                <RecentActivity data={reportData.recentActivity} />
              </div>
            </div>
          </>
        )}

        {/* Revenue-focused view */}
        {selectedView === 'revenue' && (
          <div className="reports-page-revenue-view space-y-4 sm:space-y-6">
            <div className="reports-page-revenue-widget">
              <RevenueGauge data={reportData.revenue} />
            </div>
            <div className="reports-page-kpi-section">
              <KPICards data={reportData.kpis.filter(kpi => kpi.id === 'revenue' || kpi.id === 'ar')} />
            </div>
          </div>
        )}

        {/* Claims-focused view */}
        {selectedView === 'claims' && (
          <div className="reports-page-claims-view space-y-4 sm:space-y-6">
            <div className="reports-page-claims-widget">
              <ClaimsPipeline data={reportData.claims} />
            </div>
            <div className="reports-page-denial-widget">
              <DenialRateChart data={reportData.denials} />
            </div>
            <div className="reports-page-kpi-section">
              <KPICards data={reportData.kpis.filter(kpi => kpi.id === 'claims' || kpi.id === 'denial')} />
            </div>
          </div>
        )}

        {/* Compliance-focused view */}
        {selectedView === 'compliance' && (
          <div className="reports-page-compliance-view space-y-4 sm:space-y-6">
            <div className="reports-page-hedis-widget">
              <HEDISCompliance data={reportData.hedis} />
            </div>
            <div className="reports-page-activity-widget">
              <RecentActivity data={reportData.recentActivity} />
            </div>
            <div className="reports-page-kpi-section">
              <KPICards data={reportData.kpis.filter(kpi => kpi.id === 'hedis' || kpi.id === 'satisfaction')} />
            </div>
          </div>
        )}
      </div>

      {/* Mila Assistant */}
      <div className="reports-page-mila-assistant fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <HelperButton 
          currentForm="Reports" 
          currentField="reports-dashboard" 
          currentStep={1} 
          onNavigate={(form, field, step) => {
            console.log('Mila navigation:', { form, field, step })
          }} 
        />
      </div>
    </div>
  )
}

export default ReportsPage

import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import { useAuth } from '../contexts/AuthContext'
import HelperButton from './HelperButton'

// Import analytics widgets
import ExecutiveOverview from './widgets/analytics/ExecutiveOverview'
import PredictiveModels from './widgets/analytics/PredictiveModels'
import GrowthAnalytics from './widgets/analytics/GrowthAnalytics'
import FinancialProjections from './widgets/analytics/FinancialProjections'
import QualityInsights from './widgets/analytics/QualityInsights'
import ScenarioPlanning from './widgets/analytics/ScenarioPlanning'

// Types for analytics data
export interface AnalyticsData {
  executive: {
    revenueProjection: number
    patientVolumeForecast: number
    marketPosition: number
    growthRate: number
    efficiencyScore: number
  }
  predictive: {
    revenueForecast: Array<{ month: string; projected: number; actual?: number; confidence: number }>
    patientVolume: Array<{ month: string; projected: number; actual?: number; confidence: number }>
    riskScore: number
    opportunities: Array<{ title: string; impact: number; effort: number; priority: 'high' | 'medium' | 'low' }>
  }
  growth: {
    serviceLines: Array<{ name: string; current: number; projected: number; growth: number }>
    marketPenetration: number
    expansionOpportunities: Array<{ area: string; potential: number; feasibility: number }>
  }
  financial: {
    cashFlow: Array<{ month: string; projected: number; actual?: number }>
    roi: Array<{ investment: string; current: number; projected: number }>
    costStructure: Array<{ category: string; current: number; projected: number; trend: number }>
  }
  quality: {
    hedisScore: { current: number; projected: number; trend: number }
    patientSatisfaction: { current: number; projected: number; trend: number }
    complianceRisk: number
  }
}

interface AnalyticsPageProps {
  isOpen?: boolean
  onClose?: () => void
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3M' | '6M' | '1Y' | '2Y'>('1Y')
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic')
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

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock analytics data
        const mockData: AnalyticsData = {
          executive: {
            revenueProjection: 2850000,
            patientVolumeForecast: 1250,
            marketPosition: 78,
            growthRate: 12.5,
            efficiencyScore: 87
          },
          predictive: {
            revenueForecast: [
              { month: 'Jan', projected: 240000, actual: 245000, confidence: 85 },
              { month: 'Feb', projected: 250000, actual: 252000, confidence: 88 },
              { month: 'Mar', projected: 260000, actual: 258000, confidence: 82 },
              { month: 'Apr', projected: 270000, confidence: 90 },
              { month: 'May', projected: 275000, confidence: 87 },
              { month: 'Jun', projected: 280000, confidence: 85 }
            ],
            patientVolume: [
              { month: 'Jan', projected: 1100, actual: 1120, confidence: 92 },
              { month: 'Feb', projected: 1150, actual: 1180, confidence: 88 },
              { month: 'Mar', projected: 1200, actual: 1190, confidence: 85 },
              { month: 'Apr', projected: 1250, confidence: 90 },
              { month: 'May', projected: 1300, confidence: 87 },
              { month: 'Jun', projected: 1350, confidence: 85 }
            ],
            riskScore: 23,
            opportunities: [
              { title: 'Expand Telehealth Services', impact: 85, effort: 60, priority: 'high' },
              { title: 'Optimize Claims Processing', impact: 70, effort: 40, priority: 'high' },
              { title: 'Implement AI Diagnostics', impact: 90, effort: 80, priority: 'medium' },
              { title: 'Partner with Local Clinics', impact: 65, effort: 50, priority: 'medium' }
            ]
          },
          growth: {
            serviceLines: [
              { name: 'Primary Care', current: 450, projected: 520, growth: 15.6 },
              { name: 'Specialty Care', current: 320, projected: 380, growth: 18.8 },
              { name: 'Preventive Care', current: 280, projected: 350, growth: 25.0 },
              { name: 'Emergency Care', current: 150, projected: 180, growth: 20.0 }
            ],
            marketPenetration: 34,
            expansionOpportunities: [
              { area: 'North Region', potential: 85, feasibility: 70 },
              { area: 'South Region', potential: 75, feasibility: 85 },
              { area: 'East Region', potential: 90, feasibility: 60 },
              { area: 'West Region', potential: 80, feasibility: 75 }
            ]
          },
          financial: {
            cashFlow: [
              { month: 'Jan', projected: 180000, actual: 185000 },
              { month: 'Feb', projected: 190000, actual: 192000 },
              { month: 'Mar', projected: 200000, actual: 198000 },
              { month: 'Apr', projected: 210000 },
              { month: 'May', projected: 220000 },
              { month: 'Jun', projected: 230000 }
            ],
            roi: [
              { investment: 'EHR System', current: 145, projected: 180 },
              { investment: 'Telehealth Platform', current: 120, projected: 160 },
              { investment: 'AI Diagnostics', current: 95, projected: 140 },
              { investment: 'Staff Training', current: 110, projected: 135 }
            ],
            costStructure: [
              { category: 'Personnel', current: 65, projected: 62, trend: -3 },
              { category: 'Technology', current: 15, projected: 18, trend: 3 },
              { category: 'Facilities', current: 12, projected: 11, trend: -1 },
              { category: 'Supplies', current: 8, projected: 9, trend: 1 }
            ]
          },
          quality: {
            hedisScore: { current: 87, projected: 92, trend: 5 },
            patientSatisfaction: { current: 4.2, projected: 4.5, trend: 0.3 },
            complianceRisk: 15
          }
        }
        
        setAnalyticsData(mockData)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [selectedTimeframe, selectedScenario])

  if (loading) {
    return (
      <div className="analytics-page-loading min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="analytics-loading-content text-center">
          <div className="analytics-loading-spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="analytics-loading-text text-gray-600 dark:text-gray-400">Loading analytics insights...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page-error min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="analytics-error-content text-center">
          <Icon name="alert-circle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="analytics-error-title text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Analytics
          </h2>
          <p className="analytics-error-text text-gray-600 dark:text-gray-400">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="analytics-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="analytics-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="analytics-header-main flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 space-y-4 sm:space-y-0">
            {/* Title Section - Full Width on Mobile */}
            <div className="analytics-header-title-section w-full sm:w-auto">
              <h1 className="analytics-page-title text-xl font-semibold text-gray-900 dark:text-white">
                Strategic Analytics
              </h1>
              <p className="analytics-page-subtitle text-sm text-gray-500 dark:text-gray-400 mt-1">
                Predictive insights for {user?.fullName || 'User'}
              </p>
            </div>
            
            {/* Controls Section - Side by Side on Mobile */}
            <div className="analytics-header-right w-full sm:w-auto">
              <div className="flex flex-row sm:flex-row sm:items-center space-x-2 sm:space-x-4">
                {/* Timeframe Selector */}
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="analytics-timeframe-select flex-1 sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="2Y">2 Years</option>
                </select>

                {/* Scenario Selector */}
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as any)}
                  className="analytics-scenario-select flex-1 sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="conservative">Conservative</option>
                  <option value="realistic">Realistic</option>
                  <option value="optimistic">Optimistic</option>
                </select>

                {/* Export Button */}
                <button className="analytics-export-btn hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <Icon name="download" size={16} className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="analytics-widgets-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Executive Overview - Full Width */}
          <div className="analytics-executive-overview-widget lg:col-span-2 xl:col-span-3">
            <ExecutiveOverview data={analyticsData.executive} />
          </div>

          {/* Predictive Models */}
          <div className="analytics-predictive-models-widget">
            <PredictiveModels data={analyticsData.predictive} />
          </div>

          {/* Growth Analytics */}
          <div className="analytics-growth-analytics-widget">
            <GrowthAnalytics data={analyticsData.growth} />
          </div>

          {/* Financial Projections */}
          <div className="analytics-financial-projections-widget">
            <FinancialProjections data={analyticsData.financial} />
          </div>

          {/* Quality Insights */}
          <div className="analytics-quality-insights-widget lg:col-span-2 xl:col-span-3">
            <QualityInsights data={analyticsData.quality} />
          </div>

          {/* Scenario Planning */}
          <div className="analytics-scenario-planning-widget lg:col-span-2 xl:col-span-3">
            <ScenarioPlanning 
              data={analyticsData} 
              selectedScenario={selectedScenario}
              selectedTimeframe={selectedTimeframe}
            />
          </div>
        </div>
      </div>

      {/* Mila Assistant */}
      <div className="analytics-page-mila-assistant" style={{ 
        position: 'fixed', 
        bottom: '5rem', 
        right: '1rem', 
        zIndex: 99999,
        maxWidth: 'calc(100vw - 2rem)'
      }}>
        <HelperButton />
      </div>
    </div>
  )
}

export default AnalyticsPage

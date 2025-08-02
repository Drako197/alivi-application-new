import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import Icon from './Icon'
import PatientEligibilityForm from './PatientEligibilityForm'
import ClaimsSubmissionForm from './ClaimsSubmissionForm'
import PrescriptionForm from './PrescriptionForm'
import HealthPlanDetailsPage from './HealthPlanDetailsPage'
import FramesAndLensesPage from './FramesAndLensesPage'
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
}

export default function PICLandingPage({ onUpdateBreadcrumb, resetToLanding = 0 }: PICLandingPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentView, setCurrentView] = useState<'landing' | 'patient-eligibility' | 'claims-submission' | 'prescription' | 'health-plan-details' | 'frames-and-lenses'>('landing')

  // Reset to landing page when resetToLanding prop changes
  useEffect(() => {
    if (resetToLanding > 0) {
      setCurrentView('landing')
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'P.I.C.'])
      }
    }
  }, [resetToLanding, onUpdateBreadcrumb])

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

  return (
    <div className="pic-landing-page">
      {/* Header */}
      <div className="pic-header">
        <div>
          <h1 className="pic-title">P.I.C. Actions</h1>
          <p className="pic-subtitle">Quick access to all provider interface center actions</p>
        </div>
        <div className="pic-view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`pic-toggle-btn ${viewMode === 'grid' ? 'pic-toggle-active' : ''}`}
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`pic-toggle-btn ${viewMode === 'list' ? 'pic-toggle-active' : ''}`}
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="pic-search">
        <div className="pic-search-container">
          <Icon name="search" size={20} className="pic-search-icon" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pic-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="pic-categories">
        <div className="pic-categories-container">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`pic-category-btn ${selectedCategory === category.id ? 'pic-category-active' : ''}`}
            >
              {category.name}
              <span className="pic-category-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frequently Used Actions */}
      <div className="pic-section">
        <h2 className="pic-section-title">Frequently Used Actions</h2>
        <div className={`pic-actions-grid ${viewMode === 'list' ? 'pic-actions-list' : ''}`}>
          {frequentActions.map((action, index) => (
            <div
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="pic-action-card pic-frequent-action-v1 cursor-pointer"
            >
              <div className="pic-action-icon">
                {getFrequentIcon(action.icon)}
              </div>
              <div className="pic-action-content">
                <h3 className="pic-action-title">{action.name}</h3>
                <p className="pic-action-description">{action.description}</p>
                <div className="pic-action-meta">
                  <span className="pic-action-frequency">{action.frequency}% usage</span>
                </div>
              </div>
              <div className="pic-action-badge">
                <span className="pic-badge-popular">
                  <Icon name="star" size={12} className="mr-1" />
                  Popular
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Actions */}
      <div className="pic-section">
        <h2 className="pic-section-title">All Actions</h2>
        {filteredActions.length === 0 ? (
          <div className="pic-empty-state">
            <Icon name="search" size={48} className="pic-empty-icon" />
            <h3 className="pic-empty-title">No actions found</h3>
            <p className="pic-empty-description">Try adjusting your search or category filters</p>
          </div>
        ) : (
          <div className={`pic-actions-grid ${viewMode === 'list' ? 'pic-actions-list' : ''}`}>
            {filteredActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="pic-action-card cursor-pointer"
              >
                <div className="pic-action-icon">
                  {getIcon(action.icon)}
                </div>
                <div className="pic-action-content">
                  <h3 className="pic-action-title">{action.name}</h3>
                  <p className="pic-action-description">{action.description}</p>
                  <div className="pic-action-meta">
                    <span className="pic-action-frequency">{action.frequency}% usage</span>
                  </div>
                </div>
                <div className="pic-action-badge">
                  {action.frequency >= 80 && (
                    <span className="pic-badge-popular">
                      <Icon name="star" size={12} className="mr-1" />
                      Popular
                    </span>
                  )}
                  {action.frequency >= 60 && action.frequency < 80 && (
                    <span className="pic-badge-active">Active</span>
                  )}
                  {action.frequency >= 40 && action.frequency < 60 && (
                    <span className="pic-badge-regular">Regular</span>
                  )}
                  {action.frequency < 40 && (
                    <span className="pic-badge-new">New</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
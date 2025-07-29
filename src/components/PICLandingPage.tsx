import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import Icon from './Icon'
import PatientEligibilityForm from './PatientEligibilityForm'
import ClaimsSubmissionForm from './ClaimsSubmissionForm'

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
  const [currentView, setCurrentView] = useState<'landing' | 'patient-eligibility' | 'claims-submission'>('landing')

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
    { id: 'claim-status', name: 'Claim Status', description: 'View real-time claim processing status', category: 'claims', frequency: 88, icon: 'search' },
    { id: 'claim-summary', name: 'Claim Summary', description: 'View detailed claim summaries and reports', category: 'claims', frequency: 82, icon: 'file-text' },
    { id: 'job-status-online', name: 'Job Status Online Entry', description: 'Enter job status information online', category: 'claims', frequency: 55, icon: 'monitor' },
    { id: 'job-status-paper', name: 'Job Status Paper Claim', description: 'Submit job status via paper claim', category: 'claims', frequency: 45, icon: 'file-text' },
    
    // Health Plans & Payments
    { id: 'health-plan-details', name: 'Health Plan Details', description: 'View health plan information and coverage', category: 'plans', frequency: 85, icon: 'info' },
    { id: 'explanation-of-payments', name: 'Explanation of Payments', description: 'View detailed payment explanations', category: 'plans', frequency: 78, icon: 'dollar-sign' },
    { id: 'payment-summary-report', name: 'Payment Summary Report', description: 'Generate payment summary reports', category: 'plans', frequency: 72, icon: 'bar-chart-3' },
    { id: 'frame-collections', name: 'Frame Collections', description: 'Access frame collection information', category: 'plans', frequency: 65, icon: 'package' },
    { id: 'lens-price-list', name: 'Lens Price List', description: 'View current lens pricing information', category: 'plans', frequency: 58, icon: 'tag' },
    
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
              <span>{category.name}</span>
              <span className="pic-category-count">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frequently Used Actions */}
      {searchTerm === '' && selectedCategory === 'all' && (
        <div className="pic-section">
          <h2 className="pic-section-title">Frequently Used Actions</h2>
          <div className={`pic-actions-grid ${viewMode === 'list' ? 'pic-actions-list' : ''}`}>
            {frequentActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`pic-action-card group pic-frequent-action ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''}`}
              >
                <div className={`pic-action-icon ${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                  {getFrequentIcon(action.icon)}
                </div>
                <div className={`pic-action-content ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                  <div className="pic-action-badge">
                    {action.frequency >= 80 ? (
                      <span className="pic-badge-popular">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Popular
                      </span>
                    ) : action.frequency >= 60 ? (
                      <span className="pic-badge-active">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        Active
                      </span>
                    ) : action.frequency >= 40 ? (
                      <span className="pic-badge-regular">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Regular
                      </span>
                    ) : (
                      <span className="pic-badge-new">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`pic-action-title ${viewMode === 'list' ? 'text-base font-medium mb-1' : ''}`}>{action.name}</h3>
                  <p className={`pic-action-description ${viewMode === 'list' ? 'text-sm text-gray-600 dark:text-gray-400' : ''}`}>{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Actions */}
      <div className="pic-section">
        <h2 className="pic-section-title">
          {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'All Actions'}
        </h2>
        {filteredActions.length > 0 ? (
          <div className={`pic-actions-grid ${viewMode === 'list' ? 'pic-actions-list' : ''}`}>
            {filteredActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`pic-action-card group ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''}`}
              >
                <div className={`pic-action-icon ${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                  {getIcon(action.icon)}
                </div>
                <div className={`pic-action-content ${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                  <div className="pic-action-badge">
                    {action.frequency >= 80 ? (
                      <span className="pic-badge-popular">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Popular
                      </span>
                    ) : action.frequency >= 60 ? (
                      <span className="pic-badge-active">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        Active
                      </span>
                    ) : action.frequency >= 40 ? (
                      <span className="pic-badge-regular">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Regular
                      </span>
                    ) : (
                      <span className="pic-badge-new">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New
                      </span>
                    )}
                  </div>
                  <h3 className={`pic-action-title ${viewMode === 'list' ? 'text-base font-medium mb-1' : ''}`}>{action.name}</h3>
                  <p className={`pic-action-description ${viewMode === 'list' ? 'text-sm text-gray-600 dark:text-gray-400' : ''}`}>{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pic-empty-state">
            <svg className="pic-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="pic-empty-title">No actions found</h3>
            <p className="pic-empty-description">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import type { ReactElement } from 'react'

interface HEDISForm {
  id: string
  title: string
  status: 'complete' | 'saved' | 'draft'
  lastModified: string
  patientName?: string
}

interface HEDISReport {
  id: string
  title: string
  type: 'screening' | 'compliance' | 'quality'
  generatedDate: string
  status: 'ready' | 'processing' | 'completed'
}

export default function HEDISLandingPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userRole, setUserRole] = useState('Field Technician') // This would come from user context
  const [userName, setUserName] = useState('John') // This would come from user context

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Format current date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Mock data - in real app this would come from API
  const dashboardStats = {
    completeForms: 20,
    savedForms: 12,
    currentDate: formatDate(currentTime)
  }

  const dashboardCards = [
    {
      id: 'completed',
      title: 'Completed Patient Forms',
      count: dashboardStats.completeForms,
      description: 'Keep track of your most recently completed patient forms in read-only format',
      icon: 'check-circle',
      type: 'complete' as const
    },
    {
      id: 'saved',
      title: 'Saved Patient Forms',
      count: dashboardStats.savedForms,
      description: 'Continue updating your recent patient forms and pick up where you left off',
      icon: 'save',
      type: 'saved' as const
    }
  ]

  const hedisTasks = [
    {
      id: 'new-screening',
      title: 'New Patient Screening',
      description: 'Start a new patient screening form to collect comprehensive health data and assessments',
      icon: 'clipboard-document-list',
      action: 'Start New Screening'
    },
    {
      id: 'reports',
      title: 'HEDIS Reports',
      description: 'Generate and view HEDIS reports',
      icon: 'chart-bar-square',
      action: 'Generate Report'
    }
  ]

  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      'clipboard-document-list': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'chart-bar-square': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      'calendar': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'check-circle': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'document-arrow-down': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'save': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      )
    }
    return iconMap[iconName] || iconMap['clipboard-document-list']
  }

  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId)
    // Handle task navigation
  }

  const handleFormClick = (type: 'complete' | 'saved') => {
    console.log('Form type clicked:', type)
    // Handle form navigation
  }

  return (
    <div className="hedis-landing-page">
      {/* Header Section */}
      <div className="hedis-header">
        <div className="hedis-greeting-section">
          <h1 className="hedis-greeting">
            {getGreeting()}, {userName}!
          </h1>
          <div className="hedis-role-badge">
            <span className="hedis-role-text">{userRole}</span>
          </div>
        </div>
        <div className="hedis-date-section">
          <div className="hedis-date-card">
            <div className="hedis-date-icon">
              {getIcon('calendar')}
            </div>
            <div className="hedis-date-content">
              <span className="hedis-date-label">Today</span>
              <span className="hedis-date-value">{dashboardStats.currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action - New Patient Screening */}
      <div className="hedis-primary-action-section">
        <div className="hedis-primary-action-card">
          <div className="hedis-primary-action-header">
            <div className="hedis-primary-action-icon">
              <div className="hedis-icon-badge">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              {getIcon('clipboard-document-list')}
            </div>
            <div className="hedis-primary-action-content">
              <h2 className="hedis-primary-action-title">New Patient Screening</h2>
              <p className="hedis-primary-action-description">
                Start a new patient screening form to collect comprehensive health data and assessments. 
                This is your primary workflow for patient evaluation and documentation.
              </p>
            </div>
          </div>
          <div className="hedis-primary-action-button">
            <button 
              className="hedis-hero-btn"
              onClick={() => handleTaskClick('new-screening')}
            >
              Start New Screening
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="hedis-secondary-actions-section">
        <div className="hedis-secondary-actions-grid">
          {/* HEDIS Reports */}
          <div className="hedis-secondary-action-card">
            <div className="hedis-secondary-action-header">
              <div className="hedis-secondary-action-icon">
                {getIcon('chart-bar-square')}
              </div>
              <div className="hedis-secondary-action-content">
                <h3 className="hedis-secondary-action-title">HEDIS Reports</h3>
                <p className="hedis-secondary-action-description">Generate and view HEDIS reports</p>
              </div>
            </div>
            <div className="hedis-secondary-action-button">
              <button 
                className="hedis-secondary-btn"
                onClick={() => handleTaskClick('reports')}
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Dashboard Overview - Compact */}
          <div className="hedis-dashboard-compact">
            <h3 className="hedis-compact-title">Quick Access</h3>
            <div className="hedis-compact-grid">
              {dashboardCards.map((card) => (
                <div 
                  key={card.id}
                  className={`hedis-compact-card hedis-${card.id}-card group`}
                  onClick={() => handleFormClick(card.type)}
                >
                  <div className={`hedis-compact-icon hedis-${card.id}-icon`}>
                    {getIcon(card.icon)}
                  </div>
                  <div className="hedis-compact-content">
                    <div className="hedis-compact-header">
                      <span className="hedis-compact-number">{card.count}</span>
                      <span className="hedis-compact-label">{card.title}</span>
                    </div>
                    <div className={`hedis-compact-badge ${card.id === 'completed' ? 'hedis-badge-view-only' : 'hedis-badge-continue-editing'}`}>
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
  )
} 
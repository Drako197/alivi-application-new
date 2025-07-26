import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import MobileSideMenu from './MobileSideMenu'
import MobileProfile from './MobileProfile'
import PICLandingPage from './PICLandingPage'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState('dashboard')
  const [activeDesktopTab, setActiveDesktopTab] = useState('dashboard')
  const [breadcrumbPath, setBreadcrumbPath] = useState(['Dashboard'])

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
  }

  const handleDesktopTabChange = (tab: string) => {
    setActiveDesktopTab(tab)
    updateBreadcrumbPath(tab)
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
    }
    // For future sub-pages, we can add more logic here
  }

  // Desktop content based on active tab
  const renderDesktopContent = () => {
    switch (activeDesktopTab) {
      case 'hedis':
        return (
          <div className="dashboard-content">
            <h1 className="welcome-title">H.E.D.I.S.</h1>
            <p className="welcome-subtitle">Healthcare Effectiveness Data and Information Set</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">HEDIS content coming soon...</p>
            </div>
          </div>
        )
      case 'pic':
        return <PICLandingPage />
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
            <p className="welcome-subtitle">Application configuration</p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">Settings content coming soon...</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
              <p className="welcome-subtitle">Here's what's happening with your claims today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-green-100 dark:bg-green-900">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Approved</p>
                    <p className="stat-value">1,234</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-blue-100 dark:bg-blue-900">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Pending</p>
                    <p className="stat-value">567</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-yellow-100 dark:bg-yellow-900">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Under Review</p>
                    <p className="stat-value">89</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-red-100 dark:bg-red-900">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Rejected</p>
                    <p className="stat-value">91</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Submit New Claim
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    View Claims History
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Generate Reports
                  </button>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Claim #1234 approved</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Claim #1235 pending review</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">New claim submitted</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Claims Processing</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
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
      case 'profile':
        return <MobileProfile />
      case 'hedis':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">HEDIS</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">HEDIS content coming soon...</p>
            </div>
          </div>
        )
      case 'pic':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">P.I.C.</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-400">P.I.C. content coming soon...</p>
            </div>
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
      default:
        return (
          <div className="dashboard-content">
            {/* Welcome Section */}
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</h1>
              <p className="welcome-subtitle">Here's what's happening with your claims today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-green-100 dark:bg-green-900">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Approved</p>
                    <p className="stat-value">1,234</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-blue-100 dark:bg-blue-900">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Total Claims</p>
                    <p className="stat-value">2,847</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-yellow-100 dark:bg-yellow-900">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Pending</p>
                    <p className="stat-value">156</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="stat-icon bg-red-100 dark:bg-red-900">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="stat-label">Rejected</p>
                    <p className="stat-value">91</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Submit New Claim
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    View Claims History
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Generate Reports
                  </button>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Claim #1234 approved</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">Claim #1235 pending review</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-600 dark:text-gray-400">New claim submitted</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Claims Processing</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                    <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                  </div>
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
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
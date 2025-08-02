import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginView from './components/LoginView'
import SignUpView from './components/SignUpView'
import ForgotPasswordView from './components/ForgotPasswordView'
import Dashboard from './components/Dashboard'

type AuthView = 'login' | 'signup' | 'forgot-password'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState<AuthView>('login')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const renderAuthView = () => {
    switch (currentView) {
      case 'login':
        return <LoginView onViewChange={setCurrentView} />
      case 'signup':
        return <SignUpView onViewChange={setCurrentView} />
      case 'forgot-password':
        return <ForgotPasswordView onViewChange={setCurrentView} />
      default:
        return <LoginView onViewChange={setCurrentView} />
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    return <Dashboard />
  }

  // Show login/signup forms if not authenticated
  return (
    <div className={`login-page-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile gradient pattern overlay */}
      <div className="mobile-gradient-pattern"></div>
      
      {/* Container with max-width and centering */}
      <div className="login-page-wrapper">
        {/* Left side - Modern Gradient Background */}
        <div className="login-page-left-side pre-login-left-panel">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 pre-login-background">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-600/20 animate-pulse pre-login-gradient-overlay"></div>
            
            {/* Geometric pattern overlay */}
            <div className="absolute inset-0 opacity-10 pre-login-geometric-patterns">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full pre-login-circle-1"></div>
              <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white/20 rounded-full pre-login-circle-2"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 border-2 border-white/20 rounded-full pre-login-circle-3"></div>
              <div className="absolute bottom-40 right-10 w-20 h-20 border-2 border-white/20 rounded-full pre-login-circle-4"></div>
            </div>
            
            {/* Subtle mesh gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-400/10 to-purple-500/10 pre-login-mesh-gradient"></div>
          </div>
          
          {/* Content overlay with enhanced styling */}
          <div className="relative z-10 flex items-center justify-center w-full h-full px-8 pre-login-content-wrapper">
            <div className="text-center text-white max-w-lg pre-login-content">
              {/* Company Logo */}
              <div className="mb-8 pre-login-company-logo-container">
                <img 
                  src="/images/company-logo.svg" 
                  alt="Company Logo" 
                  className="h-16 w-auto mx-auto mb-6 filter brightness-0 invert pre-login-company-logo"
                />
              </div>
              
              {/* Alivi Logo - All Screen Sizes */}
              <div className="mb-8 pre-login-alivi-section">
                <div className="flex flex-col items-center space-y-4 pre-login-alivi-content">
                  <div className="text-center pre-login-tagline">
                    <p className="text-white/90 text-sm lg:text-lg font-medium pre-login-tagline-main">Healthcare Data Intelligence</p>
                    <p className="text-white/70 text-xs lg:text-base mt-1 pre-login-tagline-subtitle">Smart Claims, Smarter Results</p>
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent pre-login-main-heading">
                Billing, adjudication, and claims submission—intelligently enhanced.
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed font-light pre-login-subheading">
                AI-powered claims management that streamlines every step of your billing workflow.
              </p>
              
              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-1 gap-4 text-sm text-blue-200 pre-login-features">
                <div className="flex items-center justify-center space-x-2 pre-login-feature-item">
                  <svg className="w-4 h-4 text-green-300 pre-login-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="pre-login-feature-text">Intelligent Claims Processing</span>
                </div>
                <div className="flex items-center justify-center space-x-2 pre-login-feature-item">
                  <svg className="w-4 h-4 text-green-300 pre-login-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="pre-login-feature-text">Automated Adjudication</span>
                </div>
                <div className="flex items-center justify-center space-x-2 pre-login-feature-item">
                  <svg className="w-4 h-4 text-green-300 pre-login-feature-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="pre-login-feature-text">HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Card */}
        <div className="login-page-right-side pre-login-right-panel">
          <div className="login-form-container pre-login-form-container">
            {/* Company Logo - Mobile Only */}
            <div className="lg:hidden flex flex-col items-center mb-8 mt-8 pre-login-mobile-logo-container">
              <img 
                src="/images/company-logo.svg" 
                alt="Company Logo" 
                className="h-12 w-auto filter brightness-0 invert pre-login-mobile-logo mb-4"
              />
              <div className="text-center pre-login-tagline">
                <p className="text-white/90 text-base font-medium pre-login-tagline-main">Healthcare Data Intelligence</p>
                <p className="text-white/70 text-sm mt-1 pre-login-tagline-subtitle">Smart Claims, Smarter Results</p>
              </div>
            </div>
            
            {/* Dark mode toggle */}
            <div className="login-form-dark-mode-toggle pre-login-dark-mode-toggle">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow pre-login-dark-mode-button"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500 pre-login-dark-mode-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600 pre-login-dark-mode-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Auth Card */}
            <div className="login-form-card pre-login-auth-card">
              <div className="login-form-content pre-login-auth-content">
                {renderAuthView()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

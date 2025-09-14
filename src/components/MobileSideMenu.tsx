import { useAuth } from '../contexts/AuthContext'
import type { ReactElement } from 'react'

interface MobileSideMenuProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onNavigate?: (tab: string) => void
}

export default function MobileSideMenu({ isOpen, onClose, isDarkMode, onToggleDarkMode, onNavigate }: MobileSideMenuProps) {
  const { user, logout } = useAuth()

  const menuItems = [
    // Main Menu
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'hedis', label: 'H.E.D.I.S.', icon: 'document' },
    { id: 'pic', label: 'P.I.C.', icon: 'credit-card' },
    { id: 'reports', label: 'Reports', icon: 'chart-bar' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-pie' },
    
    // Team Management
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'shield-check' },
    { id: 'audit', label: 'Audit Log', icon: 'clipboard-list' },
    
    // Settings & Support
    { id: 'settings', label: 'Settings', icon: 'cog' },
    { id: 'help', label: 'Help', icon: 'question-mark-circle' },
    { id: 'about', label: 'About', icon: 'information-circle' }
  ]

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      dashboard: (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      document: (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'credit-card': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'chart-pie': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      'shield-check': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'clipboard-list': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      cog: (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'question-mark-circle': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'information-circle': (
        <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return icons[iconName] || <div className="w-5 h-5" />
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  const handleMenuItemClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId)
    }
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div className="mobile-side-menu" onClick={onClose}>
          <div 
            className={`mobile-side-menu-content ${isOpen ? 'open' : 'closed'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-all duration-200 ease-in-out">Menu</h2>
                <button
                  onClick={onClose}
                  className="mobile-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200 ease-in-out hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="mobile-profile-avatar user-avatar">
                  <span className="text-sm font-medium text-white">
                    {user?.fullName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white transition-all duration-200 ease-in-out">{user?.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-200 ease-in-out">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={item.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <button 
                      onClick={() => handleMenuItemClick(item.id)}
                      className="mobile-menu-item w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="nav-icon">{getIcon(item.icon)}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dark Mode Toggle */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onToggleDarkMode}
                className="mobile-menu-item w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <span className="nav-icon">
                  {isDarkMode ? (
                    <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <button
                onClick={handleLogout}
                className="mobile-menu-item w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="nav-icon">
                  <svg className="w-5 h-5 transition-transform duration-200 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
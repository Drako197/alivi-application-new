import { useState } from 'react'
import type { ReactElement } from 'react'

interface SidebarProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ isDarkMode, onToggleDarkMode, activeTab, onTabChange }: SidebarProps) {

  const menuItems = [
    {
      section: 'Main Menu',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'hedis', label: 'H.E.D.I.S.', icon: 'document' },
        { id: 'pic', label: 'P.I.C.', icon: 'credit-card' },
        { id: 'reports', label: 'Reports', icon: 'chart-bar' },
        { id: 'analytics', label: 'Analytics', icon: 'chart-pie' }
      ]
    },
    {
      section: 'Team Management',
      items: [
        { id: 'users', label: 'Users', icon: 'users' },
        { id: 'roles', label: 'Roles & Permissions', icon: 'shield-check' },
        { id: 'audit', label: 'Audit Log', icon: 'clipboard-list' }
      ]
    }
  ]

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: 'cog' }
  ]

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      document: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'credit-card': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'chart-pie': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      'shield-check': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'clipboard-list': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      cog: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'question-mark-circle': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return icons[iconName] || <div className="w-5 h-5" />
  }

  return (
    <div className="sidebar">
      {/* Logo and Brand */}
      <div className="logo-container">
        <div className="logo-wrapper">
          <div className="logo-icon">
            <img 
              src="/images/Alivi_A_Icon.png" 
              alt="Alivi Icon" 
              className="w-5 h-5 object-contain filter brightness-0 invert"
            />
          </div>
          <span className="logo-text">Alivi</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-section">
        {menuItems.map((section) => (
          <div key={section.section} className={`nav-section-container-${section.section.toLowerCase().replace(/\s+/g, '-')}`}>
            <h3 className="nav-section-title">
              {section.section}
            </h3>
            <ul className="nav-list">
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`nav-item ${
                      activeTab === item.id
                        ? 'nav-item-active'
                        : 'nav-item-inactive'
                    }`}
                  >
                    <span className="nav-icon">{getIcon(item.icon)}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {/* Dark Mode Toggle */}
        <div className="mb-4">
          <button
            onClick={onToggleDarkMode}
            className="dark-mode-toggle"
          >
            <span className="nav-icon">
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </span>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Bottom Menu Items */}
        <div className="bottom-nav-container">
          <ul className="nav-list">
            {bottomItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`nav-item ${
                    activeTab === item.id
                      ? 'nav-item-active'
                      : 'nav-item-inactive'
                  }`}
                >
                  <span className="nav-icon">{getIcon(item.icon)}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 
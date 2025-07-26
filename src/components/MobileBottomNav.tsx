import { useState } from 'react'
import type { ReactElement } from 'react'

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'hedis', label: 'H.E.D.I.S.', icon: 'document' },
    { id: 'pic', label: 'P.I.C.', icon: 'credit-card' },
    { id: 'reports', label: 'Reports', icon: 'chart-bar' },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ]

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      dashboard: (
        <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
      document: (
        <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'credit-card': (
        <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      user: (
        <svg className="mobile-nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
    return icons[iconName] || <div className="mobile-nav-icon" />
  }

  return (
    <nav className="mobile-bottom-nav">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`mobile-nav-tab mobile-bottom-nav-tab ${
              activeTab === tab.id
                ? 'mobile-nav-tab-active'
                : 'mobile-nav-tab-inactive'
            }`}
          >
            {getIcon(tab.icon)}
            <span className="transition-all duration-200 ease-in-out">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
} 
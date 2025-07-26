import { useAuth } from '../contexts/AuthContext'

interface MobileHeaderProps {
  onMenuToggle: () => void
  title: string
}

export default function MobileHeader({ onMenuToggle, title }: MobileHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="mobile-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="mobile-button p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200 ease-in-out hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="logo-icon">
              <img 
                src="/images/Alivi_A_Icon.png" 
                alt="Alivi Icon" 
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <span className="logo-text text-lg font-bold text-gray-900 dark:text-white">Alivi</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="mobile-profile-avatar user-avatar">
            <span className="text-sm font-medium text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
} 
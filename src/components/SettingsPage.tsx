import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface SettingsPageProps {
  isOpen?: boolean
  onClose?: () => void
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    // User & Security Settings
    profile: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      role: 'Administrator',
      department: 'Billing',
      phone: '',
      timezone: 'America/New_York'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true
    },
    // Practice & Organization Settings
    practice: {
      name: 'Alivi Health Solutions',
      npi: '1234567890',
      taxId: '12-3456789',
      address: '123 Healthcare Ave, Medical City, MC 12345',
      phone: '(555) 123-4567',
      email: 'billing@alivihealth.com'
    },
    // Billing & Financial Settings
    billing: {
      defaultFeeSchedule: 'Medicare',
      autoBillingEnabled: true,
      paymentTerms: 30,
      lateFeePercentage: 1.5,
      minimumPaymentAmount: 25.00
    },
    // Notification Settings
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      smsPhoneNumber: '',
      claimDenials: true,
      paymentAlerts: true,
      systemUpdates: true,
      arAgingAlerts: true
    },
    // Interface Settings
    interface: {
      theme: theme,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      decimalPlaces: 2
    }
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Sync settings theme with context theme
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      interface: {
        ...prev.interface,
        theme: theme
      }
    }))
  }, [theme])

  const tabs = [
    { id: 'profile', name: 'Profile & Security', icon: 'user', description: 'Manage your account and security settings' },
    { id: 'practice', name: 'Practice Settings', icon: 'building', description: 'Organization and practice information' },
    { id: 'billing', name: 'Billing & Financial', icon: 'dollar-sign', description: 'Billing rules and financial settings' },
    { id: 'notifications', name: 'Notifications', icon: 'bell', description: 'Email and alert preferences' },
    { id: 'interface', name: 'Interface', icon: 'settings', description: 'Display and language preferences' }
  ]

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
    setHasChanges(true)

    // Show specific confirmations for important changes
    if (section === 'security' && field === 'twoFactorEnabled') {
      if (value) {
        showConfirmation('info', 'Two-factor authentication enabled. You will need to set up your authenticator app.')
      } else {
        showConfirmation('info', 'Two-factor authentication disabled. Your account security has been reduced.')
      }
    } else if (section === 'billing' && field === 'autoBillingEnabled') {
      if (value) {
        showConfirmation('info', 'Auto-billing enabled. Bills will be generated automatically.')
      } else {
        showConfirmation('info', 'Auto-billing disabled. You will need to generate bills manually.')
      }
    } else if (section === 'notifications' && field === 'emailNotifications') {
      if (value) {
        showConfirmation('info', 'Email notifications enabled.')
      } else {
        showConfirmation('info', 'Email notifications disabled.')
      }
    } else if (section === 'notifications' && field === 'smsNotifications') {
      if (value) {
        showConfirmation('info', 'SMS notifications enabled. Please configure your phone number below.')
      } else {
        showConfirmation('info', 'SMS notifications disabled.')
      }
    } else if (section === 'interface' && field === 'theme') {
      setTheme(value as 'light' | 'dark' | 'auto')
      if (value === 'auto') {
        showConfirmation('info', 'Theme set to Auto. The interface will follow your system\'s dark/light mode preference.')
      } else {
        showConfirmation('info', `Theme changed to ${value}. The interface will update accordingly.`)
      }
    } else if (section === 'notifications' && field === 'smsPhoneNumber') {
      if (value) {
        showConfirmation('info', `SMS notifications will be sent to: ${value}`)
      }
    }
  }

  const showConfirmation = (type: 'success' | 'error' | 'info', message: string) => {
    setConfirmationMessage({ type, message })
    setTimeout(() => {
      setConfirmationMessage(null)
    }, 5000)
  }

  const handleSave = () => {
    // In a real application, this would save to a backend
    console.log('Saving settings:', settings)
    setHasChanges(false)
    showConfirmation('success', 'Settings saved successfully!')
  }

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false)
    showConfirmation('info', 'Settings reset to default values')
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="settings-section">
        <h3 className="settings-section-title">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="settings-field">
            <label className="settings-label">Full Name</label>
            <input
              type="text"
              value={settings.profile.fullName}
              onChange={(e) => handleInputChange('profile', 'fullName', e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Email Address</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Role</label>
            <select
              value={settings.profile.role}
              onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
              className="settings-select"
            >
              <option value="Administrator">Administrator</option>
              <option value="Billing Manager">Billing Manager</option>
              <option value="Billing Specialist">Billing Specialist</option>
              <option value="Field Technician">Field Technician</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Department</label>
            <select
              value={settings.profile.department}
              onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
              className="settings-select"
            >
              <option value="Billing">Billing</option>
              <option value="Administration">Administration</option>
              <option value="Field Operations">Field Operations</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Phone Number</label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              className="settings-input"
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Timezone</label>
            <select
              value={settings.profile.timezone}
              onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
              className="settings-select"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">Security Settings</h3>
        <div className="space-y-4">
          <div className="settings-toggle">
            <div>
              <label className="settings-label">Two-Factor Authentication</label>
              <p className="settings-description">Add an extra layer of security to your account</p>
            </div>
            <label className={`settings-switch ${settings.security.twoFactorEnabled ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
          <div className="settings-field">
            <label className="settings-label">Session Timeout (minutes)</label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="settings-select"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          <div className="settings-toggle">
            <div>
              <label className="settings-label">Login Notifications</label>
              <p className="settings-description">Get notified when someone logs into your account</p>
            </div>
            <label className={`settings-switch ${settings.security.loginNotifications ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.security.loginNotifications}
                onChange={(e) => handleInputChange('security', 'loginNotifications', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPracticeSettings = () => (
    <div className="space-y-6">
      {/* Practice Information */}
      <div className="settings-section">
        <h3 className="settings-section-title">Practice Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="settings-field md:col-span-2">
            <label className="settings-label">Practice Name</label>
            <input
              type="text"
              value={settings.practice.name}
              onChange={(e) => handleInputChange('practice', 'name', e.target.value)}
              className="settings-input"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">NPI Number</label>
            <input
              type="text"
              value={settings.practice.npi}
              onChange={(e) => handleInputChange('practice', 'npi', e.target.value)}
              className="settings-input"
              placeholder="1234567890"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Tax ID</label>
            <input
              type="text"
              value={settings.practice.taxId}
              onChange={(e) => handleInputChange('practice', 'taxId', e.target.value)}
              className="settings-input"
              placeholder="12-3456789"
            />
          </div>
          <div className="settings-field md:col-span-2">
            <label className="settings-label">Address</label>
            <textarea
              value={settings.practice.address}
              onChange={(e) => handleInputChange('practice', 'address', e.target.value)}
              className="settings-textarea"
              rows={3}
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Phone Number</label>
            <input
              type="tel"
              value={settings.practice.phone}
              onChange={(e) => handleInputChange('practice', 'phone', e.target.value)}
              className="settings-input"
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Email Address</label>
            <input
              type="email"
              value={settings.practice.email}
              onChange={(e) => handleInputChange('practice', 'email', e.target.value)}
              className="settings-input"
              placeholder="billing@practice.com"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-6">
      {/* Billing Configuration */}
      <div className="settings-section">
        <h3 className="settings-section-title">Billing Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="settings-field">
            <label className="settings-label">Default Fee Schedule</label>
            <select
              value={settings.billing.defaultFeeSchedule}
              onChange={(e) => handleInputChange('billing', 'defaultFeeSchedule', e.target.value)}
              className="settings-select"
            >
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Commercial">Commercial</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Payment Terms (days)</label>
            <input
              type="number"
              value={settings.billing.paymentTerms}
              onChange={(e) => handleInputChange('billing', 'paymentTerms', parseInt(e.target.value))}
              className="settings-input"
              min="0"
              max="365"
            />
          </div>
          <div className="settings-field">
            <label className="settings-label">Late Fee Percentage</label>
            <div className="relative">
              <input
                type="number"
                value={settings.billing.lateFeePercentage}
                onChange={(e) => handleInputChange('billing', 'lateFeePercentage', parseFloat(e.target.value))}
                className="settings-input pr-8"
                min="0"
                max="100"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
          <div className="settings-field">
            <label className="settings-label">Minimum Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.billing.minimumPaymentAmount}
                onChange={(e) => handleInputChange('billing', 'minimumPaymentAmount', parseFloat(e.target.value))}
                className="settings-input pl-8"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <div className="settings-toggle mt-4">
          <div>
            <label className="settings-label">Auto-Billing</label>
            <p className="settings-description">Automatically generate and send bills</p>
          </div>
          <label className={`settings-switch ${settings.billing.autoBillingEnabled ? 'settings-switch-active' : ''}`}>
            <input
              type="checkbox"
              checked={settings.billing.autoBillingEnabled}
              onChange={(e) => handleInputChange('billing', 'autoBillingEnabled', e.target.checked)}
            />
            <span className="settings-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="settings-section">
        <h3 className="settings-section-title">Email Notifications</h3>
        <div className="space-y-4">
          <div className="settings-toggle">
            <div>
              <label className="settings-label">Email Notifications</label>
              <p className="settings-description">Receive notifications via email</p>
            </div>
            <label className={`settings-switch ${settings.notifications.emailNotifications ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
          <div className="settings-toggle">
            <div>
              <label className="settings-label">Claim Denials</label>
              <p className="settings-description">Get notified when claims are denied</p>
            </div>
            <label className={`settings-switch ${settings.notifications.claimDenials ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.notifications.claimDenials}
                onChange={(e) => handleInputChange('notifications', 'claimDenials', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
          <div className="settings-toggle">
            <div>
              <label className="settings-label">Payment Alerts</label>
              <p className="settings-description">Get notified when payments are received</p>
            </div>
            <label className={`settings-switch ${settings.notifications.paymentAlerts ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.notifications.paymentAlerts}
                onChange={(e) => handleInputChange('notifications', 'paymentAlerts', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
          <div className="settings-toggle">
            <div>
              <label className="settings-label">AR Aging Alerts</label>
              <p className="settings-description">Get notified about overdue accounts</p>
            </div>
            <label className={`settings-switch ${settings.notifications.arAgingAlerts ? 'settings-switch-active' : ''}`}>
              <input
                type="checkbox"
                checked={settings.notifications.arAgingAlerts}
                onChange={(e) => handleInputChange('notifications', 'arAgingAlerts', e.target.checked)}
              />
              <span className="settings-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="settings-section">
        <h3 className="settings-section-title">SMS Notifications</h3>
        <div className="settings-toggle">
          <div>
            <label className="settings-label">SMS Notifications</label>
            <p className="settings-description">Receive urgent notifications via SMS</p>
          </div>
          <label className={`settings-switch ${settings.notifications.smsNotifications ? 'settings-switch-active' : ''}`}>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
            />
            <span className="settings-slider"></span>
          </label>
        </div>
        
        {/* SMS Phone Number - Only show when SMS is enabled */}
        {settings.notifications.smsNotifications && (
          <div className="settings-field mt-4">
            <label className="settings-label">SMS Phone Number</label>
            <div className="flex items-center space-x-3">
              <input
                type="tel"
                value={settings.notifications.smsPhoneNumber || settings.profile.phone}
                onChange={(e) => handleInputChange('notifications', 'smsPhoneNumber', e.target.value)}
                className="settings-input flex-1"
                placeholder="(555) 123-4567"
              />
              <button
                type="button"
                onClick={() => {
                  const profilePhone = settings.profile.phone
                  if (profilePhone) {
                    handleInputChange('notifications', 'smsPhoneNumber', profilePhone)
                    showConfirmation('info', 'Phone number copied from profile')
                  } else {
                    showConfirmation('error', 'No phone number found in profile')
                  }
                }}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Use Profile
              </button>
            </div>
            <p className="settings-description mt-1">
              {settings.notifications.smsPhoneNumber || settings.profile.phone 
                ? `SMS notifications will be sent to: ${settings.notifications.smsPhoneNumber || settings.profile.phone}`
                : 'Enter a phone number to receive SMS notifications'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderInterfaceSettings = () => (
    <div className="space-y-6">
      {/* Display Settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">Display Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="settings-field">
            <label className="settings-label">Theme</label>
            <select
              value={settings.interface.theme}
              onChange={(e) => handleInputChange('interface', 'theme', e.target.value)}
              className="settings-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
            {settings.interface.theme === 'auto' && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">Auto Theme Active</p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      The theme will automatically switch based on your system's dark/light mode preference. 
                      This means the interface will change when you switch your operating system's theme settings.
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 mt-2 text-xs">
                      💡 Tip: You can change your system theme in your OS settings to see the effect immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="settings-field">
            <label className="settings-label">Language</label>
            <select
              value={settings.interface.language}
              onChange={(e) => handleInputChange('interface', 'language', e.target.value)}
              className="settings-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Date Format</label>
            <select
              value={settings.interface.dateFormat}
              onChange={(e) => handleInputChange('interface', 'dateFormat', e.target.value)}
              className="settings-select"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Time Format</label>
            <select
              value={settings.interface.timeFormat}
              onChange={(e) => handleInputChange('interface', 'timeFormat', e.target.value)}
              className="settings-select"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Currency</label>
            <select
              value={settings.interface.currency}
              onChange={(e) => handleInputChange('interface', 'currency', e.target.value)}
              className="settings-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="settings-field">
            <label className="settings-label">Decimal Places</label>
            <select
              value={settings.interface.decimalPlaces}
              onChange={(e) => handleInputChange('interface', 'decimalPlaces', parseInt(e.target.value))}
              className="settings-select"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'practice':
        return renderPracticeSettings()
      case 'billing':
        return renderBillingSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'interface':
        return renderInterfaceSettings()
      default:
        return renderProfileSettings()
    }
  }

  if (!isOpen) return null

  return (
    <div className="settings-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="settings-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="settings-page-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="settings-page-header-inner flex items-center justify-between h-16">
            <div className="settings-page-header-left flex items-center space-x-4">
              <div className="settings-page-title-section">
                <h1 className="settings-page-title text-xl font-semibold text-gray-900 dark:text-white">
                  Settings
                </h1>
                <p className="settings-page-subtitle text-sm text-gray-500 dark:text-gray-400">
                  Manage your application preferences and configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="settings-layout grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="settings-sidebar lg:col-span-1">
              <nav className="settings-nav space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`settings-nav-item w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={tab.icon} size={20} />
                      <div>
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-sm opacity-75">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="settings-main lg:col-span-3">
            <div className="settings-content bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="settings-content-header px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="settings-content-title text-xl font-semibold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
                <p className="settings-content-description text-gray-600 dark:text-gray-400 mt-1">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
              
              <div className="settings-content-body p-6">
                {renderTabContent()}
              </div>

              {/* Footer Actions */}
              {hasChanges && (
                <div className="settings-content-footer px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      You have unsaved changes
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleReset}
                        className="settings-btn-secondary px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSave}
                        className="settings-btn-primary px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Tab Navigation */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-4 py-3">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name={tab.icon} className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Active Tab Header */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={tabs.find(t => t.id === activeTab)?.icon || 'settings'} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tabs.find(t => t.id === activeTab)?.description}
              </p>
            </div>

            {/* Mobile Settings Content */}
            <div className="p-4">
              {renderTabContent()}
            </div>

            {/* Mobile Footer Actions */}
            {hasChanges && (
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex flex-col space-y-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    You have unsaved changes
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className={`fixed top-20 right-4 z-[10002] px-6 py-4 rounded-lg shadow-lg max-w-sm ${
          confirmationMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
            : confirmationMessage.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Icon 
              name={confirmationMessage.type === 'success' ? 'check-circle' : 
                    confirmationMessage.type === 'error' ? 'x-circle' : 'info'} 
              size={20} 
            />
            <span className="font-medium">{confirmationMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage

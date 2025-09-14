import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Shield, 
  Settings, 
  Eye, 
  Save,
  X,
  Check,
  Clock,
  Monitor
} from 'lucide-react'

interface ProfileData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    jobTitle: string
    department: string
    employeeId: string
    hireDate: string
    manager: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    activeSessions: Array<{
      id: string
      device: string
      location: string
      lastActive: string
      current: boolean
    }>
    securityQuestions: Array<{
      question: string
      answer: string
    }>
  }
  preferences: {
    notifications: {
      email: boolean
      sms: boolean
      smsPhoneNumber: string
      push: boolean
      weeklyDigest: boolean
      systemUpdates: boolean
      claimDenials: boolean
      paymentAlerts: boolean
      arAgingAlerts: boolean
    }
    interface: {
      language: string
      timezone: string
      dateFormat: string
      timeFormat: string
      currency: string
      decimalPlaces: number
    }
    dashboardLayout: string
  }
  roles: {
    currentRoles: Array<{
      name: string
      description: string
      assignedDate: string
    }>
    permissions: Array<{
      category: string
      permissions: string[]
    }>
  }
  activity: {
    recentActivity: Array<{
      id: string
      action: string
      timestamp: string
      details: string
    }>
    loginHistory: Array<{
      id: string
      timestamp: string
      ipAddress: string
      location: string
      device: string
      success: boolean
    }>
  }
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [originalData, setOriginalData] = useState<ProfileData | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      firstName: user?.fullName?.split(' ')[0] || 'Demo',
      lastName: user?.fullName?.split(' ')[1] || 'User',
      email: user?.email || 'demo.user@alivi.com',
      phone: '(555) 123-4567',
      jobTitle: 'Field Technician',
      department: 'HEDIS Operations',
      employeeId: 'EMP-001',
      hireDate: '2023-01-15',
      manager: 'Sarah Johnson',
      address: {
        street: '123 Healthcare Ave',
        city: 'Medical City',
        state: 'CA',
        zipCode: '90210'
      },
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Spouse',
        phone: '(555) 987-6543'
      }
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-15',
      activeSessions: [
        {
          id: '1',
          device: 'Chrome on MacBook Pro',
          location: 'San Francisco, CA',
          lastActive: '2024-01-20 10:30 AM',
          current: true
        },
        {
          id: '2',
          device: 'Safari on iPhone',
          location: 'San Francisco, CA',
          lastActive: '2024-01-19 3:45 PM',
          current: false
        }
      ],
      securityQuestions: [
        {
          question: 'What was the name of your first pet?',
          answer: 'Fluffy'
        },
        {
          question: 'What city were you born in?',
          answer: 'New York'
        }
      ]
    },
  preferences: {
    notifications: {
      email: true,
      sms: false,
      smsPhoneNumber: '',
      push: true,
      weeklyDigest: true,
      systemUpdates: false,
      claimDenials: true,
      paymentAlerts: true,
      arAgingAlerts: true
    },
    interface: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      decimalPlaces: 2
    },
    dashboardLayout: 'default'
  },
    roles: {
      currentRoles: [
        {
          name: 'Field Technician',
          description: 'Can access HEDIS screening tools and patient data',
          assignedDate: '2023-01-15'
        },
        {
          name: 'Report Viewer',
          description: 'Can view reports and analytics',
          assignedDate: '2023-02-01'
        }
      ],
      permissions: [
        {
          category: 'Patient Data',
          permissions: ['View', 'Edit', 'Create']
        },
        {
          category: 'Reports',
          permissions: ['View', 'Export']
        },
        {
          category: 'Settings',
          permissions: ['View']
        }
      ]
    },
    activity: {
      recentActivity: [
        {
          id: '1',
          action: 'Updated profile information',
          timestamp: '2024-01-20 10:30 AM',
          details: 'Changed phone number and address'
        },
        {
          id: '2',
          action: 'Logged in',
          timestamp: '2024-01-20 09:15 AM',
          details: 'Successful login from Chrome on MacBook Pro'
        },
        {
          id: '3',
          action: 'Viewed HEDIS report',
          timestamp: '2024-01-19 2:30 PM',
          details: 'Accessed Diabetes Mellitus compliance report'
        }
      ],
      loginHistory: [
        {
          id: '1',
          timestamp: '2024-01-20 09:15 AM',
          ipAddress: '192.168.1.100',
          location: 'San Francisco, CA',
          device: 'Chrome on MacBook Pro',
          success: true
        },
        {
          id: '2',
          timestamp: '2024-01-19 3:45 PM',
          ipAddress: '192.168.1.100',
          location: 'San Francisco, CA',
          device: 'Safari on iPhone',
          success: true
        },
        {
          id: '3',
          timestamp: '2024-01-18 11:20 AM',
          ipAddress: '192.168.1.100',
          location: 'San Francisco, CA',
          device: 'Chrome on MacBook Pro',
          success: true
        }
      ]
    }
  })

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User, description: 'Manage your personal information and contact details' },
    { id: 'security', name: 'Security & Privacy', icon: Shield, description: 'Password, 2FA, and security settings' },
    { id: 'preferences', name: 'Preferences', icon: Settings, description: 'Notification, display, and interface preferences' },
    { id: 'roles', name: 'Roles & Access', icon: Eye, description: 'View your roles and permissions' },
    { id: 'activity', name: 'Activity', icon: Clock, description: 'Recent activity and login history' }
  ]


  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ProfileData],
        [subsection]: {
          ...(prev[section as keyof ProfileData] as any)[subsection],
          [field]: value
        }
      }
    }))
  }

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (000) 000-0000
    if (phoneNumber.length === 0) return ''
    if (phoneNumber.length <= 3) return `(${phoneNumber}`
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // Handle phone number input changes
  const handlePhoneChange = (section: string, subsection: string, field: string, value: string) => {
    const formattedValue = formatPhoneNumber(value)
    handleNestedInputChange(section, subsection, field, formattedValue)
  }

  // Password validation rules
  const validatePassword = (password: string) => {
    const rules = [
      { test: password.length >= 8, message: 'At least 8 characters' },
      { test: /[A-Z]/.test(password), message: 'One uppercase letter' },
      { test: /[a-z]/.test(password), message: 'One lowercase letter' },
      { test: /\d/.test(password), message: 'One number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'One special character' }
    ]
    
    const passedRules = rules.filter(rule => rule.test).length
    setPasswordStrength(passedRules)
    
    return rules.filter(rule => !rule.test).map(rule => rule.message)
  }

  // Handle password input changes
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'newPassword') {
      const errors = validatePassword(value)
      setPasswordErrors(errors)
    }
  }

  // Handle Change Password
  const handleChangePassword = () => {
    setShowPasswordModal(true)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordErrors([])
    setPasswordStrength(0)
  }

  // Handle password form submission
  const handlePasswordSubmit = () => {
    const errors: string[] = []
    
    if (!passwordData.currentPassword) {
      errors.push('Current password is required')
    }
    
    if (!passwordData.newPassword) {
      errors.push('New password is required')
    } else {
      const passwordValidationErrors = validatePassword(passwordData.newPassword)
      errors.push(...passwordValidationErrors)
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Passwords do not match')
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password')
    }
    
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }
    
    // Simulate password change
    setShowPasswordModal(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log('Password changed successfully')
  }

  // Close password modal
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordErrors([])
    setPasswordStrength(0)
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  // Handle 2FA toggle
  const handleToggle2FA = () => {
    const newValue = !profileData.security.twoFactorEnabled
    setProfileData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        twoFactorEnabled: newValue
      }
    }))
    console.log(`2FA ${newValue ? 'enabled' : 'disabled'}`)
  }

  // Handle session revocation
  const handleRevokeSession = (sessionId: string) => {
    setProfileData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        activeSessions: prev.security.activeSessions.filter(session => session.id !== sessionId)
      }
    }))
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log(`Session ${sessionId} revoked`)
  }

  // Handle security question update
  const handleUpdateSecurityAnswer = (questionId: string) => {
    // In a real app, this would open a modal to update the answer
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log(`Update security answer for question ${questionId}`)
  }

  // Handle Use Profile phone number
  const handleUseProfilePhone = () => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          smsPhoneNumber: prev.personalInfo.phone
        }
      }
    }))
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    console.log('Using profile phone number for SMS')
  }

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      const twoFactorChanged = originalData?.security.twoFactorEnabled !== profileData.security.twoFactorEnabled
      
      setOriginalData(JSON.parse(JSON.stringify(profileData)))
      setHasChanges(false)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      
      // Log specific changes
      if (twoFactorChanged) {
        console.log(`2FA ${profileData.security.twoFactorEnabled ? 'enabled' : 'disabled'} successfully`)
      }
      console.log('Profile saved:', profileData)
    }, 1000)
  }

  const handleCancel = () => {
    if (originalData) {
      setProfileData(JSON.parse(JSON.stringify(originalData)))
    }
    setHasChanges(false)
  }

  // Initialize original data for change tracking
  useEffect(() => {
    if (!originalData) {
      setOriginalData(JSON.parse(JSON.stringify(profileData)))
    }
  }, [profileData, originalData])

  // Track changes by comparing current data with original
  useEffect(() => {
    if (originalData) {
      const hasDataChanged = JSON.stringify(profileData) !== JSON.stringify(originalData)
      setHasChanges(hasDataChanged)
    }
  }, [profileData, originalData])


  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{profileData.personalInfo.jobTitle}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{profileData.personalInfo.department}</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={profileData.personalInfo.firstName}
            onChange={(e) => handleNestedInputChange('personalInfo', '', 'firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={profileData.personalInfo.lastName}
            onChange={(e) => handleNestedInputChange('personalInfo', '', 'lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={profileData.personalInfo.email}
            onChange={(e) => handleNestedInputChange('personalInfo', '', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.personalInfo.phone}
            onChange={(e) => handlePhoneChange('personalInfo', '', 'phone', e.target.value)}
            placeholder="(000) 000-0000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <select
            value={profileData.personalInfo.jobTitle}
            onChange={(e) => handleNestedInputChange('personalInfo', '', 'jobTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Job Title</option>
            <option value="Field Technician">Field Technician</option>
            <option value="Billing Specialist">Billing Specialist</option>
            <option value="Claims Processor">Claims Processor</option>
            <option value="Medical Coder">Medical Coder</option>
            <option value="Revenue Cycle Manager">Revenue Cycle Manager</option>
            <option value="Compliance Officer">Compliance Officer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Customer Service Representative">Customer Service Representative</option>
            <option value="Quality Assurance Specialist">Quality Assurance Specialist</option>
            <option value="Operations Manager">Operations Manager</option>
            <option value="Administrative Assistant">Administrative Assistant</option>
            <option value="IT Support Specialist">IT Support Specialist</option>
            <option value="Training Coordinator">Training Coordinator</option>
            <option value="Audit Specialist">Audit Specialist</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            value={profileData.personalInfo.department}
            onChange={(e) => handleNestedInputChange('personalInfo', '', 'department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select Department</option>
            <option value="HEDIS Operations">HEDIS Operations</option>
            <option value="Billing & Claims">Billing & Claims</option>
            <option value="Revenue Cycle">Revenue Cycle</option>
            <option value="Compliance">Compliance</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Customer Service">Customer Service</option>
            <option value="IT Support">IT Support</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Training">Training</option>
            <option value="Audit">Audit</option>
            <option value="Administration">Administration</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employee ID
          </label>
          <input
            type="text"
            value={profileData.personalInfo.employeeId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hire Date
          </label>
          <input
            type="date"
            value={profileData.personalInfo.hireDate}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={profileData.personalInfo.address.street}
              onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={profileData.personalInfo.address.city}
              onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <select
              value={profileData.personalInfo.address.state}
              onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
              <option value="DC">District of Columbia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={profileData.personalInfo.address.zipCode}
              onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={profileData.personalInfo.emergencyContact.name}
              onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship
            </label>
            <select
              value={profileData.personalInfo.emergencyContact.relationship}
              onChange={(e) => handleNestedInputChange('personalInfo', 'emergencyContact', 'relationship', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Relationship</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Partner">Partner</option>
              <option value="Friend">Friend</option>
              <option value="Relative">Relative</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileData.personalInfo.emergencyContact.phone}
              onChange={(e) => handlePhoneChange('personalInfo', 'emergencyContact', 'phone', e.target.value)}
              placeholder="(000) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Password Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password & Security</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Password</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last changed: {profileData.security.lastPasswordChange}
              </p>
            </div>
            <button 
              onClick={handleChangePassword}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profileData.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button 
              onClick={handleToggle2FA}
              className={`px-4 py-2 rounded-lg transition-colors ${
                profileData.security.twoFactorEnabled 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {profileData.security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h4>
        <div className="space-y-3">
          {profileData.security.activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{session.device}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.location}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Last active: {session.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {session.current && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Current
                  </span>
                )}
                {!session.current && (
                  <button 
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Questions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Questions</h4>
        <div className="space-y-4">
          {profileData.security.securityQuestions.map((q, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">{q.question}</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Answer: ••••••••</p>
              <button 
                onClick={() => handleUpdateSecurityAnswer(q.question)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Update Answer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h4>
        <div className="space-y-4">
          {Object.entries(profileData.preferences.notifications).map(([key, value]) => {
            if (key === 'smsPhoneNumber') return null // Handle separately
            return (
              <div key={key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'sms' && 'Receive notifications via SMS'}
                      {key === 'push' && 'Receive push notifications in browser'}
                      {key === 'weeklyDigest' && 'Receive weekly summary emails'}
                      {key === 'systemUpdates' && 'Receive system update notifications'}
                      {key === 'claimDenials' && 'Get notified about claim denials'}
                      {key === 'paymentAlerts' && 'Receive payment alerts and updates'}
                      {key === 'arAgingAlerts' && 'Get alerts for aging accounts receivable'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNestedInputChange('preferences', 'notifications', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* SMS Phone Number Input - Show when SMS is enabled */}
                {key === 'sms' && value && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMS Phone Number
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="tel"
                        value={profileData.preferences.notifications.smsPhoneNumber}
                        onChange={(e) => handlePhoneChange('preferences', 'notifications', 'smsPhoneNumber', e.target.value)}
                        placeholder="(000) 000-0000"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button 
                        onClick={handleUseProfilePhone}
                        className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Use Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Interface Preferences */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interface Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={profileData.preferences.interface.language}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={profileData.preferences.interface.timezone}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={profileData.preferences.interface.dateFormat}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Format
            </label>
            <select
              value={profileData.preferences.interface.timeFormat}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={profileData.preferences.interface.currency}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Decimal Places
            </label>
            <select
              value={profileData.preferences.interface.decimalPlaces}
              onChange={(e) => handleNestedInputChange('preferences', 'interface', 'decimalPlaces', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  )

  const renderRoles = () => (
    <div className="space-y-6">
      {/* Current Roles */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Roles</h4>
        <div className="space-y-3">
          {profileData.roles.currentRoles.map((role, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{role.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Assigned: {role.assignedDate}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Permissions</h4>
        <div className="space-y-4">
          {profileData.roles.permissions.map((category, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">{category.category}</h5>
              <div className="flex flex-wrap gap-2">
                {category.permissions.map((permission, permIndex) => (
                  <span
                    key={permIndex}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderActivity = () => (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {profileData.activity.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 dark:text-white">{activity.action}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Login History</h4>
        <div className="space-y-3">
          {profileData.activity.loginHistory.map((login) => (
            <div key={login.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  login.success 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}>
                  <Monitor className={`w-4 h-4 ${
                    login.success 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">{login.device}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{login.location}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{login.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">{login.ipAddress}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  login.success 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {login.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo()
      case 'security':
        return renderSecurity()
      case 'preferences':
        return renderPreferences()
      case 'roles':
        return renderRoles()
      case 'activity':
        return renderActivity()
      default:
        return renderPersonalInfo()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your personal information, security settings, and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {renderTabContent()}
              </div>
              
              {/* Footer Actions */}
              {hasChanges && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      You have unsaved changes
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                      >
                        <X className="w-4 h-4 mr-2 inline" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2 inline" />
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

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="truncate">{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Footer Actions */}
      {hasChanges && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex flex-col space-y-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
              You have unsaved changes
            </span>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[99999]">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
                <button
                  onClick={handleClosePasswordModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Password strength: {
                          passwordStrength <= 2 ? 'Weak' :
                          passwordStrength <= 3 ? 'Medium' : 'Strong'
                        }
                      </p>
                    </div>
                  )}

                  {/* Password Rules */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-1">Password must contain:</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center ${passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{passwordData.newPassword.length >= 8 ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${/\d/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{/\d/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                        One number
                      </li>
                      <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>

                {/* Error Messages */}
                {passwordErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage

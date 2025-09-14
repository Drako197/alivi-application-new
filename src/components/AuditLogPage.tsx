import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Settings,
  CreditCard,
  FileCheck,
  Users,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react'

// Types
interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  action: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  module: string
  description: string
  ipAddress: string
  userAgent: string
  affectedEntity?: string
  oldValue?: string
  newValue?: string
  sessionId: string
  outcome: 'success' | 'failure' | 'warning'
}

const AuditLogPage: React.FC = () => {
  const { user } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('7d')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  
  // Modal states
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Initialize data
  useEffect(() => {
    initializeAuditLogs()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [auditLogs, searchTerm, dateRange, categoryFilter, severityFilter, moduleFilter, userFilter, outcomeFilter])

  const initializeAuditLogs = () => {
    const mockLogs: AuditLogEntry[] = [
      // Recent logs (last 24 hours)
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user-1',
        userName: 'John Smith',
        userEmail: 'john.smith@alivi.com',
        action: 'LOGIN_SUCCESS',
        category: 'Authentication',
        severity: 'low',
        module: 'System',
        description: 'User successfully logged into the system',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123456',
        outcome: 'success'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        userId: 'user-2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@alivi.com',
        action: 'PATIENT_DATA_ACCESS',
        category: 'Data Access',
        severity: 'medium',
        module: 'Patients',
        description: 'Accessed patient record: John Doe (ID: 12345)',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'sess-123457',
        affectedEntity: 'Patient: John Doe (ID: 12345)',
        outcome: 'success'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        userId: 'user-3',
        userName: 'Mike Davis',
        userEmail: 'mike.davis@alivi.com',
        action: 'CLAIM_MODIFIED',
        category: 'Data Modification',
        severity: 'high',
        module: 'Claims',
        description: 'Modified claim information for patient ID: 67890',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123458',
        affectedEntity: 'Claim ID: CLM-2024-001234',
        oldValue: 'Status: Pending',
        newValue: 'Status: Approved',
        outcome: 'success'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        userId: 'user-4',
        userName: 'Lisa Wilson',
        userEmail: 'lisa.wilson@alivi.com',
        action: 'LOGIN_FAILED',
        category: 'Security',
        severity: 'medium',
        module: 'System',
        description: 'Failed login attempt with invalid credentials',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123459',
        outcome: 'failure'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        userId: 'user-1',
        userName: 'John Smith',
        userEmail: 'john.smith@alivi.com',
        action: 'ROLE_PERMISSION_CHANGED',
        category: 'System Configuration',
        severity: 'high',
        module: 'Roles',
        description: 'Modified permissions for role: Billing Specialist',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123460',
        affectedEntity: 'Role: Billing Specialist',
        oldValue: 'Permissions: 15',
        newValue: 'Permissions: 18',
        outcome: 'success'
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        userId: 'user-5',
        userName: 'David Brown',
        userEmail: 'david.brown@alivi.com',
        action: 'HEDIS_SCREENING_CREATED',
        category: 'Business Operations',
        severity: 'low',
        module: 'HEDIS',
        description: 'Created new HEDIS screening for patient ID: 11111',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'sess-123461',
        affectedEntity: 'HEDIS Screening ID: HED-2024-001',
        outcome: 'success'
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        userId: 'user-6',
        userName: 'Emma Garcia',
        userEmail: 'emma.garcia@alivi.com',
        action: 'BILLING_INVOICE_GENERATED',
        category: 'Business Operations',
        severity: 'low',
        module: 'Billing',
        description: 'Generated invoice for patient ID: 22222',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123462',
        affectedEntity: 'Invoice ID: INV-2024-001234',
        outcome: 'success'
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        userId: 'user-7',
        userName: 'Robert Taylor',
        userEmail: 'robert.taylor@alivi.com',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        category: 'Security',
        severity: 'critical',
        module: 'System',
        description: 'Attempted to access restricted patient data without proper authorization',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123463',
        affectedEntity: 'Patient Records - Restricted Access',
        outcome: 'failure'
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        userId: 'user-2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah.johnson@alivi.com',
        action: 'PASSWORD_CHANGED',
        category: 'Authentication',
        severity: 'medium',
        module: 'Profile',
        description: 'User changed their password',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'sess-123464',
        outcome: 'success'
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        userId: 'user-8',
        userName: 'Jennifer Martinez',
        userEmail: 'jennifer.martinez@alivi.com',
        action: 'USER_CREATED',
        category: 'User Management',
        severity: 'high',
        module: 'Users',
        description: 'Created new user account: test.user@alivi.com',
        ipAddress: '192.168.1.107',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess-123465',
        affectedEntity: 'User: test.user@alivi.com',
        outcome: 'success'
      }
    ]
    
    setAuditLogs(mockLogs)
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...auditLogs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date range filter
    const now = new Date()
    const dateFilterMap: { [key: string]: number } = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }
    
    if (dateRange !== 'all' && dateFilterMap[dateRange]) {
      const cutoffTime = now.getTime() - dateFilterMap[dateRange]
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() > cutoffTime)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter)
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter)
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter)
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userId === userFilter)
    }

    // Outcome filter
    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(log => log.outcome === outcomeFilter)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'low':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Lock className="w-4 h-4" />
      case 'Data Access':
        return <Eye className="w-4 h-4" />
      case 'Data Modification':
        return <Edit className="w-4 h-4" />
      case 'Security':
        return <Shield className="w-4 h-4" />
      case 'System Configuration':
        return <Settings className="w-4 h-4" />
      case 'Business Operations':
        return <FileCheck className="w-4 h-4" />
      case 'User Management':
        return <Users className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getUniqueUsers = () => {
    const users = auditLogs.reduce((acc, log) => {
      if (!acc.find(u => u.id === log.userId)) {
        acc.push({ id: log.userId, name: log.userName })
      }
      return acc
    }, [] as { id: string; name: string }[])
    return users
  }

  const getUniqueModules = () => {
    return [...new Set(auditLogs.map(log => log.module))]
  }

  const getUniqueCategories = () => {
    return [...new Set(auditLogs.map(log => log.category))]
  }

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Severity', 'Module', 'Description', 'IP Address', 'Outcome'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userName,
        log.action,
        log.category,
        log.severity,
        log.module,
        log.description,
        log.ipAddress,
        log.outcome
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="audit-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="audit-header-title-section">
              <h1 className="audit-page-title text-2xl font-bold text-gray-900 dark:text-white">
                Audit Log
              </h1>
              <p className="audit-page-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                System activity and security logs
              </p>
            </div>
            <div className="audit-header-actions flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="audit-export-btn inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="audit-filters-btn inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="audit-search-section mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="audit-search-input w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="audit-filters-section bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Module
                </label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Modules</option>
                  {getUniqueModules().map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Users</option>
                  {getUniqueUsers().map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Outcome
                </label>
                <select
                  value={outcomeFilter}
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Outcomes</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="audit-results-summary mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredLogs.length} of {auditLogs.length} audit log entries
          </p>
        </div>

        {/* Audit Log Entries */}
        <div className="audit-logs-container space-y-4">
          {currentLogs.map((log) => (
            <div
              key={log.id}
              className={`audit-log-entry p-4 rounded-lg border ${getSeverityColor(log.severity)} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => handleViewDetails(log)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="audit-log-icon flex-shrink-0 mt-1">
                    {getCategoryIcon(log.category)}
                  </div>
                  <div className="audit-log-content flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="audit-log-action font-medium text-gray-900 dark:text-white">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="audit-log-severity">
                        {getSeverityIcon(log.severity)}
                      </span>
                      <span className="audit-log-outcome">
                        {getOutcomeIcon(log.outcome)}
                      </span>
                    </div>
                    <p className="audit-log-description text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {log.description}
                    </p>
                    <div className="audit-log-meta flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="audit-log-user">
                        <User className="w-3 h-3 mr-1 inline" />
                        {log.userName}
                      </span>
                      <span className="audit-log-category">
                        {log.category}
                      </span>
                      <span className="audit-log-module">
                        {log.module}
                      </span>
                      <span className="audit-log-ip">
                        IP: {log.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="audit-log-timestamp text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="audit-pagination mt-8 flex items-center justify-between">
            <div className="audit-pagination-info text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
            </div>
            <div className="audit-pagination-controls flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredLogs.length === 0 && (
          <div className="audit-no-results text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audit Log Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setSelectedLog(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="audit-detail-content space-y-4">
                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timestamp
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.userName} ({selectedLog.userEmail})
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Action
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.action.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.category}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Severity
                  </label>
                  <div className="audit-detail-value flex items-center space-x-2">
                    {getSeverityIcon(selectedLog.severity)}
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Module
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.module}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.description}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    IP Address
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                    {selectedLog.ipAddress}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Agent
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session ID
                  </label>
                  <p className="audit-detail-value text-sm text-gray-900 dark:text-white font-mono">
                    {selectedLog.sessionId}
                  </p>
                </div>

                <div className="audit-detail-row">
                  <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Outcome
                  </label>
                  <div className="audit-detail-value flex items-center space-x-2">
                    {getOutcomeIcon(selectedLog.outcome)}
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {selectedLog.outcome}
                    </span>
                  </div>
                </div>

                {selectedLog.affectedEntity && (
                  <div className="audit-detail-row">
                    <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Affected Entity
                    </label>
                    <p className="audit-detail-value text-sm text-gray-900 dark:text-white">
                      {selectedLog.affectedEntity}
                    </p>
                  </div>
                )}

                {selectedLog.oldValue && (
                  <div className="audit-detail-row">
                    <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Previous Value
                    </label>
                    <p className="audit-detail-value text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-2 rounded border">
                      {selectedLog.oldValue}
                    </p>
                  </div>
                )}

                {selectedLog.newValue && (
                  <div className="audit-detail-row">
                    <label className="audit-detail-label block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Value
                    </label>
                    <p className="audit-detail-value text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-2 rounded border">
                      {selectedLog.newValue}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogPage


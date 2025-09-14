import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import { getDemoUserFirstName } from '../utils/nameGenerator'
import { useAuth } from '../contexts/AuthContext'

// Types for user management
export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  lastLogin: string
  avatar?: string
  permissions: string[]
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

interface UsersPageProps {
  isOpen?: boolean
  onClose?: () => void
}

const UsersPage: React.FC<UsersPageProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth()
  
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserActions, setShowUserActions] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    notes: ''
  })
  const [confirmationMessage, setConfirmationMessage] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    show: boolean
  }>({
    type: 'info',
    message: '',
    show: false
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'delete'
    user: User | null
    message: string
    confirmText: string
    confirmClass: string
  } | null>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserActions) {
        setShowUserActions(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserActions])

  // Mock data for demonstration
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockUsers: User[] = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@alivihealth.com',
            role: 'Physician',
            department: 'Cardiology',
            status: 'active',
            lastLogin: '2024-01-15 09:30',
            permissions: ['view_patients', 'edit_patients', 'view_reports', 'manage_hedis']
          },
          {
            id: '2',
            name: 'Mike Chen',
            email: 'mike.chen@alivihealth.com',
            role: 'Billing Specialist',
            department: 'Finance',
            status: 'active',
            lastLogin: '2024-01-15 08:45',
            permissions: ['view_claims', 'edit_claims', 'view_reports', 'manage_pic']
          },
          {
            id: '3',
            name: 'Lisa Rodriguez',
            email: 'lisa.rodriguez@alivihealth.com',
            role: 'Nurse',
            department: 'Primary Care',
            status: 'active',
            lastLogin: '2024-01-14 16:20',
            permissions: ['view_patients', 'edit_patients', 'view_reports']
          },
          {
            id: '4',
            name: 'David Kim',
            email: 'david.kim@alivihealth.com',
            role: 'System Administrator',
            department: 'IT',
            status: 'active',
            lastLogin: '2024-01-15 10:15',
            permissions: ['admin_all', 'manage_users', 'view_audit', 'system_config']
          },
          {
            id: '5',
            name: 'Jennifer Walsh',
            email: 'jennifer.walsh@alivihealth.com',
            role: 'Office Manager',
            department: 'Administration',
            status: 'pending',
            lastLogin: 'Never',
            permissions: ['view_reports', 'manage_staff', 'view_analytics']
          }
        ]

        const mockRoles: UserRole[] = [
          {
            id: 'physician',
            name: 'Physician',
            description: 'Full clinical access and patient management',
            permissions: ['view_patients', 'edit_patients', 'view_reports', 'manage_hedis'],
            color: 'blue'
          },
          {
            id: 'nurse',
            name: 'Nurse',
            description: 'Patient care and documentation access',
            permissions: ['view_patients', 'edit_patients', 'view_reports'],
            color: 'green'
          },
          {
            id: 'billing',
            name: 'Billing Specialist',
            description: 'Claims and financial data management',
            permissions: ['view_claims', 'edit_claims', 'view_reports', 'manage_pic'],
            color: 'purple'
          },
          {
            id: 'admin',
            name: 'System Administrator',
            description: 'Full system access and user management',
            permissions: ['admin_all', 'manage_users', 'view_audit', 'system_config'],
            color: 'red'
          },
          {
            id: 'manager',
            name: 'Office Manager',
            description: 'Staff management and reporting access',
            permissions: ['view_reports', 'manage_staff', 'view_analytics'],
            color: 'orange'
          }
        ]

        setUsers(mockUsers)
        setRoles(mockRoles)
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.name === role)
    return roleData?.color || 'gray'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'inactive': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
  }

  const handleCloseUserDetails = () => {
    setSelectedUser(null)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditUser(true)
    setShowUserActions(null)
  }

  const handleSaveEditUser = () => {
    if (!editingUser) return
    
    if (!editingUser.name || !editingUser.email || !editingUser.role || !editingUser.department) {
      showConfirmation('error', 'Please fill in all required fields')
      return
    }

    // Update the user in the users array
    setUsers(users.map(u => 
      u.id === editingUser.id 
        ? { ...u, ...editingUser }
        : u
    ))
    
    showConfirmation('success', `User "${editingUser.name}" has been updated successfully`)
    setShowEditUser(false)
    setEditingUser(null)
  }

  const handleEditInputChange = (field: string, value: string) => {
    if (!editingUser) return
    setEditingUser({ ...editingUser, [field]: value })
  }

  const handleDeactivateUser = (user: User) => {
    const action = user.status === 'active' ? 'deactivate' : 'activate'
    const actionText = user.status === 'active' ? 'Deactivate' : 'Activate'
    
    // Show confirmation modal for deactivation
    if (user.status === 'active') {
      setConfirmAction({
        type: 'deactivate',
        user: user,
        message: `Are you sure you want to deactivate ${user.name}? They will lose access to the system.`,
        confirmText: 'Deactivate User',
        confirmClass: 'bg-orange-600 hover:bg-orange-700'
      })
      setShowConfirmModal(true)
      setShowUserActions(null)
      return
    }
    
    // For activation, proceed directly
    const newStatus = 'active'
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: newStatus as 'active' | 'inactive' | 'pending' }
        : u
    ))
    
    showConfirmation('success', `User "${user.name}" has been activated successfully`)
    setShowUserActions(null)
  }

  const handleDeleteUser = (user: User) => {
    setConfirmAction({
      type: 'delete',
      user: user,
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone and will permanently remove all their data.`,
      confirmText: 'Delete User',
      confirmClass: 'bg-red-600 hover:bg-red-700'
    })
    setShowConfirmModal(true)
    setShowUserActions(null)
  }

  const handleToggleUserActions = (userId: string) => {
    setShowUserActions(showUserActions === userId ? null : userId)
  }

  const handleConfirmAction = () => {
    if (!confirmAction || !confirmAction.user) return

    if (confirmAction.type === 'deactivate') {
      const user = confirmAction.user
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: 'inactive' as 'active' | 'inactive' | 'pending' }
          : u
      ))
      showConfirmation('success', `User "${user.name}" has been deactivated successfully`)
    } else if (confirmAction.type === 'delete') {
      const user = confirmAction.user
      setUsers(users.filter(u => u.id !== user.id))
      showConfirmation('success', `User "${user.name}" has been deleted successfully`)
    }

    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const handleCancelAction = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.department) {
      showConfirmation('error', 'Please fill in all required fields')
      return
    }

    // Create new user
    const user: User = {
      id: `user-${Date.now()}`, // Simple ID generation
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
      lastLogin: 'Never',
      permissions: roles.find(r => r.name === newUser.role)?.permissions || []
    }

    // Add to users list
    setUsers([...users, user])
    
    // Show success message
    showConfirmation('success', `User "${newUser.name}" has been added successfully`)
    
    // Reset form and close modal
    setNewUser({
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'active',
      notes: ''
    })
    setShowAddUser(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const showConfirmation = (type: 'success' | 'error' | 'info', message: string) => {
    setConfirmationMessage({ type, message, show: true })
    setTimeout(() => {
      setConfirmationMessage(prev => ({ ...prev, show: false }))
    }, 4000) // Auto-hide after 4 seconds
  }

  const handleOpenAddUser = () => {
    setNewUser({
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'active',
      notes: ''
    })
    setShowAddUser(true)
  }

  if (loading) {
    return (
      <div className="users-page-loading min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="users-loading-content text-center">
          <div className="users-loading-spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="users-loading-text text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="users-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="users-page-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="users-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="users-header-main py-6">
            <div className="users-header-title-section">
              <h1 className="users-page-title text-2xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="users-page-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage users, roles, and permissions for {user?.fullName || 'User'}
              </p>
              
              {/* Add User Button */}
              <div className="users-header-actions mt-4">
                <button 
                  onClick={handleOpenAddUser}
                  className="users-add-btn inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Icon name="plus" size={16} className="mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="users-filters flex flex-col gap-4 pb-4">
            {/* Search */}
            <div className="users-search">
              <div className="relative">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="users-search-input w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role and Status Filters */}
            <div className="users-filter-row flex flex-row gap-4">
              {/* Role Filter */}
              <div className="users-role-filter flex-1">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="users-role-select w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="users-status-filter flex-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="users-status-select w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Messages */}
      {confirmationMessage.show && (
        <div className="users-confirmation-message fixed top-20 right-4 z-[10002] max-w-sm">
          <div className={`users-confirmation-alert p-4 rounded-lg shadow-lg border-l-4 ${
            confirmationMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
              : confirmationMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200'
          }`}>
            <div className="flex items-center">
              <Icon 
                name={
                  confirmationMessage.type === 'success' 
                    ? 'check-circle' 
                    : confirmationMessage.type === 'error'
                    ? 'x-circle'
                    : 'info'
                } 
                size={20} 
                className="mr-3" 
              />
              <div className="flex-1">
                <p className="users-confirmation-text text-sm font-medium">
                  {confirmationMessage.message}
                </p>
              </div>
              <button
                onClick={() => setConfirmationMessage(prev => ({ ...prev, show: false }))}
                className="users-confirmation-close ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="users-page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Users Grid */}
        <div className="users-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="users-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 relative"
            >
              {/* User Header */}
              <div className="users-card-header flex items-start justify-between mb-4">
                <div className="users-card-avatar flex items-center space-x-3">
                  <div className="users-avatar w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="users-avatar-text text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="users-card-info">
                    <h3 className="users-card-name text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="users-card-email text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Button - Positioned in top-right corner */}
              <div className="users-actions-dropdown absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation() // Prevent card click
                      handleToggleUserActions(user.id)
                    }}
                    className="users-actions-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 shadow-sm"
                    title="User actions"
                    type="button"
                  >
                    <Icon name="more-vertical" size={18} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                  </button>
                  {showUserActions === user.id && (
                    <div className="users-actions-menu absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[10001]">
                    <div className="users-actions-list py-1" onClick={(e) => e.stopPropagation()}>
                      <div
                        onMouseDown={() => handleEditUser(user)}
                        className="users-action-item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer"
                      >
                        <Icon name="edit" size={16} />
                        <span>Edit User</span>
                      </div>
                      <div
                        onMouseDown={() => handleDeactivateUser(user)}
                        className="users-action-item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer"
                      >
                        <Icon name={user.status === 'active' ? 'user-x' : 'user-check'} size={16} />
                        <span>{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                      </div>
                      <div
                        onMouseDown={() => handleDeleteUser(user)}
                        className="users-action-item w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 cursor-pointer"
                      >
                        <Icon name="trash-2" size={16} />
                        <span>Delete User</span>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* User Details */}
              <div className="users-card-details space-y-2">
                {/* Status Badge - Prominently displayed */}
                <div className="users-detail-item flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="user" size={16} className="text-gray-400" />
                    <span className="users-detail-text text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                  </div>
                  <div className={`users-status-badge px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </div>
                </div>
                <div className="users-detail-item flex items-center space-x-2">
                  <Icon name="briefcase" size={16} className="text-gray-400" />
                  <span className="users-detail-text text-sm text-gray-600 dark:text-gray-400">
                    {user.role}
                  </span>
                </div>
                <div className="users-detail-item flex items-center space-x-2">
                  <Icon name="building" size={16} className="text-gray-400" />
                  <span className="users-detail-text text-sm text-gray-600 dark:text-gray-400">
                    {user.department}
                  </span>
                </div>
                <div className="users-detail-item flex items-center space-x-2">
                  <Icon name="clock" size={16} className="text-gray-400" />
                  <span className="users-detail-text text-sm text-gray-600 dark:text-gray-400">
                    Last login: {user.lastLogin}
                  </span>
                </div>
              </div>

              {/* Role Badge */}
              <div className="users-card-footer mt-4">
                <div className={`users-role-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800 dark:bg-${getRoleColor(user.role)}-900 dark:text-${getRoleColor(user.role)}-200`}>
                  {user.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="users-empty-state text-center py-12">
            <Icon name="users" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="users-empty-title text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="users-empty-text text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="users-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="users-modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="users-modal-header flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="users-modal-title text-xl font-semibold text-gray-900 dark:text-white">
                User Details
              </h2>
              <button
                onClick={handleCloseUserDetails}
                className="users-modal-close p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon name="x" size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="users-modal-body p-6">
              <div className="users-modal-user-info mb-6">
                <div className="users-modal-avatar flex items-center space-x-4 mb-4">
                  <div className="users-modal-avatar-circle w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="users-modal-avatar-text text-blue-600 dark:text-blue-400 font-semibold text-xl">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="users-modal-user-name text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="users-modal-user-email text-gray-600 dark:text-gray-400">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="users-modal-details grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="users-modal-detail">
                    <label className="users-modal-label text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <p className="users-modal-value text-gray-900 dark:text-white">
                      {selectedUser.role}
                    </p>
                  </div>
                  <div className="users-modal-detail">
                    <label className="users-modal-label text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <p className="users-modal-value text-gray-900 dark:text-white">
                      {selectedUser.department}
                    </p>
                  </div>
                  <div className="users-modal-detail">
                    <label className="users-modal-label text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <span className={`users-modal-status inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="users-modal-detail">
                    <label className="users-modal-label text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Login
                    </label>
                    <p className="users-modal-value text-gray-900 dark:text-white">
                      {selectedUser.lastLogin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="users-modal-permissions">
                <h4 className="users-modal-permissions-title text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Permissions
                </h4>
                <div className="users-modal-permissions-list grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedUser.permissions.map((permission, index) => (
                    <div key={index} className="users-modal-permission flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Icon name="check" size={16} className="text-green-500" />
                      <span className="users-modal-permission-text text-sm text-gray-700 dark:text-gray-300">
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="users-modal-footer flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseUserDetails}
                className="users-modal-cancel px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="users-modal-edit px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="users-add-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="users-add-modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="users-add-modal-header flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="users-add-modal-title text-xl font-semibold text-gray-900 dark:text-white">
                Add New User
              </h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="users-add-modal-close p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon name="x" size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="users-add-modal-body p-6">
              <form className="users-add-form space-y-4">
                <div className="users-add-form-row grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="users-add-form-group">
                    <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="users-add-form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="users-add-form-group">
                    <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="users-add-form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="users-add-form-row grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="users-add-form-group">
                    <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="users-add-form-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="users-add-form-group">
                    <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department *
                    </label>
                    <select 
                      value={newUser.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="users-add-form-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Administration">Administration</option>
                      <option value="Billing">Billing</option>
                    </select>
                  </div>
                </div>

                <div className="users-add-form-group">
                  <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Status
                  </label>
                  <div className="users-add-status-options flex space-x-4">
                    <label className="users-add-status-option flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={newUser.status === 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="users-add-status-radio mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <label className="users-add-status-option flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="pending"
                        checked={newUser.status === 'pending'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="users-add-status-radio mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                    </label>
                  </div>
                </div>

                <div className="users-add-form-group">
                  <label className="users-add-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={newUser.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="users-add-form-textarea w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes about this user..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="users-add-modal-footer flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddUser(false)}
                className="users-add-modal-cancel px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                className="users-add-modal-save px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="users-edit-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="users-edit-modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="users-edit-modal-header flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="users-edit-modal-title text-xl font-semibold text-gray-900 dark:text-white">
                Edit User
              </h2>
              <button
                onClick={() => {
                  setShowEditUser(false)
                  setEditingUser(null)
                }}
                className="users-edit-modal-close text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Icon name="x" size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="users-edit-modal-body p-6">
              <form className="users-edit-form space-y-4">
                <div className="users-edit-form-group">
                  <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    className="users-edit-form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="users-edit-form-group">
                  <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => handleEditInputChange('email', e.target.value)}
                    className="users-edit-form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="users-edit-form-row flex space-x-4">
                  <div className="users-edit-form-group flex-1">
                    <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => handleEditInputChange('role', e.target.value)}
                      className="users-edit-form-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select role</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Field Technician">Field Technician</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Billing Specialist">Billing Specialist</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>

                  <div className="users-edit-form-group flex-1">
                    <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department *
                    </label>
                    <select
                      value={editingUser.department}
                      onChange={(e) => handleEditInputChange('department', e.target.value)}
                      className="users-edit-form-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Administration">Administration</option>
                      <option value="Billing">Billing</option>
                    </select>
                  </div>
                </div>

                <div className="users-edit-form-group">
                  <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="users-edit-status-options flex space-x-4">
                    <label className="users-edit-status-option flex items-center">
                      <input
                        type="radio"
                        name="edit-status"
                        value="active"
                        checked={editingUser.status === 'active'}
                        onChange={(e) => handleEditInputChange('status', e.target.value)}
                        className="users-edit-status-radio mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                    <label className="users-edit-status-option flex items-center">
                      <input
                        type="radio"
                        name="edit-status"
                        value="inactive"
                        checked={editingUser.status === 'inactive'}
                        onChange={(e) => handleEditInputChange('status', e.target.value)}
                        className="users-edit-status-radio mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                    </label>
                    <label className="users-edit-status-option flex items-center">
                      <input
                        type="radio"
                        name="edit-status"
                        value="pending"
                        checked={editingUser.status === 'pending'}
                        onChange={(e) => handleEditInputChange('status', e.target.value)}
                        className="users-edit-status-radio mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                    </label>
                  </div>
                </div>

                <div className="users-edit-form-group">
                  <label className="users-edit-form-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={editingUser.notes || ''}
                    onChange={(e) => handleEditInputChange('notes', e.target.value)}
                    className="users-edit-form-textarea w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes about this user..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="users-edit-modal-footer flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditUser(false)
                  setEditingUser(null)
                }}
                className="users-edit-modal-cancel px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEditUser}
                className="users-edit-modal-save px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="users-confirm-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10002] p-4">
          <div className="users-confirm-modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="users-confirm-modal-header flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmAction.type === 'delete' 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : 'bg-orange-100 dark:bg-orange-900/20'
                }`}>
                  <Icon 
                    name={confirmAction.type === 'delete' ? 'trash-2' : 'user-x'} 
                    size={20} 
                    className={confirmAction.type === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'} 
                  />
                </div>
                <h2 className="users-confirm-modal-title text-xl font-semibold text-gray-900 dark:text-white">
                  {confirmAction.type === 'delete' ? 'Delete User' : 'Deactivate User'}
                </h2>
              </div>
              <button
                onClick={handleCancelAction}
                className="users-confirm-modal-close text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Icon name="x" size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="users-confirm-modal-body p-6">
              <p className="users-confirm-modal-message text-gray-700 dark:text-gray-300 mb-4">
                {confirmAction.message}
              </p>
              {confirmAction.type === 'delete' && (
                <div className="users-confirm-modal-warning bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="alert-triangle" size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        This action cannot be undone
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        All user data, permissions, and history will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="users-confirm-modal-footer flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancelAction}
                className="users-confirm-modal-cancel px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction}
                className={`users-confirm-modal-confirm px-4 py-2 text-white rounded-lg transition-colors ${confirmAction.confirmClass}`}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage

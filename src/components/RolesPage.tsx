import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Save,
  UserCheck,
  Lock,
  Unlock,
  Settings,
  FileText,
  BarChart3,
  CreditCard,
  ClipboardList
} from 'lucide-react'

// Types
interface Permission {
  id: string
  name: string
  description: string
  category: string
  module: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface RoleUser {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

const RolesPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showRoleUsersModal, setShowRoleUsersModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  // Initialize data
  useEffect(() => {
    initializePermissions()
    initializeRoles()
  }, [])

  const initializePermissions = () => {
    const permissionsData: Permission[] = [
      // User Management
      { id: 'users.view', name: 'View Users', description: 'View user list and details', category: 'User Management', module: 'Users' },
      { id: 'users.create', name: 'Create Users', description: 'Add new users to the system', category: 'User Management', module: 'Users' },
      { id: 'users.edit', name: 'Edit Users', description: 'Modify user information', category: 'User Management', module: 'Users' },
      { id: 'users.delete', name: 'Delete Users', description: 'Remove users from the system', category: 'User Management', module: 'Users' },
      { id: 'users.activate', name: 'Activate/Deactivate Users', description: 'Enable or disable user accounts', category: 'User Management', module: 'Users' },

      // Role Management
      { id: 'roles.view', name: 'View Roles', description: 'View roles and permissions', category: 'Role Management', module: 'Roles' },
      { id: 'roles.create', name: 'Create Roles', description: 'Create new roles', category: 'Role Management', module: 'Roles' },
      { id: 'roles.edit', name: 'Edit Roles', description: 'Modify role permissions', category: 'Role Management', module: 'Roles' },
      { id: 'roles.delete', name: 'Delete Roles', description: 'Remove roles from the system', category: 'Role Management', module: 'Roles' },

      // Patient Management
      { id: 'patients.view', name: 'View Patients', description: 'Access patient directory and information', category: 'Patient Management', module: 'Patients' },
      { id: 'patients.create', name: 'Create Patients', description: 'Add new patient records', category: 'Patient Management', module: 'Patients' },
      { id: 'patients.edit', name: 'Edit Patients', description: 'Modify patient information', category: 'Patient Management', module: 'Patients' },
      { id: 'patients.delete', name: 'Delete Patients', description: 'Remove patient records', category: 'Patient Management', module: 'Patients' },

      // Claims Processing
      { id: 'claims.view', name: 'View Claims', description: 'Access claims data and status', category: 'Claims Processing', module: 'Claims' },
      { id: 'claims.create', name: 'Create Claims', description: 'Submit new claims', category: 'Claims Processing', module: 'Claims' },
      { id: 'claims.edit', name: 'Edit Claims', description: 'Modify claim information', category: 'Claims Processing', module: 'Claims' },
      { id: 'claims.approve', name: 'Approve Claims', description: 'Approve or deny claims', category: 'Claims Processing', module: 'Claims' },
      { id: 'claims.reprocess', name: 'Reprocess Claims', description: 'Resubmit denied claims', category: 'Claims Processing', module: 'Claims' },

      // Billing
      { id: 'billing.view', name: 'View Billing', description: 'Access billing information', category: 'Billing', module: 'Billing' },
      { id: 'billing.create', name: 'Create Invoices', description: 'Generate new invoices', category: 'Billing', module: 'Billing' },
      { id: 'billing.edit', name: 'Edit Invoices', description: 'Modify billing information', category: 'Billing', module: 'Billing' },
      { id: 'billing.payment', name: 'Process Payments', description: 'Record and process payments', category: 'Billing', module: 'Billing' },

      // Reports & Analytics
      { id: 'reports.view', name: 'View Reports', description: 'Access standard reports', category: 'Reports & Analytics', module: 'Reports' },
      { id: 'reports.create', name: 'Create Reports', description: 'Generate custom reports', category: 'Reports & Analytics', module: 'Reports' },
      { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Reports & Analytics', module: 'Analytics' },
      { id: 'analytics.export', name: 'Export Data', description: 'Export reports and data', category: 'Reports & Analytics', module: 'Analytics' },

      // HEDIS
      { id: 'hedis.view', name: 'View HEDIS', description: 'Access HEDIS screening data', category: 'HEDIS', module: 'HEDIS' },
      { id: 'hedis.create', name: 'Create Screenings', description: 'Add new HEDIS screenings', category: 'HEDIS', module: 'HEDIS' },
      { id: 'hedis.edit', name: 'Edit Screenings', description: 'Modify screening information', category: 'HEDIS', module: 'HEDIS' },
      { id: 'hedis.approve', name: 'Approve Screenings', description: 'Approve screening results', category: 'HEDIS', module: 'HEDIS' },

      // PIC
      { id: 'pic.view', name: 'View PIC', description: 'Access PIC data', category: 'PIC', module: 'PIC' },
      { id: 'pic.create', name: 'Create PIC Records', description: 'Add new PIC records', category: 'PIC', module: 'PIC' },
      { id: 'pic.edit', name: 'Edit PIC Records', description: 'Modify PIC information', category: 'PIC', module: 'PIC' },

      // System Administration
      { id: 'settings.view', name: 'View Settings', description: 'Access system settings', category: 'System Administration', module: 'Settings' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system settings', category: 'System Administration', module: 'Settings' },
      { id: 'audit.view', name: 'View Audit Logs', description: 'Access audit trail', category: 'System Administration', module: 'Audit' },
      { id: 'system.admin', name: 'System Administration', description: 'Full system administration access', category: 'System Administration', module: 'System' }
    ]
    setPermissions(permissionsData)
  }

  const initializeRoles = () => {
    const rolesData: Role[] = [
      {
        id: 'admin',
        name: 'System Administrator',
        description: 'Full access to all system features and settings',
        permissions: permissions.map(p => p.id),
        userCount: 2,
        isDefault: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'billing-manager',
        name: 'Billing Manager',
        description: 'Manages billing operations and oversees billing team',
        permissions: [
          'billing.view', 'billing.create', 'billing.edit', 'billing.payment',
          'claims.view', 'claims.edit', 'claims.approve',
          'patients.view', 'patients.edit',
          'reports.view', 'reports.create', 'analytics.view', 'analytics.export',
          'users.view'
        ],
        userCount: 3,
        isDefault: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'billing-specialist',
        name: 'Billing Specialist',
        description: 'Processes claims and handles billing operations',
        permissions: [
          'billing.view', 'billing.create', 'billing.edit',
          'claims.view', 'claims.create', 'claims.edit',
          'patients.view', 'patients.edit',
          'reports.view'
        ],
        userCount: 8,
        isDefault: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'coding-specialist',
        name: 'Coding Specialist',
        description: 'Specializes in medical coding and claim preparation',
        permissions: [
          'claims.view', 'claims.create', 'claims.edit',
          'patients.view', 'patients.edit',
          'hedis.view', 'hedis.create', 'hedis.edit',
          'pic.view', 'pic.create', 'pic.edit',
          'reports.view'
        ],
        userCount: 5,
        isDefault: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'claims-processor',
        name: 'Claims Processor',
        description: 'Processes and manages insurance claims',
        permissions: [
          'claims.view', 'claims.create', 'claims.edit',
          'patients.view',
          'billing.view',
          'reports.view'
        ],
        userCount: 12,
        isDefault: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'hedis-coordinator',
        name: 'HEDIS Coordinator',
        description: 'Manages HEDIS screening and compliance activities',
        permissions: [
          'hedis.view', 'hedis.create', 'hedis.edit', 'hedis.approve',
          'patients.view', 'patients.edit',
          'reports.view', 'analytics.view'
        ],
        userCount: 4,
        isDefault: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'auditor',
        name: 'Auditor',
        description: 'Reviews and audits billing and compliance activities',
        permissions: [
          'claims.view',
          'billing.view',
          'patients.view',
          'reports.view', 'reports.create', 'analytics.view', 'analytics.export',
          'audit.view',
          'hedis.view',
          'pic.view'
        ],
        userCount: 2,
        isDefault: false,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to most system features',
        permissions: [
          'patients.view',
          'claims.view',
          'billing.view',
          'reports.view',
          'hedis.view',
          'pic.view',
          'analytics.view'
        ],
        userCount: 6,
        isDefault: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
    ]
    setRoles(rolesData)
  }

  // Helper functions
  const getPermissionById = (id: string) => permissions.find(p => p.id === id)
  const getPermissionCategory = (category: string) => permissions.filter(p => p.category === category)
  const getPermissionModules = () => [...new Set(permissions.map(p => p.module))]

  // Modal handlers
  const handleAddRole = () => {
    setRoleForm({ name: '', description: '', permissions: [] })
    setSelectedRole(null)
    setShowAddRoleModal(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setShowEditRoleModal(true)
  }

  const handleViewRoleUsers = (role: Role) => {
    setSelectedRole(role)
    setShowRoleUsersModal(true)
  }

  const handleDeleteRole = (role: Role) => {
    if (role.isDefault) {
      showMessage('Cannot delete default roles', 'error')
      return
    }
    if (role.userCount > 0) {
      showMessage('Cannot delete role with assigned users', 'error')
      return
    }
    
    setRoles(prev => prev.filter(r => r.id !== role.id))
    showMessage('Role deleted successfully')
  }

  const handleSaveRole = () => {
    if (!roleForm.name.trim()) {
      showMessage('Role name is required', 'error')
      return
    }

    const newRole: Role = {
      id: selectedRole?.id || roleForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: roleForm.name,
      description: roleForm.description,
      permissions: roleForm.permissions,
      userCount: selectedRole?.userCount || 0,
      isDefault: false,
      createdAt: selectedRole?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    if (selectedRole) {
      // Edit existing role
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? newRole : r))
      showMessage('Role updated successfully')
    } else {
      // Add new role
      setRoles(prev => [...prev, newRole])
      showMessage('Role created successfully')
    }

    setShowAddRoleModal(false)
    setShowEditRoleModal(false)
    setSelectedRole(null)
  }

  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = getPermissionCategory(category).map(p => p.id)
    const allSelected = categoryPermissions.every(p => roleForm.permissions.includes(p))
    
    if (allSelected) {
      // Remove all permissions from this category
      setRoleForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }))
    } else {
      // Add all permissions from this category
      setRoleForm(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }))
    }
  }

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const getPermissionIcon = (module: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Users': <Users className="w-4 h-4" />,
      'Roles': <Shield className="w-4 h-4" />,
      'Patients': <UserCheck className="w-4 h-4" />,
      'Claims': <FileText className="w-4 h-4" />,
      'Billing': <CreditCard className="w-4 h-4" />,
      'Reports': <BarChart3 className="w-4 h-4" />,
      'Analytics': <BarChart3 className="w-4 h-4" />,
      'HEDIS': <ClipboardList className="w-4 h-4" />,
      'PIC': <CreditCard className="w-4 h-4" />,
      'Settings': <Settings className="w-4 h-4" />,
      'Audit': <Eye className="w-4 h-4" />,
      'System': <Settings className="w-4 h-4" />
    }
    return icons[module] || <Shield className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="roles-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="roles-header-title-section">
              <h1 className="roles-page-title text-2xl font-bold text-gray-900 dark:text-white">
                Roles & Permissions
              </h1>
              <p className="roles-page-subtitle text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage user roles and system permissions
              </p>
            </div>
            <button
              onClick={handleAddRole}
              className="roles-add-btn inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="roles-navigation mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('roles')}
              className={`roles-nav-item py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 mr-2 inline" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`roles-nav-item py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Lock className="w-4 h-4 mr-2 inline" />
              Permissions
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'roles' && (
          <div className="roles-content">
            {/* Roles Grid */}
            <div className="roles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="roles-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="roles-card-icon p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="roles-card-title text-lg font-semibold text-gray-900 dark:text-white">
                            {role.name}
                          </h3>
                          {role.isDefault && (
                            <span className="roles-default-badge inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="roles-card-actions">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-1"
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!role.isDefault && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="roles-card-description text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {role.description}
                    </p>

                    <div className="roles-card-stats flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="roles-user-count">
                        <Users className="w-4 h-4 mr-1 inline" />
                        {role.userCount} users
                      </span>
                      <span className="roles-permission-count">
                        <Lock className="w-4 h-4 mr-1 inline" />
                        {role.permissions.length} permissions
                      </span>
                    </div>

                    <div className="roles-card-footer">
                      <button
                        onClick={() => handleViewRoleUsers(role)}
                        className="roles-view-users-btn w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Users
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="permissions-content">
            <div className="permissions-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
              {getPermissionModules().map((module) => {
                const modulePermissions = permissions.filter(p => p.module === module)
                const categories = [...new Set(modulePermissions.map(p => p.category))]
                
                return (
                  <div key={module} className="permissions-module-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="permissions-module-header flex items-center mb-6">
                        <div className="permissions-module-icon p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                          {getPermissionIcon(module)}
                        </div>
                        <h3 className="permissions-module-title text-lg font-semibold text-gray-900 dark:text-white">
                          {module}
                        </h3>
                      </div>

                      <div className="permissions-categories space-y-4">
                        {categories.map((category) => (
                          <div key={category} className="permissions-category">
                            <h4 className="permissions-category-title text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {category}
                            </h4>
                            <div className="permissions-list space-y-2">
                              {modulePermissions
                                .filter(p => p.category === category)
                                .map((permission) => (
                                  <div key={permission.id} className="permission-item flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <div className="permission-info">
                                      <span className="permission-name text-sm font-medium text-gray-900 dark:text-white">
                                        {permission.name}
                                      </span>
                                      <p className="permission-description text-xs text-gray-600 dark:text-gray-400">
                                        {permission.description}
                                      </p>
                                    </div>
                                    <span className="permission-id text-xs text-gray-500 dark:text-gray-400 font-mono">
                                      {permission.id}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Role Modal */}
      {(showAddRoleModal || showEditRoleModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRole ? 'Edit Role' : 'Add New Role'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddRoleModal(false)
                    setShowEditRoleModal(false)
                    setSelectedRole(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Role Basic Info */}
              <div className="role-form-basic mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter role description"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="role-form-permissions">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Permissions
                </h4>
                
                <div className="permissions-selection grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getPermissionModules().map((module) => {
                    const modulePermissions = permissions.filter(p => p.module === module)
                    const categories = [...new Set(modulePermissions.map(p => p.category))]
                    
                    return (
                      <div key={module} className="permissions-module-selection">
                        <div className="permissions-module-header flex items-center mb-4">
                          <div className="permissions-module-icon p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                            {getPermissionIcon(module)}
                          </div>
                          <h5 className="permissions-module-title text-md font-medium text-gray-900 dark:text-white">
                            {module}
                          </h5>
                        </div>

                        <div className="permissions-categories-selection space-y-3">
                          {categories.map((category) => {
                            const categoryPermissions = modulePermissions.filter(p => p.category === category)
                            const allSelected = categoryPermissions.every(p => roleForm.permissions.includes(p.id))
                            const someSelected = categoryPermissions.some(p => roleForm.permissions.includes(p.id))
                            
                            return (
                              <div key={category} className="permissions-category-selection">
                                <label className="permissions-category-toggle flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(input) => {
                                      if (input) input.indeterminate = someSelected && !allSelected
                                    }}
                                    onChange={() => handleCategoryToggle(category)}
                                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="permissions-category-name text-sm font-medium text-gray-900 dark:text-white">
                                    {category}
                                  </span>
                                </label>

                                <div className="permissions-list-selection ml-6 mt-2 space-y-1">
                                  {categoryPermissions.map((permission) => (
                                    <label key={permission.id} className="permission-item-selection flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={roleForm.permissions.includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id)}
                                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <div className="permission-info-selection">
                                        <span className="permission-name text-sm text-gray-900 dark:text-white">
                                          {permission.name}
                                        </span>
                                        <p className="permission-description text-xs text-gray-600 dark:text-gray-400">
                                          {permission.description}
                                        </p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddRoleModal(false)
                    setShowEditRoleModal(false)
                    setSelectedRole(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  {selectedRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Users Modal */}
      {showRoleUsersModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Users with {selectedRole.name} Role
                </h3>
                <button
                  onClick={() => {
                    setShowRoleUsersModal(false)
                    setSelectedRole(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="role-users-list space-y-3">
                {/* Mock users data - in real app, this would come from API */}
                {Array.from({ length: selectedRole.userCount }, (_, i) => ({
                  id: `user-${i + 1}`,
                  name: `User ${i + 1}`,
                  email: `user${i + 1}@example.com`,
                  status: i % 3 === 0 ? 'inactive' as const : 'active' as const
                })).map((user) => (
                  <div key={user.id} className="role-user-item flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="role-user-avatar w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="role-user-name text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="role-user-email text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className={`role-user-status inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.status === 'active' ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[99999]">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RolesPage


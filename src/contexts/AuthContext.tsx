import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  fullName: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize demo user account
  useEffect(() => {
    const initializeDemoUser = () => {
      const storedUsers = localStorage.getItem('alivi_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      // Check if demo user already exists
      const demoUserExists = users.find((u: any) => u.username === 'demo')
      
      if (!demoUserExists) {
        // Create demo user account
        const demoUser = {
          id: 'demo-user-001',
          username: 'demo',
          fullName: 'Demo User',
          email: 'demo@alivi.com',
          password: 'demo',
          createdAt: new Date().toISOString()
        }
        
        users.push(demoUser)
        localStorage.setItem('alivi_users', JSON.stringify(users))
      }
    }

    initializeDemoUser()
  }, [])

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('alivi_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('alivi_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('alivi_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []

      // Find user by username or email
      const user = users.find((u: any) => u.username === username || u.email === username)

      if (!user) {
        return { success: false, error: 'User not found. Please create an account.' }
      }

      // Simple password validation (in real app, use bcrypt)
      if (user.password !== password) {
        return { success: false, error: 'Invalid password.' }
      }

      // Create user session
      const userSession = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }

      setUser(userSession)
      localStorage.setItem('alivi_user', JSON.stringify(userSession))
      
      // Clear any saved tab states to ensure user starts on main dashboard
      localStorage.removeItem('activeDesktopTab')
      localStorage.removeItem('activeMobileTab')

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An error occurred during login.' }
    }
  }

  const signup = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('alivi_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []

      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email)
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists.' }
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        fullName,
        email,
        password, // In real app, hash this with bcrypt
        createdAt: new Date().toISOString()
      }

      // Save to storage
      users.push(newUser)
      localStorage.setItem('alivi_users', JSON.stringify(users))

      // Create user session
      const userSession = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt
      }

      setUser(userSession)
      localStorage.setItem('alivi_user', JSON.stringify(userSession))
      
      // Clear any saved tab states to ensure user starts on main dashboard
      localStorage.removeItem('activeDesktopTab')
      localStorage.removeItem('activeMobileTab')

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'An error occurred during signup.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('alivi_user')
    // Clear M.I.L.A. welcome session so user gets welcome message on next login
    sessionStorage.removeItem('mila_welcomed_user')
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('alivi_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []

      // Check if user exists
      const user = users.find((u: any) => u.email === email)
      if (!user) {
        return { success: false, error: 'No account found with this email address.' }
      }

      // In a real app, send email with reset link
      // For now, just return success
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: 'An error occurred while resetting password.' }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
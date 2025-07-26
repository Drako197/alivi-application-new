import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface LoginViewProps {
  onViewChange: (view: 'login' | 'signup' | 'forgot-password') => void
}

export default function LoginView({ onViewChange }: LoginViewProps) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validations, setValidations] = useState({
    email: false
  })

  // Real-time validation
  useEffect(() => {
    const newValidations = {
      email: /\S+@\S+\.\S+/.test(formData.email)
    }
    setValidations(newValidations)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const result = await login(formData.email, formData.password)
      
      if (!result.success) {
        setErrors({ general: result.error || 'Login failed' })
      }
      // If successful, the AuthContext will handle the redirect
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const getInputClassName = (fieldName: string) => {
    const baseClasses = "form-input"
    const errorClasses = "form-input-error"
    const successClasses = "form-input-success"
    
    if (errors[fieldName]) {
      return `${baseClasses} ${errorClasses}`
    } else if (validations[fieldName as keyof typeof validations]) {
      return `${baseClasses} ${successClasses}`
    } else {
      return baseClasses
    }
  }

  return (
    <div className="form-container">
      {/* Header */}
      <div className="auth-header">
        <h2 className="auth-title">
          Welcome back
        </h2>
        <p className="auth-subtitle">
          Sign in to your medical billing account
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="form-section">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="form-error">{errors.general}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={getInputClassName('email')}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {validations.email && !errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="form-error">{errors.email}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input pr-12 ${
                errors.password 
                  ? 'form-input-error' 
                  : ''
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => onViewChange('forgot-password')}
            className="form-link"
            disabled={isSubmitting}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="form-button"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => {
              onViewChange('signup')
              // Smooth scroll to form on mobile
              if (window.innerWidth <= 1023) {
                setTimeout(() => {
                  const formElement = document.querySelector('.form-container form')
                  if (formElement) {
                    formElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    })
                  }
                }, 100) // Small delay to ensure form is rendered
              }
            }}
            className="form-link"
            disabled={isSubmitting}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
} 
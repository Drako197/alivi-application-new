import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface SignUpViewProps {
  onViewChange: (view: 'login' | 'signup' | 'forgot-password') => void
}

export default function SignUpView({ onViewChange }: SignUpViewProps) {
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validations, setValidations] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
    agreeToTerms: false
  })

  // Real-time validation
  useEffect(() => {
    const newValidations = {
      fullName: formData.fullName.trim().length >= 2,
      email: /\S+@\S+\.\S+/.test(formData.email),
      password: formData.password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password),
      confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
      role: formData.role.length > 0,
      agreeToTerms: formData.agreeToTerms
    }
    setValidations(newValidations)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = 'checked' in e.target ? e.target.checked : false
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const result = await signup(formData.fullName, formData.email, formData.password)
      
      if (!result.success) {
        setErrors({ general: result.error || 'Signup failed' })
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
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
          Create your account
        </h2>
        <p className="auth-subtitle">
          Get started with your medical billing account
        </p>
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="form-section">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="form-error">{errors.general}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full name
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={getInputClassName('fullName')}
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
            {validations.fullName && !errors.fullName && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          {errors.fullName && (
            <p className="form-error">{errors.fullName}</p>
          )}
        </div>

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
              className={getInputClassName('password')}
              placeholder="Create a password"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
              {validations.password && !errors.password && (
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
          </div>
          {errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
          <p className="help-text">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={getInputClassName('confirmPassword')}
              placeholder="Confirm your password"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
              {validations.confirmPassword && !errors.confirmPassword && (
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? (
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
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword}</p>
          )}
          {validations.confirmPassword && !errors.confirmPassword && (
            <p className="form-success flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Passwords match!
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={getInputClassName('role')}
            disabled={isSubmitting}
          >
            <option value="">Select a role</option>
            <option value="Licensed Medical Doctor">Licensed Medical Doctor</option>
            <option value="Field Technician">Field Technician</option>
          </select>
          {errors.role && (
            <p className="form-error">{errors.role}</p>
          )}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agree-to-terms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agree-to-terms" className="text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="form-link">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="form-link">
                Privacy Policy
              </a>
            </label>
            {errors.agreeToTerms && (
              <p className="form-error">{errors.agreeToTerms}</p>
            )}
          </div>
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
              Creating account...
            </div>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onViewChange('login')}
            className="form-link"
            disabled={isSubmitting}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
} 
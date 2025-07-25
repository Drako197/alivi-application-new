import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ForgotPasswordViewProps {
  onViewChange: (view: 'login' | 'signup' | 'forgot-password') => void
}

export default function ForgotPasswordView({ onViewChange }: ForgotPasswordViewProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  const validateEmail = () => {
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail()) return

    setIsSubmitting(true)
    try {
      const result = await resetPassword(email)
      
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="form-container">
        {/* Success State */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 auth-title">
            Check your email
          </h2>
          <p className="mt-3 auth-subtitle">
            We've sent a password reset link to{' '}
            <span className="font-medium text-gray-900 dark:text-white">{email}</span>
          </p>
          <p className="mt-4 help-text">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="form-link font-medium"
            >
              try again
            </button>
          </p>
        </div>

        {/* Back to login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onViewChange('login')}
            className="form-link"
          >
            ← Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-container">
      {/* Header */}
      <div className="auth-header">
        <h2 className="auth-title">
          Reset your password
        </h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="form-section">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="form-error">{error}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            className={`form-input ${
              error 
                ? 'form-input-error' 
                : ''
            }`}
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
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
              Sending reset link...
            </div>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => onViewChange('login')}
          className="form-link"
          disabled={isSubmitting}
        >
          ← Back to login
        </button>
      </div>
    </div>
  )
} 
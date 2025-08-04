import React, { useState } from 'react'
import Icon from './Icon'
import DatePicker from './DatePicker'
import HelperButton from './HelperButton'
import MilaInputField from './MilaInputField'

interface ManualEligibilityRequestFormProps {
  onBack?: () => void
}

export default function ManualEligibilityRequestForm({ onBack }: ManualEligibilityRequestFormProps) {
  const [formData, setFormData] = useState({
    date: '8/2/2025',
    locationNumber: '',
    insuranceProvider: '',
    otherInsuranceProvider: '',
    dateOfService: '',
    contactMethod: 'email' as 'email' | 'fax',
    emailAddress: '',
    faxNumber: '',
    memberId: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    dateOfBirth: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validations, setValidations] = useState<{ [key: string]: boolean }>({})

  // Insurance provider options
  const insuranceProviders = [
    { value: 'avmed', label: 'AvMed' },
    { value: 'careplus', label: 'Care Plus Health Plans' },
    { value: 'floridablue', label: 'Florida Blue' },
    { value: 'humana', label: 'Humana' },
    { value: 'kaiser', label: 'Kaiser' },
    { value: 'aetna', label: 'Aetna' },
    { value: 'cigna', label: 'Cigna' },
    { value: 'unitedhealthcare', label: 'UnitedHealthcare' },
    { value: 'anthem', label: 'Anthem' },
    { value: 'molina', label: 'Molina' },
    { value: 'wellcare', label: 'WellCare' }
  ]

  // US States options
  const usStates = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Validate field
    validateField(name, value)
  }

  const handleContactMethodChange = (method: 'email' | 'fax') => {
    setFormData(prev => ({ ...prev, contactMethod: method }))
  }

  const handleMilaTrigger = (fieldName: string, formName: string) => {
    console.log('M.I.L.A. triggered for:', fieldName, 'in form:', formName)
    // This will be handled by the HelperButton component
  }

  const validateField = (fieldName: string, value: string) => {
    let isValid = true
    let errorMessage = ''

    switch (fieldName) {
      case 'locationNumber':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Location number is required'
        }
        break
      case 'insuranceProvider':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Insurance provider is required'
        }
        break
      case 'dateOfService':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Date of service is required'
        }
        break
      case 'emailAddress':
        if (formData.contactMethod === 'email' && !value.trim()) {
          isValid = false
          errorMessage = 'Email address is required'
        } else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false
          errorMessage = 'Please enter a valid email address'
        }
        break
      case 'faxNumber':
        if (formData.contactMethod === 'fax' && !value.trim()) {
          isValid = false
          errorMessage = 'Fax number is required'
        } else if (value && !/^\d{3}-\d{3}-\d{4}$/.test(value)) {
          isValid = false
          errorMessage = 'Please enter fax number in format: 000-000-0000'
        }
        break
      case 'memberId':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Member ID is required'
        }
        break
      case 'firstName':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'First name is required'
        }
        break
      case 'lastName':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Last name is required'
        }
        break
      case 'streetAddress':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Street address is required'
        }
        break
      case 'city':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'City is required'
        }
        break
      case 'state':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'State is required'
        }
        break
      case 'zip':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'ZIP code is required'
        } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
          isValid = false
          errorMessage = 'Please enter a valid ZIP code'
        }
        break
      case 'dateOfBirth':
        if (!value.trim()) {
          isValid = false
          errorMessage = 'Date of birth is required'
        }
        break
    }

    setValidations(prev => ({ ...prev, [fieldName]: isValid }))
    if (!isValid) {
      setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const validateForm = () => {
    const requiredFields = [
      'locationNumber', 'insuranceProvider', 'dateOfService', 'memberId',
      'firstName', 'lastName', 'streetAddress', 'city', 'state', 'zip', 'dateOfBirth'
    ]

    const newErrors: { [key: string]: string } = {}
    let isValid = true

    requiredFields.forEach(field => {
      validateField(field, formData[field as keyof typeof formData])
      if (errors[field]) {
        newErrors[field] = errors[field]
        isValid = false
      }
    })

    // Validate contact method
    if (formData.contactMethod === 'email' && !formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required'
      isValid = false
    } else if (formData.contactMethod === 'fax' && !formData.faxNumber.trim()) {
      newErrors.faxNumber = 'Fax number is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    
    // Show success message or redirect
    alert('Manual eligibility request submitted successfully! Please allow 48 hours for processing.')
  }

  const handlePrint = () => {
    window.print()
  }

  const getInputClassName = (fieldName: string) => {
    const baseClasses = "form-input"
    const errorClasses = "form-input-error"
    const successClasses = "form-input-success"
    
    if (errors[fieldName]) {
      return `${baseClasses} ${errorClasses}`
    } else if (validations[fieldName]) {
      return `${baseClasses} ${successClasses}`
    } else {
      return baseClasses
    }
  }

  const getSelectClassName = (fieldName: string) => {
    const baseClasses = "form-select"
    const errorClasses = "form-input-error"
    const successClasses = "form-input-success"
    
    if (errors[fieldName]) {
      return `${baseClasses} ${errorClasses}`
    } else if (validations[fieldName]) {
      return `${baseClasses} ${successClasses}`
    } else {
      return baseClasses
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Icon name="arrow-left" size={16} />
                  Back
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manual Eligibility Request Form
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Processing Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Icon name="info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Processing Time
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Please allow 48 hours for processing
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {/* Provider Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Provider Information
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              To be completed by a Network Provider
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="form-label">
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="locationNumber" className="form-label">
                  Location Number <span className="text-red-500">*</span>
                </label>
                <MilaInputField
                  value={formData.locationNumber}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, locationNumber: value }))
                  }}
                  placeholder="Provider ID"
                  fieldName="locationNumber"
                  formName="ManualEligibility"
                  onMilaTrigger={handleMilaTrigger}
                  error={!!errors.locationNumber}
                  className="form-input"
                />
                {errors.locationNumber && (
                  <p className="form-error">{errors.locationNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="insuranceProvider" className="form-label">
                  Insurance Provider <span className="text-red-500">*</span>
                </label>
                <select
                  id="insuranceProvider"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white appearance-none cursor-pointer bg-white dark:bg-gray-700 pr-10 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[position:right_0.75rem_center] bg-no-repeat"
                >
                  <option value="">Select an Insurance Provider</option>
                  {insuranceProviders.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                {errors.insuranceProvider && (
                  <p className="form-error">{errors.insuranceProvider}</p>
                )}
              </div>

              <div>
                <label htmlFor="otherInsuranceProvider" className="form-label">
                  Other (if insurance provider is not in list)
                </label>
                <input
                  type="text"
                  id="otherInsuranceProvider"
                  name="otherInsuranceProvider"
                  value={formData.otherInsuranceProvider}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="Other Provider"
                />
              </div>

              <div>
                <label htmlFor="dateOfService" className="form-label">
                  Date of Service <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="dateOfService"
                  value={formData.dateOfService}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, dateOfService: date }))
                  }}
                  placeholder="Select date of service"
                  hasError={!!errors.dateOfService}
                />
                {errors.dateOfService && (
                  <p className="form-error">{errors.dateOfService}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Method Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Contact Method
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose how you would like to receive the eligibility response
            </p>

            {/* Contact Method Toggle */}
            <div className="mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
                <button
                  type="button"
                  onClick={() => handleContactMethodChange('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    formData.contactMethod === 'email'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon name="mail" size={16} className="inline mr-2" />
                  Email Reply Address
                </button>
                <button
                  type="button"
                  onClick={() => handleContactMethodChange('fax')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    formData.contactMethod === 'fax'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon name="printer" size={16} className="inline mr-2" />
                  Provider Fax-back Number
                </button>
              </div>
            </div>

            {/* Email Method */}
            {formData.contactMethod === 'email' && (
              <div className="space-y-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <div data-error={!!errors.emailAddress}>
                  <label htmlFor="emailAddress" className="form-label">
                    Email Reply Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="email@domain.com"
                  />
                  {errors.emailAddress && (
                    <p className="form-error">{errors.emailAddress}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    We'll send the eligibility response to this email address
                  </p>
                </div>
              </div>
            )}

            {/* Fax Method */}
            {formData.contactMethod === 'fax' && (
              <div className="space-y-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <div data-error={!!errors.faxNumber}>
                  <label htmlFor="faxNumber" className="form-label">
                    Provider Fax-back Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="faxNumber"
                    name="faxNumber"
                    value={formData.faxNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="000-000-0000"
                  />
                  {errors.faxNumber && (
                    <p className="form-error">{errors.faxNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    We'll fax the eligibility response to this number
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Patient Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Patient Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="memberId" className="form-label">
                  Member ID <span className="text-red-500">*</span>
                </label>
                <MilaInputField
                  value={formData.memberId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, memberId: value }))
                  }}
                  placeholder="Member ID"
                  fieldName="memberId"
                  formName="ManualEligibility"
                  onMilaTrigger={handleMilaTrigger}
                  error={!!errors.memberId}
                  className="form-input"
                />
                {errors.memberId && (
                  <p className="form-error">{errors.memberId}</p>
                )}
              </div>

              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label htmlFor="streetAddress" className="form-label">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="Street Address"
                />
                {errors.streetAddress && (
                  <p className="form-error">{errors.streetAddress}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="form-label">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="City"
                />
                {errors.city && (
                  <p className="form-error">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="form-label">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white appearance-none cursor-pointer bg-white dark:bg-gray-700 pr-10 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[position:right_0.75rem_center] bg-no-repeat"
                >
                  <option value="">Select a State</option>
                  {usStates.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="form-error">{errors.state}</p>
                )}
              </div>

              <div>
                <label htmlFor="zip" className="form-label">
                  ZIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder="ZIP"
                />
                {errors.zip && (
                  <p className="form-error">{errors.zip}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(date) => {
                    setFormData(prev => ({ ...prev, dateOfBirth: date }))
                  }}
                  placeholder="Select date of birth"
                  hasError={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="form-error">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Icon name="printer" size={16} />
              <span>Print</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              <Icon name="edit" size={16} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Form'}</span>
            </button>
          </div>
        </form>

        {/* Footer Notes */}
        <div className="mt-8 space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please note when a member is NOT found, we must first call the Insurance Provider for eligibility verification. Then, that member must be manually entered into our system.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Please submit this form to us 48 hours prior to your patient's appointment.
            </p>
          </div>
        </div>

        {/* M.I.L.A. Assistant */}
        <div className="fixed bottom-6 right-6">
          <HelperButton currentForm="ManualEligibility" currentField="general" currentStep={1} />
        </div>
      </div>
    </div>
  )
} 
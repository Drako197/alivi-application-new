import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import DatePicker from './DatePicker'

interface PatientEligibilityFormProps {
  onBack?: () => void
}

export default function PatientEligibilityForm({ onBack }: PatientEligibilityFormProps) {
  const [formData, setFormData] = useState({
    providerId: '',
    effectiveDate: '',
    // Group 1: Subscriber ID approach
    subscriberId: '',
    dependantSequence: '',
    // Group 2: Name/DOB approach  
    lastName: '',
    firstName: '',
    dateOfBirth: '',
    // Track which identification method is being used
    identificationMethod: 'subscriber' as 'subscriber' | 'name' | 'none',
    // Manual input flags
    manualProviderId: false,
    manualSubscriberId: false,
    manualDependantSequence: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validations, setValidations] = useState<{ [key: string]: boolean }>({})
  
  // Modal and step states
  const [showEligibilityModal, setShowEligibilityModal] = useState(false)
  const [selectedEligibilityType, setSelectedEligibilityType] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)


  // Real-world data for dropdowns
  const providerIdOptions = [
    { value: '1234567890', label: '1234567890 - Dr. Sarah Johnson, Cardiology' },
    { value: '2345678901', label: '2345678901 - Dr. Michael Chen, Internal Medicine' },
    { value: '3456789012', label: '3456789012 - Dr. Emily Rodriguez, Family Practice' },
    { value: '4567890123', label: '4567890123 - Dr. David Thompson, Pediatrics' },
    { value: '5678901234', label: '5678901234 - Dr. Lisa Wang, Dermatology' },
    { value: '6789012345', label: '6789012345 - Dr. Robert Martinez, Orthopedics' },
    { value: '7890123456', label: '7890123456 - Dr. Jennifer Lee, Neurology' },
    { value: '8901234567', label: '8901234567 - Dr. Thomas Brown, Endocrinology' },
    { value: '9012345678', label: '9012345678 - Dr. Amanda Davis, Oncology' },
    { value: '0123456789', label: '0123456789 - Dr. Christopher Wilson, Psychiatry' }
  ]

  const subscriberIdOptions = [
    { value: 'S123456789', label: 'S123456789 - John Smith' },
    { value: 'S234567890', label: 'S234567890 - Mary Johnson' },
    { value: 'S345678901', label: 'S345678901 - Robert Davis' },
    { value: 'S456789012', label: 'S456789012 - Lisa Anderson' },
    { value: 'S567890123', label: 'S567890123 - Michael Wilson' },
    { value: 'S678901234', label: 'S678901234 - Sarah Taylor' },
    { value: 'S789012345', label: 'S789012345 - David Brown' },
    { value: 'S890123456', label: 'S890123456 - Jennifer Garcia' },
    { value: 'S901234567', label: 'S901234567 - Christopher Martinez' },
    { value: 'S012345678', label: 'S012345678 - Amanda Rodriguez' }
  ]

  const dependantSequenceOptions = [
    { value: '00', label: '00 - Primary Subscriber' },
    { value: '01', label: '01 - Spouse' },
    { value: '02', label: '02 - Child 1' },
    { value: '03', label: '03 - Child 2' },
    { value: '04', label: '04 - Child 3' },
    { value: '05', label: '05 - Child 4' },
    { value: '06', label: '06 - Child 5' },
    { value: '07', label: '07 - Child 6' },
    { value: '08', label: '08 - Child 7' },
    { value: '09', label: '09 - Child 8' },
    { value: '10', label: '10 - Child 9' },
    { value: '11', label: '11 - Child 10' },
    { value: '12', label: '12 - Child 11' },
    { value: '13', label: '13 - Child 12' },
    { value: '14', label: '14 - Child 13' },
    { value: '15', label: '15 - Child 14' },
    { value: '16', label: '16 - Child 15' },
    { value: '17', label: '17 - Child 16' },
    { value: '18', label: '18 - Child 17' },
    { value: '19', label: '19 - Child 18' },
    { value: '20', label: '20 - Stepchild 1' },
    { value: '21', label: '21 - Stepchild 2' },
    { value: '22', label: '22 - Stepchild 3' },
    { value: '23', label: '23 - Stepchild 4' },
    { value: '24', label: '24 - Stepchild 5' },
    { value: '25', label: '25 - Foster Child 1' },
    { value: '26', label: '26 - Foster Child 2' },
    { value: '27', label: '27 - Foster Child 3' },
    { value: '28', label: '28 - Adopted Child 1' },
    { value: '29', label: '29 - Adopted Child 2' },
    { value: '30', label: '30 - Grandchild 1' },
    { value: '31', label: '31 - Grandchild 2' },
    { value: '32', label: '32 - Niece/Nephew 1' },
    { value: '33', label: '33 - Niece/Nephew 2' },
    { value: '34', label: '34 - Other Dependent 1' },
    { value: '35', label: '35 - Other Dependent 2' },
    { value: '36', label: '36 - Disabled Child 1' },
    { value: '37', label: '37 - Disabled Child 2' },
    { value: '38', label: '38 - Student Child 1' },
  ]

  // Eligibility types for modal
  const eligibilityTypes = [
    { id: 'medical', label: 'Medical', description: 'Standard medical coverage' },
    { id: 'dental', label: 'Dental', description: 'Dental and oral health coverage' },
    { id: 'vision', label: 'Vision', description: 'Vision and eye care coverage' },
    { id: 'mental-health', label: 'Mental Health', description: 'Mental health and behavioral coverage' },
    { id: 'prescription', label: 'Prescription', description: 'Prescription drug coverage' }
  ]

  // Mock eligibility results data
  const eligibilityResults = {
    provider: {
      name: 'Dr. Sarah Johnson',
      id: '1234567890',
      specialty: 'Cardiology',
      phone: '(555) 123-4567',
      address: '123 Medical Center Dr, Suite 200'
    },
    patient: {
      name: 'John Smith',
      id: 'S123456789',
      dob: '1985-03-15',
      relationship: 'Primary Subscriber',
      status: 'Active'
    },
    primaryCarePhysician: {
      name: 'Dr. Michael Chen',
      specialty: 'Internal Medicine',
      phone: '(555) 987-6543'
    },
    availableBenefits: [
      'Preventive Care - 100% covered',
      'Specialist Visits - $25 copay',
      'Emergency Room - $100 copay',
      'Urgent Care - $15 copay',
      'Prescription Drugs - Tier 1: $10, Tier 2: $25, Tier 3: $50'
    ],
    notes: [
      'Coverage effective through December 31, 2024',
      'Prior authorization required for certain procedures',
      'Network restrictions apply to specialist visits',
      'Prescription coverage includes 90-day supply option'
    ]
  }

  // Real-time validation
  useEffect(() => {
    const newValidations = {
      providerId: formData.providerId.trim().length >= 3,
      effectiveDate: formData.effectiveDate.length > 0,
      subscriberId: formData.subscriberId.trim().length > 0,
      dependantSequence: formData.dependantSequence.trim().length > 0,
      lastName: formData.lastName.trim().length > 0,
      firstName: formData.firstName.trim().length > 0,
      dateOfBirth: formData.dateOfBirth.length > 0
    }
    setValidations(newValidations)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user selects an option
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleIdentificationMethodChange = (method: 'subscriber' | 'name') => {
    setFormData(prev => ({
      ...prev,
      identificationMethod: method
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    // Required field validation
    if (!formData.providerId.trim()) {
      newErrors.providerId = 'Provider ID is required'
    } else if (formData.providerId.trim().length < 3) {
      newErrors.providerId = 'Provider ID must be at least 3 characters'
    }
    
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required'
    }
    
    // Validate that at least one identification method is selected
    if (formData.identificationMethod === 'none') {
      newErrors.identificationMethod = 'Please select an identification method'
    } else if (formData.identificationMethod === 'subscriber') {
      if (!formData.subscriberId.trim()) {
        newErrors.subscriberId = 'Subscriber ID is required'
      }
      if (!formData.dependantSequence.trim()) {
        newErrors.dependantSequence = 'Dependant sequence is required'
      }
    } else if (formData.identificationMethod === 'name') {
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  const handleViewReservedBenefits = () => {
    // Navigate to reserved benefits view
    console.log('Viewing reserved benefits')
  }

  // Modal and step handling functions
  const handleVerifyEligibility = () => {
    if (validateForm()) {
      setShowEligibilityModal(true)
    }
  }

  const handleEligibilityTypeContinue = (type: string) => {
    setSelectedEligibilityType(type)
    setShowEligibilityModal(false)
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setCurrentStep(3) // Move to results step
    }, 2000)
  }

  const handleReserveBenefits = () => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setCurrentStep(4) // Move to success step
    }, 2000)
  }

  const handleBackToForm = () => {
    setCurrentStep(1)
    setSelectedEligibilityType('')
  }

  // Modal Component
  const EligibilityTypeModal = () => {
    if (!showEligibilityModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Eligibility Type
            </h3>
            <div className="space-y-3">
              {eligibilityTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleEligibilityTypeContinue(type.id)}
                  className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step Indicators Component
  const StepIndicators = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { number: 1, label: 'Patient Information' },
      { number: 2, label: 'Eligibility Type' },
      { number: 3, label: 'Results' },
      { number: 4, label: 'Confirmation' }
    ]

    return (
      <div className="hedis-screening-step-indicators">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`hedis-screening-step ${
              step.number === currentStep
                ? 'hedis-screening-step-active'
                : step.number < currentStep
                ? 'hedis-screening-step-completed'
                : 'hedis-screening-step-inactive'
            }`}
          >
            <div className="hedis-screening-step-number">{step.number}</div>
            <div className="hedis-screening-step-label">{step.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // Current Eligibility Results Component
  const CurrentEligibilityResults = () => {
    return (
      <div className="hedis-screening-content">
        <h2 className="hedis-screening-step-title">
          Current Eligibility based on the information provided
        </h2>

        {/* Step Progress */}
        <StepIndicators currentStep={currentStep} />

        <div className="flex justify-end mb-6">
          <button
            onClick={handleBackToForm}
            className="btn-secondary"
          >
            <Icon name="arrow-left" size={16} />
            Back to Form
          </button>
        </div>

        {/* Provider Information */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Provider Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provider Name</p>
            <p className="font-medium">{eligibilityResults.provider.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provider ID</p>
            <p className="font-medium">{eligibilityResults.provider.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Specialty</p>
            <p className="font-medium">{eligibilityResults.provider.specialty}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium">{eligibilityResults.provider.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
            <p className="font-medium">{eligibilityResults.provider.address}</p>
          </div>
        </div>

        {/* Patient Information */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
            <p className="font-medium">{eligibilityResults.patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
            <p className="font-medium">{eligibilityResults.patient.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
            <p className="font-medium">{eligibilityResults.patient.dob}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Relationship</p>
            <p className="font-medium">{eligibilityResults.patient.relationship}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium text-green-600">{eligibilityResults.patient.status}</p>
          </div>
        </div>

        {/* Primary Care Physician */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Primary Care Physician
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">PCP Name</p>
            <p className="font-medium">{eligibilityResults.primaryCarePhysician.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Specialty</p>
            <p className="font-medium">{eligibilityResults.primaryCarePhysician.specialty}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium">{eligibilityResults.primaryCarePhysician.phone}</p>
          </div>
        </div>

        {/* Available Benefits */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Available Benefits
        </h3>
        <div className="mb-6">
          <ul className="space-y-2">
            {eligibilityResults.availableBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Icon name="check" size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Notes
        </h3>
        <div className="mb-6">
          <ul className="space-y-2">
            {eligibilityResults.notes.map((note, index) => (
              <li key={index} className="flex items-start">
                <Icon name="info" size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Eligibility Type: <span className="font-medium text-gray-900 dark:text-white">{selectedEligibilityType}</span></p>
              <p>Requested on: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewReservedBenefits}
                className="btn-tertiary"
              >
                <Icon name="external-link" size={16} />
                View Reserved Benefits
              </button>
              <button
                onClick={handleReserveBenefits}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="loader-2" size={16} className="animate-spin" />
                    Reserving Benefits...
                  </>
                ) : (
                  <>
                    <Icon name="shield-check" size={16} />
                    Reserve Benefits
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getInputClassName = (fieldName: string) => {
    const baseClasses = "form-input transition-all duration-200"
    const errorClasses = "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500"
    const successClasses = "border-green-300 dark:border-green-600 focus:ring-green-500 focus:border-green-500"
    
    if (errors[fieldName]) {
      return `${baseClasses} ${errorClasses}`
    } else if (validations[fieldName]) {
      return `${baseClasses} ${successClasses}`
    } else {
      return baseClasses
    }
  }

  const getSelectClassName = (fieldName: string) => {
    const baseClasses = "form-select transition-all duration-200"
    const errorClasses = "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500"
    const successClasses = "border-green-300 dark:border-green-600 focus:ring-green-500 focus:border-green-500"
    
    if (errors[fieldName]) {
      return `${baseClasses} ${errorClasses}`
    } else if (validations[fieldName]) {
      return `${baseClasses} ${successClasses}`
    } else {
      return baseClasses
    }
  }

  if (submitted) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
          <div className="hedis-screening-breadcrumb">
            <button onClick={handleBack} className="hedis-screening-back-button">
              <Icon name="arrow-left" size={20} />
              <span>Back to P.I.C. Actions</span>
            </button>
          </div>
        </div>
        
        <div className="hedis-screening-content">
          <div className="text-center py-12">
            <div className="mb-6">
              <Icon name="check-circle" size={64} className="text-green-500 mx-auto animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Eligibility Request Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your patient eligibility request has been successfully submitted. You will receive a response within 24-48 hours.
            </p>
            <button
              onClick={handleBack}
              className="btn-primary"
            >
              Return to P.I.C. Actions
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render different steps based on currentStep
  if (currentStep === 3) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
          <div className="hedis-screening-breadcrumb">
            <button onClick={handleBack} className="hedis-screening-back-button">
              <Icon name="arrow-left" size={20} />
              <span>Back to P.I.C. Actions</span>
            </button>
          </div>
        </div>
        <CurrentEligibilityResults />
      </div>
    )
  }

  if (currentStep === 4) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
          <div className="hedis-screening-breadcrumb">
            <button onClick={handleBack} className="hedis-screening-back-button">
              <Icon name="arrow-left" size={20} />
              <span>Back to P.I.C. Actions</span>
            </button>
          </div>
        </div>
        
        <div className="hedis-screening-content">
          <div className="text-center py-12">
            <div className="mb-6">
              <Icon name="check-circle" size={64} className="text-green-500 mx-auto animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Benefits Reserved Successfully
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The {selectedEligibilityType} benefits have been successfully reserved for the patient.
            </p>
            <button
              onClick={handleBack}
              className="btn-primary"
            >
              Return to P.I.C. Actions
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hedis-screening-page">
      <div className="hedis-screening-header">
        <div className="hedis-screening-breadcrumb">
          <button onClick={handleBack} className="hedis-screening-back-button">
            <Icon name="arrow-left" size={20} />
            <span>Back to P.I.C. Actions</span>
          </button>
        </div>
        <div className="hedis-screening-progress">
          <StepIndicators currentStep={currentStep} />
        </div>
      </div>

      <div className="hedis-screening-content">
        <div className="hedis-screening-step-content">
          <h2 className="hedis-screening-step-title">
            Request Patient Eligibility
          </h2>
          <p className="hedis-screening-step-description">
            Submit a patient eligibility request to check benefits and coverage. Please provide the required information below.
          </p>



          <form onSubmit={handleSubmit} className="eligibility-form">
            {/* Required Fields Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Required Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div data-error={!!errors.providerId}>
                      <label htmlFor="providerId" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Provider ID <span className="text-red-500">*</span>
                      </label>
                      
                      {/* Provider ID Manual Input Checkbox */}
                      <div className="mb-3">
                        <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            name="manualProviderId"
                            checked={formData.manualProviderId}
                            onChange={handleCheckboxChange}
                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Enter Provider ID manually (if not in dropdown)
                        </label>
                      </div>

                      {formData.manualProviderId ? (
                        <div className="relative">
                          <input
                            type="text"
                            id="providerId"
                            name="providerId"
                            value={formData.providerId}
                            onChange={handleInputChange}
                            placeholder="Enter provider ID"
                            className="form-input"
                            onClick={() => handleIdentificationMethodChange('subscriber')}
                          />
                          {validations.providerId && !errors.providerId && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Icon name="check-circle" size={16} className="text-green-500" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            id="providerId"
                            name="providerId"
                            value={formData.providerId}
                            onChange={handleSelectChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              errors.providerId ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onClick={() => handleIdentificationMethodChange('subscriber')}
                          >
                            <option value="">Select a provider...</option>
                            {providerIdOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {validations.providerId && !errors.providerId && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Icon name="check-circle" size={16} className="text-green-500" />
                            </div>
                          )}
                        </div>
                      )}
                      {errors.providerId && (
                        <p className="mt-1 text-sm text-red-600">{errors.providerId}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Your unique provider identifier (minimum 3 characters)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div data-error={!!errors.effectiveDate}>
                      <label htmlFor="effectiveDate" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Effective as of <span className="text-red-500">*</span>
                      </label>
                      <p className="mt-1 text-sm leading-8 text-gray-500 dark:text-gray-400">
                        Date when the eligibility check becomes valid (today or future date)
                      </p>
                      <DatePicker
                        name="effectiveDate"
                        value={formData.effectiveDate}
                        onChange={(date) => {
                          setFormData(prev => ({ ...prev, effectiveDate: date }))
                          handleIdentificationMethodChange('subscriber')
                        }}
                        placeholder="Select effective date"
                        hasError={!!errors.effectiveDate}
                      />
                      {errors.effectiveDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Identification Section */}
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Patient Identification Method
                </h3>
                
                {/* Method Selection Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleIdentificationMethodChange('subscriber')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.identificationMethod === 'subscriber'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon name="credit-card" size={16} className="inline mr-2" />
                    Subscriber ID Method
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIdentificationMethodChange('name')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      formData.identificationMethod === 'name'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon name="user" size={16} className="inline mr-2" />
                    Name/DOB Method
                  </button>
                </div>
                
                {errors.identificationMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.identificationMethod}</p>
                )}

                {/* Subscriber ID Method */}
                {formData.identificationMethod === 'subscriber' && (
                  <div className="space-y-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div data-error={!!errors.subscriberId}>
                        <label htmlFor="subscriberId" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Subscriber ID:
                        </label>
                        
                        {/* Subscriber ID Manual Input Checkbox */}
                        <div className="mb-3">
                          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              name="manualSubscriberId"
                              checked={formData.manualSubscriberId}
                              onChange={handleCheckboxChange}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Enter Subscriber ID manually (if not in dropdown)
                          </label>
                        </div>

                        {formData.manualSubscriberId ? (
                          <div className="relative">
                            <input
                              type="text"
                              id="subscriberId"
                              name="subscriberId"
                              value={formData.subscriberId}
                              onChange={handleInputChange}
                              placeholder="Enter subscriber ID"
                              className="form-input"
                              onClick={() => handleIdentificationMethodChange('subscriber')}
                            />
                            {validations.subscriberId && !errors.subscriberId && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <Icon name="check-circle" size={16} className="text-green-500" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              id="subscriberId"
                              name="subscriberId"
                              value={formData.subscriberId}
                              onChange={handleSelectChange}
                              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                errors.subscriberId ? 'border-red-500' : 'border-gray-300'
                              }`}
                              onClick={() => handleIdentificationMethodChange('subscriber')}
                            >
                              <option value="">Select a subscriber...</option>
                              {subscriberIdOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {validations.subscriberId && !errors.subscriberId && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Icon name="check-circle" size={16} className="text-green-500" />
                              </div>
                            )}
                          </div>
                        )}
                        {errors.subscriberId && (
                          <p className="mt-1 text-sm text-red-600">{errors.subscriberId}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Primary subscriber's ID (typically 9-11 digits)
                        </p>
                      </div>
                      
                      <div data-error={!!errors.dependantSequence}>
                        <label htmlFor="dependantSequence" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Dependant Sequence:
                        </label>
                        
                        {/* Dependant Sequence Manual Input Checkbox */}
                        <div className="mb-3">
                          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              name="manualDependantSequence"
                              checked={formData.manualDependantSequence}
                              onChange={handleCheckboxChange}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Enter Dependent Sequence manually (if not in dropdown)
                          </label>
                        </div>

                        {formData.manualDependantSequence ? (
                          <div className="relative">
                            <input
                              type="text"
                              id="dependantSequence"
                              name="dependantSequence"
                              value={formData.dependantSequence}
                              onChange={handleInputChange}
                              placeholder="(1 or more digits)"
                              className="form-input"
                              onClick={() => handleIdentificationMethodChange('subscriber')}
                            />
                            {validations.dependantSequence && !errors.dependantSequence && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <Icon name="check-circle" size={16} className="text-green-500" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              id="dependantSequence"
                              name="dependantSequence"
                              value={formData.dependantSequence}
                              onChange={handleSelectChange}
                              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                errors.dependantSequence ? 'border-red-500' : 'border-gray-300'
                              }`}
                              onClick={() => handleIdentificationMethodChange('subscriber')}
                            >
                              <option value="">Select dependant sequence...</option>
                              {dependantSequenceOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {validations.dependantSequence && !errors.dependantSequence && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Icon name="check-circle" size={16} className="text-green-500" />
                              </div>
                            )}
                          </div>
                        )}
                        {errors.dependantSequence && (
                          <p className="mt-1 text-sm text-red-600">{errors.dependantSequence}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Dependent sequence number (00 for primary, 01+ for dependents)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Name/DOB Method */}
                {formData.identificationMethod === 'name' && (
                  <div className="space-y-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div data-error={!!errors.lastName}>
                        <label htmlFor="lastName" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Last Name:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                            className="form-input"
                            onClick={() => handleIdentificationMethodChange('name')}
                          />
                          {validations.lastName && !errors.lastName && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Icon name="check-circle" size={16} className="text-green-500" />
                            </div>
                          )}
                        </div>
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Patient's last name as it appears on insurance records
                        </p>
                      </div>
                      
                      <div data-error={!!errors.firstName}>
                        <label htmlFor="firstName" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          First Name:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            className="form-input"
                            onClick={() => handleIdentificationMethodChange('name')}
                          />
                          {validations.firstName && !errors.firstName && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Icon name="check-circle" size={16} className="text-green-500" />
                            </div>
                          )}
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Patient's first name as it appears on insurance records
                        </p>
                      </div>
                    </div>
                    
                    <div data-error={!!errors.dateOfBirth}>
                      <label htmlFor="dateOfBirth" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth:
                      </label>
                      <div className="relative">
                        <DatePicker
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={(date) => {
                            setFormData(prev => ({ ...prev, dateOfBirth: date }))
                            handleIdentificationMethodChange('name')
                          }}
                          placeholder="Select date of birth"
                          hasError={!!errors.dateOfBirth}
                        />
                        {validations.dateOfBirth && !errors.dateOfBirth && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <Icon name="check-circle" size={16} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Patient's date of birth in MM/DD/YYYY format
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleViewReservedBenefits}
                className="btn-tertiary"
              >
                <Icon name="heart" size={20} className="mr-2" />
                View Reserved Benefits
              </button>
              <button
                type="button"
                onClick={handleVerifyEligibility}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="loader-2" size={20} className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Icon name="search" size={20} className="text-white mr-2" />
                    Verify Eligibility
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal */}
      <EligibilityTypeModal />
    </div>
  )
} 
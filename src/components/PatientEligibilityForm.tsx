import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import DatePicker from './DatePicker'
import ReservedBenefitsPageStandalone from './ReservedBenefitsPage'
import HelperButton from './HelperButton'
import MilaInputField from './MilaInputField'
import { scrollToFirstError } from '../utils/validationUtils'

interface PatientEligibilityFormProps {
  onBack?: () => void
  originatingPage?: string
  navigationHistory?: string[]
}

export default function PatientEligibilityForm({ 
  onBack, 
  originatingPage = 'pic',
  navigationHistory = []
}: PatientEligibilityFormProps) {
  // Navigation state
  const [navigationStack] = useState<string[]>([
    originatingPage,
    ...navigationHistory
  ])

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
  const [showReservedBenefits, setShowReservedBenefits] = useState(false)
  const [currentField, setCurrentField] = useState<string>('')


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

  // Mock data for reserved benefits page
  const reservedBenefitsData = {
    member: {
      id: "H00967498 00",
      name: "Singer Shirley",
      address: "400 North West 92nd Ave, Pembroke Pines, Fl 33027",
      dateOfBirth: "04/20/1943"
    },
    primaryCarePhysician: {
      id: "0000171392 PCP301",
      organization: "PPMG At Hallandale Inc.",
      phone: "(305) 418-2025",
      tollFree: "(877) 418-2025"
    },
    provider: {
      renderingProvider: "Jodi L. Stern",
      npi: "12345878995",
      taxId: "4584552455556X",
      license: "OPC2748",
      location: {
        name: "(69) Dr Stern's VHC @ Sunset",
        address: "8732 SW 72nd Street, Miami, Fl 33173",
        phone: "(305) 559-8370"
      }
    },
    eligibility: {
      certificateId: "4569578596",
      effectiveDate: "06/13/16",
      expiration: "07/30/16",
      group: "Hum MCR SPC314 B314",
      plan: "Hum MCR - $115"
    },
    benefits: [
      {
        description: "1 Routine Examp at $0 Co-Pay",
        benefit: "$115 Product Benefit, OR"
      },
      {
        description: "1 Pair(s) of Grand Lux Collection Eyeglasses, OR",
        benefit: "1 Free Lasik Procedure"
      },
      {
        description: "1 Discounted Eye Coloration Surgery",
        benefit: "1 $10 KP Procedure"
      }
    ],
    notes: "Reminder! All claims must be received within 90 days from the date of service. Claim appeals must be received within 60 days from the denial EOP. Expedite your payment with direct deposits. If you have not signed up for direct deposit please visit our web portal @ www.webportal.com"
  };

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
    
    // Update current field for AI assistant context
    setCurrentField(name)
    
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
    
    // Update current field for AI assistant context
    setCurrentField(name)
    
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

  const handleMilaTrigger = (fieldName: string, formName: string) => {
    // This will be handled by the HelperModal component
    console.log(`M.I.L.A. triggered for ${fieldName} in ${formName}`)
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
    
    // Scroll to first error on mobile if there are errors
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors)
    }
    
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
    // Smart back navigation based on originating page and navigation history
    const currentOrigin = navigationStack[navigationStack.length - 1]
    
    switch (currentOrigin) {
      case 'pic':
        // Return to PIC landing page
        if (onBack) {
          onBack()
        }
        break
      case 'dashboard':
        // Return to main dashboard
        window.location.href = '/'
        break
      case 'hedis':
        // Return to HEDIS landing page
        window.location.href = '/hedis'
        break
      case 'patient-search':
        // Return to patient search results
        // This would typically be handled by the parent component
        if (onBack) {
          onBack()
        }
        break
      case 'claims':
        // Return to claims section
        window.location.href = '/claims'
        break
      case 'eligibility':
        // Return to eligibility section
        window.location.href = '/eligibility'
        break
      default:
        // Default fallback - try to go back in browser history
        if (window.history.length > 1) {
          window.history.back()
        } else {
          // If no history, go to dashboard
          window.location.href = '/'
        }
    }
  }

  const handleViewReservedBenefits = () => {
    // Show standalone reserved benefits page
    setShowReservedBenefits(true)
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
      // Scroll to top on mobile when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2000)
  }

  const handleReserveBenefits = () => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setCurrentStep(4) // Move to success step
      // Scroll to top on mobile when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2000)
  }

  // handleBackToForm removed as it's not used

  const handleNewSearch = () => {
    // Reset form data
    setFormData({
      providerId: '',
      effectiveDate: '',
      subscriberId: '',
      dependantSequence: '',
      lastName: '',
      firstName: '',
      dateOfBirth: '',
      identificationMethod: 'subscriber',
      manualProviderId: false,
      manualSubscriberId: false,
      manualDependantSequence: false
    })
    
    // Reset all states
    setIsSubmitting(false)
    setSubmitted(false)
    setErrors({})
    setValidations({})
    setShowEligibilityModal(false)
    setSelectedEligibilityType('')
    
    // Go back to step 1
    setCurrentStep(1)
    // Scroll to top on mobile when resetting to step 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackFromReservedBenefits = () => {
    setShowReservedBenefits(false)
  }

  // Helper function to get the display name for the originating page
  const getOriginatingPageDisplayName = () => {
    const currentOrigin = navigationStack[navigationStack.length - 1]
    
    switch (currentOrigin) {
      case 'pic':
        return 'P.I.C. Actions'
      case 'dashboard':
        return 'Dashboard'
      case 'hedis':
        return 'HEDIS Screenings'
      case 'patient-search':
        return 'Patient Search'
      case 'claims':
        return 'Claims'
      case 'eligibility':
        return 'Eligibility'
      default:
        return 'Dashboard'
    }
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
    return (
      <div className="step-indicators-container">
        <div className={`step-item ${currentStep > 1 ? 'step-completed' : currentStep === 1 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">1</div>
          <div className="step-label">Patient Info</div>
        </div>
        <div className={`step-item ${currentStep > 2 ? 'step-completed' : currentStep === 2 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">2</div>
          <div className="step-label">Eligibility Type</div>
        </div>
        <div className={`step-item ${currentStep > 3 ? 'step-completed' : currentStep === 3 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">3</div>
          <div className="step-label">Current Eligibility</div>
        </div>
        <div className={`step-item ${currentStep > 4 ? 'step-completed' : currentStep === 4 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">4</div>
          <div className="step-label">Reserved Benefits</div>
        </div>
      </div>
    )
  }

  // Current Eligibility Results Component
  const CurrentEligibilityResults = () => {
    return (
      <div className="screening-form-content relative">
        {/* Enhanced Header with Status Indicators */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Eligibility Results</h2>
                <p className="text-gray-600 dark:text-gray-400">Patient eligibility information retrieved successfully</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                Active Coverage
              </span>
            </div>
          </div>
        </div>

        {/* Provider Information Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Information</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                Verified
              </span>
            </div>
          </div>
          
          {/* Provider Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Name:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.provider.name}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">ID:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.provider.id}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Specialty:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.provider.specialty}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Phone:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.provider.phone}</span>
            </div>
            <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Address:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.provider.address}</span>
            </div>
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
          
          {/* Patient Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Name:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.patient.name}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">ID:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.patient.id}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">DOB:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.patient.dob}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Relationship:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.patient.relationship}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Status:</span>
              <span className="text-sm font-medium text-green-600">{eligibilityResults.patient.status}</span>
            </div>
          </div>
        </div>

        {/* Primary Care Physician Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Primary Care Physician</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                Assigned
              </span>
            </div>
          </div>
          
          {/* PCP Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Name:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.primaryCarePhysician.name}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Specialty:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.primaryCarePhysician.specialty}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Phone:</span>
              <span className="text-sm text-gray-900 dark:text-white">{eligibilityResults.primaryCarePhysician.phone}</span>
            </div>
          </div>
        </div>

        {/* Available Benefits Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Benefits</h3>
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium rounded-full">
                {eligibilityResults.availableBenefits.length} Benefits
              </span>
            </div>
          </div>
          
          {/* Benefits List */}
          <div className="space-y-2">
            {eligibilityResults.availableBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Icon name="check" size={16} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                {eligibilityResults.notes.length} Notes
              </span>
            </div>
          </div>
          
          {/* Notes List */}
          <div className="space-y-2">
            {eligibilityResults.notes.map((note, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Icon name="info" size={16} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Eligibility Type: <span className="font-medium text-gray-900 dark:text-white">{selectedEligibilityType}</span></p>
              <p>Requested on: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleReserveBenefits}
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="loader-2" size={18} className="animate-spin" />
                    <span>Reserving Benefits...</span>
                  </>
                ) : (
                  <>
                    <Icon name="shield-check" size={18} />
                    <span>Reserve Benefits</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ReservedBenefitsPage = () => {
    // Financial summary data
    const financialSummary = {
      totalReserved: 2450,
      available: 1200,
      used: 1250
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reserved Benefits
                </h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="btn-secondary flex items-center gap-2">
                  <Icon name="printer" size={16} />
                  Print
                </button>
                <button 
                  onClick={handleNewSearch}
                  className="btn-primary flex items-center gap-2"
                >
                  <Icon name="search" size={16} />
                  New Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Financial Summary Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Benefits Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">${financialSummary.totalReserved.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Reserved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">${financialSummary.available.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">${financialSummary.used.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Used</div>
              </div>
            </div>
          </div>

          {/* Network Banner */}
          <div className="bg-slate-600 text-white p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded">
                  <Icon name="shield-check" size={24} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold">In-Network Provider</h3>
                  <p className="text-sm text-slate-200">Your benefits are active and available</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-200">Certificate ID</div>
                <div className="font-semibold">{reservedBenefitsData.eligibility.certificateId}</div>
              </div>
            </div>
          </div>

          {/* Member Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Member Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Member ID:</span> {reservedBenefitsData.member.id}</div>
                <div><span className="font-medium">Name:</span> {reservedBenefitsData.member.name}</div>
                <div><span className="font-medium">Address:</span> {reservedBenefitsData.member.address}</div>
                <div><span className="font-medium">Date of Birth:</span> {reservedBenefitsData.member.dateOfBirth}</div>
              </div>
            </div>
          </div>

          {/* Primary Care Physician */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Primary Care Physician
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">ID:</span> {reservedBenefitsData.primaryCarePhysician.id}</div>
                <div><span className="font-medium">Organization:</span> {reservedBenefitsData.primaryCarePhysician.organization}</div>
                <div><span className="font-medium">Phone:</span> Tel: {reservedBenefitsData.primaryCarePhysician.phone}</div>
                <div><span className="font-medium">Toll Free:</span> {reservedBenefitsData.primaryCarePhysician.tollFree}</div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Provider Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendering Provider</div>
                  <div className="text-sm">{reservedBenefitsData.provider.renderingProvider}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">NPI</div>
                  <div className="text-sm">{reservedBenefitsData.provider.npi}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tax ID</div>
                  <div className="text-sm">{reservedBenefitsData.provider.taxId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">License</div>
                  <div className="text-sm">{reservedBenefitsData.provider.license}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Location</div>
                <div>{reservedBenefitsData.provider.location.name}</div>
                <div>{reservedBenefitsData.provider.location.address}</div>
                <div>{reservedBenefitsData.provider.location.phone}</div>
              </div>
            </div>
          </div>

          {/* Eligibility Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eligibility Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate ID</div>
                  <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.certificateId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Effective Date</div>
                  <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.effectiveDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiration</div>
                  <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.expiration}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Group</div>
                  <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.group}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</div>
                  <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.plan}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reserved Benefits Details
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Benefit Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reserved Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Used Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Available</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Vision Exam</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$150.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$150.00</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Eyeglasses</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$200.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$75.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$125.00</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Partially Used</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Contact Lenses</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$100.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$100.00</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Used</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Benefits
              </h3>
            </div>
            <div className="p-6">
              {reservedBenefitsData.benefits.map((benefit, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{benefit.benefit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Important Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{reservedBenefitsData.notes}</p>
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

  let stepContent: React.ReactNode = null;
  
  if (showReservedBenefits) {
    stepContent = (
      <ReservedBenefitsPageStandalone 
        onBack={handleBackFromReservedBenefits}
      />
    );
  } else if (submitted) {
    stepContent = (
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
    );
  } else if (currentStep === 3) {
    stepContent = <CurrentEligibilityResults />;
  } else if (currentStep === 4) {
    stepContent = <ReservedBenefitsPage />;
  } else {
    // Default: show the form
    stepContent = (
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
                          <MilaInputField
                            value={formData.providerId}
                            onChange={(value) => {
                              setFormData(prev => ({ ...prev, providerId: value }))
                            }}
                            placeholder="Enter provider ID"
                            fieldName="providerId"
                            formName="PatientEligibility"
                            onMilaTrigger={handleMilaTrigger}
                            error={!!errors.providerId}
                            className="form-input"
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
                            <MilaInputField
                              value={formData.subscriberId}
                              onChange={(value) => {
                                setFormData(prev => ({ ...prev, subscriberId: value }))
                              }}
                              placeholder="Enter subscriber ID"
                              fieldName="subscriberId"
                              formName="PatientEligibility"
                              onMilaTrigger={handleMilaTrigger}
                              error={!!errors.subscriberId}
                              className="form-input"
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
    );
  }

  // Render the header ONCE, and the step content below
  if (showReservedBenefits) {
    return (
      <div className="hedis-screening-page">
        {stepContent}
      </div>
    );
  }

  return (
    <div className="hedis-screening-page">
      <div className="hedis-screening-header">
        <div className="hedis-screening-progress">
          <StepIndicators currentStep={currentStep} />
        </div>
      </div>
      {stepContent}
      <EligibilityTypeModal />
      
      {/* AI Assistant Button */}
      <HelperButton
        currentForm="PatientEligibilityForm"
        currentField={currentField}
        currentStep={currentStep}
        onFieldSuggestion={(fieldName, suggestion) => {
          console.log(`AI Suggestion for ${fieldName}:`, suggestion)
          // In a real implementation, you could auto-fill or highlight the field
        }}
      />
    </div>
  )
} 
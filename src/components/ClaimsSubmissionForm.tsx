import React, { useState, useEffect, useMemo } from 'react'
import Icon from './Icon'
import DatePicker from './DatePicker'

interface ClaimsSubmissionFormProps {
  onBack?: () => void
  originatingPage?: string
  navigationHistory?: string[]
}

export default function ClaimsSubmissionForm({ 
  onBack, 
  originatingPage = 'pic',
  navigationHistory = []
}: ClaimsSubmissionFormProps) {
  // Navigation state
  const [navigationStack] = useState<string[]>([
    originatingPage,
    ...navigationHistory
  ])

  const [formData, setFormData] = useState({
    // Provider Information
    providerId: '',
    providerName: '',
    npi: '',
    taxId: '',
    
    // Patient Information
    patientId: '',
    patientName: '',
    dateOfBirth: '',
    gender: '',
    
    // Claim Information
    claimType: '',
    serviceDate: '',
    placeOfService: '',
    procedureCodes: '',
    charges: '',
    
    // Insurance Information
    primaryInsurance: '',
    secondaryInsurance: '',
    groupNumber: '',
    memberId: '',
    
    // Additional Information
    authorizationNumber: '',
    notes: '',
    
    // Patient Identification (from Patient Eligibility form)
    subscriberId: '',
    dependantSequence: '',
    lastName: '',
    firstName: '',
    identificationMethod: 'subscriber' as 'subscriber' | 'name' | 'none',
    manualProviderId: false,
    manualSubscriberId: false,
    manualDependantSequence: false,
    effectiveDate: '',
    
    // Step 2 - Patient Information
    serviceDateFrom: '',
    serviceDateTo: '',
    lab: '',
    submissionForm: '',
    
    // Step 2 - Procedure / Exam Codes
    routineExams: '',
    contactLensFittings: '',
    postCataractExam: '',
    isDiabetic: '',
    diabetesType: '',
    manifestation: '',
    wasDilated: '',
    reasonForNotDilating: '',
    reasonOther: '',
    diagnosisCodes1: '',
    diagnosisCodes2: '',
    diagnosisCodes3: '',
    diagnosisCodes4: '',
    diagnosisCodes5: '',
    diagnosisCodes6: '',
    
      // Step 2 - Doctor's Signature Agreement
  doctorSignatureAgreement: false,
  // Dynamic diagnosis codes
  diagnosisCodes: [
    { id: 1, code: '', description: '', isPrimary: true }
  ]
})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showDiagnosisCheatSheet, setShowDiagnosisCheatSheet] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validations, setValidations] = useState<{ [key: string]: boolean }>({})
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Real-world data for dropdowns
  const providerIdOptions = [
    { value: '1234567890', label: '1234567890 - Dr. Sarah Johnson, Cardiology' },
    { value: '2345678901', label: '2345678901 - Dr. Michael Chen, Internal Medicine' },
    { value: '3456789012', label: '3456789012 - Dr. Emily Rodriguez, Family Practice' },
    { value: '4567890123', label: '4567890123 - Dr. David Thompson, Pediatrics' },
    { value: '5678901234', label: '5678901234 - Dr. Lisa Wang, Dermatology' }
  ]

  const claimTypeOptions = [
    { value: 'medical', label: 'Medical Claim' },
    { value: 'dental', label: 'Dental Claim' },
    { value: 'vision', label: 'Vision Claim' },
    { value: 'pharmacy', label: 'Pharmacy Claim' },
    { value: 'mental-health', label: 'Mental Health Claim' }
  ]

  const placeOfServiceOptions = [
    { value: 'office', label: 'Office' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'urgent-care', label: 'Urgent Care' },
    { value: 'emergency-room', label: 'Emergency Room' },
    { value: 'outpatient', label: 'Outpatient Facility' },
    { value: 'home', label: 'Home' },
    { value: 'nursing-facility', label: 'Nursing Facility' }
  ]

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  // Additional data options from Patient Eligibility form
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
    { value: '38', label: '38 - Student Child 1' }
  ]

  // Step 2 dropdown options
  const labOptions = [
    { value: '', label: 'Please Select One' },
    { value: 'lab1', label: 'Lab 1 - Central Processing' },
    { value: 'lab2', label: 'Lab 2 - Regional Center' },
    { value: 'lab3', label: 'Lab 3 - Specialty Services' },
    { value: 'lab4', label: 'Lab 4 - Mobile Unit' }
  ]

  const submissionFormOptions = [
    { value: '', label: 'Please Select One' },
    { value: 'form1', label: 'Standard Claim Form' },
    { value: 'form2', label: 'Expedited Processing Form' },
    { value: 'form3', label: 'Specialty Service Form' },
    { value: 'form4', label: 'Emergency Claim Form' }
  ]

  const routineExamsOptions = [
    { value: '', label: 'Not Selected' },
    { value: 'comprehensive', label: 'Comprehensive Eye Exam' },
    { value: 'basic', label: 'Basic Eye Exam' },
    { value: 'follow-up', label: 'Follow-up Exam' },
    { value: 'emergency', label: 'Emergency Exam' }
  ]

  const contactLensFittingsOptions = [
    { value: '', label: 'Not Selected' },
    { value: 'initial', label: 'Initial Fitting' },
    { value: 'follow-up', label: 'Follow-up Fitting' },
    { value: 'adjustment', label: 'Lens Adjustment' },
    { value: 'evaluation', label: 'Lens Evaluation' }
  ]

  const postCataractExamOptions = [
    { value: '', label: 'Not Selected' },
    { value: 'post-op', label: 'Post-Operative Exam' },
    { value: 'follow-up', label: 'Follow-up Exam' },
    { value: 'comprehensive', label: 'Comprehensive Post-Cataract' }
  ]

  const diabetesTypeOptions = [
    { value: '', label: 'Not Selected' },
    { value: 'type1', label: 'Type 1 Diabetes' },
    { value: 'type2', label: 'Type 2 Diabetes' },
    { value: 'gestational', label: 'Gestational Diabetes' },
    { value: 'prediabetes', label: 'Prediabetes' }
  ]

  const manifestationOptions = [
    { value: '', label: 'Not Selected' },
    { value: 'retinopathy', label: 'Diabetic Retinopathy' },
    { value: 'macular', label: 'Macular Edema' },
    { value: 'neuropathy', label: 'Optic Neuropathy' },
    { value: 'cataracts', label: 'Cataracts' }
  ]

  const reasonForNotDilatingOptions = [
    { value: '', label: 'Please Select One' },
    { value: 'patient-refused', label: 'Patient Refused' },
    { value: 'medical-contraindication', label: 'Medical Contraindication' },
    { value: 'equipment-unavailable', label: 'Equipment Unavailable' },
    { value: 'time-constraints', label: 'Time Constraints' },
    { value: 'other', label: 'Other' }
  ]

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Set validation success
    if (value.trim()) {
      setValidations(prev => ({ ...prev, [name]: true }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Set validation success
    if (value) {
      setValidations(prev => ({ ...prev, [name]: true }))
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  // Diagnosis codes management
  const addDiagnosisCode = () => {
    if (formData.diagnosisCodes.length < 6) {
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: [
          ...prev.diagnosisCodes,
          {
            id: Math.max(...prev.diagnosisCodes.map(dc => dc.id)) + 1,
            code: '',
            description: '',
            isPrimary: false
          }
        ]
      }))
    }
  }

  const removeDiagnosisCode = (id: number) => {
    if (formData.diagnosisCodes.length > 1) {
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: prev.diagnosisCodes.filter(dc => dc.id !== id)
      }))
    }
  }

  const updateDiagnosisCode = (id: number, field: 'code' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCodes: prev.diagnosisCodes.map(dc =>
        dc.id === id ? { ...dc, [field]: value } : dc
      )
    }))
  }

  const setPrimaryDiagnosis = (id: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosisCodes: prev.diagnosisCodes.map(dc => ({
        ...dc,
        isPrimary: dc.id === id
      }))
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleIdentificationMethodChange = (method: 'subscriber' | 'name') => {
    setFormData(prev => ({ ...prev, identificationMethod: method }))
  }

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    // Step 1 validation (Provider & Patient Info)
    if (currentStep === 1) {
      if (!formData.providerId) newErrors.providerId = 'Provider ID is required'
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
      
      // Validate based on identification method
      if (formData.identificationMethod === 'subscriber') {
        if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
        if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
      } else if (formData.identificationMethod === 'name') {
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      } else {
        newErrors.identificationMethod = 'Please select an identification method'
      }
    }
    
    // Step 2 validation (Claim Details)
    if (currentStep === 2) {
      if (!formData.claimType) newErrors.claimType = 'Claim type is required'
      if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required'
      if (!formData.placeOfService) newErrors.placeOfService = 'Place of service is required'
      // Check if at least one diagnosis code has a value
      const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
      if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
      if (!formData.procedureCodes) newErrors.procedureCodes = 'Procedure codes are required'
      if (!formData.charges) newErrors.charges = 'Charges are required'
    }
    
    // Step 3 validation (Insurance Info)
    if (currentStep === 3) {
      if (!formData.primaryInsurance) newErrors.primaryInsurance = 'Primary insurance is required'
      if (!formData.memberId) newErrors.memberId = 'Member ID is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Memoized validation result to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    const newErrors: { [key: string]: string } = {}
    
    // Step 1 validation (Provider & Patient Info)
    if (currentStep === 1) {
      if (!formData.providerId) newErrors.providerId = 'Provider ID is required'
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
      
      // Validate based on identification method
      if (formData.identificationMethod === 'subscriber') {
        if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
        if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
      } else if (formData.identificationMethod === 'name') {
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      } else {
        newErrors.identificationMethod = 'Please select an identification method'
      }
    }
    
    // Step 2 validation (Claim Details)
    if (currentStep === 2) {
      if (!formData.claimType) newErrors.claimType = 'Claim type is required'
      if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required'
      if (!formData.placeOfService) newErrors.placeOfService = 'Place of service is required'
      // Check if at least one diagnosis code has a value
      const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
      if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
      if (!formData.procedureCodes) newErrors.procedureCodes = 'Procedure codes are required'
      if (!formData.charges) newErrors.charges = 'Charges are required'
    }
    
    // Step 3 validation (Insurance Info)
    if (currentStep === 3) {
      if (!formData.primaryInsurance) newErrors.primaryInsurance = 'Primary insurance is required'
      if (!formData.memberId) newErrors.memberId = 'Member ID is required'
    }
    
    return Object.keys(newErrors).length === 0
  }, [currentStep, formData])

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setCurrentStep(4)
  }

  const handleNext = () => {
    // Clear previous errors
    setErrors({})
    
    // Run validation and collect errors
    const newErrors: { [key: string]: string } = {}
    
    // Step 1 validation (Provider & Patient Info)
    if (currentStep === 1) {
      if (!formData.providerId) newErrors.providerId = 'Provider ID is required'
      if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective date is required'
      
      // Validate based on identification method
      if (formData.identificationMethod === 'subscriber') {
        if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
        if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
      } else if (formData.identificationMethod === 'name') {
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      } else {
        newErrors.identificationMethod = 'Please select an identification method'
      }
    }
    
          // Step 2 validation (Claim Details)
      if (currentStep === 2) {
        if (!formData.claimType) newErrors.claimType = 'Claim type is required'
        if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required'
        if (!formData.placeOfService) newErrors.placeOfService = 'Place of service is required'
        // Check if at least one diagnosis code has a value
        const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
        if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
        if (!formData.procedureCodes) newErrors.procedureCodes = 'Procedure codes are required'
        if (!formData.charges) newErrors.charges = 'Charges are required'
      }
    
    // Step 3 validation (Insurance Info)
    if (currentStep === 3) {
      if (!formData.primaryInsurance) newErrors.primaryInsurance = 'Primary insurance is required'
      if (!formData.memberId) newErrors.memberId = 'Member ID is required'
    }
    
    // If there are errors, set them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // If validation passes, show loading and proceed to next step
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4)
      setIsTransitioning(false)
    }, 500) // 500ms delay to show loading animation
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4)
  }

  const handleBackToLanding = () => {
    if (onBack) {
      onBack()
    }
  }

  const getOriginatingPageDisplayName = () => {
    switch (originatingPage) {
      case 'pic':
        return 'P.I.C. Actions'
      case 'dashboard':
        return 'Dashboard'
      default:
        return 'Dashboard'
    }
  }

  // Step Indicators Component
  const StepIndicators = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { number: 1, label: 'Patient Information' },
      { number: 2, label: 'Claim Details' },
      { number: 3, label: 'Insurance Info' },
      { number: 4, label: 'Review & Submit' }
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

  // Success Message Component
  const ClaimsSubmissionSuccess = () => {
    return (
      <div className="hedis-screening-content">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Icon name="check-circle" size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Claim Submitted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your claim has been submitted and is being processed. You will receive a confirmation email with the claim reference number.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Claim Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Claim Reference:</span>
                <span className="ml-2 text-gray-900 dark:text-white">CLM-2024-001234</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Patient:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formData.patientName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Service Date:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formData.serviceDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Claim Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formData.claimType}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBackToLanding}
              className="btn-secondary flex items-center gap-2"
            >
              <Icon name="arrow-left" size={16} />
              Back to P.I.C. Actions
            </button>
            <button
              onClick={() => {
                setFormData({
                  providerId: '',
                  providerName: '',
                  npi: '',
                  taxId: '',
                  patientId: '',
                  patientName: '',
                  dateOfBirth: '',
                  gender: '',
                  claimType: '',
                  serviceDate: '',
                  placeOfService: '',
                  procedureCodes: '',
                  charges: '',
                  primaryInsurance: '',
                  secondaryInsurance: '',
                  groupNumber: '',
                  memberId: '',
                  authorizationNumber: '',
                  notes: '',
                  subscriberId: '',
                  dependantSequence: '',
                  lastName: '',
                  firstName: '',
                  identificationMethod: 'subscriber',
                  manualProviderId: false,
                  manualSubscriberId: false,
                  manualDependantSequence: false,
                  effectiveDate: '',
                  serviceDateFrom: '',
                  serviceDateTo: '',
                  lab: '',
                  submissionForm: '',
                  routineExams: '',
                  contactLensFittings: '',
                  postCataractExam: '',
                  isDiabetic: '',
                  diabetesType: '',
                  manifestation: '',
                  wasDilated: '',
                  reasonForNotDilating: '',
                  reasonOther: '',
                  diagnosisCodes1: '',
                  diagnosisCodes2: '',
                  diagnosisCodes3: '',
                  diagnosisCodes4: '',
                  diagnosisCodes5: '',
                  diagnosisCodes6: '',
                  doctorSignatureAgreement: false,
                  diagnosisCodes: [
                    { id: 1, code: '', description: '', isPrimary: true }
                  ]
                })
                setCurrentStep(1)
                setSubmitted(false)
                setErrors({})
                setValidations({})
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Icon name="plus" size={16} />
              Submit Another Claim
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main form content based on current step
  let stepContent

  if (submitted && currentStep === 4) {
    stepContent = <ClaimsSubmissionSuccess />
  } else {
    stepContent = (
      <div className="hedis-screening-content">
        <div className="hedis-screening-step-content">
          <h2 className="hedis-screening-step-title">
            Claims Submission
          </h2>
          <p className="hedis-screening-step-description">
            Submit a new claim for processing. Please provide the required information below.
          </p>
          
          <form onSubmit={handleSubmit} className="claims-form">
                        {currentStep === 1 && (
              <div className="space-y-6">
                {/* Required Fields Section */}
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Patient Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Subscriber ID
                      </label>
                      <div className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                        H254789658
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name (Last, First)
                      </label>
                      <div className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                        Smith, John
                      </div>
                    </div>

                    <div data-error={!!errors.serviceDateTo}>
                      <label htmlFor="serviceDateTo" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Service Date (To)
                      </label>
                      <DatePicker
                        value={formData.serviceDateTo}
                        onChange={(date) => {
                          setFormData(prev => ({ ...prev, serviceDateTo: date }))
                          if (errors.serviceDateTo) {
                            setErrors(prev => ({ ...prev, serviceDateTo: '' }))
                          }
                        }}
                        placeholder="Service Date (To):"
                        className={errors.serviceDateTo ? 'border-red-500' : ''}
                      />
                      {errors.serviceDateTo && (
                        <p className="mt-1 text-sm text-red-600">{errors.serviceDateTo}</p>
                      )}
                    </div>

                    <div data-error={!!errors.serviceDateFrom}>
                      <label htmlFor="serviceDateFrom" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Service Date (From)
                      </label>
                      <DatePicker
                        value={formData.serviceDateFrom}
                        onChange={(date) => {
                          setFormData(prev => ({ ...prev, serviceDateFrom: date }))
                          if (errors.serviceDateFrom) {
                            setErrors(prev => ({ ...prev, serviceDateFrom: '' }))
                          }
                        }}
                        placeholder="Service Date (From):"
                        className={errors.serviceDateFrom ? 'border-red-500' : ''}
                      />
                      {errors.serviceDateFrom && (
                        <p className="mt-1 text-sm text-red-600">{errors.serviceDateFrom}</p>
                      )}
                    </div>

                    <div data-error={!!errors.lab}>
                      <label htmlFor="lab" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Lab
                      </label>
                      <select
                        id="lab"
                        name="lab"
                        value={formData.lab}
                        onChange={handleSelectChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lab ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {labOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.lab && (
                        <p className="mt-1 text-sm text-red-600">{errors.lab}</p>
                      )}
                    </div>

                    <div data-error={!!errors.submissionForm}>
                      <label htmlFor="submissionForm" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Submission Form
                      </label>
                      <select
                        id="submissionForm"
                        name="submissionForm"
                        value={formData.submissionForm}
                        onChange={handleSelectChange}
                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.submissionForm ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {submissionFormOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.submissionForm && (
                        <p className="mt-1 text-sm text-red-600">{errors.submissionForm}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Procedure / Exam Codes Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Procedure / Exam Codes
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div data-error={!!errors.routineExams}>
                        <label htmlFor="routineExams" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Routine Exams
                        </label>
                        <select
                          id="routineExams"
                          name="routineExams"
                          value={formData.routineExams}
                          onChange={handleSelectChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.routineExams ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {routineExamsOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.routineExams && (
                          <p className="mt-1 text-sm text-red-600">{errors.routineExams}</p>
                        )}
                      </div>

                      <div data-error={!!errors.contactLensFittings}>
                        <label htmlFor="contactLensFittings" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Contact Lens Fittings
                        </label>
                        <select
                          id="contactLensFittings"
                          name="contactLensFittings"
                          value={formData.contactLensFittings}
                          onChange={handleSelectChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.contactLensFittings ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {contactLensFittingsOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.contactLensFittings && (
                          <p className="mt-1 text-sm text-red-600">{errors.contactLensFittings}</p>
                        )}
                      </div>

                      <div data-error={!!errors.postCataractExam}>
                        <label htmlFor="postCataractExam" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Post Cataract Exam
                        </label>
                        <select
                          id="postCataractExam"
                          name="postCataractExam"
                          value={formData.postCataractExam}
                          onChange={handleSelectChange}
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.postCataractExam ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {postCataractExamOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.postCataractExam && (
                          <p className="mt-1 text-sm text-red-600">{errors.postCataractExam}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Is the Patient Diabetic?
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="isDiabetic"
                              value="yes"
                              checked={formData.isDiabetic === 'yes'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="isDiabetic"
                              value="no"
                              checked={formData.isDiabetic === 'no'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {formData.isDiabetic === 'yes' && (
                        <div data-error={!!errors.diabetesType}>
                          <label htmlFor="diabetesType" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                            What Type of Diabetes?
                          </label>
                          <select
                            id="diabetesType"
                            name="diabetesType"
                            value={formData.diabetesType}
                            onChange={handleSelectChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              errors.diabetesType ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            {diabetesTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.diabetesType && (
                            <p className="mt-1 text-sm text-red-600">{errors.diabetesType}</p>
                          )}
                        </div>
                      )}

                      {formData.isDiabetic === 'yes' && (
                        <div data-error={!!errors.manifestation}>
                          <label htmlFor="manifestation" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                            What is the manifestation?
                          </label>
                          <select
                            id="manifestation"
                            name="manifestation"
                            value={formData.manifestation}
                            onChange={handleSelectChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              errors.manifestation ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            {manifestationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.manifestation && (
                            <p className="mt-1 text-sm text-red-600">{errors.manifestation}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Was the Patient Dilated?
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="wasDilated"
                              value="yes"
                              checked={formData.wasDilated === 'yes'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="wasDilated"
                              value="no"
                              checked={formData.wasDilated === 'no'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {formData.wasDilated === 'no' && (
                        <div data-error={!!errors.reasonForNotDilating}>
                          <label htmlFor="reasonForNotDilating" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                            Reason for not Dilating?
                          </label>
                          <select
                            id="reasonForNotDilating"
                            name="reasonForNotDilating"
                            value={formData.reasonForNotDilating}
                            onChange={handleSelectChange}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                              errors.reasonForNotDilating ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            {reasonForNotDilatingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.reasonForNotDilating && (
                            <p className="mt-1 text-sm text-red-600">{errors.reasonForNotDilating}</p>
                          )}
                        </div>
                      )}

                      {formData.reasonForNotDilating === 'other' && (
                        <div data-error={!!errors.reasonOther}>
                          <label htmlFor="reasonOther" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                            Reason (Other)
                          </label>
                          <input
                            type="text"
                            id="reasonOther"
                            name="reasonOther"
                            value={formData.reasonOther}
                            onChange={handleInputChange}
                            placeholder="If Other Provide Reason"
                            className={`form-input ${errors.reasonOther ? 'border-red-500' : ''}`}
                          />
                          {errors.reasonOther && (
                            <p className="mt-1 text-sm text-red-600">{errors.reasonOther}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Diagnosis Codes <span className="text-gray-500 text-xs">({formData.diagnosisCodes.length}/6)</span>
                      </label>
                      
                      <div className="space-y-4">
                        {formData.diagnosisCodes.map((diagnosisCode, index) => (
                          <div key={diagnosisCode.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <input
                                    type="radio"
                                    name="primaryDiagnosis"
                                    checked={diagnosisCode.isPrimary}
                                    onChange={() => setPrimaryDiagnosis(diagnosisCode.id)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs">Primary</span>
                                </label>
                                <span className="text-xs text-gray-500">Diagnosis {index + 1}</span>
                              </div>
                              {formData.diagnosisCodes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDiagnosisCode(diagnosisCode.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                  title="Remove diagnosis code"
                                >
                                  <Icon name="x" size={16} />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  ICD-10 Code
                                </label>
                                <input
                                  type="text"
                                  value={diagnosisCode.code}
                                  onChange={(e) => updateDiagnosisCode(diagnosisCode.id, 'code', e.target.value)}
                                  placeholder="e.g., H25.1"
                                  className={`form-input ${errors.diagnosisCodes ? 'border-red-500' : ''}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={diagnosisCode.description}
                                  onChange={(e) => updateDiagnosisCode(diagnosisCode.id, 'description', e.target.value)}
                                  placeholder="e.g., Age-related nuclear cataract"
                                  className="form-input"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                                             <div className="flex items-center gap-4 mt-3">
                         {formData.diagnosisCodes.length < 6 && (
                           <button
                             type="button"
                             onClick={addDiagnosisCode}
                             className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                           >
                             <Icon name="plus" size={16} />
                             Add Diagnosis Code ({formData.diagnosisCodes.length}/6)
                           </button>
                         )}
                         
                         <button
                           type="button"
                           onClick={() => setShowDiagnosisCheatSheet(!showDiagnosisCheatSheet)}
                           className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2"
                         >
                           <Icon name="info" size={16} />
                           Common Diagnosis Codes
                         </button>
                       </div>
                      
                                             {errors.diagnosisCodes && (
                         <p className="mt-2 text-sm text-red-600">{errors.diagnosisCodes}</p>
                       )}
                       
                       {/* Diagnosis Codes Cheat Sheet */}
                       {showDiagnosisCheatSheet && (
                         <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                           <div className="flex items-center justify-between mb-3">
                             <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                               Common Retinal Diagnosis Codes
                             </h4>
                             <button
                               type="button"
                               onClick={() => setShowDiagnosisCheatSheet(false)}
                               className="text-blue-600 hover:text-blue-800"
                             >
                               <Icon name="x" size={16} />
                             </button>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div>
                               <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Diabetic Retinopathy</h5>
                               <div className="space-y-1">
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('E11.31')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     E11.31
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Type 2 DM with mild NPDR</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('E11.32')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     E11.32
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Type 2 DM with moderate NPDR</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('E11.33')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     E11.33
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Type 2 DM with severe NPDR</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('E11.34')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     E11.34
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Type 2 DM with PDR</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div>
                               <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Macular Degeneration</h5>
                               <div className="space-y-1">
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.30')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.30
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Unspecified macular degeneration</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.31')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.31
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Nonexudative AMD</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.32')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.32
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Exudative AMD</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div>
                               <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Retinal Detachment</h5>
                               <div className="space-y-1">
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H33.0')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H33.0
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Retinal detachment with retinal break</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H33.1')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H33.1
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Retinoschisis and retinal cysts</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H33.2')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H33.2
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Serous retinal detachment</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div>
                               <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Retinal Vascular Disorders</h5>
                               <div className="space-y-1">
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.0')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.0
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Background retinopathy</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.1')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.1
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Preproliferative retinopathy</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <button
                                     type="button"
                                     onClick={() => copyToClipboard('H35.2')}
                                     className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-mono cursor-pointer"
                                   >
                                     H35.2
                                   </button>
                                   <span className="text-blue-600 dark:text-blue-400">Other proliferative retinopathy</span>
                                 </div>
                               </div>
                             </div>
                           </div>
                           
                           <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                             <p className="text-xs text-blue-600 dark:text-blue-400">
                               💡 <strong>Tip:</strong> Click on any code to copy it to your clipboard, then paste it into the ICD-10 Code field above.
                             </p>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                </div>

                {/* Dr's Signature Agreement Section */}
                <div className={`p-4 rounded-lg border ${formData.doctorSignatureAgreement ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="doctorSignatureAgreement"
                      name="doctorSignatureAgreement"
                      checked={formData.doctorSignatureAgreement}
                      onChange={handleCheckboxChange}
                      className="mt-1 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="doctorSignatureAgreement" className="text-sm font-medium text-gray-900 dark:text-white">
                      I attest that i have performed this eye exam, in full scope and in accordance to my State of Florida Physician's License
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Insurance Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-error={!!errors.primaryInsurance}>
                      <label htmlFor="primaryInsurance" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Primary Insurance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primaryInsurance"
                        name="primaryInsurance"
                        value={formData.primaryInsurance}
                        onChange={handleInputChange}
                        placeholder="Enter primary insurance"
                        className={`form-input ${errors.primaryInsurance ? 'border-red-500' : ''}`}
                      />
                      {errors.primaryInsurance && (
                        <p className="mt-1 text-sm text-red-600">{errors.primaryInsurance}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="secondaryInsurance" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Secondary Insurance
                      </label>
                      <input
                        type="text"
                        id="secondaryInsurance"
                        name="secondaryInsurance"
                        value={formData.secondaryInsurance}
                        onChange={handleInputChange}
                        placeholder="Enter secondary insurance"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="groupNumber" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Group Number
                      </label>
                      <input
                        type="text"
                        id="groupNumber"
                        name="groupNumber"
                        value={formData.groupNumber}
                        onChange={handleInputChange}
                        placeholder="Enter group number"
                        className="form-input"
                      />
                    </div>

                    <div data-error={!!errors.memberId}>
                      <label htmlFor="memberId" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Member ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="memberId"
                        name="memberId"
                        value={formData.memberId}
                        onChange={handleInputChange}
                        placeholder="Enter member ID"
                        className={`form-input ${errors.memberId ? 'border-red-500' : ''}`}
                      />
                      {errors.memberId && (
                        <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="authorizationNumber" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                        Authorization Number
                      </label>
                      <input
                        type="text"
                        id="authorizationNumber"
                        name="authorizationNumber"
                        value={formData.authorizationNumber}
                        onChange={handleInputChange}
                        placeholder="Enter authorization number"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Additional Information
                  </h3>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleTextareaChange}
                      placeholder="Enter any additional notes..."
                      rows={4}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Review Claim Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Provider Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Provider ID:</span> {formData.providerId}</div>
                          <div><span className="font-medium">NPI:</span> {formData.npi}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Patient Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Patient ID:</span> {formData.patientId}</div>
                          <div><span className="font-medium">Name:</span> {formData.patientName}</div>
                          <div><span className="font-medium">DOB:</span> {formData.dateOfBirth}</div>
                          <div><span className="font-medium">Gender:</span> {formData.gender}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Claim Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Claim Type:</span> {formData.claimType}</div>
                          <div><span className="font-medium">Service Date:</span> {formData.serviceDate}</div>
                          <div><span className="font-medium">Place of Service:</span> {formData.placeOfService}</div>
                          <div><span className="font-medium">Charges:</span> ${formData.charges}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Insurance Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Primary Insurance:</span> {formData.primaryInsurance}</div>
                          <div><span className="font-medium">Member ID:</span> {formData.memberId}</div>
                          <div><span className="font-medium">Group Number:</span> {formData.groupNumber}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Left side: Destructive/utility actions */}
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Icon name="arrow-left" size={16} />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    // Clear form logic
                    if (confirm('Are you sure you want to clear the form? All data will be lost.')) {
                      // Reset form data
                      setFormData({
                        providerId: '',
                        providerName: '',
                        npi: '',
                        taxId: '',
                        patientId: '',
                        patientName: '',
                        dateOfBirth: '',
                        gender: '',
                        claimType: '',
                        serviceDate: '',
                        placeOfService: '',
                        diagnosisCodes: [
                          { id: 1, code: '', description: '', isPrimary: true }
                        ],
                        procedureCodes: '',
                        charges: '',
                        primaryInsurance: '',
                        secondaryInsurance: '',
                        groupNumber: '',
                        memberId: '',
                        authorizationNumber: '',
                        notes: '',
                        subscriberId: '',
                        dependantSequence: '',
                        lastName: '',
                        firstName: '',
                        identificationMethod: 'subscriber',
                        manualProviderId: false,
                        manualSubscriberId: false,
                        manualDependantSequence: false,
                        effectiveDate: '',
                        serviceDateFrom: '',
                        serviceDateTo: '',
                        lab: '',
                        submissionForm: '',
                        routineExams: '',
                        contactLensFittings: '',
                        postCataractExam: '',
                        isDiabetic: '',
                        diabetesType: '',
                        manifestation: '',
                        wasDilated: '',
                        reasonForNotDilating: '',
                        reasonOther: '',
                        diagnosisCodes1: '',
                        diagnosisCodes2: '',
                        diagnosisCodes3: '',
                        diagnosisCodes4: '',
                        diagnosisCodes5: '',
                        diagnosisCodes6: '',
                        doctorSignatureAgreement: false
                      })
                    }
                  }}
                  className="px-3 py-1.5 text-sm border border-red-500 text-red-600 bg-white hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                >
                  <Icon name="x" size={16} />
                  Clear Form
                </button>
              </div>
              
              {/* Right side: Primary actions */}
              <div className="flex gap-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2"
                    disabled={isTransitioning}
                  >
                    {isTransitioning ? (
                      <>
                        <Icon name="loader-2" size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === 1 ? 'Start Claim' : currentStep === 2 ? 'Continue to Review' : 'Next'}
                        <Icon name="arrow-right" size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="loader-2" size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Icon name="upload" size={16} />
                        Submit Claim
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Main return
  return (
    <div className="hedis-screening-page">
      {/* Header with breadcrumb and step indicators */}
      <div className="hedis-screening-header">
        <div className="hedis-screening-breadcrumb">
          <button
            onClick={handleBackToLanding}
            className="hedis-screening-back-button flex items-center gap-2"
          >
            <Icon name="arrow-left" size={16} />
            {getOriginatingPageDisplayName()}
          </button>
        </div>
        
        {currentStep < 4 && (
          <StepIndicators currentStep={currentStep} />
        )}
      </div>

      {/* Main content */}
      {stepContent}
    </div>
  )
} 
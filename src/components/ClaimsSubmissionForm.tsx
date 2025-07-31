import React, { useState, useEffect, useMemo } from 'react'
import Icon from './Icon'
import DatePicker from './DatePicker'
import HelperButton from './HelperButton'
import MilaInputField from './MilaInputField'
import HelperModal from './HelperModal'
import ClaimAcceptedView from './ClaimAcceptedView'
import ReservedBenefitsView from './ReservedBenefitsView'
import { scrollToFirstError } from '../utils/validationUtils'

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

  // Loading modal state
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  // Reserved Benefits state
  const [showReservedBenefits, setShowReservedBenefits] = useState(false)

  // M.I.L.A. Code Selection state
  const [showMilaModal, setShowMilaModal] = useState(false)
  const [milaCodeSelectionMode, setMilaCodeSelectionMode] = useState(false)
  const [triggeringField, setTriggeringField] = useState('')
  const [triggeringForm, setTriggeringForm] = useState('')

  // Help tooltip state
  const [showHelp, setShowHelp] = useState<string | null>(null)

  const loadingMessages = [
    "We are processing your claim... 🏥",
    "Logging medical codes like a pro! 📊",
    "Almost there, just a few more clicks! ✨"
  ]

  // Help tooltips
  const helpText = {
    sphere: 'The spherical power of the lens. Positive values correct farsightedness, negative values correct nearsightedness.',
    cylinder: 'The cylindrical power of the lens. Used to correct astigmatism.',
    axis: 'The orientation of the cylinder in degrees (0-180).',
    add: 'Additional power for reading or near vision.',
    bc: 'Base curve of the lens. Affects the fit and comfort of contact lenses.'
  }

  const [formData, setFormData] = useState({
    // Step 1: Patient Information
    providerId: '',
    subscriberId: '',
    fullName: '',
    dependantSequence: '',
    identificationMethod: 'subscriber',
    
    // Step 2: Claim Details
    serviceDateFrom: '',
    serviceDateTo: '',
    lab: '',
    submissionForm: '',
    isDiabetic: '',
    diabetesType: '',
    manifestation: '',
    wasDilated: '',
    reasonForNotDilating: '',
    reasonOther: '',
    doctorSignatureAgreement: false,
    diagnosisCodes: [{ id: 1, code: '', description: '', isPrimary: true }],
    
    // Step 3: Prescription Details
    odSphere: '',
    osSphere: '',
    odCylinder: '',
    osCylinder: '',
    odAxis: '',
    osAxis: '',
    odAdd: '',
    osAdd: '',
    odBC: '',
    osBC: '',
    odHorizontal: '',
    osHorizontal: '',
    odHorizontalDirection: '',
    osHorizontalDirection: '',
    odVertical: '',
    osVertical: '',
    odVerticalDirection: '',
    osVerticalDirection: '',
    odPrismType: '',
    osPrismType: '',
    slabOff: '',
    
    // Step 4: Lens Choice
    visionType: '',
    lensType: '',
    pdType: '',
    material: '',
    binocularFarPD: '',
    binocularNearPD: '',
    monocularFarPDOD: '',
    monocularFarPDOS: '',
    monocularNearPDOD: '',
    monocularNearPDOS: '',
    segmentHeightOD: '',
    segmentHeightOS: '',
    edge: '',
    thickness: '',
    coating: '',
    tintShade: '',
    tintType: '',
    tintType2: '',
    uvScratchResistant: false,
    uvCoating: false,
    scratchCoating: false,
    td2ScratchCoating: false,
    heatTempering: false,
    chemicalTempering: false,
    
    // Step 5: Frame Selection
    frameSource: '',
    frameType: '',
    rimlessType: '',
    frameName: '',
    frameColor: '',
    eyeSize: '',
    bridge: '',
    vertical: '',
    ed: '',
    
    // Step 6: Review & Submit
    eligibilityNumber: '',
    procedureCodes: [
      {
        id: 1,
        code: '92012',
        description: 'Eye Exam Establish Patient, Copy will run...',
        pos: '',
        mod: '',
        diagnosisReference: '',
        units: '1',
        uAndCCharge: '$200,000.00',
        planAllowed: '$10,000.00',
        showDiagnosisModal: false
      }
    ],
    totalCharges: '',
    totalAllowed: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showDiagnosisCheatSheet, setShowDiagnosisCheatSheet] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validations, setValidations] = useState<{ [key: string]: boolean }>({})
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)

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

  // M.I.L.A. Code Selection handlers
  const handleMilaTrigger = (fieldName: string, formName: string) => {
    setTriggeringField(fieldName)
    setTriggeringForm(formName)
    setMilaCodeSelectionMode(true)
    setShowMilaModal(true)
  }

  const handleCodeSelect = (code: string, description: string) => {
    // Find the current diagnosis code being edited and update it
    if (triggeringField === 'diagnosisCodes') {
      // For now, update the first diagnosis code
      // In a real implementation, you'd track which specific diagnosis code is being edited
      setFormData(prev => ({
        ...prev,
        diagnosisCodes: prev.diagnosisCodes.map((dc, index) => 
          index === 0 ? { ...dc, code, description } : dc
        )
      }))
    }
    
    // Close the modal
    setShowMilaModal(false)
    setMilaCodeSelectionMode(false)
  }

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    // Step 1 validation (Provider & Patient Info)
    if (currentStep === 1) {
      if (!formData.providerId) newErrors.providerId = 'Provider ID is required'
      if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
      if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
    }
    
    // Step 2 validation (Claim Details)
    if (currentStep === 2) {
      if (!formData.serviceDateFrom) newErrors.serviceDateFrom = 'Service date (from) is required'
      if (!formData.serviceDateTo) newErrors.serviceDateTo = 'Service date (to) is required'
      if (!formData.lab) newErrors.lab = 'Lab is required'
      if (!formData.submissionForm) newErrors.submissionForm = 'Submission form is required'
      
      // Diabetes-related validation
      if (formData.isDiabetic === 'yes') {
        if (!formData.diabetesType) newErrors.diabetesType = 'Diabetes type is required'
        if (!formData.manifestation) newErrors.manifestation = 'Manifestation is required'
      }
      
      // Dilation-related validation
      if (formData.wasDilated === 'no') {
        if (!formData.reasonForNotDilating) newErrors.reasonForNotDilating = 'Reason for not dilating is required'
        if (formData.reasonForNotDilating === 'other' && !formData.reasonOther) {
          newErrors.reasonOther = 'Please specify the reason'
        }
      }
      
      // Check if at least one diagnosis code has a value
      const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
      if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
      
      // Doctor signature agreement is required
      if (!formData.doctorSignatureAgreement) newErrors.doctorSignatureAgreement = 'Doctor signature agreement is required'
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
      if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
      if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
    }
    
    // Step 2 validation (Claim Details)
    if (currentStep === 2) {
      if (!formData.serviceDateFrom) newErrors.serviceDateFrom = 'Service date (from) is required'
      if (!formData.serviceDateTo) newErrors.serviceDateTo = 'Service date (to) is required'
      if (!formData.lab) newErrors.lab = 'Lab is required'
      if (!formData.submissionForm) newErrors.submissionForm = 'Submission form is required'
      
      // Diabetes-related validation
      if (formData.isDiabetic === 'yes') {
        if (!formData.diabetesType) newErrors.diabetesType = 'Diabetes type is required'
        if (!formData.manifestation) newErrors.manifestation = 'Manifestation is required'
      }
      
      // Dilation-related validation
      if (formData.wasDilated === 'no') {
        if (!formData.reasonForNotDilating) newErrors.reasonForNotDilating = 'Reason for not dilating is required'
        if (formData.reasonForNotDilating === 'other' && !formData.reasonOther) {
          newErrors.reasonOther = 'Please specify the reason'
        }
      }
      
      // Check if at least one diagnosis code has a value
      const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
      if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
      
      // Doctor signature agreement is required
      if (!formData.doctorSignatureAgreement) newErrors.doctorSignatureAgreement = 'Doctor signature agreement is required'
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
    setShowLoadingModal(true)
    setLoadingStep(0)
    setLoadingMessage(loadingMessages[0])
    
    // Simulate loading steps with different messages
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingStep(i)
      setLoadingMessage(loadingMessages[i])
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds per message
    }
    
    setIsSubmitting(false)
    setShowLoadingModal(false)
    setSubmitted(true)
    setCurrentStep(7) // Navigate to Claim Accepted View
  }

  const handleNext = () => {
    // Clear previous errors
    setErrors({})
    
    // Run validation and collect errors
    const newErrors: { [key: string]: string } = {}
    
    // Step 1 validation (Provider & Patient Info)
    if (currentStep === 1) {
      if (!formData.providerId) newErrors.providerId = 'Provider ID is required'
      if (!formData.subscriberId) newErrors.subscriberId = 'Subscriber ID is required'
      if (!formData.dependantSequence) newErrors.dependantSequence = 'Dependent sequence is required'
    }
    
          // Step 2 validation (Claim Details)
      if (currentStep === 2) {
        if (!formData.serviceDateFrom) newErrors.serviceDateFrom = 'Service date (from) is required'
        if (!formData.serviceDateTo) newErrors.serviceDateTo = 'Service date (to) is required'
        if (!formData.lab) newErrors.lab = 'Lab is required'
        if (!formData.submissionForm) newErrors.submissionForm = 'Submission form is required'
        
        // Diabetes-related validation
        if (formData.isDiabetic === 'yes') {
          if (!formData.diabetesType) newErrors.diabetesType = 'Diabetes type is required'
          if (!formData.manifestation) newErrors.manifestation = 'Manifestation is required'
        }
        
        // Dilation-related validation
        if (formData.wasDilated === 'no') {
          if (!formData.reasonForNotDilating) newErrors.reasonForNotDilating = 'Reason for not dilating is required'
          if (formData.reasonForNotDilating === 'other' && !formData.reasonOther) {
            newErrors.reasonOther = 'Please specify the reason'
          }
        }
        
        // Check if at least one diagnosis code has a value
        const hasDiagnosisCodes = formData.diagnosisCodes.some(dc => dc.code.trim() !== '')
        if (!hasDiagnosisCodes) newErrors.diagnosisCodes = 'At least one diagnosis code is required'
        
        // Doctor signature agreement is required
        if (!formData.doctorSignatureAgreement) newErrors.doctorSignatureAgreement = 'Doctor signature agreement is required'
      }
    
    // Step 3 validation (Prescription Details)
    if (currentStep === 3) {
      // At least one eye must have sphere values
      if (!formData.odSphere && !formData.osSphere) {
        newErrors.odSphere = 'At least one eye sphere value is required'
        newErrors.osSphere = 'At least one eye sphere value is required'
      }
      
      // If OD sphere is selected, other OD fields should be filled
      if (formData.odSphere && !formData.odCylinder) {
        newErrors.odCylinder = 'Cylinder is required when sphere is selected'
      }
      if (formData.odSphere && !formData.odAxis) {
        newErrors.odAxis = 'Axis is required when sphere is selected'
      }
      
      // If OS sphere is selected, other OS fields should be filled
      if (formData.osSphere && !formData.osCylinder) {
        newErrors.osCylinder = 'Cylinder is required when sphere is selected'
      }
      if (formData.osSphere && !formData.osAxis) {
        newErrors.osAxis = 'Axis is required when sphere is selected'
      }
    }
    
    // Step 4 validation (Lens Choice)
    if (currentStep === 4) {
      if (!formData.visionType) newErrors.visionType = 'Vision Type is required'
      if (!formData.lensType) newErrors.lensType = 'Lens Type is required'
      if (!formData.pdType) newErrors.pdType = 'PD Type is required'
      if (!formData.material) newErrors.material = 'Material is required'
      if (!formData.binocularFarPD) newErrors.binocularFarPD = 'Far PD is required'
      if (!formData.binocularNearPD) newErrors.binocularNearPD = 'Near PD is required'
      if (!formData.coating) newErrors.coating = 'Coating is required'
    }
    
    // Step 6 validation (Review & Submit)
    if (currentStep === 6) {
      if (!formData.eligibilityNumber) newErrors.eligibilityNumber = 'Eligibility Number is required'
      if (!formData.totalCharges) newErrors.totalCharges = 'Total Charges is required'
      if (!formData.totalAllowed) newErrors.totalAllowed = 'Total Allowed is required'
      
      // Validate procedure codes have required fields
      formData.procedureCodes.forEach((procedure, index) => {
        if (!procedure.pos) newErrors[`procedure${index}Pos`] = 'POS is required'
        if (!procedure.diagnosisReference) newErrors[`procedure${index}Diagnosis`] = 'Diagnosis Reference is required'
      })
    }
    
    // If there are errors, set them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to first error on mobile
      scrollToFirstError(newErrors)
      return
    }
    
    // If validation passes, show loading and proceed to next step
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6)
      setIsTransitioning(false)
      // Scroll to top on mobile when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 500) // 500ms delay to show loading animation
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4 | 5 | 6)
    // Scroll to top on mobile when moving to previous step
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    return (
      <div className="step-indicators-container">
        {/* Mobile-friendly step indicators */}
        <div className={`step-item ${currentStep > 1 ? 'step-completed' : currentStep === 1 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">1</div>
          <div className="step-label">Patient Info</div>
        </div>
        <div className={`step-item ${currentStep > 2 ? 'step-completed' : currentStep === 2 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">2</div>
          <div className="step-label">Diagnosis</div>
        </div>
        <div className={`step-item ${currentStep > 3 ? 'step-completed' : currentStep === 3 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">3</div>
          <div className="step-label">Procedure</div>
        </div>
        <div className={`step-item ${currentStep > 4 ? 'step-completed' : currentStep === 4 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">4</div>
          <div className="step-label">Provider</div>
        </div>
        <div className={`step-item ${currentStep > 5 ? 'step-completed' : currentStep === 5 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">5</div>
          <div className="step-label">Billing</div>
        </div>
        <div className={`step-item ${currentStep > 6 ? 'step-completed' : currentStep === 6 ? 'step-active' : 'step-inactive'}`}>
          <div className="step-number">6</div>
          <div className="step-label">Review</div>
        </div>
      </div>
    )
  }

  // Success Message Component
  const ClaimsSubmissionSuccess = () => {
    return (
      <div className="hedis-screening-success">
        <div className="hedis-screening-success-icon">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="hedis-screening-success-title">Claim Submitted Successfully!</h3>
        <p className="hedis-screening-success-description">
          Your claim has been submitted and is being processed. You will receive a confirmation email shortly.
        </p>
        <div className="hedis-screening-success-actions">
          <button
            onClick={() => {
              setFormData({
                providerId: '',
                subscriberId: '',
                fullName: '',
                dependantSequence: '',
                identificationMethod: 'subscriber',
                serviceDateFrom: '',
                serviceDateTo: '',
                lab: '',
                submissionForm: '',
                isDiabetic: '',
                diabetesType: '',
                manifestation: '',
                wasDilated: '',
                reasonForNotDilating: '',
                reasonOther: '',
                doctorSignatureAgreement: false,
                diagnosisCodes: [{ id: 1, code: '', description: '', isPrimary: true }],
                odSphere: '',
                osSphere: '',
                odCylinder: '',
                osCylinder: '',
                odAxis: '',
                osAxis: '',
                odAdd: '',
                osAdd: '',
                odBC: '',
                osBC: '',
                odHorizontal: '',
                osHorizontal: '',
                odHorizontalDirection: '',
                osHorizontalDirection: '',
                odVertical: '',
                osVertical: '',
                odVerticalDirection: '',
                osVerticalDirection: '',
                odPrismType: '',
                osPrismType: '',
                slabOff: '',
                visionType: '',
                lensType: '',
                pdType: '',
                material: '',
                binocularFarPD: '',
                binocularNearPD: '',
                monocularFarPDOD: '',
                monocularFarPDOS: '',
                monocularNearPDOD: '',
                monocularNearPDOS: '',
                segmentHeightOD: '',
                segmentHeightOS: '',
                edge: '',
                thickness: '',
                coating: '',
                tintShade: '',
                tintType: '',
                tintType2: '',
                uvScratchResistant: false,
                uvCoating: false,
                scratchCoating: false,
                td2ScratchCoating: false,
                heatTempering: false,
                chemicalTempering: false,
                frameSource: '',
                frameType: '',
                rimlessType: '',
                frameName: '',
                frameColor: '',
                eyeSize: '',
                bridge: '',
                vertical: '',
                ed: '',
                eligibilityNumber: '',
                procedureCodes: [
                  {
                    id: 1,
                    code: '92012',
                    description: 'Eye Exam Establish Patient, Copy will run...',
                    pos: '',
                    mod: '',
                    diagnosisReference: '',
                    units: '1',
                    uAndCCharge: '$200,000.00',
                    planAllowed: '$10,000.00',
                    showDiagnosisModal: false
                  }
                ],
                totalCharges: '',
                totalAllowed: ''
              })
              setCurrentStep(1)
              setSubmitted(false)
              setErrors({})
              setValidations({})
              setShowDiagnosisCheatSheet(false)
            }}
            className="hedis-screening-success-button"
          >
            Submit Another Claim
          </button>
          <button
            onClick={handleBackToLanding}
            className="hedis-screening-success-button-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Main form content based on current step
  let stepContent

  if (showReservedBenefits) {
    stepContent = (
      <ReservedBenefitsView
        onBack={() => setShowReservedBenefits(false)}
        onPrint={() => console.log('Print reserved benefits')}
        onExport={() => console.log('Export reserved benefits')}
      />
    )
  } else if (currentStep === 7) {
    stepContent = (
      <ClaimAcceptedView
        onBack={() => setCurrentStep(6)}
        onPrint={() => console.log('Print claim accepted')}
        onViewReport={() => console.log('View optometric report')}
        onViewBenefits={() => setShowReservedBenefits(true)}
      />
    )
  } else if (submitted && currentStep === 6) {
    stepContent = <ClaimsSubmissionSuccess />
  } else {
    stepContent = (
      <div className="hedis-screening-content">
        <div className="hedis-screening-step-content">
          <h2 className="hedis-screening-step-title">
            {currentStep === 2 ? 'Claim Details' : currentStep === 3 ? 'Prescription Details' : currentStep === 4 ? 'Lens Choice' : currentStep === 5 ? 'Frame Selection' : currentStep === 6 ? 'Review & Submit' : 'Claims Submission'}
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
                              Subscriber ID <span className="text-red-500">*</span>
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
                              Dependant Sequence <span className="text-red-500">*</span>
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
                        Service Date (To) <span className="text-red-500">*</span>
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
                        Service Date (From) <span className="text-red-500">*</span>
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
                        Lab <span className="text-red-500">*</span>
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
                        Submission Form <span className="text-red-500">*</span>
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
                            What Type of Diabetes? <span className="text-red-500">*</span>
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
                            What is the manifestation? <span className="text-red-500">*</span>
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
                            Reason for not Dilating? <span className="text-red-500">*</span>
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
                            Reason (Other) <span className="text-red-500">*</span>
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
                        Diagnosis Codes <span className="text-red-500">*</span> <span className="text-gray-500 text-xs">({formData.diagnosisCodes.length}/6)</span>
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
                                <MilaInputField
                                  value={diagnosisCode.code}
                                  onChange={(value) => updateDiagnosisCode(diagnosisCode.id, 'code', value)}
                                  placeholder="e.g., H25.1"
                                  fieldName="diagnosisCodes"
                                  formName="ClaimsSubmission"
                                  onMilaTrigger={handleMilaTrigger}
                                  error={!!errors.diagnosisCodes}
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
                      
                                             <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
                         {formData.diagnosisCodes.length < 6 && (
                           <button
                             type="button"
                             onClick={addDiagnosisCode}
                             className="text-blue-600 hover:text-blue-800 text-base font-medium flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors w-full sm:w-auto min-h-[44px]"
                           >
                             <Icon name="plus" size={18} />
                             Add Diagnosis Code ({formData.diagnosisCodes.length}/6)
                           </button>
                         )}
                         
                         <button
                           type="button"
                           onClick={() => setShowDiagnosisCheatSheet(!showDiagnosisCheatSheet)}
                           className="text-gray-600 hover:text-gray-800 text-base font-medium flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full sm:w-auto min-h-[44px]"
                         >
                           <Icon name="info" size={18} />
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
                      I attest that i have performed this eye exam, in full scope and in accordance to my State of Florida Physician's License <span className="text-red-500">*</span>
                    </label>
                  </div>
                  {errors.doctorSignatureAgreement && (
                    <p className="mt-2 text-sm text-red-600">{errors.doctorSignatureAgreement}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Prescription Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Prescription Details
                  </h3>
                  
                  {/* Smart Actions */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          osSphere: prev.odSphere,
                          osCylinder: prev.odCylinder,
                          osAxis: prev.odAxis,
                          osAdd: prev.odAdd,
                          osBC: prev.odBC,
                          osHorizontal: prev.odHorizontal,
                          osHorizontalDirection: prev.odHorizontalDirection,
                          osVertical: prev.odVertical,
                          osVerticalDirection: prev.odVerticalDirection,
                          osPrismType: prev.odPrismType
                        }))
                      }}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <Icon name="copy" size={16} />
                      Copy OD→OS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          odSphere: prev.osSphere,
                          odCylinder: prev.osCylinder,
                          odAxis: prev.osAxis,
                          odAdd: prev.osAdd,
                          odBC: prev.osBC,
                          odHorizontal: prev.osHorizontal,
                          odHorizontalDirection: prev.osHorizontalDirection,
                          odVertical: prev.osVertical,
                          odVerticalDirection: prev.osVerticalDirection,
                          odPrismType: prev.osPrismType
                        }))
                      }}
                      className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center gap-2"
                    >
                      <Icon name="copy" size={16} />
                      Copy OS→OD
                    </button>
                  </div>

                  {/* Refractive Correction Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Refractive Correction
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4">
                      {/* Parameter Labels */}
                      <div className="lg:col-span-1">
                        <div className="h-10"></div> {/* Spacer for header */}
                        <div className="space-y-4">
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sphere <span className="text-red-500">*</span></span>
                            <button
                              type="button"
                              onClick={() => setShowHelp(showHelp === 'sphere' ? null : 'sphere')}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="help-circle" size={16} />
                            </button>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cylinder <span className="text-red-500">*</span></span>
                            <button
                              type="button"
                              onClick={() => setShowHelp(showHelp === 'cylinder' ? null : 'cylinder')}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="help-circle" size={16} />
                            </button>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Axis <span className="text-red-500">*</span></span>
                            <button
                              type="button"
                              onClick={() => setShowHelp(showHelp === 'axis' ? null : 'axis')}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="help-circle" size={16} />
                            </button>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add</span>
                            <button
                              type="button"
                              onClick={() => setShowHelp(showHelp === 'add' ? null : 'add')}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="help-circle" size={16} />
                            </button>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">BC</span>
                            <button
                              type="button"
                              onClick={() => setShowHelp(showHelp === 'bc' ? null : 'bc')}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon name="help-circle" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* OD (Right Eye) - Blue theme */}
                      <div className="lg:col-span-2 md:col-span-1">
                        <div className="h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border border-blue-200 dark:border-blue-800">
                          <Icon name="eye" size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Right Eye (OD)</span>
                        </div>
                        <div className="space-y-4 border border-blue-200 dark:border-blue-800 rounded-b-lg p-4">
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odSphere}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, odSphere: e.target.value }))
                                if (e.target.value && errors.odSphere) {
                                  setErrors(prev => ({ ...prev, odSphere: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.odSphere ? 'border-red-500' : 'border-blue-300'}`}
                            >
                              <option value="">Select Sphere</option>
                              <option value="-6.00">-6.00</option>
                              <option value="-5.75">-5.75</option>
                              <option value="-5.50">-5.50</option>
                              <option value="-5.25">-5.25</option>
                              <option value="-5.00">-5.00</option>
                              <option value="-4.75">-4.75</option>
                              <option value="-4.50">-4.50</option>
                              <option value="-4.25">-4.25</option>
                              <option value="-4.00">-4.00</option>
                              <option value="-3.75">-3.75</option>
                              <option value="-3.50">-3.50</option>
                              <option value="-3.25">-3.25</option>
                              <option value="-3.00">-3.00</option>
                              <option value="-2.75">-2.75</option>
                              <option value="-2.50">-2.50</option>
                              <option value="-2.25">-2.25</option>
                              <option value="-2.00">-2.00</option>
                              <option value="-1.75">-1.75</option>
                              <option value="-1.50">-1.50</option>
                              <option value="-1.25">-1.25</option>
                              <option value="-1.00">-1.00</option>
                              <option value="-0.75">-0.75</option>
                              <option value="-0.50">-0.50</option>
                              <option value="-0.25">-0.25</option>
                              <option value="0.00">0.00</option>
                              <option value="+0.25">+0.25</option>
                              <option value="+0.50">+0.50</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                              <option value="+3.25">+3.25</option>
                              <option value="+3.50">+3.50</option>
                              <option value="+3.75">+3.75</option>
                              <option value="+4.00">+4.00</option>
                              <option value="+4.25">+4.25</option>
                              <option value="+4.50">+4.50</option>
                              <option value="+4.75">+4.75</option>
                              <option value="+5.00">+5.00</option>
                              <option value="+5.25">+5.25</option>
                              <option value="+5.50">+5.50</option>
                              <option value="+5.75">+5.75</option>
                              <option value="+6.00">+6.00</option>
                            </select>
                          </div>
                          {errors.odSphere && (
                            <p className="mt-1 text-sm text-red-600">{errors.odSphere}</p>
                          )}
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odCylinder}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, odCylinder: e.target.value }))
                                if (e.target.value && errors.odCylinder) {
                                  setErrors(prev => ({ ...prev, odCylinder: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.odCylinder ? 'border-red-500' : 'border-blue-300'}`}
                            >
                              <option value="">Select Cylinder</option>
                              <option value="-6.00">-6.00</option>
                              <option value="-5.75">-5.75</option>
                              <option value="-5.50">-5.50</option>
                              <option value="-5.25">-5.25</option>
                              <option value="-5.00">-5.00</option>
                              <option value="-4.75">-4.75</option>
                              <option value="-4.50">-4.50</option>
                              <option value="-4.25">-4.25</option>
                              <option value="-4.00">-4.00</option>
                              <option value="-3.75">-3.75</option>
                              <option value="-3.50">-3.50</option>
                              <option value="-3.25">-3.25</option>
                              <option value="-3.00">-3.00</option>
                              <option value="-2.75">-2.75</option>
                              <option value="-2.50">-2.50</option>
                              <option value="-2.25">-2.25</option>
                              <option value="-2.00">-2.00</option>
                              <option value="-1.75">-1.75</option>
                              <option value="-1.50">-1.50</option>
                              <option value="-1.25">-1.25</option>
                              <option value="-1.00">-1.00</option>
                              <option value="-0.75">-0.75</option>
                              <option value="-0.50">-0.50</option>
                              <option value="-0.25">-0.25</option>
                              <option value="0.00">0.00</option>
                              <option value="+0.25">+0.25</option>
                              <option value="+0.50">+0.50</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                              <option value="+3.25">+3.25</option>
                              <option value="+3.50">+3.50</option>
                              <option value="+3.75">+3.75</option>
                              <option value="+4.00">+4.00</option>
                              <option value="+4.25">+4.25</option>
                              <option value="+4.50">+4.50</option>
                              <option value="+4.75">+4.75</option>
                              <option value="+5.00">+5.00</option>
                              <option value="+5.25">+5.25</option>
                              <option value="+5.50">+5.50</option>
                              <option value="+5.75">+5.75</option>
                              <option value="+6.00">+6.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odAxis}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, odAxis: e.target.value }))
                                if (e.target.value && errors.odAxis) {
                                  setErrors(prev => ({ ...prev, odAxis: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.odAxis ? 'border-red-500' : 'border-blue-300'}`}
                            >
                              <option value="">Select Axis</option>
                              {Array.from({ length: 180 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num.toString()}>{num}</option>
                              ))}
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odAdd}
                              onChange={(e) => setFormData(prev => ({ ...prev, odAdd: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Add</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odBC}
                              onChange={(e) => setFormData(prev => ({ ...prev, odBC: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select BC</option>
                              <option value="0.50">0.50</option>
                              <option value="0.75">0.75</option>
                              <option value="1.00">1.00</option>
                              <option value="1.25">1.25</option>
                              <option value="1.50">1.50</option>
                              <option value="1.75">1.75</option>
                              <option value="2.00">2.00</option>
                              <option value="2.25">2.25</option>
                              <option value="2.50">2.50</option>
                              <option value="2.75">2.75</option>
                              <option value="3.00">3.00</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* OS (Left Eye) - Green theme */}
                      <div className="lg:col-span-2 md:col-span-1">
                        <div className="h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-t-lg border border-green-200 dark:border-green-800">
                          <Icon name="eye" size={16} className="text-green-600 dark:text-green-400 mr-2" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">Left Eye (OS)</span>
                        </div>
                        <div className="space-y-4 border border-green-200 dark:border-green-800 rounded-b-lg p-4">
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osSphere}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, osSphere: e.target.value }))
                                if (e.target.value && errors.osSphere) {
                                  setErrors(prev => ({ ...prev, osSphere: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.osSphere ? 'border-red-500' : 'border-green-300'}`}
                            >
                              <option value="">Select Sphere</option>
                              <option value="-6.00">-6.00</option>
                              <option value="-5.75">-5.75</option>
                              <option value="-5.50">-5.50</option>
                              <option value="-5.25">-5.25</option>
                              <option value="-5.00">-5.00</option>
                              <option value="-4.75">-4.75</option>
                              <option value="-4.50">-4.50</option>
                              <option value="-4.25">-4.25</option>
                              <option value="-4.00">-4.00</option>
                              <option value="-3.75">-3.75</option>
                              <option value="-3.50">-3.50</option>
                              <option value="-3.25">-3.25</option>
                              <option value="-3.00">-3.00</option>
                              <option value="-2.75">-2.75</option>
                              <option value="-2.50">-2.50</option>
                              <option value="-2.25">-2.25</option>
                              <option value="-2.00">-2.00</option>
                              <option value="-1.75">-1.75</option>
                              <option value="-1.50">-1.50</option>
                              <option value="-1.25">-1.25</option>
                              <option value="-1.00">-1.00</option>
                              <option value="-0.75">-0.75</option>
                              <option value="-0.50">-0.50</option>
                              <option value="-0.25">-0.25</option>
                              <option value="0.00">0.00</option>
                              <option value="+0.25">+0.25</option>
                              <option value="+0.50">+0.50</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                              <option value="+3.25">+3.25</option>
                              <option value="+3.50">+3.50</option>
                              <option value="+3.75">+3.75</option>
                              <option value="+4.00">+4.00</option>
                              <option value="+4.25">+4.25</option>
                              <option value="+4.50">+4.50</option>
                              <option value="+4.75">+4.75</option>
                              <option value="+5.00">+5.00</option>
                              <option value="+5.25">+5.25</option>
                              <option value="+5.50">+5.50</option>
                              <option value="+5.75">+5.75</option>
                              <option value="+6.00">+6.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osCylinder}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, osCylinder: e.target.value }))
                                if (e.target.value && errors.osCylinder) {
                                  setErrors(prev => ({ ...prev, osCylinder: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.osCylinder ? 'border-red-500' : 'border-green-300'}`}
                            >
                              <option value="">Select Cylinder</option>
                              <option value="-6.00">-6.00</option>
                              <option value="-5.75">-5.75</option>
                              <option value="-5.50">-5.50</option>
                              <option value="-5.25">-5.25</option>
                              <option value="-5.00">-5.00</option>
                              <option value="-4.75">-4.75</option>
                              <option value="-4.50">-4.50</option>
                              <option value="-4.25">-4.25</option>
                              <option value="-4.00">-4.00</option>
                              <option value="-3.75">-3.75</option>
                              <option value="-3.50">-3.50</option>
                              <option value="-3.25">-3.25</option>
                              <option value="-3.00">-3.00</option>
                              <option value="-2.75">-2.75</option>
                              <option value="-2.50">-2.50</option>
                              <option value="-2.25">-2.25</option>
                              <option value="-2.00">-2.00</option>
                              <option value="-1.75">-1.75</option>
                              <option value="-1.50">-1.50</option>
                              <option value="-1.25">-1.25</option>
                              <option value="-1.00">-1.00</option>
                              <option value="-0.75">-0.75</option>
                              <option value="-0.50">-0.50</option>
                              <option value="-0.25">-0.25</option>
                              <option value="0.00">0.00</option>
                              <option value="+0.25">+0.25</option>
                              <option value="+0.50">+0.50</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                              <option value="+3.25">+3.25</option>
                              <option value="+3.50">+3.50</option>
                              <option value="+3.75">+3.75</option>
                              <option value="+4.00">+4.00</option>
                              <option value="+4.25">+4.25</option>
                              <option value="+4.50">+4.50</option>
                              <option value="+4.75">+4.75</option>
                              <option value="+5.00">+5.00</option>
                              <option value="+5.25">+5.25</option>
                              <option value="+5.50">+5.50</option>
                              <option value="+5.75">+5.75</option>
                              <option value="+6.00">+6.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osAxis}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, osAxis: e.target.value }))
                                if (e.target.value && errors.osAxis) {
                                  setErrors(prev => ({ ...prev, osAxis: '' }))
                                }
                              }}
                              className={`form-select w-full border rounded-md pl-2.5 ${errors.osAxis ? 'border-red-500' : 'border-green-300'}`}
                            >
                              <option value="">Select Axis</option>
                              {Array.from({ length: 180 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num.toString()}>{num}</option>
                              ))}
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osAdd}
                              onChange={(e) => setFormData(prev => ({ ...prev, osAdd: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Add</option>
                              <option value="+0.75">+0.75</option>
                              <option value="+1.00">+1.00</option>
                              <option value="+1.25">+1.25</option>
                              <option value="+1.50">+1.50</option>
                              <option value="+1.75">+1.75</option>
                              <option value="+2.00">+2.00</option>
                              <option value="+2.25">+2.25</option>
                              <option value="+2.50">+2.50</option>
                              <option value="+2.75">+2.75</option>
                              <option value="+3.00">+3.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osBC}
                              onChange={(e) => setFormData(prev => ({ ...prev, osBC: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select BC</option>
                              <option value="0.50">0.50</option>
                              <option value="0.75">0.75</option>
                              <option value="1.00">1.00</option>
                              <option value="1.25">1.25</option>
                              <option value="1.50">1.50</option>
                              <option value="1.75">1.75</option>
                              <option value="2.00">2.00</option>
                              <option value="2.25">2.25</option>
                              <option value="2.50">2.50</option>
                              <option value="2.75">2.75</option>
                              <option value="3.00">3.00</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prism Correction Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Prism Correction
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4">
                      {/* Parameter Labels */}
                      <div className="lg:col-span-1">
                        <div className="h-10"></div> {/* Spacer for header */}
                        <div className="space-y-4">
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizontal</span>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Direction</span>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vertical</span>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Direction</span>
                          </div>
                          <div className="h-10 flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prism Type</span>
                          </div>
                        </div>
                      </div>

                      {/* OD (Right Eye) - Blue theme */}
                      <div className="lg:col-span-2 md:col-span-1">
                        <div className="h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border border-blue-200 dark:border-blue-800">
                          <Icon name="eye" size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Right Eye (OD)</span>
                        </div>
                        <div className="space-y-4 border border-blue-200 dark:border-blue-800 rounded-b-lg p-4">
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odHorizontal}
                              onChange={(e) => setFormData(prev => ({ ...prev, odHorizontal: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Horizontal</option>
                              <option value="0.50">0.50</option>
                              <option value="1.00">1.00</option>
                              <option value="1.50">1.50</option>
                              <option value="2.00">2.00</option>
                              <option value="2.50">2.50</option>
                              <option value="3.00">3.00</option>
                              <option value="3.50">3.50</option>
                              <option value="4.00">4.00</option>
                              <option value="4.50">4.50</option>
                              <option value="5.00">5.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odHorizontalDirection}
                              onChange={(e) => setFormData(prev => ({ ...prev, odHorizontalDirection: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Direction</option>
                              <option value="In">In</option>
                              <option value="Out">Out</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odVertical}
                              onChange={(e) => setFormData(prev => ({ ...prev, odVertical: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Vertical</option>
                              <option value="0.50">0.50</option>
                              <option value="1.00">1.00</option>
                              <option value="1.50">1.50</option>
                              <option value="2.00">2.00</option>
                              <option value="2.50">2.50</option>
                              <option value="3.00">3.00</option>
                              <option value="3.50">3.50</option>
                              <option value="4.00">4.00</option>
                              <option value="4.50">4.50</option>
                              <option value="5.00">5.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odVerticalDirection}
                              onChange={(e) => setFormData(prev => ({ ...prev, odVerticalDirection: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Direction</option>
                              <option value="Up">Up</option>
                              <option value="Down">Down</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.odPrismType}
                              onChange={(e) => setFormData(prev => ({ ...prev, odPrismType: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-blue-300"
                            >
                              <option value="">Select Prism Type</option>
                              <option value="Decentered">Decentered</option>
                              <option value="Ground In">Ground In</option>
                              <option value="Slab Off">Slab Off</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* OS (Left Eye) - Green theme */}
                      <div className="lg:col-span-2 md:col-span-1">
                        <div className="h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-t-lg border border-green-200 dark:border-green-800">
                          <Icon name="eye" size={16} className="text-green-600 dark:text-green-400 mr-2" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">Left Eye (OS)</span>
                        </div>
                        <div className="space-y-4 border border-green-200 dark:border-green-800 rounded-b-lg p-4">
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osHorizontal}
                              onChange={(e) => setFormData(prev => ({ ...prev, osHorizontal: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Horizontal</option>
                              <option value="0.50">0.50</option>
                              <option value="1.00">1.00</option>
                              <option value="1.50">1.50</option>
                              <option value="2.00">2.00</option>
                              <option value="2.50">2.50</option>
                              <option value="3.00">3.00</option>
                              <option value="3.50">3.50</option>
                              <option value="4.00">4.00</option>
                              <option value="4.50">4.50</option>
                              <option value="5.00">5.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osHorizontalDirection}
                              onChange={(e) => setFormData(prev => ({ ...prev, osHorizontalDirection: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Direction</option>
                              <option value="In">In</option>
                              <option value="Out">Out</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osVertical}
                              onChange={(e) => setFormData(prev => ({ ...prev, osVertical: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Vertical</option>
                              <option value="0.50">0.50</option>
                              <option value="1.00">1.00</option>
                              <option value="1.50">1.50</option>
                              <option value="2.00">2.00</option>
                              <option value="2.50">2.50</option>
                              <option value="3.00">3.00</option>
                              <option value="3.50">3.50</option>
                              <option value="4.00">4.00</option>
                              <option value="4.50">4.50</option>
                              <option value="5.00">5.00</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osVerticalDirection}
                              onChange={(e) => setFormData(prev => ({ ...prev, osVerticalDirection: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Direction</option>
                              <option value="Up">Up</option>
                              <option value="Down">Down</option>
                            </select>
                          </div>
                          <div className="h-10 flex items-center">
                            <select
                              value={formData.osPrismType}
                              onChange={(e) => setFormData(prev => ({ ...prev, osPrismType: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5 border-green-300"
                            >
                              <option value="">Select Prism Type</option>
                              <option value="Decentered">Decentered</option>
                              <option value="Ground In">Ground In</option>
                              <option value="Slab Off">Slab Off</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slab Off Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Slab Off
                    </h4>
                    <div className="w-full md:w-1/2">
                      <select
                        value={formData.slabOff}
                        onChange={(e) => setFormData(prev => ({ ...prev, slabOff: e.target.value }))}
                        className="form-select w-full border border-gray-300 rounded-md pl-2.5"
                      >
                        <option value="">Select Slab Off</option>
                        <option value="None">None</option>
                        <option value="OD">OD (Right Eye)</option>
                        <option value="OS">OS (Left Eye)</option>
                        <option value="Both">Both Eyes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Lens Choice Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Lens Choice Details
                  </h3>
                  
                  {/* General Lens Properties */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      General Lens Properties
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Vision Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.visionType}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, visionType: e.target.value }))
                            if (e.target.value && errors.visionType) {
                              setErrors(prev => ({ ...prev, visionType: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.visionType ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Vision Type</option>
                          <option value="Single Vision">Single Vision</option>
                          <option value="Bi-Focal">Bi-Focal</option>
                          <option value="Progressive">Progressive</option>
                          <option value="Trifocal">Trifocal</option>
                        </select>
                        {errors.visionType && (
                          <p className="mt-1 text-sm text-red-600">{errors.visionType}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Lens Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.lensType}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, lensType: e.target.value }))
                            if (e.target.value && errors.lensType) {
                              setErrors(prev => ({ ...prev, lensType: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.lensType ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Lens Type</option>
                          <option value="Blended 25">Blended 25</option>
                          <option value="Blended 28">Blended 28</option>
                          <option value="Executive">Executive</option>
                          <option value="Round Seg">Round Seg</option>
                          <option value="Flat Top">Flat Top</option>
                        </select>
                        {errors.lensType && (
                          <p className="mt-1 text-sm text-red-600">{errors.lensType}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          PD Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.pdType}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, pdType: e.target.value }))
                            if (e.target.value && errors.pdType) {
                              setErrors(prev => ({ ...prev, pdType: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.pdType ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select PD Type</option>
                          <option value="CR-39">CR-39</option>
                          <option value="Polycarbonate">Polycarbonate</option>
                          <option value="High Index 1.67">High Index 1.67</option>
                          <option value="High Index 1.74">High Index 1.74</option>
                        </select>
                        {errors.pdType && (
                          <p className="mt-1 text-sm text-red-600">{errors.pdType}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Material <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.material}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, material: e.target.value }))
                            if (e.target.value && errors.material) {
                              setErrors(prev => ({ ...prev, material: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.material ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Material</option>
                          <option value="CR-39">CR-39</option>
                          <option value="Polycarbonate">Polycarbonate</option>
                                                      <option value="High Index 1.67">High Index 1.67</option>
                            <option value="High Index 1.74">High Index 1.74</option>
                          </select>
                          {errors.material && (
                            <p className="mt-1 text-sm text-red-600">{errors.material}</p>
                          )}
                        </div>
                    </div>
                  </div>
                  
                  {/* Binocular Section */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Binocular Measurements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Far PD <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.binocularFarPD}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, binocularFarPD: e.target.value }))
                            if (e.target.value && errors.binocularFarPD) {
                              setErrors(prev => ({ ...prev, binocularFarPD: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.binocularFarPD ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Far PD</option>
                          {Array.from({ length: 20 }, (_, i) => (30 + i * 0.5).toFixed(1)).map(pd => (
                            <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                          ))}
                        </select>
                        {errors.binocularFarPD && (
                          <p className="mt-1 text-sm text-red-600">{errors.binocularFarPD}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Near PD <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.binocularNearPD}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, binocularNearPD: e.target.value }))
                            if (e.target.value && errors.binocularNearPD) {
                              setErrors(prev => ({ ...prev, binocularNearPD: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.binocularNearPD ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Near PD</option>
                          {Array.from({ length: 20 }, (_, i) => (27 + i * 0.5).toFixed(1)).map(pd => (
                            <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                          ))}
                        </select>
                        {errors.binocularNearPD && (
                          <p className="mt-1 text-sm text-red-600">{errors.binocularNearPD}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Monocular Section */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Monocular Measurements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Far</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OD</label>
                            <select
                              value={formData.monocularFarPDOD}
                              onChange={(e) => setFormData(prev => ({ ...prev, monocularFarPDOD: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5"
                            >
                              <option value="">Select Far PD OD</option>
                              {Array.from({ length: 21 }, (_, i) => (25 + i * 0.5).toFixed(1)).map(pd => (
                                <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OS</label>
                            <select
                              value={formData.monocularFarPDOS}
                              onChange={(e) => setFormData(prev => ({ ...prev, monocularFarPDOS: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5"
                            >
                              <option value="">Select Far PD OS</option>
                              {Array.from({ length: 21 }, (_, i) => (25 + i * 0.5).toFixed(1)).map(pd => (
                                <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Near</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OD</label>
                            <select
                              value={formData.monocularNearPDOD}
                              onChange={(e) => setFormData(prev => ({ ...prev, monocularNearPDOD: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5"
                            >
                              <option value="">Select Near PD OD</option>
                              {Array.from({ length: 21 }, (_, i) => (22 + i * 0.5).toFixed(1)).map(pd => (
                                <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">OS</label>
                            <select
                              value={formData.monocularNearPDOS}
                              onChange={(e) => setFormData(prev => ({ ...prev, monocularNearPDOS: e.target.value }))}
                              className="form-select w-full border rounded-md pl-2.5"
                            >
                              <option value="">Select Near PD OS</option>
                              {Array.from({ length: 21 }, (_, i) => (22 + i * 0.5).toFixed(1)).map(pd => (
                                <option key={pd} value={`${pd} MM`}>{pd} MM</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Segment Height Section */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Segment Height
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          OD Segment Height
                        </label>
                        <select
                          value={formData.segmentHeightOD}
                          onChange={(e) => setFormData(prev => ({ ...prev, segmentHeightOD: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Height</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(height => (
                            <option key={height} value={`${height} MM`}>{height} MM</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          OS Segment Height
                        </label>
                        <select
                          value={formData.segmentHeightOS}
                          onChange={(e) => setFormData(prev => ({ ...prev, segmentHeightOS: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Height</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(height => (
                            <option key={height} value={`${height} MM`}>{height} MM</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lens Finishing and Tinting Section */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Lens Finishing & Tinting
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Edge
                        </label>
                        <select
                          value={formData.edge}
                          onChange={(e) => setFormData(prev => ({ ...prev, edge: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Edge</option>
                          <option value="Standard">Standard</option>
                          <option value="Polished">Polished</option>
                          <option value="Beveled">Beveled</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Thickness
                        </label>
                        <select
                          value={formData.thickness}
                          onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Thickness</option>
                          <option value="Standard">Standard</option>
                          <option value="Thin">Thin</option>
                          <option value="Ultra Thin">Ultra Thin</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Coating <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.coating}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, coating: e.target.value }))
                            if (e.target.value && errors.coating) {
                              setErrors(prev => ({ ...prev, coating: '' }))
                            }
                          }}
                          className={`form-select w-full border rounded-md pl-2.5 ${errors.coating ? 'border-red-500' : 'border-blue-300'}`}
                        >
                          <option value="">Select Coating</option>
                                                      <option value="Standard ARC">Standard ARC</option>
                            <option value="Premium ARC">Premium ARC</option>
                            <option value="Blue Light Filter">Blue Light Filter</option>
                          </select>
                          {errors.coating && (
                            <p className="mt-1 text-sm text-red-600">{errors.coating}</p>
                          )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Tint Shade
                        </label>
                        <select
                          value={formData.tintShade}
                          onChange={(e) => setFormData(prev => ({ ...prev, tintShade: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Shade</option>
                          <option value="1/4">1/4</option>
                          <option value="1/2">1/2</option>
                          <option value="3/4">3/4</option>
                          <option value="Full">Full</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Tint Type
                        </label>
                        <select
                          value={formData.tintType}
                          onChange={(e) => setFormData(prev => ({ ...prev, tintType: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Tint Type</option>
                          <option value="Gray">Gray</option>
                          <option value="Brown">Brown</option>
                          <option value="Green">Green</option>
                          <option value="Blue">Blue</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
                          Tint Style
                        </label>
                        <select
                          value={formData.tintType2}
                          onChange={(e) => setFormData(prev => ({ ...prev, tintType2: e.target.value }))}
                          className="form-select w-full border rounded-md pl-2.5"
                        >
                          <option value="">Select Style</option>
                          <option value="Solid">Solid</option>
                          <option value="Gradient">Gradient</option>
                          <option value="Photochromic">Photochromic</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Optional Features Section */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Optional Features & Coatings
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="uvScratchResistant"
                          checked={formData.uvScratchResistant}
                          onChange={(e) => setFormData(prev => ({ ...prev, uvScratchResistant: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="uvScratchResistant" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          UV Scratch Resistant and Tint Package
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="uvCoating"
                            checked={formData.uvCoating}
                            onChange={(e) => setFormData(prev => ({ ...prev, uvCoating: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="uvCoating" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            UV Coating
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="scratchCoating"
                            checked={formData.scratchCoating}
                            onChange={(e) => setFormData(prev => ({ ...prev, scratchCoating: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="scratchCoating" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Scratch Coating
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="td2ScratchCoating"
                            checked={formData.td2ScratchCoating}
                            onChange={(e) => setFormData(prev => ({ ...prev, td2ScratchCoating: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="td2ScratchCoating" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            TD-2 Scratch Coating
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="heatTempering"
                            checked={formData.heatTempering}
                            onChange={(e) => setFormData(prev => ({ ...prev, heatTempering: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="heatTempering" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Heat Tempering
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="chemicalTempering"
                          checked={formData.chemicalTempering}
                          onChange={(e) => setFormData(prev => ({ ...prev, chemicalTempering: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="chemicalTempering" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Chemical Tempering
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Frame Selection Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Frame Selection Details
                  </h3>
                  
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label htmlFor="frameSource" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frame Source
                      </label>
                      <select
                        id="frameSource"
                        value={formData.frameSource}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameSource: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Frame Source</option>
                        <option value="insurance-supplied-gran">Insurance Supplied - Gran</option>
                        <option value="patient-choice">Patient Choice</option>
                        <option value="provider-selection">Provider Selection</option>
                        <option value="custom-order">Custom Order</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="frameType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frame Type
                      </label>
                      <select
                        id="frameType"
                        value={formData.frameType}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameType: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Frame Type</option>
                        <option value="zyl">ZYL</option>
                        <option value="metal">Metal</option>
                        <option value="rimless">Rimless</option>
                        <option value="semi-rimless">Semi-Rimless</option>
                        <option value="plastic">Plastic</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="rimlessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rimless Type
                      </label>
                      <select
                        id="rimlessType"
                        value={formData.rimlessType}
                        onChange={(e) => setFormData(prev => ({ ...prev, rimlessType: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Rimless Type</option>
                        <option value="4-hole">4 Hole</option>
                        <option value="3-hole">3 Hole</option>
                        <option value="drill-mount">Drill Mount</option>
                        <option value="groove-mount">Groove Mount</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="frameName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <select
                        id="frameName"
                        value={formData.frameName}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameName: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Frame Name</option>
                        <option value="u-20-tortoise">U-20 Tortoise</option>
                        <option value="u-21-black">U-21 Black</option>
                        <option value="u-22-brown">U-22 Brown</option>
                        <option value="u-23-gunmetal">U-23 Gunmetal</option>
                        <option value="u-24-silver">U-24 Silver</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label htmlFor="frameColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color
                      </label>
                      <select
                        id="frameColor"
                        value={formData.frameColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, frameColor: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Color</option>
                        <option value="tortoise">Tortoise</option>
                        <option value="black">Black</option>
                        <option value="brown">Brown</option>
                        <option value="gunmetal">Gunmetal</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="rose-gold">Rose Gold</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="eyeSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Eye Size
                      </label>
                      <select
                        id="eyeSize"
                        value={formData.eyeSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, eyeSize: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Eye Size</option>
                        <option value="40-mm">40 MM</option>
                        <option value="42-mm">42 MM</option>
                        <option value="44-mm">44 MM</option>
                        <option value="46-mm">46 MM</option>
                        <option value="48-mm">48 MM</option>
                        <option value="50-mm">50 MM</option>
                        <option value="52-mm">52 MM</option>
                        <option value="54-mm">54 MM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="bridge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bridge
                      </label>
                      <select
                        id="bridge"
                        value={formData.bridge}
                        onChange={(e) => setFormData(prev => ({ ...prev, bridge: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Bridge</option>
                        <option value="18-mm">18 MM</option>
                        <option value="20-mm">20 MM</option>
                        <option value="22-mm">22 MM</option>
                        <option value="24-mm">24 MM</option>
                        <option value="26-mm">26 MM</option>
                        <option value="28-mm">28 MM</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vertical
                      </label>
                      <select
                        id="vertical"
                        value={formData.vertical}
                        onChange={(e) => setFormData(prev => ({ ...prev, vertical: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Vertical</option>
                        <option value="24-mm">24 MM</option>
                        <option value="26-mm">26 MM</option>
                        <option value="28-mm">28 MM</option>
                        <option value="30-mm">30 MM</option>
                        <option value="32-mm">32 MM</option>
                        <option value="34-mm">34 MM</option>
                        <option value="36-mm">36 MM</option>
                        <option value="38-mm">38 MM</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="ed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ED
                      </label>
                      <select
                        id="ed"
                        value={formData.ed}
                        onChange={(e) => setFormData(prev => ({ ...prev, ed: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select ED</option>
                        <option value="44-mm">44 MM</option>
                        <option value="46-mm">46 MM</option>
                        <option value="48-mm">48 MM</option>
                        <option value="50-mm">50 MM</option>
                        <option value="52-mm">52 MM</option>
                        <option value="54-mm">54 MM</option>
                        <option value="56-mm">56 MM</option>
                        <option value="58-mm">58 MM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Patient Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscriber ID:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">H254789658</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name (Last, First):</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">Smith, John</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dependent Sequence:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">02</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Date (From):</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">05/16/16</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Date (To):</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">05/16/22</div>
                    </div>
                  </div>
                </div>

                {/* FOPN Provided Eligibility Number Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    FOPN Provided Eligibility Number
                  </h3>
                  <div>
                    <label htmlFor="eligibilityNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Eligibility Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="eligibilityNumber"
                      value={formData.eligibilityNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibilityNumber: e.target.value }))}
                      placeholder="Eligibility Number"
                      className="form-input w-full border rounded-md pl-2.5"
                    />
                    {errors.eligibilityNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.eligibilityNumber}</p>
                    )}
                  </div>
                </div>

                {/* Batch Information Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Batch Information
                  </h3>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number:</span>
                    <div className="text-sm text-gray-900 dark:text-white mt-1">12546958756</div>
                  </div>
                </div>

                {/* Diagnosis Codes Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Diagnosis Codes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm text-gray-900 dark:text-white">1.) 12345ABC</div>
                    <div className="text-sm text-gray-900 dark:text-white">2.) 52344BCS</div>
                    <div className="text-sm text-gray-900 dark:text-white">3.) 55533VVE</div>
                    <div className="text-sm text-gray-900 dark:text-white">4.) 1543NBG</div>
                    <div className="text-sm text-gray-900 dark:text-white">5.) 13323VEE</div>
                    <div className="text-sm text-gray-900 dark:text-white">6.) 45678CBA</div>
                  </div>
                </div>

                {/* Procedure Codes Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Procedure Codes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please enter the corresponding diagnosis codes and line charges, and any other procedure codes if needed:
                  </p>
                  
                  {/* Procedure Codes Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Codes</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Descriptions</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">POS</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">MOD</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Diagnosis Reference</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Units</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">U&C Charge</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Plan Allowed</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.procedureCodes.map((procedure, index) => (
                          <tr key={procedure.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.code}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].code = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="Code"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.description}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].description = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="Description"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.pos}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].pos = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="POS"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.mod}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].mod = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="MOD"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedCodes = [...formData.procedureCodes]
                                    updatedCodes[index].showDiagnosisModal = true
                                    setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                  }}
                                  className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                  {procedure.diagnosisReference ? (
                                    <div className="flex flex-wrap gap-1">
                                      {procedure.diagnosisReference.split(',').map((ref, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                          {ref}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const currentRefs = procedure.diagnosisReference.split(',')
                                              const newRefs = currentRefs.filter(r => r !== ref)
                                              const updatedCodes = [...formData.procedureCodes]
                                              updatedCodes[index].diagnosisReference = newRefs.join(',')
                                              setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                            }}
                                            className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400">Select diagnosis references...</span>
                                  )}
                                </button>
                                
                                {/* Multi-select Modal */}
                                {procedure.showDiagnosisModal && (
                                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Diagnosis References</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose one or more diagnosis references for this procedure code.</p>
                                      </div>
                                      
                                      <div className="p-4 max-h-64 overflow-y-auto">
                                        <div className="space-y-2">
                                          {[1, 2, 3, 4, 5, 6].map((refNum) => {
                                            const isSelected = procedure.diagnosisReference && procedure.diagnosisReference.split(',').includes(refNum.toString())
                                            return (
                                              <label key={refNum} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                                                <input
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={(e) => {
                                                    const currentRefs = procedure.diagnosisReference ? procedure.diagnosisReference.split(',') : []
                                                    let newRefs
                                                    if (e.target.checked) {
                                                      newRefs = [...currentRefs, refNum.toString()]
                                                    } else {
                                                      newRefs = currentRefs.filter(r => r !== refNum.toString())
                                                    }
                                                    const updatedCodes = [...formData.procedureCodes]
                                                    updatedCodes[index].diagnosisReference = newRefs.join(',')
                                                    setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                                  }}
                                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">Diagnosis Reference {refNum}</span>
                                              </label>
                                            )
                                          })}
                                        </div>
                                      </div>
                                      
                                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedCodes = [...formData.procedureCodes]
                                            updatedCodes[index].diagnosisReference = ''
                                            updatedCodes[index].showDiagnosisModal = false
                                            setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                          }}
                                          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        >
                                          Clear All
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedCodes = [...formData.procedureCodes]
                                            updatedCodes[index].showDiagnosisModal = false
                                            setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                          }}
                                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                        >
                                          Done
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{procedure.units}</td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.uAndCCharge}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].uAndCCharge = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="$0.00"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={procedure.planAllowed}
                                onChange={(e) => {
                                  const updatedCodes = [...formData.procedureCodes]
                                  updatedCodes[index].planAllowed = e.target.value
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="form-input w-full border rounded-md pl-2.5 text-sm"
                                placeholder="$0.00"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedCodes = formData.procedureCodes.filter((_, i) => i !== index)
                                  setFormData(prev => ({ ...prev, procedureCodes: updatedCodes }))
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="x" size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = {
                          id: Math.max(...formData.procedureCodes.map(c => c.id)) + 1,
                          code: '',
                          description: '',
                          pos: '',
                          mod: '',
                          diagnosisReference: '',
                          units: '1',
                          uAndCCharge: '$0.00',
                          planAllowed: '$0.00',
                          showDiagnosisModal: false
                        }
                        setFormData(prev => ({ ...prev, procedureCodes: [...prev.procedureCodes, newCode] }))
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Icon name="plus" size={16} />
                      Add New Line
                    </button>
                    <button
                      type="button"
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Icon name="refresh-cw" size={16} />
                      Retrieve and Recalculate
                    </button>
                  </div>
                  
                  {/* Summary Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label htmlFor="totalCharges" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Charges <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          id="totalCharges"
                          value={formData.totalCharges}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalCharges: e.target.value }))}
                          className="form-input w-full border rounded-md pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.totalCharges && (
                        <p className="mt-1 text-sm text-red-600">{errors.totalCharges}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="totalAllowed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Allowed <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          id="totalAllowed"
                          value={formData.totalAllowed}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalAllowed: e.target.value }))}
                          className="form-input w-full border rounded-md pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.totalAllowed && (
                        <p className="mt-1 text-sm text-red-600">{errors.totalAllowed}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prescription Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Prescription
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b"></th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Sphere</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Cylinder</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Axis</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Add</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">BC</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Segment Hgt</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">OD</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">+4.25</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">-0.50</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">2.0</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.50</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.0</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">8MM</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">OS</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">+4.00</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">-0.75</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">2.0</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.0</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.50</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">8MM</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Prescription Detail Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Prescription Detail
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b"></th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Horizontal</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Direction</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Vertical</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Direction</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">Prism Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">OD</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.5</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">In</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.5</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">Up</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">Decentered</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">OS</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.75</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">In</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">0.75</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">Up</td>
                          <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">Ground In</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Far:</span>
                      <span className="text-sm text-gray-900 dark:text-white ml-2">40MM</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Near:</span>
                      <span className="text-sm text-gray-900 dark:text-white ml-2">37MM</span>
                    </div>
                  </div>
                </div>

                {/* Frame Selection Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Frame Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Frame Source:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">Insurance Supplied - Grand Lux Collection</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Frame Type:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">1</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rimless Type:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">XYL</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">U 20</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">Tortoise</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eye Size:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">46</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bridge:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">20</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vertical:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">20</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ED:</span>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">46</div>
                    </div>
                  </div>
                </div>

                {/* Remake Section */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Remake
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reason
                      </label>
                      <select
                        value={formData.remakeReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, remakeReason: e.target.value }))}
                        className="form-select w-full border rounded-md pl-2.5"
                      >
                        <option value="">Select Reason</option>
                        <option value="Incorrect Order">Incorrect Order</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Wrong Size">Wrong Size</option>
                        <option value="Patient Request">Patient Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Order Number
                      </label>
                      <div className="h-10 flex items-center">
                        <input
                          type="text"
                          value={formData.jobOrderNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, jobOrderNumber: e.target.value }))}
                          className="form-input w-full border rounded-md pl-2.5"
                          placeholder="Enter job order number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <DatePicker
                        name="remakeDate"
                        value={formData.remakeDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, remakeDate: date }))}
                        placeholder="Select remake date"
                      />
                    </div>
                  </div>
                </div>

                {/* Claim Notes Section */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Claim Notes
                  </h3>
                  <div>
                    <label htmlFor="claimNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="claimNotes"
                      value={formData.claimNotes}
                      onChange={(e) => setFormData(prev => ({ ...prev, claimNotes: e.target.value }))}
                      rows={4}
                      className="form-textarea w-full border rounded-md pl-2.5 resize-y"
                      placeholder="Enter any additional notes about this claim..."
                    />
                  </div>
                </div>


              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
              {/* Left side: Destructive/utility actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
                  >
                    <Icon name="arrow-left" size={18} />
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
                        doctorSignatureAgreement: false,
                        
                        // Step 3 - Prescription Details
                        odSphere: '',
                        odCylinder: '',
                        odAxis: '',
                        odAdd: '',
                        odBC: '',
                        osSphere: '',
                        osCylinder: '',
                        osAxis: '',
                        osAdd: '',
                        osBC: '',
                        odHorizontal: '',
                        odHorizontalDirection: '',
                        odVertical: '',
                        odVerticalDirection: '',
                        odPrismType: '',
                        osHorizontal: '',
                        osHorizontalDirection: '',
                        osVertical: '',
                        osVerticalDirection: '',
                        osPrismType: '',
                        slabOff: '',
                        eligibilityNumber: '',
                        procedureCodes: [
                          {
                            id: 1,
                            code: '92012',
                            description: 'Eye Exam Establish Patient, Copy will run...',
                            pos: '',
                            mod: '',
                            diagnosisReference: '',
                            units: '1',
                            uAndCCharge: '$200,000.00',
                            planAllowed: '$10,000.00'
                          }
                        ],
                        totalCharges: '',
                        totalAllowed: '',
                        
                        // Step 6 - Additional fields
                        remakeReason: '',
                        jobOrderNumber: '000122544552',
                        remakeDate: '07/16/2016',
                        claimNotes: ''
                      })
                    }
                  }}
                  className="px-6 py-3 text-base font-medium border border-red-500 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
                >
                  <Icon name="x" size={18} />
                  Clear Form
                </button>
              </div>
              
              {/* Right side: Primary actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
                    disabled={isTransitioning}
                  >
                    {isTransitioning ? (
                      <>
                        <Icon name="loader-2" size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === 1 ? 'Start Claim' : currentStep === 2 ? 'Continue' : currentStep === 3 ? 'Continue to Lens Choice' : currentStep === 4 ? 'Continue to Frame Selection' : currentStep === 5 ? 'Continue to Review' : 'Next'}
                        <Icon name="arrow-right" size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="loader-2" size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Icon name="upload" size={18} />
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
        {currentStep <= 6 && (
          <StepIndicators currentStep={currentStep} />
        )}
      </div>

      {/* Main content */}
      {stepContent}
      
      {/* M.I.L.A. Assistant */}
      <HelperButton 
        currentForm="ClaimsSubmission"
        currentField={getCurrentField()}
        currentStep={currentStep}
      />

      {/* M.I.L.A. Code Selection Modal */}
      <HelperModal
        isOpen={showMilaModal}
        onClose={() => {
          setShowMilaModal(false)
          setMilaCodeSelectionMode(false)
        }}
        currentForm="ClaimsSubmission"
        currentField={getCurrentField()}
        currentStep={currentStep}
        isCodeSelectionMode={milaCodeSelectionMode}
        triggeringFieldName={triggeringField}
        triggeringFormName={triggeringForm}
        onCodeSelect={handleCodeSelect}
      />

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              {/* Spinner */}
              <div className="mb-6">
                <Icon name="loader-2" size={48} className="animate-spin text-blue-500 mx-auto" />
              </div>
              
              {/* Loading Message */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Processing Your Claim
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                {loadingMessage}
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mt-6">
                {loadingMessages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index <= loadingStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
  
  // Helper function to determine current field based on step
  function getCurrentField(): string {
    switch (currentStep) {
      case 1:
        return 'patient-information'
      case 2:
        return 'claim-details'
      case 3:
        return 'prescription-details'
      case 4:
        return 'lens-choice'
      case 5:
        return 'frame-selection'
      case 6:
        return 'review-submit'
      default:
        return 'general'
    }
  }
} 
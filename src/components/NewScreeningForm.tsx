import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from './DatePicker'
import HelperButton from './HelperButton'

// NOTE: Using React Portal to ensure modal overlay covers entire viewport
// This fixes the issue where modals don't start from the top of the page
// Apply this pattern to all future modals in the application

// TypeScript Interfaces
interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  pcpName: string
  pcpLocation: string
  lastVisit: string
  status: 'active' | 'inactive'
}

interface ScreeningDetails {
  dateOfScreening: string
  placeOfService: string
  pcpLocation: string
  practicePhone: string
  practiceFax: string
  practiceEmail: string
  practiceName: string
  practiceLocation: string
  officeContact: string
  diabetesMellitus: 'yes' | 'no' | ''
  diabetesType: 'type1' | 'type2' | ''
  lastEyeExam: string
  ocularHistory: string[]
  ocularSurgery: string[]
  ocularHistoryOther: string
  ocularSurgeryOther: string
}

interface RetinalImages {
  rightEyeMissing: boolean
  leftEyeMissing: boolean
  rightEyeImages: File[]
  leftEyeImages: File[]
  technicianComments: string
}

interface NewScreeningFormProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onSave: (formData: { details: ScreeningDetails; images: RetinalImages }) => void
  onComplete: (formData: { details: ScreeningDetails; images: RetinalImages }) => void
}

export default function NewScreeningForm({ 
  patient, 
  isOpen, 
  onClose, 
  onSave, 
  onComplete 
}: NewScreeningFormProps) {
  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [screeningDetails, setScreeningDetails] = useState<ScreeningDetails>({
    dateOfScreening: '',
    placeOfService: '',
    pcpLocation: '',
    practicePhone: '305-555-5555',
    practiceFax: '305-555-5556',
    practiceEmail: 'Contact@gableseyecare.com',
    practiceName: 'Coral Gables Eye Care',
    practiceLocation: '2525 Ponce De Leon Blv',
    officeContact: 'Tom Brady',
    diabetesMellitus: '',
    diabetesType: '',
    lastEyeExam: '7/26/2025',
    ocularHistory: [],
    ocularSurgery: [],
    ocularHistoryOther: '',
    ocularSurgeryOther: ''
  })

  const [retinalImages, setRetinalImages] = useState<RetinalImages>({
    rightEyeMissing: false,
    leftEyeMissing: false,
    rightEyeImages: [],
    leftEyeImages: [],
    technicianComments: ''
  })

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Auto-save effect
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        // Auto-save logic here
        console.log('Auto-saving form data...')
      }, 5000)

      return () => clearTimeout(timeoutId)
    }
  }, [screeningDetails, isOpen])

  // Debug effect to log state changes
  useEffect(() => {
    console.log('screeningDetails state changed:', screeningDetails)
  }, [screeningDetails])

  // Validation functions
  const validateScreeningDetails = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!screeningDetails.dateOfScreening) {
      newErrors.dateOfScreening = 'Date of screening is required'
    }

    if (!screeningDetails.placeOfService) {
      newErrors.placeOfService = 'Place of service is required'
    }

    if (screeningDetails.ocularHistory.includes('other') && !screeningDetails.ocularHistoryOther) {
      newErrors.ocularHistoryOther = 'Please specify other ocular history'
    }

    if (screeningDetails.ocularSurgery.includes('other') && !screeningDetails.ocularSurgeryOther) {
      newErrors.ocularSurgeryOther = 'Please specify other ocular surgery'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRetinalImages = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!retinalImages.rightEyeMissing && retinalImages.rightEyeImages.length === 0) {
      newErrors.rightEyeImages = 'At least one image is required for right eye'
    }

    if (!retinalImages.leftEyeMissing && retinalImages.leftEyeImages.length === 0) {
      newErrors.leftEyeImages = 'At least one image is required for left eye'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation functions
  const handleNext = () => {
    if (currentStep === 1 && validateScreeningDetails()) {
      setCurrentStep(2)
      // Scroll to top on mobile when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
      // Scroll to top on mobile when moving to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Action functions
  const handleSaveForLater = () => {
    onSave({ details: screeningDetails, images: retinalImages })
  }

  const handleComplete = () => {
    if (validateRetinalImages()) {
      onComplete({ details: screeningDetails, images: retinalImages })
    }
  }

  const handleClose = () => {
    onClose()
  }

  // Helper function for icons
  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      camera: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      save: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    return icons[iconName] || icons.close
  }

  if (!isOpen) return null

  const modalJSX = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              HEDIS DIABETIC RETINAL SCREENING
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              (Field Technician - PCP NON-MYDRIATIC SCREENING)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {getIcon('close')}
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
          <div className="step-indicators-container">
            <div className={`step-item ${
              currentStep > 1 ? 'step-completed' : 
              currentStep === 1 ? 'step-active' : 
              'step-inactive'
            }`}>
              <div className="step-number">1</div>
              <div className="step-label">Screening Details</div>
            </div>
            <div className={`step-item ${
              currentStep > 2 ? 'step-completed' : 
              currentStep === 2 ? 'step-active' : 
              'step-inactive'
            }`}>
              <div className="step-number">2</div>
              <div className="step-label">Retinal Images</div>
            </div>
            <div className={`step-item ${
              currentStep > 3 ? 'step-completed' : 
              currentStep === 3 ? 'step-active' : 
              'step-inactive'
            }`}>
              <div className="step-number">3</div>
              <div className="step-label">Review & Submit</div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {currentStep === 1 ? (
            <ScreeningDetailsForm
              patient={patient}
              screeningDetails={screeningDetails}
              setScreeningDetails={setScreeningDetails}
              errors={errors}
            />
          ) : currentStep === 2 ? (
            <RetinalImagesForm
              retinalImages={retinalImages}
              setRetinalImages={setRetinalImages}
              errors={errors}
            />
          ) : (
            <ReviewAndSubmitForm
              patient={patient}
              screeningDetails={screeningDetails}
              retinalImages={retinalImages}
              onEditStep={(step) => setCurrentStep(step)}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {getIcon('close')}
              <span className="ml-2">Close & Don't Save</span>
            </button>
            <button
              onClick={handleSaveForLater}
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {getIcon('save')}
              <span className="ml-2">Save for Later</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : currentStep === 2 ? (
              <>
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Review & Submit</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleComplete}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {getIcon('check')}
                  <span className="ml-2">Submit Screening</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(
    <>
      {modalJSX}
      


      {/* M.I.L.A. Assistant Button - Outside modal for proper z-index */}
      <HelperButton
        currentForm="NewScreeningForm"
        currentField="diabetesMellitus"
        currentStep={currentStep}
      />
    </>,
    document.body
  )
}

// Screening Details Form Component
interface ScreeningDetailsFormProps {
  patient: Patient
  screeningDetails: ScreeningDetails
  setScreeningDetails: (details: ScreeningDetails) => void
  errors: { [key: string]: string }
}

function ScreeningDetailsForm({ 
  patient, 
  screeningDetails, 
  setScreeningDetails, 
  errors 
}: ScreeningDetailsFormProps) {
  const [isToggling, setIsToggling] = useState(false)
  

  
  const handleInputChange = (field: keyof ScreeningDetails, value: any) => {
    setScreeningDetails({ ...screeningDetails, [field]: value })
  }

  const handleRadioChange = (field: keyof ScreeningDetails, value: any) => {
    setScreeningDetails({ ...screeningDetails, [field]: value })
  }

  const handleCheckboxChange = (field: 'ocularHistory' | 'ocularSurgery', value: string, checked: boolean) => {
    const currentArray = screeningDetails[field] as string[]
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value)
    
    setScreeningDetails({ ...screeningDetails, [field]: newArray })
  }

  return (
    <div className="space-y-8">
      {/* Patient Screening Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Patient Screening Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Screening */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date of Screening <span className="text-red-500">*</span>
            </label>
            <DatePicker
              name="dateOfScreening"
              value={screeningDetails.dateOfScreening}
              onChange={(date) => handleInputChange('dateOfScreening', date)}
              placeholder="Date of Screening"
              className={errors.dateOfScreening ? 'border-red-300' : ''}
            />
            {errors.dateOfScreening && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfScreening}</p>
            )}
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient Name
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.firstName} {patient.lastName}
            </div>
          </div>

          {/* Place of Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Place of Service <span className="text-red-500">*</span>
            </label>
            <select
              name="placeOfService"
              value={screeningDetails.placeOfService}
              onChange={(e) => handleInputChange('placeOfService', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-8 appearance-none bg-white ${
                errors.placeOfService ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">Select place of service</option>
              <option value="11">11 - Doctor's Office</option>
              <option value="12">12 - Patient's Home</option>
              <option value="15">15 - Mobile Unit</option>
              <option value="99">99 - Other Unlisted Facility</option>
            </select>
            {errors.placeOfService && (
              <p className="mt-1 text-sm text-red-600">{errors.placeOfService}</p>
            )}
          </div>

          {/* PCP Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PCP Location
            </label>
            <select
              name="pcpLocation"
              value={screeningDetails.pcpLocation || patient.pcpLocation}
              onChange={(e) => handleInputChange('pcpLocation', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-8 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">Select PCP location</option>
              <option value="Downtown Medical Center">Downtown Medical Center</option>
              <option value="Westside Clinic">Westside Clinic</option>
              <option value="Northside Family Practice">Northside Family Practice</option>
              <option value="Eastside Medical Group">Eastside Medical Group</option>
              <option value="Central Health Partners">Central Health Partners</option>
            </select>
          </div>

          {/* Practice Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Phone
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practicePhone}
            </div>
          </div>

          {/* PCP Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PCP Name
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.pcpName}
            </div>
          </div>

          {/* Patient Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient Date of Birth
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.dateOfBirth}
            </div>
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient ID
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.patientId}
            </div>
          </div>

          {/* Last Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Visit
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.lastVisit}
            </div>
          </div>

          {/* Patient Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Patient Status
            </label>
            <div className="text-gray-900 dark:text-white">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                patient.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {patient.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Practice Fax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Fax
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceFax}
            </div>
          </div>



          {/* Practice Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Email
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceEmail}
            </div>
          </div>



          {/* Practice Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Name
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceName}
            </div>
          </div>

          {/* Office Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Office Contact
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.officeContact}
            </div>
          </div>



          {/* Practice Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Practice Location
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceLocation}
            </div>
          </div>


        </div>
      </div>

      {/* Patient History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Patient History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DM (Diabetes Mellitus) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              DM
            </label>
            <div className="space-y-3">
              {/* DM Dropdown */}
              <div>
                <select
                  name="diabetesMellitus"
                  value={screeningDetails.diabetesMellitus || ''}
                  onChange={(e) => {
                    const newValue = e.target.value
                    console.log('DM dropdown changed:', newValue)
                    handleRadioChange('diabetesMellitus', newValue)
                    // Clear diabetes type when switching to 'no'
                    if (newValue === 'no') {
                      handleInputChange('diabetesType', '')
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-8 appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Select DM status</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Type Options - Only show when 'yes' is selected */}
              {screeningDetails.diabetesMellitus === 'yes' && (
                <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Type
                  </label>
                  <div className="flex space-x-6">
                    {[
                      { value: 'type1', label: 'Type I' },
                      { value: 'type2', label: 'Type II' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="diabetesType"
                          value={option.value}
                          checked={screeningDetails.diabetesType === option.value}
                          onChange={(e) => handleInputChange('diabetesType', e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Last Eye Exam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Eye Exam (Optional)
            </label>
            <DatePicker
              name="lastEyeExam"
              value={screeningDetails.lastEyeExam}
              onChange={(date) => handleInputChange('lastEyeExam', date)}
              placeholder="Last Eye Exam"
            />
          </div>

          {/* Ocular HX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Ocular HX
            </label>
            <div className="space-y-2">
              {[
                { value: 'glaucoma', label: 'Glaucoma' },
                { value: 'retinal-detachment', label: 'Retinal Detachment' },
                { value: 'macular-degeneration', label: 'Macular Degeneration' },
                { value: 'other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={screeningDetails.ocularHistory.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('ocularHistory', option.value, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {option.value === 'other' && screeningDetails.ocularHistory.includes('other') && (
                    <input
                      type="text"
                      name="ocularHistoryOther"
                      value={screeningDetails.ocularHistoryOther}
                      onChange={(e) => handleInputChange('ocularHistoryOther', e.target.value)}
                      placeholder="Specify other"
                      className="ml-2 flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </label>
              ))}
            </div>
            {errors.ocularHistoryOther && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularHistoryOther}</p>
            )}
          </div>

          {/* Ocular SX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Ocular SX
            </label>
            <div className="space-y-2">
              {[
                { value: 'cataract', label: 'Cataract' },
                { value: 'laser', label: 'Laser' },
                { value: 'other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={screeningDetails.ocularSurgery.includes(option.value)}
                    onChange={(e) => handleCheckboxChange('ocularSurgery', option.value, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {option.value === 'other' && screeningDetails.ocularSurgery.includes('other') && (
                    <input
                      type="text"
                      name="ocularSurgeryOther"
                      value={screeningDetails.ocularSurgeryOther}
                      onChange={(e) => handleInputChange('ocularSurgeryOther', e.target.value)}
                      placeholder="Specify other"
                      className="ml-2 flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </label>
              ))}
            </div>
            {errors.ocularSurgeryOther && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularSurgeryOther}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Retinal Images Form Component
interface RetinalImagesFormProps {
  retinalImages: RetinalImages
  setRetinalImages: (images: RetinalImages) => void
  errors: { [key: string]: string }
}

interface ReviewAndSubmitFormProps {
  patient: Patient
  screeningDetails: ScreeningDetails
  retinalImages: RetinalImages
  onEditStep: (step: number) => void
}

function RetinalImagesForm({ 
  retinalImages, 
  setRetinalImages, 
  errors 
}: RetinalImagesFormProps) {
  const handleInputChange = (field: keyof RetinalImages, value: any) => {
    setRetinalImages({ ...retinalImages, [field]: value })
  }

  const handleImageUpload = (eye: 'right' | 'left', files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files)
    const currentImages = eye === 'right' ? retinalImages.rightEyeImages : retinalImages.leftEyeImages
    
    // Limit to 3 images per eye
    const updatedImages = [...currentImages, ...newImages].slice(0, 3)
    
    setRetinalImages({
      ...retinalImages,
      [`${eye}EyeImages`]: updatedImages
    })
  }

  const removeImage = (eye: 'right' | 'left', index: number) => {
    const currentImages = eye === 'right' ? retinalImages.rightEyeImages : retinalImages.leftEyeImages
    const updatedImages = currentImages.filter((_, i) => i !== index)
    
    setRetinalImages({
      ...retinalImages,
      [`${eye}EyeImages`]: updatedImages
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Retinal Images
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          (Limit 3 per eye, perspective is based on looking at patients eyes)
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Eye */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Right Eye <span className="text-red-500">*</span></h4>
            
            {/* Missing Eye Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Is the Right Eye missing?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('rightEyeMissing', true)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    retinalImages.rightEyeMissing
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('rightEyeMissing', false)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !retinalImages.rightEyeMissing
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Image Upload Slots */}
            {!retinalImages.rightEyeMissing && (
              <div className="space-y-3">
                {[1, 2, 3].map((slot) => {
                  const image = retinalImages.rightEyeImages[slot - 1]
                  return (
                    <div key={slot} className="relative">
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {image ? (
                          <div className="relative w-full h-full">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Right eye image ${slot}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('right', slot - 1)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-500">OD {slot}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                <input
                  type="file"
                  name="rightEyeImages"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload('right', e.target.files)}
                  className="hidden"
                  id="right-eye-upload"
                />
                <label
                  htmlFor="right-eye-upload"
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload Images
                </label>
              </div>
            )}
            {errors.rightEyeImages && (
              <p className="text-sm text-red-600">{errors.rightEyeImages}</p>
            )}
          </div>

          {/* Left Eye */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Left Eye <span className="text-red-500">*</span></h4>
            
            {/* Missing Eye Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Is the Left Eye missing?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('leftEyeMissing', true)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    retinalImages.leftEyeMissing
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('leftEyeMissing', false)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    !retinalImages.leftEyeMissing
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Image Upload Slots */}
            {!retinalImages.leftEyeMissing && (
              <div className="space-y-3">
                {[1, 2, 3].map((slot) => {
                  const image = retinalImages.leftEyeImages[slot - 1]
                  return (
                    <div key={slot} className="relative">
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {image ? (
                          <div className="relative w-full h-full">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Left eye image ${slot}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('left', slot - 1)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-500">OS {slot}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                <input
                  type="file"
                  name="leftEyeImages"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload('left', e.target.files)}
                  className="hidden"
                  id="left-eye-upload"
                />
                <label
                  htmlFor="left-eye-upload"
                  className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload Images
                </label>
              </div>
            )}
            {errors.leftEyeImages && (
              <p className="text-sm text-red-600">{errors.leftEyeImages}</p>
            )}
          </div>
        </div>

        {/* Technician Comments */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technician Comments (Optional)
          </label>
          <textarea
            name="technicianComments"
            value={retinalImages.technicianComments}
            onChange={(e) => handleInputChange('technicianComments', e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional comments or observations..."
          />
        </div>
      </div>
    </div>
  )
}

// Review and Submit Form Component
function ReviewAndSubmitForm({ 
  patient, 
  screeningDetails, 
  retinalImages, 
  onEditStep 
}: ReviewAndSubmitFormProps) {
  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      edit: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      image: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
    return icons[iconName] || icons.check
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Review & Submit
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Please review all information before submitting. You can edit any section by clicking the edit buttons.
        </p>

        {/* Patient Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Patient Information</h4>
            <button
              onClick={() => onEditStep(1)}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {getIcon('edit')}
              <span className="ml-1">Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Patient Name:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.patientId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Date of Birth:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.dateOfBirth}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">PCP Name:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.pcpName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">PCP Location:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.pcpLocation}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Visit:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{patient.lastVisit}</span>
            </div>
          </div>
        </div>

        {/* Screening Details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Screening Details</h4>
            <button
              onClick={() => onEditStep(1)}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {getIcon('edit')}
              <span className="ml-1">Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Date of Screening:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{screeningDetails.dateOfScreening || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Place of Service:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{screeningDetails.placeOfService || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">PCP Location:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{screeningDetails.pcpLocation || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Diabetes Mellitus:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {screeningDetails.diabetesMellitus === 'yes' 
                  ? `Yes${screeningDetails.diabetesType ? ` (${screeningDetails.diabetesType === 'type1' ? 'Type I' : 'Type II'})` : ''}`
                  : screeningDetails.diabetesMellitus === 'no' 
                    ? 'No' 
                    : 'Not specified'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Last Eye Exam:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{screeningDetails.lastEyeExam || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Ocular History:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {screeningDetails.ocularHistory.length > 0 ? screeningDetails.ocularHistory.join(', ') : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Ocular Surgery:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {screeningDetails.ocularSurgery.length > 0 ? screeningDetails.ocularSurgery.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Retinal Images */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Retinal Images</h4>
            <button
              onClick={() => onEditStep(2)}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {getIcon('edit')}
              <span className="ml-1">Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Eye */}
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Right Eye (OD)</h5>
              {retinalImages.rightEyeMissing ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">Eye marked as missing</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Images: {retinalImages.rightEyeImages.length}/3
                  </div>
                  {retinalImages.rightEyeImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {retinalImages.rightEyeImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Right eye image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Left Eye */}
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Left Eye (OS)</h5>
              {retinalImages.leftEyeMissing ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">Eye marked as missing</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Images: {retinalImages.leftEyeImages.length}/3
                  </div>
                  {retinalImages.leftEyeImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {retinalImages.leftEyeImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Left eye image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Technician Comments */}
          {retinalImages.technicianComments && (
            <div className="mt-4">
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Technician Comments</h5>
              <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                {retinalImages.technicianComments}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon('check')}
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Ready to Submit
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Please review all information above. Once submitted, this screening will be processed and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
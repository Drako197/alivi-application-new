import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import PatientSearchModal from './PatientSearchModal'
import NewScreeningForm from './NewScreeningForm'
import DatePicker from './DatePicker'
import HelperButton from './HelperButton'
import Icon from './Icon'

import ScreeningDataService from '../services/ScreeningDataService'
import type { CompletedScreening, SavedScreening, DashboardStats } from '../services/ScreeningDataService'

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

// Helper function for responsive alert positioning
const createResponsiveAlert = (alertMessage: string, alertDescription: string) => {
  // Create the alert element with the exact same structure as the success alert
  const alert = document.createElement('div')
  alert.className = 'hedis-integrated-alert show'
  
  // Create the content div
  const content = document.createElement('div')
  content.className = 'hedis-integrated-alert-content'
  
  // Create the icon div
  const icon = document.createElement('div')
  icon.className = 'hedis-integrated-alert-icon'
  icon.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
  `
  
  // Create the message div
  const messageDiv = document.createElement('div')
  messageDiv.className = 'hedis-integrated-alert-message'
  
  // Create the title
  const title = document.createElement('h4')
  title.className = 'hedis-integrated-alert-title'
  title.textContent = alertMessage
  
  // Create the description
  const description = document.createElement('p')
  description.className = 'hedis-integrated-alert-description'
  description.textContent = alertDescription
  
  // Create the close button
  const closeButton = document.createElement('button')
  closeButton.className = 'hedis-integrated-alert-close'
  closeButton.setAttribute('aria-label', 'Close alert')
  closeButton.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `
  
  // Assemble the structure
  messageDiv.appendChild(title)
  messageDiv.appendChild(description)
  content.appendChild(icon)
  content.appendChild(messageDiv)
  content.appendChild(closeButton)
  alert.appendChild(content)
  
  // Find the dashboard content and insert at the top
  const dashboardContent = document.querySelector('.dashboard-content')
  if (dashboardContent) {
    dashboardContent.insertBefore(alert, dashboardContent.firstChild)
  } else {
    document.body.appendChild(alert)
  }
  
  // Add close functionality
  closeButton.addEventListener('click', () => {
    alert.remove()
  })
  
  // Remove alert after 10 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove()
    }
  }, 10000)
}

// Patient Search Step Component
interface PatientSearchStepProps {
  onPatientSelect: (patient: Patient) => void
  onNextStep: () => void
}

function PatientSearchStep({ onPatientSelect, onNextStep }: PatientSearchStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    pcpName: '',
    pcpLocation: '',
    patientStatus: 'all'
  })

  // Mock patient data for type-ahead
  const allPatients: Patient[] = [
    {
      id: '1',
      patientId: '12345678',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-03-15',
      pcpName: 'Dr. Sarah Johnson',
      pcpLocation: 'Downtown Medical Center',
      lastVisit: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      patientId: '87654321',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-07-22',
      pcpName: 'Dr. Michael Chen',
      pcpLocation: 'Westside Clinic',
      lastVisit: '2024-02-10',
      status: 'active'
    },
    {
      id: '3',
      patientId: '11223344',
      firstName: 'Robert',
      lastName: 'Wilson',
      dateOfBirth: '1978-11-05',
      pcpName: 'Dr. Sarah Johnson',
      pcpLocation: 'Downtown Medical Center',
      lastVisit: '2024-01-20',
      status: 'active'
    },
    {
      id: '4',
      patientId: '55667788',
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: '1992-04-12',
      pcpName: 'Dr. Michael Chen',
      pcpLocation: 'Westside Clinic',
      lastVisit: '2024-02-15',
      status: 'active'
    },
    {
      id: '5',
      patientId: '99887766',
      firstName: 'David',
      lastName: 'Brown',
      dateOfBirth: '1983-09-18',
      pcpName: 'Dr. Sarah Johnson',
      pcpLocation: 'Downtown Medical Center',
      lastVisit: '2024-01-25',
      status: 'active'
    }
  ]

  // Type-ahead filtering
  const filteredPatients = allPatients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.includes(searchTerm) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPcpName = !selectedFilters.pcpName || 
      patient.pcpName.toLowerCase().includes(selectedFilters.pcpName.toLowerCase())
    
    const matchesPcpLocation = !selectedFilters.pcpLocation || 
      patient.pcpLocation === selectedFilters.pcpLocation
    
    const matchesStatus = selectedFilters.patientStatus === 'all' || 
      patient.status === selectedFilters.patientStatus
    
    return matchesSearch && matchesPcpName && matchesPcpLocation && matchesStatus
  })

  const handleSearch = async () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setSearchResults(filteredPatients)
      setIsSearching(false)
    }, 500)
  }

  // Update search results when search term or filters change
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchResults(filteredPatients)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, selectedFilters])

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    onNextStep()
    // Mobile scroll to top of next form
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    }, 150) // Slightly longer delay to ensure step transition completes
  }

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  return (
    <div className="hedis-patient-search-step">
      {/* M.I.L.A. Assistant Button */}
      <HelperButton
        currentForm="PatientSearchStep"
        currentField="patientId"
        currentStep={1}
        onNavigate={(destination) => {
          console.log('HEDIS navigation requested:', destination)
          // Handle HEDIS-specific navigation
          if (destination === 'hedis-screening') {
            // Navigate to new screening
            onNextStep()
          } else if (destination === 'hedis-dashboard') {
            // Stay on dashboard
            console.log('Already on HEDIS dashboard')
          }
        }}
      />
      

      
      <div className="hedis-search-section">
        <div className="hedis-search-input-group">
          <label className="hedis-search-label">Search by Patient ID or Name</label>
          <div className="hedis-search-input-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Patient ID (8 digits) or patient name..."
              className="hedis-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="hedis-search-clear-button"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="hedis-search-hint">
              <p>Type to see matching patients...</p>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="hedis-advanced-filters">
          <div className="hedis-filters-header">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="hedis-filters-toggle"
            >
              <span className="hedis-filters-title">Advanced Filters</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="hedis-filters-content">
              <div className="hedis-filters-grid">
                <div className="hedis-filter-group">
                  <label className="hedis-filter-label">PCP Name</label>
                  <input
                    type="text"
                    value={selectedFilters.pcpName}
                    onChange={(e) => handleFilterChange('pcpName', e.target.value)}
                    placeholder="Search by PCP name..."
                    className="hedis-filter-input"
                  />
                </div>

                <div className="hedis-filter-group">
                  <label className="hedis-filter-label">PCP Location</label>
                  <select
                    value={selectedFilters.pcpLocation}
                    onChange={(e) => handleFilterChange('pcpLocation', e.target.value)}
                    className="hedis-filter-select"
                  >
                    <option value="">All Locations</option>
                    <option value="Downtown Medical Center">Downtown Medical Center</option>
                    <option value="Westside Clinic">Westside Clinic</option>
                    <option value="Northside Hospital">Northside Hospital</option>
                    <option value="Eastside Medical Group">Eastside Medical Group</option>
                  </select>
                </div>

                <div className="hedis-filter-group">
                  <label className="hedis-filter-label">Patient Status</label>
                  <select
                    value={selectedFilters.patientStatus}
                    onChange={(e) => handleFilterChange('patientStatus', e.target.value)}
                    className="hedis-filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results
            </h3>
            
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="patient-search-result-card cursor-pointer"
                  >
                    <div className="patient-search-result-content">
                      <div className="patient-search-result-header">
                        <h4 className="patient-search-result-name">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <span className="patient-search-result-id">
                          ID: {patient.patientId}
                        </span>
                      </div>
                      <div className="patient-search-result-details">
                        <p className="patient-search-result-pcp">
                          PCP: {patient.pcpName}
                        </p>
                        <p className="patient-search-result-location">
                          Location: {patient.pcpLocation}
                        </p>
                      </div>
                    </div>
                    <div className="patient-search-result-actions">
                      <button className="patient-search-select-button">
                        Start Screening
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="patient-search-no-results">
                <div className="patient-search-no-results-icon">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="patient-search-no-results-title">
                  No patients found
                </h4>
                <p className="patient-search-no-results-message">
                  No patients match your search criteria. Try updating your search terms or adjusting the filters above.
                </p>
                <div className="patient-search-no-results-suggestions">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Suggestions:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Check the spelling of the patient name or ID</li>
                    <li>• Try searching by just the first or last name</li>
                    <li>• Use the advanced filters to narrow your search</li>
                    <li>• Clear filters if you've applied too many restrictions</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Screening Details Form Component
interface ScreeningDetailsFormProps {
  patient: Patient
  screeningDetails: ScreeningDetails
  setScreeningDetails: (details: ScreeningDetails) => void
  errors: { [key: string]: string }
  setErrors: (errors: { [key: string]: string }) => void
  onNextStep: () => void
  onPreviousStep: () => void
  updateScreeningStep: (step: number, mode?: 'new' | 'edit' | 'view' | 'dashboard', formId?: string) => void
  currentFormId: string | undefined
  selectedPatient: Patient | null
  currentScreeningStep: number
  savedForms: any[]
  setSavedForms: (forms: any[]) => void
  setDashboardStats: (stats: any) => void
  setSelectedPatient: (patient: Patient | null) => void
  setCurrentFormId: (formId: string | undefined) => void
}

function ScreeningDetailsForm({ 
  patient, 
  screeningDetails, 
  setScreeningDetails, 
  errors,
  setErrors,
  onNextStep,
  onPreviousStep,
  updateScreeningStep,
  currentFormId,
  selectedPatient,
  currentScreeningStep,
  savedForms,
  setSavedForms,
  setDashboardStats,
  setSelectedPatient,
  setCurrentFormId
}: ScreeningDetailsFormProps) {
  const handleInputChange = (field: keyof ScreeningDetails, value: any) => {
    setScreeningDetails({ ...screeningDetails, [field]: value })
    
    // Clear validation error for this field when user makes a selection
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const handleRadioChange = (field: keyof ScreeningDetails, value: any) => {
    setScreeningDetails({ ...screeningDetails, [field]: value })
  }

  const handleOcularRadioChange = (field: 'ocularHistory' | 'ocularSurgery', value: string) => {
    // For radio buttons, we only store the selected value, not an array
    const updatedScreeningDetails = { ...screeningDetails, [field]: [value] }
    
    // Clear "Other" field if user selects something other than "Other"
    if (value !== 'Other') {
      if (field === 'ocularHistory') {
        updatedScreeningDetails.ocularHistoryOther = ''
      } else if (field === 'ocularSurgery') {
        updatedScreeningDetails.ocularSurgeryOther = ''
      }
    }
    
    setScreeningDetails(updatedScreeningDetails)
    
    // Clear validation error for this field when user makes a selection
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Required fields validation
    if (!screeningDetails.dateOfScreening) {
      newErrors.dateOfScreening = 'Date of screening is required'
    }

    if (!screeningDetails.placeOfService) {
      newErrors.placeOfService = 'Place of service is required'
    }

    if (!screeningDetails.pcpLocation) {
      newErrors.pcpLocation = 'PCP location is required'
    }

    // DM validation
    if (!screeningDetails.diabetesMellitus) {
      newErrors.diabetesMellitus = 'Please select DM status'
    }

    // DM Type validation (only if DM is 'yes')
    if (screeningDetails.diabetesMellitus === 'yes' && !screeningDetails.diabetesType) {
      newErrors.diabetesType = 'Please select diabetes type'
    }

    // Ocular History validation
    if (screeningDetails.ocularHistory.length === 0) {
      newErrors.ocularHistory = 'Please select at least one ocular history option'
    }

    // Ocular History Other validation
    if (screeningDetails.ocularHistory.includes('Other') && !screeningDetails.ocularHistoryOther.trim()) {
      newErrors.ocularHistoryOther = 'Please specify other ocular history'
    }

    // Ocular Surgery validation
    if (screeningDetails.ocularSurgery.length === 0) {
      newErrors.ocularSurgery = 'Please select at least one ocular surgery option'
    }

    // Ocular Surgery Other validation
    if (screeningDetails.ocularSurgery.includes('Other') && !screeningDetails.ocularSurgeryOther.trim()) {
      newErrors.ocularSurgeryOther = 'Please specify other ocular surgery'
    }

    // Update errors state
    setErrors(newErrors)
    
    return Object.keys(newErrors).length === 0
  }

  // Handle Next button click with validation
  const handleNextClick = () => {
    if (validateForm()) {
      onNextStep()
      // Mobile scroll to top of next form
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        })
      }, 150) // Slightly longer delay to ensure step transition completes
    } else {
      // Mobile-friendly scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]')
        if (firstErrorElement) {
          // For mobile, scroll to the element with some offset from top
          firstErrorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
          
          // Add a small delay and scroll up a bit to account for mobile header
          setTimeout(() => {
            window.scrollBy({
              top: -80, // Offset for mobile header/navigation
              behavior: 'smooth'
            })
          }, 300)
        }
      }, 100) // Small delay to ensure error states are rendered
    }
  }

  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      building: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      eye: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
    return iconMap[iconName] || <></>
  }

  return (
    <div className="space-y-8">
      {/* M.I.L.A. Assistant Button */}
      <div className="fixed bottom-6 right-6 z-[999999]">
        <HelperButton
          currentForm="ScreeningDetailsForm"
          currentField="dateOfScreening"
          currentStep={2}
          onNavigate={(destination) => {
            console.log('HEDIS navigation requested:', destination)
            // Handle HEDIS-specific navigation
            if (destination === 'hedis-screening') {
              // Navigate to new screening
              onNextStep()
            } else if (destination === 'hedis-dashboard') {
              // Stay on dashboard
              console.log('Already on HEDIS dashboard')
            }
          }}
        />
      </div>
      
      {/* Patient Screening Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          Patient Screening Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Screening */}
          <div data-error={!!errors.dateOfScreening}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Date of Screening <span className="text-red-500">*</span>
            </label>
            <DatePicker
              name="dateOfScreening"
              value={screeningDetails.dateOfScreening}
              onChange={(date) => handleInputChange('dateOfScreening', date)}
              placeholder="Select screening date"
              hasError={!!errors.dateOfScreening}
            />
            {errors.dateOfScreening && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfScreening}</p>
            )}
          </div>

          {/* Place of Service */}
          <div data-error={!!errors.placeOfService}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Place of Service <span className="text-red-500">*</span>
            </label>
            <select
              name="placeOfService"
              value={screeningDetails.placeOfService}
              onChange={(e) => handleInputChange('placeOfService', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.placeOfService ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Place of Service</option>
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
          <div data-error={!!errors.pcpLocation}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              PCP Location <span className="text-red-500">*</span>
            </label>
            <select
              name="pcpLocation"
              value={screeningDetails.pcpLocation}
              onChange={(e) => handleInputChange('pcpLocation', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.pcpLocation ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select PCP Location</option>
              <option value="Northside Hospital">Northside Hospital</option>
              <option value="Southside Medical Center">Southside Medical Center</option>
              <option value="Downtown Clinic">Downtown Clinic</option>
              <option value="Community Health Center">Community Health Center</option>
              <option value="Riverside Medical Group">Riverside Medical Group</option>
            </select>
            {errors.pcpLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.pcpLocation}</p>
            )}
          </div>

          {/* Practice Phone */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Practice Phone
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practicePhone || '305-555-5555'}
            </div>
          </div>

          {/* PCP Name */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              PCP Name
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.pcpName}
            </div>
          </div>

          {/* Patient Date of Birth */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Patient Date of Birth
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.dateOfBirth}
            </div>
          </div>

          {/* Health Insurance Plan */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Health Insurance Plan
            </label>
            <div className="text-gray-900 dark:text-white">
              Aetna
            </div>
          </div>

          {/* Patient ID */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Patient ID
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.patientId}
            </div>
          </div>

          {/* Practice Name */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Practice Name
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceName || 'Coral Gables Eye Care'}
            </div>
          </div>

          {/* Last Visit */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Last Visit
            </label>
            <div className="text-gray-900 dark:text-white">
              {patient.lastVisit}
            </div>
          </div>

          {/* Practice Location */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Practice Location
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceLocation || '2525 Ponce De Leon Blv'}
            </div>
          </div>

          {/* Patient Status */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
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
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Practice Fax
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceFax || '305-555-5556'}
            </div>
          </div>

          {/* Practice Email */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Practice Email
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.practiceEmail || 'Contact@gableseyecare.com'}
            </div>
          </div>

          {/* Office Contact */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Office Contact
            </label>
            <div className="text-gray-900 dark:text-white">
              {screeningDetails.officeContact || 'Tom Brady'}
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
          <div data-error={!!errors.diabetesMellitus}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Diabetes Mellitus <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="diabetesMellitus"
                  value="yes"
                  checked={screeningDetails.diabetesMellitus === 'yes'}
                  onChange={(e) => handleInputChange('diabetesMellitus', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="diabetesMellitus"
                  value="no"
                  checked={screeningDetails.diabetesMellitus === 'no'}
                  onChange={(e) => handleInputChange('diabetesMellitus', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No</span>
              </label>
            </div>
            {errors.diabetesMellitus && (
              <p className="mt-1 text-sm text-red-600">{errors.diabetesMellitus}</p>
            )}
          </div>

          {/* DM Type - To the right of Diabetes Mellitus */}
          <div data-error={!!errors.diabetesType}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              DM Type {screeningDetails.diabetesMellitus === 'yes' ? <span className="text-red-500">*</span> : '(Disabled)'}
            </label>
            <div className="flex space-x-4">
              <label className={`flex items-center ${
                screeningDetails.diabetesMellitus !== 'yes' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}>
                <input
                  type="radio"
                  name="diabetesType"
                  value="type1"
                  checked={screeningDetails.diabetesType === 'type1'}
                  onChange={(e) => {
                    if (screeningDetails.diabetesMellitus === 'yes') {
                      handleInputChange('diabetesType', e.target.value)
                    }
                  }}
                  disabled={screeningDetails.diabetesMellitus !== 'yes'}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                    screeningDetails.diabetesMellitus === 'yes' ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  screeningDetails.diabetesMellitus === 'yes'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>Type I</span>
              </label>
              <label className={`flex items-center ${
                screeningDetails.diabetesMellitus !== 'yes' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}>
                <input
                  type="radio"
                  name="diabetesType"
                  value="type2"
                  checked={screeningDetails.diabetesType === 'type2'}
                  onChange={(e) => {
                    if (screeningDetails.diabetesMellitus === 'yes') {
                      handleInputChange('diabetesType', e.target.value)
                    }
                  }}
                  disabled={screeningDetails.diabetesMellitus !== 'yes'}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                    screeningDetails.diabetesMellitus === 'yes' ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                />
                <span className={`ml-2 text-sm ${
                  screeningDetails.diabetesMellitus === 'yes'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>Type II</span>
              </label>
            </div>
            {screeningDetails.diabetesMellitus === 'yes' && errors.diabetesType && (
              <p className="mt-1 text-sm text-red-600">{errors.diabetesType}</p>
            )}
          </div>

          {/* Ocular HX - Left column */}
          <div data-error={!!errors.ocularHistory || !!errors.ocularHistoryOther}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-3">
              Ocular HX <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'Glaucoma', label: 'Glaucoma' },
                { value: 'Retinal Detachment', label: 'Retinal Detachment' },
                { value: 'Macular Degeneration', label: 'Macular Degeneration' },
                { value: 'Other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="ocularHistory"
                    value={option.value}
                    checked={screeningDetails.ocularHistory.includes(option.value)}
                    onChange={(e) => {
                      handleOcularRadioChange('ocularHistory', option.value)
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {option.value === 'Other' && screeningDetails.ocularHistory.includes('Other') && (
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
            {errors.ocularHistory && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularHistory}</p>
            )}
            {errors.ocularHistoryOther && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularHistoryOther}</p>
            )}
          </div>

          {/* Ocular SX - Right column */}
          <div data-error={!!errors.ocularSurgery || !!errors.ocularSurgeryOther}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-3">
              Ocular SX <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'Cataract', label: 'Cataract' },
                { value: 'Laser', label: 'Laser' },
                { value: 'Other', label: 'Other' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="ocularSurgery"
                    value={option.value}
                    checked={screeningDetails.ocularSurgery.includes(option.value)}
                    onChange={(e) => {
                      handleOcularRadioChange('ocularSurgery', option.value)
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {option.value === 'Other' && screeningDetails.ocularSurgery.includes('Other') && (
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
            {errors.ocularSurgery && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularSurgery}</p>
            )}
            {errors.ocularSurgeryOther && (
              <p className="mt-1 text-sm text-red-600">{errors.ocularSurgeryOther}</p>
            )}
          </div>

          {/* Last Eye Exam - Full width at the end */}
          <div className="md:col-span-2">
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Last Eye Exam (Optional)
            </label>
            <DatePicker
              name="lastEyeExam"
              value={screeningDetails.lastEyeExam}
              onChange={(date) => handleInputChange('lastEyeExam', date)}
              placeholder="Last Eye Exam"
              hasError={!!errors.lastEyeExam}
            />
            {errors.lastEyeExam && (
              <p className="mt-1 text-sm text-red-600">{errors.lastEyeExam}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions - Mobile Optimized */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        {/* Mobile: Stack buttons vertically */}
        <div className="flex flex-col space-y-3 md:hidden">
          {/* Primary Action - Next */}
                      <button
              onClick={handleNextClick}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
            >
              <span>Continue to Review & Submit</span>
              <Icon name="arrow-right" size={18} />
            </button>
          
          {/* Secondary Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onPreviousStep}
              className="flex-1 flex items-center justify-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                // Save form data
                const formData = {
                  id: currentFormId || `form_${Date.now()}`,
                  patientId: patient.patientId,
                  patientName: `${patient.firstName} ${patient.lastName}`,
                  dateSaved: new Date().toISOString(),
                  progress: `Step ${currentScreeningStep} of 4`,
                  screeningDetails,
                  retinalImages: { rightEyeImages: [], leftEyeImages: [], rightEyeMissing: false, leftEyeMissing: false, technicianComments: '' }
                }
                
                // Add to saved forms
                const updatedSavedForms = [...savedForms, formData]
                setSavedForms(updatedSavedForms)
                
                // Update dashboard stats
                setDashboardStats((prev: { savedPatientForms: number; completedPatientForms: number }) => ({
                  ...prev,
                  savedPatientForms: prev.savedPatientForms + 1
                }))
                
                // Return to dashboard
                updateScreeningStep(0, 'dashboard')
                
                // Show alert
                createResponsiveAlert(
                  'Form saved successfully!',
                  'You have 30 days to complete this form. It will be automatically deleted after 30 days.'
                )
              }}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save</span>
            </button>
          </div>
          
          {/* Close button - Full width on mobile */}
          <button
            onClick={() => updateScreeningStep(0, 'dashboard')}
            className="flex items-center justify-center w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close Form</span>
          </button>
        </div>
        
        {/* Desktop: Original horizontal layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => updateScreeningStep(0, 'dashboard')}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close & Don't Save</span>
            </button>
            <button
              onClick={() => {
                // Save form data
                const formData = {
                  id: currentFormId || `form_${Date.now()}`,
                  patientId: patient.patientId,
                  patientName: `${patient.firstName} ${patient.lastName}`,
                  dateSaved: new Date().toISOString(),
                  progress: `Step ${currentScreeningStep} of 4`,
                  screeningDetails,
                  retinalImages: { rightEyeImages: [], leftEyeImages: [], rightEyeMissing: false, leftEyeMissing: false, technicianComments: '' }
                }
                
                // Add to saved forms
                const updatedSavedForms = [...savedForms, formData]
                setSavedForms(updatedSavedForms)
                
                // Update dashboard stats
                setDashboardStats((prev: { savedPatientForms: number; completedPatientForms: number }) => ({
                  ...prev,
                  savedPatientForms: prev.savedPatientForms + 1
                }))
                
                // Return to dashboard
                updateScreeningStep(0, 'dashboard')
                
                // Show alert
                createResponsiveAlert(
                  'Form saved successfully!',
                  'You have 30 days to complete this form. It will be automatically deleted after 30 days.'
                )
              }}
              className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save for Later</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onPreviousStep}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            <button
              onClick={handleNextClick}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
            >
              <span>Continue to Next Step</span>
              <Icon name="arrow-right" size={18} />
            </button>
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
  setErrors: (errors: { [key: string]: string }) => void
  onNextStep: () => void
  onPreviousStep: () => void
  currentFormId?: string
  selectedPatient: Patient | null
  screeningDetails: ScreeningDetails
  savedForms: any[]
  setSavedForms: (forms: any[]) => void
  setDashboardStats: (stats: any) => void
  updateScreeningStep: (step: number, mode?: 'new' | 'edit' | 'view' | 'dashboard', formId?: string) => void
  currentScreeningStep: number
}

function RetinalImagesForm({ 
  retinalImages, 
  setRetinalImages, 
  errors,
  setErrors,
  onNextStep,
  onPreviousStep,
  currentFormId,
  selectedPatient,
  screeningDetails,
  savedForms,
  setSavedForms,
  setDashboardStats,
  updateScreeningStep,
  currentScreeningStep
}: RetinalImagesFormProps) {
  const handleInputChange = (field: keyof RetinalImages, value: any) => {
    setRetinalImages({ ...retinalImages, [field]: value })
    
    // Clear validation error for this field when user makes a selection
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }

    // Clear errors when user marks eye as missing
    if (field === 'rightEyeMissing' && value === true) {
      const newErrors = { ...errors }
      delete newErrors.rightEyeImages
      setErrors(newErrors)
    }
    if (field === 'leftEyeMissing' && value === true) {
      const newErrors = { ...errors }
      delete newErrors.leftEyeImages
      setErrors(newErrors)
    }

    // Prevent both eyes from being marked as missing
    if (field === 'rightEyeMissing' && value === true && retinalImages.leftEyeMissing) {
      setRetinalImages({ ...retinalImages, leftEyeMissing: false })
      const newErrors = { ...errors }
      delete newErrors.leftEyeImages
      setErrors(newErrors)
    }
    if (field === 'leftEyeMissing' && value === true && retinalImages.rightEyeMissing) {
      setRetinalImages({ ...retinalImages, rightEyeMissing: false })
      const newErrors = { ...errors }
      delete newErrors.rightEyeImages
      setErrors(newErrors)
    }
    
    // Clear general error if the user's action resolves the overall validation issue
    const updatedRetinalImages = { ...retinalImages, [field]: value }
    const hasImages = updatedRetinalImages.rightEyeImages.length > 0 || updatedRetinalImages.leftEyeImages.length > 0
    const hasMissingEyes = updatedRetinalImages.rightEyeMissing || updatedRetinalImages.leftEyeMissing
    
    if (hasImages || hasMissingEyes) {
      const newErrors = { ...errors }
      delete newErrors.general
      if (Object.keys(newErrors).length !== Object.keys(errors).length) {
        setErrors(newErrors)
      }
    }
  }

  const handleImageUpload = (eye: 'right' | 'left', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
      
      if (eye === 'right') {
        setRetinalImages({
          ...retinalImages,
          rightEyeImages: [...retinalImages.rightEyeImages, ...imageFiles].slice(0, 3)
        })
        
        // Clear validation errors for right eye when images are added
        const newErrors = { ...errors }
        delete newErrors.rightEyeImages
        if (Object.keys(newErrors).length !== Object.keys(errors).length) {
          setErrors(newErrors)
        }
      } else {
        setRetinalImages({
          ...retinalImages,
          leftEyeImages: [...retinalImages.leftEyeImages, ...imageFiles].slice(0, 3)
        })
        
        // Clear validation errors for left eye when images are added
        const newErrors = { ...errors }
        delete newErrors.leftEyeImages
        if (Object.keys(newErrors).length !== Object.keys(errors).length) {
          setErrors(newErrors)
        }
      }
      
      // Clear general error if at least one eye now has images
      const updatedImages = eye === 'right' 
        ? { ...retinalImages, rightEyeImages: [...retinalImages.rightEyeImages, ...imageFiles].slice(0, 3) }
        : { ...retinalImages, leftEyeImages: [...retinalImages.leftEyeImages, ...imageFiles].slice(0, 3) }
      
      const hasImages = updatedImages.rightEyeImages.length > 0 || updatedImages.leftEyeImages.length > 0
      const hasMissingEyes = updatedImages.rightEyeMissing || updatedImages.leftEyeMissing
      
      if (hasImages || hasMissingEyes) {
        const newErrors = { ...errors }
        delete newErrors.general
        if (Object.keys(newErrors).length !== Object.keys(errors).length) {
          setErrors(newErrors)
        }
      }
    }
  }

  const removeImage = (eye: 'right' | 'left', index: number) => {
    if (eye === 'right') {
      setRetinalImages({
        ...retinalImages,
        rightEyeImages: retinalImages.rightEyeImages.filter((_: File, i: number) => i !== index)
      })
    } else {
      setRetinalImages({
        ...retinalImages,
        leftEyeImages: retinalImages.leftEyeImages.filter((_: File, i: number) => i !== index)
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
  }

  const handleDrop = (e: React.DragEvent, eye: 'right' | 'left') => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
    handleImageUpload(eye, e.dataTransfer.files)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Check if at least one eye has images or is marked as missing
    const rightEyeValid = retinalImages.rightEyeMissing || retinalImages.rightEyeImages.length > 0
    const leftEyeValid = retinalImages.leftEyeMissing || retinalImages.leftEyeImages.length > 0

    // Ensure at least one eye has images (not both marked as missing)
    const atLeastOneEyeHasImages = (retinalImages.rightEyeImages.length > 0 || retinalImages.leftEyeImages.length > 0) || 
                                   (retinalImages.rightEyeMissing && !retinalImages.leftEyeMissing) || 
                                   (!retinalImages.rightEyeMissing && retinalImages.leftEyeMissing)

    if (!rightEyeValid) {
      newErrors.rightEyeImages = 'Please upload images for right eye or mark as missing'
    }

    if (!leftEyeValid) {
      newErrors.leftEyeImages = 'Please upload images for left eye or mark as missing'
    }

    // Check that at least one eye has images
    if (!atLeastOneEyeHasImages) {
      if (!retinalImages.rightEyeImages.length && !retinalImages.leftEyeImages.length) {
        newErrors.general = 'At least one eye must have images uploaded. You cannot mark both eyes as missing.'
      }
    }

    // Update errors state
    setErrors(newErrors)
    
    return Object.keys(newErrors).length === 0
  }

  const handleNextClick = () => {
    if (validateForm()) {
      onNextStep()
      // Mobile scroll to top of next form
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        })
      }, 150) // Slightly longer delay to ensure step transition completes
    } else {
      // Mobile-friendly scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]')
        if (firstErrorElement) {
          // For mobile, scroll to the element with some offset from top
          firstErrorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
          
          // Add a small delay and scroll up a bit to account for mobile header
          setTimeout(() => {
            window.scrollBy({
              top: -80, // Offset for mobile header/navigation
              behavior: 'smooth'
            })
          }, 300)
        }
      }, 100) // Small delay to ensure error states are rendered
    }
  }

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      upload: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      eye: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      close: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    return icons[iconName] || <></>
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* M.I.L.A. Assistant Button */}
      <div className="fixed bottom-6 right-6 z-[999999]">
        <HelperButton
          currentForm="RetinalImagesForm"
          currentField="rightEyeImages"
          currentStep={3}
          onNavigate={(destination) => {
            console.log('HEDIS navigation requested:', destination)
            // Handle HEDIS-specific navigation
            if (destination === 'hedis-screening') {
              // Navigate to new screening
              onNextStep()
            } else if (destination === 'hedis-dashboard') {
              // Stay on dashboard
              console.log('Already on HEDIS dashboard')
            }
          }}
        />
      </div>
      
      {/* Header - Mobile Optimized */}
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
          Retinal Image Upload
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4 md:px-0">
          Upload retinal images for both eyes. Each eye requires up to 3 images for comprehensive screening.
        </p>
      </div>

      {/* General Error Message - Mobile Optimized */}
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4 md:mx-0">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      {/* Eyes Container - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0">
        {/* Right Eye - Mobile Optimized */}
        <div className="space-y-4 md:space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
              Right Eye (OD)
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-gray-500">
                {retinalImages.rightEyeImages.length}/3 images
              </span>
              {retinalImages.rightEyeImages.length === 3 && (
                <div className="flex items-center text-green-600">
                  {getIcon('check')}
                </div>
              )}
            </div>
          </div>

          {/* Missing Eye Toggle - Mobile Optimized */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={retinalImages.rightEyeMissing}
                onChange={(e) => handleInputChange('rightEyeMissing', e.target.checked)}
                className="h-5 w-5 md:h-4 md:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 md:ml-2 text-sm md:text-sm text-gray-700 dark:text-gray-300">
                Right eye (OD) images unavailable
              </span>
            </label>
          </div>

          {/* Upload Zone - Mobile Optimized */}
          {!retinalImages.rightEyeMissing && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 md:p-6 transition-all duration-200 ${
                retinalImages.rightEyeImages.length === 0
                  ? 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  : 'border-green-300 bg-green-50'
              } ${errors.rightEyeImages ? 'border-red-300 bg-red-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'right')}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload('right', e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={retinalImages.rightEyeImages.length >= 3}
              />
              
              {retinalImages.rightEyeImages.length === 0 ? (
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    {getIcon('upload')}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="md:hidden">Tap to select images</span>
                    <span className="hidden md:inline">Drag and drop images here, or click to browse</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF (max 3 images)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-medium text-green-700 mb-3">
                    {retinalImages.rightEyeImages.length} image(s) uploaded
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {retinalImages.rightEyeImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Right eye (OD) image ${index + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded border shadow-sm"
                        />
                        {/* Desktop X button */}
                        <button
                          onClick={() => removeImage('right', index)}
                          className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-white hidden sm:flex"
                          title="Remove image"
                        >
                          {getIcon('close')}
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded pointer-events-none"></div>
                        
                        {/* Mobile Remove button */}
                        <button
                          onClick={() => removeImage('right', index)}
                          className="w-full mt-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors sm:hidden"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message for right eye */}
          {errors.rightEyeImages && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {errors.rightEyeImages}
            </p>
          )}

          {retinalImages.rightEyeMissing && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Right eye (OD) images marked as unavailable. Please document reason in technician comments below.
              </p>
            </div>
          )}
        </div>

        {/* Left Eye - Mobile Optimized */}
        <div className="space-y-4 md:space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 bg-green-600 rounded-full mr-3"></span>
              Left Eye (OS)
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-gray-500">
                {retinalImages.leftEyeImages.length}/3 images
              </span>
              {retinalImages.leftEyeImages.length === 3 && (
                <div className="flex items-center text-green-600">
                  {getIcon('check')}
                </div>
              )}
            </div>
          </div>

          {/* Missing Eye Toggle - Mobile Optimized */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={retinalImages.leftEyeMissing}
                onChange={(e) => handleInputChange('leftEyeMissing', e.target.checked)}
                className="h-5 w-5 md:h-4 md:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 md:ml-2 text-sm md:text-sm text-gray-700 dark:text-gray-300">
                Left eye (OS) images unavailable
              </span>
            </label>
          </div>

          {/* Upload Zone - Mobile Optimized */}
          {!retinalImages.leftEyeMissing && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 md:p-6 transition-all duration-200 ${
                retinalImages.leftEyeImages.length === 0
                  ? 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  : 'border-green-300 bg-green-50'
              } ${errors.leftEyeImages ? 'border-red-300 bg-red-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'left')}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload('left', e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={retinalImages.leftEyeImages.length >= 3}
              />
              
              {retinalImages.leftEyeImages.length === 0 ? (
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    {getIcon('upload')}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="md:hidden">Tap to select images</span>
                    <span className="hidden md:inline">Drag and drop images here, or click to browse</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF (max 3 images)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-medium text-green-700 mb-3">
                    {retinalImages.leftEyeImages.length} image(s) uploaded
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {retinalImages.leftEyeImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Left eye (OS) image ${index + 1}`}
                          className="w-full h-24 md:h-32 object-cover rounded border shadow-sm"
                        />
                        {/* Desktop X button */}
                        <button
                          onClick={() => removeImage('left', index)}
                          className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-white hidden sm:flex"
                          title="Remove image"
                        >
                          {getIcon('close')}
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded pointer-events-none"></div>
                        
                        {/* Mobile Remove button */}
                        <button
                          onClick={() => removeImage('left', index)}
                          className="w-full mt-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors sm:hidden"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message for left eye */}
          {errors.leftEyeImages && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {errors.leftEyeImages}
            </p>
          )}

          {retinalImages.leftEyeMissing && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Left eye (OS) images marked as unavailable. Please document reason in technician comments below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Technician Comments - Mobile Optimized */}
      <div className="space-y-3 px-4 md:px-0">
        <label className="block text-sm md:text-sm font-extrabold text-gray-700 dark:text-gray-300">
          Technician Comments
        </label>
        <textarea
          name="technicianComments"
          value={retinalImages.technicianComments}
          onChange={(e) => handleInputChange('technicianComments', e.target.value)}
          placeholder="Add any relevant notes about the image capture process, patient cooperation, or image quality..."
          rows={4}
          className={`block w-full px-3 py-3 md:py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-sm md:text-sm ${
            errors.technicianComments ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.technicianComments && (
          <p className="text-sm text-red-600">{errors.technicianComments}</p>
        )}
      </div>

      {/* Progress Summary - Mobile Optimized */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mx-4 md:mx-0">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Upload Summary
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Right Eye (OD):</span>
            <span className={`font-medium ${
              retinalImages.rightEyeMissing 
                ? 'text-yellow-600' 
                : retinalImages.rightEyeImages.length > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}>
              {retinalImages.rightEyeMissing 
                ? 'Marked unavailable' 
                : `${retinalImages.rightEyeImages.length}/3 images`
              }
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Left Eye (OS):</span>
            <span className={`font-medium ${
              retinalImages.leftEyeMissing 
                ? 'text-yellow-600' 
                : retinalImages.leftEyeImages.length > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}>
              {retinalImages.leftEyeMissing 
                ? 'Marked unavailable' 
                : `${retinalImages.leftEyeImages.length}/3 images`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions - Mobile Optimized */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        {/* Mobile: Stack buttons vertically */}
        <div className="flex flex-col space-y-3 md:hidden">
          {/* Primary Action - Next */}
          <button
            onClick={handleNextClick}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
          >
            <span>Continue to Next Step</span>
            <Icon name="arrow-right" size={18} />
          </button>

          {/* Secondary Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onPreviousStep}
              className="flex-1 flex items-center justify-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                // Save form data
                const formData = {
                  id: currentFormId || `form_${Date.now()}`,
                  patientId: selectedPatient?.patientId || '',
                  patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
                  dateSaved: new Date().toISOString(),
                  progress: `Step ${currentScreeningStep} of 4`,
                  screeningDetails,
                  retinalImages
                }
                
                // Add to saved forms
                const updatedSavedForms = [...savedForms, formData]
                setSavedForms(updatedSavedForms)
                
                // Update dashboard stats
                setDashboardStats((prev: { savedPatientForms: number; completedPatientForms: number }) => ({
                  ...prev,
                  savedPatientForms: prev.savedPatientForms + 1
                }))
                
                // Return to dashboard
                updateScreeningStep(0, 'dashboard')
                
                // Show alert
                createResponsiveAlert(
                  'Form saved successfully!',
                  'You have 30 days to complete this form. It will be automatically deleted after 30 days.'
                )
              }}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save</span>
            </button>
          </div>

          {/* Close button - Full width on mobile */}
          <button
            onClick={() => updateScreeningStep(0, 'dashboard')}
            className="flex items-center justify-center w-full px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close Form</span>
          </button>
        </div>

        {/* Desktop: Original horizontal layout */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => updateScreeningStep(0, 'dashboard')}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Close & Don't Save</span>
            </button>
            <button
              onClick={() => {
                // Save form data
                const formData = {
                  id: currentFormId || `form_${Date.now()}`,
                  patientId: selectedPatient?.patientId || '',
                  patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
                  dateSaved: new Date().toISOString(),
                  progress: `Step ${currentScreeningStep} of 4`,
                  screeningDetails,
                  retinalImages
                }
                
                // Add to saved forms
                const updatedSavedForms = [...savedForms, formData]
                setSavedForms(updatedSavedForms)
                
                // Update dashboard stats
                setDashboardStats((prev: { savedPatientForms: number; completedPatientForms: number }) => ({
                  ...prev,
                  savedPatientForms: prev.savedPatientForms + 1
                }))
                
                // Return to dashboard
                updateScreeningStep(0, 'dashboard')
                
                // Show alert
                createResponsiveAlert(
                  'Form saved successfully!',
                  'You have 30 days to complete this form. It will be automatically deleted after 30 days.'
                )
              }}
              className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save for Later</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onPreviousStep}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            <button
              onClick={handleNextClick}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-colors w-full sm:w-auto min-h-[44px]"
            >
              <span>Continue to Next Step</span>
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Review and Submit Form Component
interface ReviewAndSubmitFormProps {
  patient: Patient
  screeningDetails: ScreeningDetails
  retinalImages: RetinalImages
  onEditStep: (step: number) => void
  onComplete: () => void
  onSave: () => void
}

interface ScreeningSuccessProps {
  patient: Patient
  onBackToDashboard: () => void
  onStartNewScreening: () => void
}

function ReviewAndSubmitForm({ 
  patient, 
  screeningDetails, 
  retinalImages, 
  onEditStep,
  onComplete,
  onSave
}: ReviewAndSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call with 5-second delay
    await new Promise(resolve => setTimeout(resolve, 5000))
    setIsSubmitting(false)
    onComplete()
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call with 5-second delay
    await new Promise(resolve => setTimeout(resolve, 5000))
    setIsSaving(false)
    onSave()
  }
  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      user: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      eye: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      check: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return iconMap[iconName] || <></>
  }

  return (
    <div className="screening-form-content relative">
      {/* M.I.L.A. Assistant Button */}
      <div className="fixed bottom-6 right-6 z-[999999]">
        <HelperButton
          currentForm="ReviewAndSubmitForm"
          currentField="review"
          currentStep={4}
          onNavigate={(destination) => {
            console.log('HEDIS navigation requested:', destination)
            // Handle HEDIS-specific navigation
            if (destination === 'hedis-screening') {
              // Navigate to new screening
              console.log('Already in review step')
            } else if (destination === 'hedis-dashboard') {
              // Stay on dashboard
              console.log('Already on HEDIS dashboard')
            }
          }}
        />
      </div>
      
      {/* Loading Overlay */}
      {(isSubmitting || isSaving) && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isSubmitting ? 'Submitting Screening...' : 'Saving for Later...'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we process your data
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Enhanced Header with Status Indicators */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review & Submit</h2>
              <p className="text-gray-600 dark:text-gray-400">All sections completed successfully</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
              Ready to Submit
            </span>
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h3>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Complete
            </span>
          </div>
        </div>
        
        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">Name:</span>
            <span className="text-sm text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">ID:</span>
            <span className="text-sm text-gray-900 dark:text-white">{patient.patientId}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">DOB:</span>
            <span className="text-sm text-gray-900 dark:text-white">{patient.dateOfBirth}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px]">PCP:</span>
            <span className="text-sm text-gray-900 dark:text-white">{patient.pcpName}</span>
          </div>
        </div>
      </div>

      {/* Screening Details Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Screening Details</h3>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Complete
            </span>
          </div>
          <button
            onClick={() => onEditStep(2)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>
        
        {/* Screening Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">Screening Date:</span>
            <span className="text-sm text-gray-900 dark:text-white">{screeningDetails.dateOfScreening || 'Not specified'}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">Place of Service:</span>
            <span className="text-sm text-gray-900 dark:text-white">{screeningDetails.placeOfService || 'Not specified'}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">PCP Location:</span>
            <span className="text-sm text-gray-900 dark:text-white">{screeningDetails.pcpLocation || 'Not specified'}</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">Diabetes Status:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {screeningDetails.diabetesMellitus ? 
                `${screeningDetails.diabetesMellitus}${screeningDetails.diabetesType ? ` (${screeningDetails.diabetesType})` : ''}` : 
                'Not specified'}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[120px]">Last Eye Exam:</span>
            <span className="text-sm text-gray-900 dark:text-white">{screeningDetails.lastEyeExam || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Retinal Images Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Retinal Images</h3>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Complete
            </span>
          </div>
          <button
            onClick={() => onEditStep(3)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>
        
        {/* Image Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${retinalImages.rightEyeMissing || retinalImages.rightEyeImages.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Right Eye (OD):</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {retinalImages.rightEyeMissing ? 'Missing Eye' : `${retinalImages.rightEyeImages.length} image(s)`}
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${retinalImages.leftEyeMissing || retinalImages.leftEyeImages.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Left Eye (OS):</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {retinalImages.leftEyeMissing ? 'Missing Eye' : `${retinalImages.leftEyeImages.length} image(s)`}
            </span>
          </div>
        </div>
        
        {retinalImages.technicianComments && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Technician Comments:</span>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{retinalImages.technicianComments}</p>
          </div>
        )}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Icon name="loader-2" size={16} className="animate-spin mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="save" size={16} className="mr-2" />
                <span>Save for Later</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            All sections completed
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isSaving}
            className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Icon name="loader-2" size={20} className="animate-spin mr-2" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Icon name="check-circle" size={20} className="mr-2" />
                <span>Submit Screening</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Screening Success Component
function ScreeningSuccess({ patient, onBackToDashboard, onStartNewScreening }: ScreeningSuccessProps) {
  return (
    <div className="screening-form-content">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-8 mb-8 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Screening Completed Successfully!</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Patient screening for <span className="font-semibold text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</span> has been submitted.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The screening data has been processed and is now available in the system.
        </p>
      </div>

      {/* Success Details */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
          What happens next?
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Data Processing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your screening data is being processed and validated by our system.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Quality Review</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">The screening will undergo quality review by our medical team.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Results Available</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Results will be available in the completed screenings section.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center space-x-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={onStartNewScreening}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Start New Screening</span>
        </button>
      </div>
    </div>
  )
}

// Completed Screening List Modal Component
interface CompletedScreeningListModalProps {
  isOpen: boolean
  onClose: () => void
  onFormSelect: (formId: string) => void
}

function CompletedScreeningListModal({ isOpen, onClose, onFormSelect }: CompletedScreeningListModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Get completed screenings from data service
  const completedScreenings = ScreeningDataService.getCompletedScreenings()

  const filteredScreenings = completedScreenings.filter(screening =>
    screening.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screening.patientId.includes(searchTerm)
  )

  if (!isOpen) return null

  return createPortal(
    <div className="hedis-list-modal-overlay">
      <div className="hedis-list-modal">
        <div className="hedis-list-modal-header">
          <h2 className="hedis-list-modal-title">Completed Patient Screenings</h2>
          <button 
            onClick={onClose}
            className="hedis-list-modal-close"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="hedis-list-modal-content">
          <div className="hedis-list-search">
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hedis-list-search-input"
            />
          </div>

          <div className="hedis-list-results">
            {filteredScreenings.length === 0 ? (
              <div className="hedis-list-empty">
                <p>No completed screenings found.</p>
              </div>
            ) : (
              <div className="hedis-list-items">
                {filteredScreenings.map((screening) => (
                  <div 
                    key={screening.id}
                    className="hedis-list-item hedis-list-item-completed"
                    onClick={() => onFormSelect(screening.id)}
                  >
                    <div className="hedis-list-item-info">
                      <div className="hedis-list-item-name">{screening.patientName}</div>
                      <div className="hedis-list-item-details">
                        <span>ID: {screening.patientId}</span>
                        <span>Completed: {screening.dateCompleted}</span>
                        <span>Technician: {screening.technician}</span>
                      </div>
                    </div>
                    <div className="hedis-list-item-action">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Saved Screening List Modal Component
interface SavedScreeningListModalProps {
  isOpen: boolean
  onClose: () => void
  onFormSelect: (formId: string) => void
  savedScreenings: any[]
}

function SavedScreeningListModal({ isOpen, onClose, onFormSelect, savedScreenings }: SavedScreeningListModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dateSaved' | 'patientName' | 'progress' | 'urgency'>('urgency')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const filteredScreenings = savedScreenings.filter(screening =>
    screening.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screening.patientId.includes(searchTerm)
  )

  const formatDateSaved = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysSinceSaved = (dateString: string) => {
    const savedDate = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - savedDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const getDaysUntilExpiry = (dateString: string) => {
    const daysSinceSaved = getDaysSinceSaved(dateString)
    const daysUntilExpiry = Math.max(0, 30 - daysSinceSaved)

    return daysUntilExpiry
  }

  const getUrgencyLevel = (dateString: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(dateString)
    if (daysUntilExpiry <= 5) return 'urgent'
    if (daysUntilExpiry <= 10) return 'warning'
    return 'safe'
  }

  const getUrgencyLabel = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'AUTO-DELETE IN 5 DAYS'
      case 'warning':
        return 'DUE SOON'
      default:
        return ''
    }
  }

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return ''
    }
  }

  const urgentForms = filteredScreenings.filter(screening => {
    const urgencyLevel = getUrgencyLevel(screening.dateSaved)
    return urgencyLevel === 'urgent'
  })

  const filteredAndSortedScreenings = filteredScreenings.sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'dateSaved':
        aValue = new Date(a.dateSaved).getTime()
        bValue = new Date(b.dateSaved).getTime()
        break
      case 'patientName':
        aValue = a.patientName.toLowerCase()
        bValue = b.patientName.toLowerCase()
        break
      case 'progress':
        aValue = a.progress
        bValue = b.progress
        break
      case 'urgency':
        const aDaysUntilExpiry = getDaysUntilExpiry(a.dateSaved)
        const bDaysUntilExpiry = getDaysUntilExpiry(b.dateSaved)
        // Sort by urgency: urgent (1-5 days until expiry) first, then warning (6-10 days), then safe (11+ days)
        // Lower urgency score = more urgent (should appear first)
        const aUrgencyScore = aDaysUntilExpiry <= 5 ? 0 : aDaysUntilExpiry <= 10 ? 1 : 2
        const bUrgencyScore = bDaysUntilExpiry <= 5 ? 0 : bDaysUntilExpiry <= 10 ? 1 : 2
        aValue = aUrgencyScore
        bValue = bUrgencyScore
        console.log(`URGENCY SORT: ${a.patientName} (${aDaysUntilExpiry} days until expiry, score ${aUrgencyScore}) vs ${b.patientName} (${bDaysUntilExpiry} days until expiry, score ${bUrgencyScore})`)
        break
      default:
        aValue = a.patientName.toLowerCase()
        bValue = b.patientName.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      // For urgency sorting, we want lower scores (more urgent) to appear first with desc order
      if (sortBy === 'urgency') {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue < bValue ? 1 : -1
      }
    }
  })

  const handleSortChange = (newSortBy: 'dateSaved' | 'patientName' | 'progress' | 'urgency') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="hedis-list-modal-overlay">
      <div className="hedis-list-modal">
        <div className="hedis-list-modal-header">
          <h2 className="hedis-list-modal-title">Saved Patient Screenings</h2>
          <button 
            onClick={onClose}
            className="hedis-list-modal-close"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="hedis-list-modal-content">
          {urgentForms.length > 0 && (
            <div className="hedis-list-modal-warning">
              <div className="hedis-list-modal-warning-content">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="hedis-list-modal-warning-text">
                  Forms not completed within 30 days of saving will be automatically deleted from the system.
                </span>
              </div>
            </div>
          )}

          <div className="hedis-list-search">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hedis-list-search-input flex-1 w-full"
              />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-')
                  setSortBy(newSortBy as 'dateSaved' | 'patientName' | 'progress' | 'urgency')
                  setSortOrder(newSortOrder as 'asc' | 'desc')
                }}
                className="hedis-list-sort-select w-full md:w-auto"
              >
                <option value="urgency-desc">Urgency (Most Urgent First)</option>
                <option value="dateSaved-desc">Date Saved (Newest)</option>
                <option value="dateSaved-asc">Date Saved (Oldest)</option>
                <option value="patientName-asc">Patient Name (A-Z)</option>
                <option value="patientName-desc">Patient Name (Z-A)</option>
                <option value="progress-asc">Progress (Step 1-4)</option>
                <option value="progress-desc">Progress (Step 4-1)</option>
              </select>
            </div>
          </div>

          <div className="hedis-list-results">
            {filteredAndSortedScreenings.length === 0 ? (
              <div className="hedis-list-empty">
                <p>No saved screenings found.</p>
              </div>
            ) : (
              <div className="hedis-list-items">
                {filteredAndSortedScreenings.map((screening) => {
                  const urgencyLevel = getUrgencyLevel(screening.dateSaved)
                  const daysUntilExpiry = getDaysUntilExpiry(screening.dateSaved)
                  
                  return (
                    <div 
                      key={screening.id}
                      className={`hedis-list-item hedis-list-item-saved ${urgencyLevel === 'urgent' ? 'hedis-list-item-urgent' : urgencyLevel === 'warning' ? 'hedis-list-item-warning' : ''}`}
                      onClick={() => onFormSelect(screening.id)}
                    >
                      <div className="hedis-list-item-info">
                        <div className="hedis-list-item-header">
                          <div className="hedis-list-item-name">{screening.patientName}</div>
                          {(urgencyLevel !== 'safe' || sortBy === 'urgency') && (
                            <span className={`hedis-list-item-urgency-badge ${getUrgencyColor(urgencyLevel)}`}>
                              {getUrgencyLabel(urgencyLevel)}
                            </span>
                          )}
                        </div>
                        <div className="hedis-list-item-details">
                          <span>ID: {screening.patientId}</span>
                          <span>Date Saved: {formatDateSaved(screening.dateSaved)}</span>
                          <span>Days Until Expiry: {daysUntilExpiry}</span>
                          <span>Progress: {screening.progress}</span>
                          <span>Technician: {screening.technician}</span>
                        </div>
                      </div>
                      <div className="hedis-list-item-action">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Completed Screening View Component (Read-only)
interface CompletedScreeningViewProps {
  screening: CompletedScreening
  onClose: () => void
}

function CompletedScreeningView({ screening, onClose }: CompletedScreeningViewProps) {
  // Image preview state
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<{ eye: 'right' | 'left', index: number } | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<{ eye: 'right' | 'left', index: number, file: any }[]>([])

  // Function to handle image preview
  const handleImagePreview = (eye: 'right' | 'left', index: number) => {
    console.log('handleImagePreview called:', { eye, index })
    
    // Create array of all images for navigation
    const images: { eye: 'right' | 'left', index: number, file: any }[] = []
    
    // Add right eye images
    if (Array.isArray(screening.retinalImages.rightEyeImages)) {
      console.log('Right eye images:', screening.retinalImages.rightEyeImages)
      screening.retinalImages.rightEyeImages.forEach((imageData, i) => {
        images.push({ eye: 'right', index: i, file: imageData })
      })
    }
    
    // Add left eye images
    if (Array.isArray(screening.retinalImages.leftEyeImages)) {
      console.log('Left eye images:', screening.retinalImages.leftEyeImages)
      screening.retinalImages.leftEyeImages.forEach((imageData, i) => {
        images.push({ eye: 'left', index: i, file: imageData })
      })
    }
    
    console.log('All images array:', images)
    setAllImages(images)
    
    // Find the current image index
    const currentIndex = images.findIndex(img => img.eye === eye && img.index === index)
    console.log('Current image index:', currentIndex)
    setCurrentImageIndex(currentIndex >= 0 ? currentIndex : 0)
    
    setPreviewImage({ eye, index })
    setShowImagePreview(true)
    console.log('Modal should be visible now')
  }

  // Function to navigate to next image
  const handleNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  // Function to navigate to previous image
  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Function to close image preview
  const handleCloseImagePreview = () => {
    setShowImagePreview(false)
    setPreviewImage(null)
    setCurrentImageIndex(0)
    setAllImages([])
  }

  // Helper function to safely create object URL
  const createSafeObjectURL = (image: any): string => {
    try {
      // Check if it's a valid File object
      if (image instanceof File) {
        return URL.createObjectURL(image)
      }
      
      // Check if it's a base64 image object from our data service
      if (image && typeof image === 'object' && image.base64) {
        console.log('Using base64 image:', image.filename)
        return image.base64 // Return the base64 data URL directly
      }
      
      // If it's not a File object or base64 object, it might be a serialized object from localStorage
      // In this case, we can't create an object URL, so return a placeholder
      console.warn('Image is not a valid File object or base64 object:', image)
      return '/images/retinal-imaging-1.jpg' // Fallback to a static image
    } catch (error) {
      console.error('Error creating object URL:', error)
      return '/images/retinal-imaging-1.jpg' // Fallback to a static image
    }
  }

  // Keyboard navigation for image preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showImagePreview) return
      
      switch (event.key) {
        case 'Escape':
          handleCloseImagePreview()
          break
        case 'ArrowLeft':
          if (currentImageIndex > 0) {
            handlePreviousImage()
          }
          break
        case 'ArrowRight':
          if (currentImageIndex < allImages.length - 1) {
            handleNextImage()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImagePreview, currentImageIndex, allImages.length])

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', { showImagePreview, allImagesLength: allImages.length, currentImageIndex })
  }, [showImagePreview, allImages.length, currentImageIndex])
  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      'user': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      'calendar': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'phone': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      'location': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'medical': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      'eye': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'comment': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
    return iconMap[iconName] || <div className="w-5 h-5" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="hedis-screening-page">
      <div className="hedis-screening-header">
        <div className="hedis-screening-progress">
          <div className="step-indicators-container">
            <div className="step-item step-completed">
              <div className="step-number">1</div>
              <div className="step-label">Patient Search</div>
            </div>
            <div className="step-item step-completed">
              <div className="step-number">2</div>
              <div className="step-label">Screening Details</div>
            </div>
            <div className="step-item step-completed">
              <div className="step-number">3</div>
              <div className="step-label">Retinal Images</div>
            </div>
            <div className="step-item step-completed">
              <div className="step-number">4</div>
              <div className="step-label">Review & Submit</div>
            </div>
          </div>
        </div>
      </div>

      <div className="users-page-headerhedis-screening-content">
        <div className="screening-form-content">
          {/* Enhanced Header with Status Indicators */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Completed Screening - {screening.patientName}</h2>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Completed on {formatDate(screening.dateCompleted)} by {screening.technician}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 md:px-3 md:py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs md:text-sm font-medium rounded-full">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Patient Information</h3>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  Complete
                </span>
              </div>
            </div>
            
            {/* Patient Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">ID:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.patient.patientId}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">Name:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.patient.firstName} {screening.patient.lastName}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">DOB:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{formatDate(screening.patient.dateOfBirth)}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">PCP:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.patient.pcpName}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">Location:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.patient.pcpLocation}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">Last Visit:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{formatDate(screening.patient.lastVisit)}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[60px] md:min-w-[80px]">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  screening.patient.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  {screening.patient.status}
                </span>
              </div>
            </div>
          </div>

          {/* Screening Details Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Screening Details</h3>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  Complete
                </span>
              </div>
            </div>
            
            {/* Screening Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Date:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{formatDate(screening.screeningDetails.dateOfScreening)}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Place:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.placeOfService}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Practice:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.practiceName}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Location:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.practiceLocation}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Phone:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.practicePhone}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Email:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.practiceEmail}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Contact:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.officeContact}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Diabetes:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  screening.screeningDetails.diabetesMellitus === 'yes' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                    : screening.screeningDetails.diabetesMellitus === 'no'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {screening.screeningDetails.diabetesMellitus || 'Not specified'}
                </span>
              </div>
              {screening.screeningDetails.diabetesMellitus === 'yes' && (
                <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Type:</span>
                  <span className="text-xs md:text-sm text-gray-900 dark:text-white">{screening.screeningDetails.diabetesType}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Last Eye Exam:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">{formatDate(screening.screeningDetails.lastEyeExam)}</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Ocular History:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">
                  {screening.screeningDetails.ocularHistory.length > 0 ? screening.screeningDetails.ocularHistory.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[80px] md:min-w-[120px]">Ocular Surgery:</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white">
                  {screening.screeningDetails.ocularSurgery.length > 0 ? screening.screeningDetails.ocularSurgery.join(', ') : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Retinal Images Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Retinal Images</h3>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  Complete
                </span>
              </div>
            </div>
            
            {/* Retinal Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Right Eye Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white">Right Eye (OD)</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    screening.retinalImages.rightEyeMissing 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  }`}>
                    {screening.retinalImages.rightEyeMissing ? 'Missing' : `${screening.retinalImages.rightEyeImages.length} Images`}
                  </span>
                </div>
                
                {!screening.retinalImages.rightEyeMissing && screening.retinalImages.rightEyeImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {Array.isArray(screening.retinalImages.rightEyeImages) && screening.retinalImages.rightEyeImages.map((image, index) => {
                  
                      return (
                        <div key={index} className="relative group cursor-pointer">
                          <img
                            src={createSafeObjectURL(image)}
                            alt={`Right eye image ${index + 1}`}
                            className="w-full h-16 md:h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                            onClick={(e) => { // Modified onClick
                              e.preventDefault()
                              e.stopPropagation()
      
                              handleImagePreview('right', index)
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center pointer-events-none"> {/* Added pointer-events-none */}
                            <svg className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {!screening.retinalImages.rightEyeMissing && screening.retinalImages.rightEyeImages.length === 0 && (
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 italic">
                    No images uploaded
                  </div>
                )}
              </div>

              {/* Left Eye Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white">Left Eye (OS)</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    screening.retinalImages.leftEyeMissing 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  }`}>
                    {screening.retinalImages.leftEyeMissing ? 'Missing' : `${screening.retinalImages.leftEyeImages.length} Images`}
                  </span>
                </div>
                
                {!screening.retinalImages.leftEyeMissing && screening.retinalImages.leftEyeImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {Array.isArray(screening.retinalImages.leftEyeImages) && screening.retinalImages.leftEyeImages.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={createSafeObjectURL(image)}
                          alt={`Left eye image ${index + 1}`}
                          className="w-full h-16 md:h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                          onClick={(e) => { // Modified onClick
                            e.preventDefault()
                            e.stopPropagation()
    
                            handleImagePreview('left', index)
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center pointer-events-none"> {/* Added pointer-events-none */}
                          <svg className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!screening.retinalImages.leftEyeMissing && screening.retinalImages.leftEyeImages.length === 0 && (
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 italic">
                    No images uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Technician Comments */}
            {screening.retinalImages.technicianComments && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technician Comments</h4>
                <p className="text-xs md:text-sm text-gray-900 dark:text-white">
                  {screening.retinalImages.technicianComments}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && allImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-none md:max-w-4xl w-full mx-2 md:mx-0 max-h-[95vh] md:max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                    Retinal Image Preview
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {allImages[currentImageIndex]?.eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - Image {allImages[currentImageIndex]?.index + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseImagePreview}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center p-3 md:p-4 relative">
              {allImages[currentImageIndex] && (
                <div className="relative max-w-full max-h-full">
                  <img
                    src={createSafeObjectURL(allImages[currentImageIndex].file)}
                    alt={`${allImages[currentImageIndex].eye === 'right' ? 'Right' : 'Left'} eye image ${allImages[currentImageIndex].index + 1}`}
                    className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 md:p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === allImages.length - 1}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1.5 md:p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center p-3 md:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    {currentImageIndex + 1} of {allImages.length}
                  </span>
                  <div className="flex space-x-1">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? 'bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HEDISLandingPage({ 
  onUpdateBreadcrumb,
  resetToLanding = 0
}: { 
  onUpdateBreadcrumb?: (path: string[]) => void
  resetToLanding?: number
}) {
  const { user } = useAuth()
  
  // State for current view and breadcrumb
  const [currentView, setCurrentView] = useState<'dashboard' | 'screening'>('dashboard')
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([])
  
  // Modern dashboard state
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30D')

  // Chart Components
  const LineChart = ({ data, title, color = "blue" }: { data: number[], title: string, color?: string }) => (
    <div className="hedis-chart-container">
      <h4 className="hedis-chart-title text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</h4>
      <div className="hedis-chart-content h-32 flex items-end space-x-1">
        {data.map((value, index) => (
          <div key={index} className="hedis-chart-bar flex-1 bg-gray-200 dark:bg-gray-700 rounded-t">
            <div 
              className={`hedis-chart-fill bg-${color}-500 rounded-t transition-all duration-500 ease-out`}
              style={{ height: `${value}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )

  const BarChart = ({ data, title, color = "green" }: { data: number[], title: string, color?: string }) => (
    <div className="hedis-chart-container">
      <h4 className="hedis-chart-title text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</h4>
      <div className="hedis-chart-content h-32 flex items-end space-x-1">
        {data.map((value, index) => (
          <div key={index} className="hedis-chart-bar flex-1 bg-gray-200 dark:bg-gray-700 rounded">
            <div 
              className={`hedis-chart-fill bg-${color}-500 rounded transition-all duration-500 ease-out`}
              style={{ height: `${value}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )

  // Skeleton Loading Component
  const SkeletonCard = ({ className = "", height = "h-32" }: { className?: string, height?: string }) => (
    <div className={`hedis-skeleton-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded ${height}`}></div>
      </div>
    </div>
  )

  // Get chart data based on selected time range
  const getChartData = (range: string) => {
    const baseData = {
      '7D': {
        screenings: [65, 72, 68, 85, 78, 92, 88],
        quality: [78, 82, 85, 88, 90, 87, 92],
        compliance: [85, 88, 87, 92, 89, 94, 91]
      },
      '30D': {
        screenings: [70, 75, 82, 78, 85, 90, 88, 92, 87, 94, 89, 96, 91, 88, 85, 89, 92, 87, 90, 93, 88, 91, 86, 89, 92, 87, 90, 88, 91, 89],
        quality: [82, 85, 87, 89, 91, 88, 92, 89, 94, 90, 87, 91, 88, 85, 89, 92, 87, 90, 88, 91, 89, 86, 88, 90, 87, 91, 89, 92, 88, 90],
        compliance: [88, 90, 92, 89, 91, 87, 90, 92, 88, 91, 89, 87, 90, 92, 88, 91, 89, 87, 90, 92, 88, 91, 89, 87, 90, 92, 88, 91, 89, 87]
      },
      '90D': {
        screenings: Array.from({length: 90}, (_, i) => 70 + Math.random() * 25),
        quality: Array.from({length: 90}, (_, i) => 80 + Math.random() * 15),
        compliance: Array.from({length: 90}, (_, i) => 85 + Math.random() * 10)
      }
    }
    return baseData[range as keyof typeof baseData] || baseData['30D']
  }

  // Function to update breadcrumbs based on current step
  const updateBreadcrumbs = (step: number, patientName?: string) => {
    if (!onUpdateBreadcrumb) return
    
    const basePath = ['Dashboard', 'H.E.D.I.S.']
    
    if (step === 0) {
      // Dashboard
      onUpdateBreadcrumb(basePath)
    } else if (step === 1) {
      // Patient Search
      onUpdateBreadcrumb([...basePath, 'Patient Search'])
    } else if (step === 2) {
      // Screening Details
      const patientDisplay = patientName ? ` - ${patientName}` : ''
      onUpdateBreadcrumb([...basePath, 'Patient Search', `Screening Details${patientDisplay}`])
    } else if (step === 3) {
      // Retinal Images
      const patientDisplay = patientName ? ` - ${patientName}` : ''
      onUpdateBreadcrumb([...basePath, 'Patient Search', `Screening Details${patientDisplay}`, 'Retinal Images'])
    } else if (step === 4) {
      // Review & Submit
      const patientDisplay = patientName ? ` - ${patientName}` : ''
      onUpdateBreadcrumb([...basePath, 'Patient Search', `Screening Details${patientDisplay}`, 'Retinal Images', 'Review & Submit'])
    }
  }

  // State for screening form
  const [currentScreeningStep, setCurrentScreeningStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  
  // Reset to dashboard when resetToLanding prop changes
  useEffect(() => {
    if (resetToLanding > 0) {
      setCurrentView('dashboard')
      setCurrentScreeningStep(0)
      setShowSuccess(false)
      setShowSuccessAlert(false)
      setSelectedPatient(null)
      setCurrentFormId(undefined)
      setFormMode('new')
      if (onUpdateBreadcrumb) {
        onUpdateBreadcrumb(['Dashboard', 'H.E.D.I.S.'])
      }
    }
  }, [resetToLanding, onUpdateBreadcrumb])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setDashboardLoading(false)
    }
    loadDashboardData()
  }, [])

  // Refresh metrics function
  const refreshMetrics = async () => {
    setMetricsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setMetricsLoading(false)
  }

  // Get current chart data
  const chartData = getChartData(selectedTimeRange)

  // Handle M.I.L.A. navigation (placeholder)
  const handleMILANavigation = (destination: string) => {
    console.log('M.I.L.A. navigation to:', destination)
  }

  const [screeningFormData, setScreeningFormData] = useState<{
    details: ScreeningDetails
    images: RetinalImages
  }>({
    details: {
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
      lastEyeExam: '',
      ocularHistory: [],
      ocularSurgery: [],
      ocularHistoryOther: '',
      ocularSurgeryOther: ''
    },
    images: {
      rightEyeMissing: false,
      leftEyeMissing: false,
      rightEyeImages: [],
      leftEyeImages: [],
      technicianComments: ''
    }
  })

  // State for form management
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new')
  const [currentFormId, setCurrentFormId] = useState<string | undefined>(undefined)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
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
    lastEyeExam: '',
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // State for saved and completed forms
  const [savedForms, setSavedForms] = useState<any[]>([])
  const [completedForms, setCompletedForms] = useState<any[]>([])

  // State for modals and views
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false)
  const [showCompletedScreeningListModal, setShowCompletedScreeningListModal] = useState(false)
  const [showSavedScreeningListModal, setShowSavedScreeningListModal] = useState(false)

  const [viewingCompletedScreening, setViewingCompletedScreening] = useState<CompletedScreening | null>(null)

  // Update breadcrumbs when step changes
  useEffect(() => {
    const patientName = selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined
    updateBreadcrumbs(currentScreeningStep, patientName)
  }, [currentScreeningStep, selectedPatient])

  // Initialize data service
  useEffect(() => {
    const initializeData = async () => {
      await ScreeningDataService.initialize()
      // Update dashboard stats after initialization
      setDashboardStats(ScreeningDataService.getDashboardStats())
      // Debug current data after initialization
      setTimeout(() => {
        ScreeningDataService.debugCurrentData()
      }, 1000)
    }
    initializeData()
  }, [])

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(() => {
    return ScreeningDataService.getDashboardStats()
  })

  // Dashboard cards data
  const dashboardCards = [
    {
      id: 'completed',
      icon: 'check-circle',
      number: dashboardStats.completedPatientForms,
      label: 'Completed Patient Forms',
      description: 'Successfully completed and submitted forms',
      badge: 'View Only',
      badgeColor: 'green'
    },
    {
      id: 'saved',
      icon: 'save',
      number: dashboardStats.savedPatientForms,
      label: 'Saved Patient Forms',
      description: 'Forms saved for later completion',
      badge: 'Continue Editing',
      badgeColor: 'yellow'
    }
  ]

  // Dashboard state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userRole, setUserRole] = useState('Field Technician')
  const [showSaveAlert, setShowSaveAlert] = useState(false)

    // Get saved screenings from data service
  const savedScreenings = ScreeningDataService.getSavedScreenings()

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // URL-based step management for screening sub-page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const step = urlParams.get('step')
    const mode = urlParams.get('mode')
    const formId = urlParams.get('formId')

    // Check localStorage first for persistent state
    const storedState = localStorage.getItem('hedisScreeningState')
    if (storedState) {
      const parsedState = JSON.parse(storedState)
      setCurrentScreeningStep(parsedState.step || 0)
      setFormMode(parsedState.mode || 'new')
      setCurrentFormId(parsedState.formId || undefined)
      setSelectedPatient(parsedState.selectedPatient || null)
      
      // Only restore screening details if we're not actively editing
      if (!parsedState.screeningDetails || Object.keys(parsedState.screeningDetails).length === 0) {
        setScreeningDetails({
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
          lastEyeExam: '',
          ocularHistory: [],
          ocularSurgery: [],
          ocularHistoryOther: '',
          ocularSurgeryOther: ''
        })
      } else {
        setScreeningDetails(parsedState.screeningDetails)
      }
      
      setRetinalImages(parsedState.retinalImages || {
        rightEyeMissing: false,
        leftEyeMissing: false,
        rightEyeImages: [],
        leftEyeImages: [],
        technicianComments: ''
      })
      setErrors(parsedState.errors || {})
    } else if (step && step !== '0') {
      // Only use URL params if step is not 0 (dashboard) and no localStorage
      setCurrentScreeningStep(parseInt(step))
      if (mode) setFormMode(mode as 'new' | 'edit' | 'view')
      if (formId) setCurrentFormId(formId)
    } else {
      // Default to dashboard if no valid state
      setCurrentScreeningStep(0)
      setFormMode('new')
      setCurrentFormId(undefined)
      setSelectedPatient(null)
      setScreeningDetails({
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
        lastEyeExam: '',
        ocularHistory: [],
        ocularSurgery: [],
        ocularHistoryOther: '',
        ocularSurgeryOther: ''
      })
      setRetinalImages({
        rightEyeMissing: false,
        leftEyeMissing: false,
        rightEyeImages: [],
        leftEyeImages: [],
        technicianComments: ''
      })
      setErrors({})
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      step: currentScreeningStep,
      mode: formMode,
      formId: currentFormId,
      selectedPatient: selectedPatient,
      screeningDetails: screeningDetails,
      retinalImages: retinalImages,
      errors: errors
    }
    localStorage.setItem('hedisScreeningState', JSON.stringify(stateToSave))
  }, [currentScreeningStep, formMode, currentFormId, selectedPatient, screeningDetails, retinalImages, errors])

  const updateScreeningStep = (step: number, mode?: 'new' | 'edit' | 'view' | 'dashboard', formId?: string) => {
    setCurrentScreeningStep(step)
    if (mode) setFormMode(mode as 'new' | 'edit' | 'view')
    if (formId) setCurrentFormId(formId)

    // Clear localStorage if going back to dashboard
    if (step === 0) {
      localStorage.removeItem('hedisScreeningState')
    }

    // Update URL
    const urlParams = new URLSearchParams()
    urlParams.set('step', step.toString())
    if (mode && mode !== 'dashboard') urlParams.set('mode', mode)
    if (formId) urlParams.set('formId', formId)

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    window.history.pushState({}, '', newUrl)

    // Mobile scroll to top when navigating to a new step
    if (step > 0) {
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        })
      }, 100) // Small delay to ensure DOM updates
    }
  }



  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const hedisTasks = [
    {
      id: 'screening',
      title: 'New Patient Screening',
      description: 'Create new diabetic retinal screening forms',
      icon: 'eye',
      action: 'Start New Screening'
    },
    {
      id: 'reports',
      title: 'HEDIS Reports',
      description: 'Generate and view HEDIS compliance reports',
      icon: 'chart-bar',
      action: 'View Reports'
    }
  ]

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: ReactElement } = {
      'check-circle': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'save': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      'eye': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'chart-bar': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
    return icons[iconName] || icons['chart-bar']
  }

  const handleTaskClick = (taskId: string) => {
    if (taskId === 'screening') {
      updateScreeningStep(1, 'new') // Start new form with patient search
    } else if (taskId === 'reports') {
      // Navigate to reports tab
      if (typeof window !== 'undefined') {
        // Dispatch a custom event to notify Dashboard to switch to reports tab
        window.dispatchEvent(new CustomEvent('navigateToReports'))
      }
    }
  }

  const handleFormCardClick = (cardId: string) => {
    if (cardId === 'completed') {
      setShowCompletedScreeningListModal(true)
    } else if (cardId === 'saved') {
      setShowSavedScreeningListModal(true)
    }
  }

  const handleCompletedFormSelect = (formId: string) => {
    console.log('Selected completed form:', formId)
    const completedScreening = ScreeningDataService.getCompletedScreeningById(formId)
    console.log('Found completed screening:', completedScreening)
    if (completedScreening) {
      console.log('Setting viewingCompletedScreening to:', completedScreening)
      setViewingCompletedScreening(completedScreening)
      setShowCompletedScreeningListModal(false)
      
      // Scroll to top for mobile users to ensure they see the top of the completed form
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100) // Small delay to ensure the form has rendered
    } else {
      console.error('Completed screening not found:', formId)
      // Let's also check what completed screenings are available
      const allScreenings = ScreeningDataService.getCompletedScreenings()
      console.log('All completed screenings:', allScreenings)
    }
  }

  const handleSavedFormSelect = (formId: string) => {
    // Load the saved form data and get the correct step
    const stepToNavigate = loadSavedFormData(formId)
    console.log(`Loading saved form ${formId}, navigating to step ${stepToNavigate}`)
    setShowSavedScreeningListModal(false)
    updateScreeningStep(stepToNavigate, 'edit', formId)
    
    // Scroll to top for mobile users to ensure they see the top of the form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100) // Small delay to ensure the form has rendered
  }

  const loadSavedFormData = (formId: string) => {
    // Find the saved form data from the mock data
    const savedForm = savedScreenings.find(form => form.id === formId)
    
    if (savedForm) {
      // Create a mock patient object from the saved form data
      const patient: Patient = {
        id: savedForm.id,
        patientId: savedForm.patientId,
        firstName: savedForm.patientName.split(' ')[0],
        lastName: savedForm.patientName.split(' ')[1] || '',
        dateOfBirth: '1985-03-15', // Mock date of birth
        pcpName: 'Dr. Sarah Wilson',
        pcpLocation: 'Miami Medical Center',
        lastVisit: '2025-01-15',
        status: 'active' as const
      }
      
      // Set the selected patient
      setSelectedPatient(patient)
      
      // Load mock screening details (this would normally come from the saved form)
      const mockScreeningDetails: ScreeningDetails = {
        dateOfScreening: '2025-07-28',
        placeOfService: '11 - Doctor\'s Office',
        pcpLocation: 'Miami Medical Center',
        practicePhone: '305-555-5555',
        practiceFax: '305-555-5556',
        practiceEmail: 'Contact@gableseyecare.com',
        practiceName: 'Coral Gables Eye Care',
        practiceLocation: '2525 Ponce De Leon Blv',
        officeContact: 'Tom Brady',
        diabetesMellitus: 'yes',
        diabetesType: 'type2',
        lastEyeExam: '2024-12-15',
        ocularHistory: ['Glaucoma'],
        ocularSurgery: ['Cataract Surgery'],
        ocularHistoryOther: '',
        ocularSurgeryOther: ''
      }
      
      // Set the screening details
      setScreeningDetails(mockScreeningDetails)
      
      // Load mock retinal images data
      const mockRetinalImages: RetinalImages = {
        rightEyeMissing: false,
        leftEyeMissing: false,
        rightEyeImages: [],
        leftEyeImages: [],
        technicianComments: 'Patient cooperative during screening process.'
      }
      
      // Set the retinal images
      setRetinalImages(mockRetinalImages)
      
      // Clear any existing errors
      setErrors({})
      
      // Determine the step based on progress
      const progressMatch = savedForm.progress.match(/Step (\d+) of \d+/)
      let progressStep = progressMatch ? parseInt(progressMatch[1]) : 2
      
      // Ensure we never return step 1 for saved forms
      if (progressStep === 1) {
        progressStep = 2
      }
      
      return progressStep
    }
    return 2 // Default to step 2 if form not found
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    updateScreeningStep(2, formMode, currentFormId || undefined) // Move to screening details with current mode
  }

  const handleScreeningFormClose = () => {
    updateScreeningStep(0) // Back to dashboard
  }

  const handleScreeningFormSave = () => {
    setDashboardStats(prev => ({
      ...prev,
      savedPatientForms: prev.savedPatientForms + 1
    }))
    setShowSaveAlert(true)
    setTimeout(() => setShowSaveAlert(false), 10000)
  }

  const handleScreeningFormComplete = () => {
    // Handle form completion
    console.log('Screening form completed')
    
    // Create completed screening data
    if (selectedPatient) {
      const completedScreening: CompletedScreening = {
        id: `completed-${Date.now()}`,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientId: selectedPatient.patientId,
        dateCompleted: new Date().toISOString(),
        technician: user?.fullName || 'User', // This comes from user context
        status: 'Processed',
        patient: selectedPatient,
        screeningDetails,
        retinalImages
      }
      
      // Save to data service
      ScreeningDataService.saveCompletedScreening(completedScreening)
      
      // Update local state
      setDashboardStats(ScreeningDataService.getDashboardStats())
    }
    
    setShowSuccessAlert(true)
    
    // Redirect back to dashboard
    updateScreeningStep(0, 'dashboard')
  }

  const handleBackToDashboard = () => {
    setShowSuccess(false)
    updateScreeningStep(0, 'dashboard')
  }

  const handleStartNewScreening = () => {
    setShowSuccess(false)
    setSelectedPatient(null)
    setScreeningDetails({
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
      lastEyeExam: '',
      ocularHistory: [],
      ocularSurgery: [],
      ocularHistoryOther: '',
      ocularSurgeryOther: ''
    })
    setRetinalImages({
      rightEyeMissing: false,
      leftEyeMissing: false,
      rightEyeImages: [],
      leftEyeImages: [],
      technicianComments: ''
    })
    setErrors({})
    updateScreeningStep(1, 'new')
  }

  // Render completed screening view if viewing a completed screening
  if (viewingCompletedScreening) {
    console.log('Rendering CompletedScreeningView with:', viewingCompletedScreening)
    return (
      <CompletedScreeningView
        screening={viewingCompletedScreening}
        onClose={() => setViewingCompletedScreening(null)}
      />
    )
  }

  // Render success screen if showing success
  if (showSuccess && selectedPatient) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
        </div>
        <div className="hedis-screening-content">
          <ScreeningSuccess
            patient={selectedPatient}
            onBackToDashboard={handleBackToDashboard}
            onStartNewScreening={handleStartNewScreening}
          />
        </div>
      </div>
    )
  }

  // Render screening sub-page if we're in screening flow
  if (currentScreeningStep > 0) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
          <div className="hedis-screening-progress">
            <div className="step-indicators-container">
              <div className={`step-item ${currentScreeningStep > 1 ? 'step-completed' : currentScreeningStep === 1 ? 'step-active' : 'step-inactive'}`}>
                <div className="step-number">1</div>
                <div className="step-label">Patient Search</div>
              </div>
              <div className={`step-item ${currentScreeningStep > 2 ? 'step-completed' : currentScreeningStep === 2 ? 'step-active' : 'step-inactive'}`}>
                <div className="step-number">2</div>
                <div className="step-label">Screening Details</div>
              </div>
              <div className={`step-item ${currentScreeningStep > 3 ? 'step-completed' : currentScreeningStep === 3 ? 'step-active' : 'step-inactive'}`}>
                <div className="step-number">3</div>
                <div className="step-label">Retinal Images</div>
              </div>
              <div className={`step-item ${currentScreeningStep > 4 ? 'step-completed' : currentScreeningStep === 4 ? 'step-active' : 'step-inactive'}`}>
                <div className="step-number">4</div>
                <div className="step-label">Review & Submit</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hedis-screening-content">
          {currentScreeningStep === 1 && (
            <div className="hedis-screening-step-content">
              <h2 className="hedis-screening-step-title">
                {formMode === 'new' ? 'Patient Search' : 
                 formMode === 'edit' ? 'Continue Screening' : 'View Screening'}
              </h2>
              <p className="hedis-screening-step-description">
                {formMode === 'new' ? 'Search for a patient to begin the diabetic retinal screening process.' :
                 formMode === 'edit' ? 'Continue working on your saved screening form.' :
                 'View the completed screening form details.'}
              </p>
              {formMode === 'new' && (
                <PatientSearchStep 
                  onPatientSelect={handlePatientSelect}
                  onNextStep={() => updateScreeningStep(2, formMode, currentFormId || undefined)}
                />
              )}
              {formMode === 'edit' && (
                <div className="hedis-continue-form">
                  <p>Loading saved form data...</p>
                  {/* Continue form component will go here */}
                </div>
              )}
              {formMode === 'view' && (
                <div className="hedis-view-form">
                  <p>Loading completed form data...</p>
                  {/* View form component will go here */}
                </div>
              )}
            </div>
          )}

          {currentScreeningStep === 2 && (
            <div className="hedis-screening-step-content">
              <h2 className="hedis-screening-step-title">
                {formMode === 'new' ? 'Screening Details' :
                 formMode === 'edit' ? 'Continue Screening Details' : 'Screening Details'}
              </h2>
              <p className="hedis-screening-step-description">
                {formMode === 'new' ? 'Enter patient screening information and medical history.' :
                 formMode === 'edit' ? 'Continue editing patient screening information.' :
                 'View patient screening information and medical history.'}
              </p>
              {selectedPatient && (
                <ScreeningDetailsForm
                  patient={selectedPatient}
                  screeningDetails={screeningDetails}
                  setScreeningDetails={setScreeningDetails}
                  errors={errors}
                  setErrors={setErrors}
                  onNextStep={() => updateScreeningStep(3, formMode, currentFormId || undefined)}
                  onPreviousStep={() => updateScreeningStep(1, formMode, currentFormId || undefined)}
                  updateScreeningStep={updateScreeningStep}
                  currentFormId={currentFormId}
                  selectedPatient={selectedPatient}
                  currentScreeningStep={currentScreeningStep}
                  savedForms={savedForms}
                  setSavedForms={setSavedForms}
                  setDashboardStats={setDashboardStats}
                  setSelectedPatient={setSelectedPatient}
                  setCurrentFormId={setCurrentFormId}
                />
              )}
            </div>
          )}

          {currentScreeningStep === 3 && (
            <div className="hedis-screening-step-content">
              <h2 className="hedis-screening-step-title">
                {formMode === 'new' ? 'Retinal Images' :
                 formMode === 'edit' ? 'Continue Retinal Images' : 'Retinal Images'}
              </h2>
              <p className="hedis-screening-step-description">
                {formMode === 'new' ? 'Upload retinal images for both eyes and add technician comments.' :
                 formMode === 'edit' ? 'Continue uploading retinal images.' :
                 'View uploaded retinal images and technician comments.'}
              </p>
              {selectedPatient && (
                <RetinalImagesForm
                  retinalImages={retinalImages}
                  setRetinalImages={setRetinalImages}
                  errors={errors}
                  setErrors={setErrors}
                  onNextStep={() => updateScreeningStep(4, formMode, currentFormId || undefined)}
                  onPreviousStep={() => updateScreeningStep(2, formMode, currentFormId || undefined)}
                  currentFormId={currentFormId}
                  selectedPatient={selectedPatient}
                  screeningDetails={screeningDetails}
                  savedForms={savedForms}
                  setSavedForms={setSavedForms}
                  setDashboardStats={setDashboardStats}
                  updateScreeningStep={updateScreeningStep}
                  currentScreeningStep={currentScreeningStep}
                />
              )}
            </div>
          )}

          {currentScreeningStep === 4 && (
            <div className="hedis-screening-step-content">
              <h2 className="hedis-screening-step-title">
                {formMode === 'new' ? 'Review & Submit' :
                 formMode === 'edit' ? 'Review & Submit' : 'Completed Screening'}
              </h2>
              <p className="hedis-screening-step-description">
                {formMode === 'new' ? 'Review all information and submit the screening form.' :
                 formMode === 'edit' ? 'Review changes and submit the screening form.' :
                 'View the completed screening form summary.'}
              </p>
              {formMode === 'view' && (
                <div className="hedis-view-completed">
                  <button 
                    onClick={() => updateScreeningStep(0)}
                    className="hedis-close-button"
                  >
                    Close
                  </button>
                </div>
              )}
              {selectedPatient && formMode !== 'view' && (
                <ReviewAndSubmitForm
                  patient={selectedPatient}
                  screeningDetails={screeningDetails}
                  retinalImages={retinalImages}
                  onEditStep={(step) => updateScreeningStep(step, formMode, currentFormId || undefined)}
                  onComplete={handleScreeningFormComplete}
                  onSave={handleScreeningFormSave}
                />
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modern HEDIS Analytics Dashboard
  return (
    <div className="hedis-analytics-dashboard">
      {/* Modern Header Section - Hidden on Mobile */}
      <div className="hedis-modern-header hidden md:block bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-blue-200 dark:border-blue-700">
        <div className="hedis-header-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hedis-header-content flex items-center justify-between py-6 h-20">
            <div className="hedis-header-left">
              <h1 className="hedis-main-title text-2xl font-bold text-gray-900 dark:text-white mb-1">
                HEDIS Quality Dashboard
              </h1>
              <div className="hedis-header-subtitle flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.fullName || 'User'}
                </span>
                <span className="hedis-user-role-badge px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                  {userRole}
                </span>
                <div className="hedis-live-indicator flex items-center text-xs text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live Data
                </div>
              </div>
            </div>
            <div className="hedis-header-right flex items-center space-x-4">
              <div className="hedis-date-display">
                <div className="hedis-date-card bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Icon name="calendar" size={18} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="hedis-date-label text-xs text-gray-500 dark:text-gray-400">Today</div>
                      <div className="hedis-date-value text-sm font-medium text-gray-900 dark:text-white">{formatDate(currentTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="hedis-refresh-btn p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/20 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors">
                <Icon name="refresh-cw" size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Only Header - Simple and Clean */}
      <div className="hedis-mobile-header md:hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200 dark:border-blue-700 px-4 py-3">
        <div className="text-center">
          <h1 className="hedis-mobile-title text-lg font-bold text-gray-900 dark:text-white">
            HEDIS Quality Dashboard
          </h1>
          <div className="hedis-mobile-subtitle flex items-center justify-center space-x-2 mt-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Welcome back, {user?.fullName || 'User'}
            </span>
            <div className="hedis-mobile-live-indicator flex items-center text-xs text-green-600 dark:text-green-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dashboard Content */}
      <div className="hedis-dashboard-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Integrated Alerts */}
        {showSaveAlert && (
          <div className="hedis-integrated-alert show">
            <div className="hedis-integrated-alert-content">
              <div className="hedis-integrated-alert-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div className="hedis-integrated-alert-message">
                <h4 className="hedis-integrated-alert-title">Form Saved Successfully!</h4>
                <p className="hedis-integrated-alert-description">
                  Your patient screening form has been saved for later completion. 
                  You have 30 days to complete the form. It will be automatically deleted after 30 days.
                </p>
              </div>
              <button 
                className="hedis-integrated-alert-close"
                onClick={() => setShowSaveAlert(false)}
                aria-label="Close alert"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {showSuccessAlert && (
          <div className="hedis-integrated-alert hedis-integrated-alert-success show">
            <div className="hedis-integrated-alert-content">
              <div className="hedis-integrated-alert-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="hedis-integrated-alert-message">
                <h4 className="hedis-integrated-alert-title">Screening Completed Successfully!</h4>
                <p className="hedis-integrated-alert-description">
                  Your patient screening has been submitted and is now being processed. 
                  The screening data is available in the completed screenings section.
                </p>
              </div>
              <button 
                className="hedis-integrated-alert-close"
                onClick={() => setShowSuccessAlert(false)}
                aria-label="Close alert"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Primary Actions - Prioritized Above KPIs */}
        <div className="hedis-primary-actions-section mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Patient Screening - Enhanced */}
            <div className="hedis-primary-action-card group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <Icon name="user-plus" size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="hedis-action-title text-lg font-semibold text-gray-900 dark:text-white">New Screening</h3>
                    <p className="hedis-action-subtitle text-sm text-gray-500 dark:text-gray-400">Start patient assessment</p>
                  </div>
                </div>
                <div className="hedis-action-badge text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  Primary
                </div>
              </div>
              <p className="hedis-action-description text-sm text-gray-600 dark:text-gray-400 mb-4">
                Begin a comprehensive HEDIS quality measure screening for a new patient.
              </p>
              <button 
                className="hedis-primary-btn w-full group/button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                onClick={() => handleTaskClick('screening')}
              >
                <span>Start New Screening</span>
                <Icon name="arrow-right" size={16} className="ml-2 group-hover/button:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* HEDIS Reports */}
            <div className="hedis-reports-card group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Icon name="bar-chart-3" size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="hedis-action-title text-lg font-semibold text-gray-900 dark:text-white">HEDIS Reports</h3>
                    <p className="hedis-action-subtitle text-sm text-gray-500 dark:text-gray-400">Quality analytics</p>
                  </div>
                </div>
                <div className="hedis-completion-counter text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {dashboardStats.completedPatientForms} reports
                </div>
              </div>
              <p className="hedis-action-description text-sm text-gray-600 dark:text-gray-400 mb-4">
                Access comprehensive HEDIS quality measure reports and compliance analytics.
              </p>
              <button 
                className="hedis-secondary-btn w-full group/button bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                onClick={() => handleTaskClick('reports')}
              >
                <span>View Reports</span>
                <Icon name="arrow-right" size={16} className="ml-2 group-hover/button:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Access Dashboard */}
            <div className="hedis-quick-access-card group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <Icon name="zap" size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="hedis-action-title text-lg font-semibold text-gray-900 dark:text-white">Quick Access</h3>
                    <p className="hedis-action-subtitle text-sm text-gray-500 dark:text-gray-400">Continue work</p>
                  </div>
                </div>
                <div className="hedis-saved-counter text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                  {dashboardStats.savedPatientForms} saved
                </div>
              </div>
              <p className="hedis-action-description text-sm text-gray-600 dark:text-gray-400 mb-4">
                Continue working on saved screenings or access frequently used forms.
              </p>
              <div className="hedis-quick-access-buttons space-y-2">
                {dashboardCards.slice(0, 2).map((card) => (
                  <button 
                    key={card.id}
                    className="hedis-quick-access-btn w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center justify-between"
                    onClick={() => handleFormCardClick(card.id)}
                  >
                    <span>{card.label} ({card.number})</span>
                    <Icon name="chevron-right" size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modern KPI Overview Section */}
        <div className="hedis-kpi-section mb-6 md:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {dashboardLoading ? (
              <>
                <SkeletonCard height="h-24" />
                <SkeletonCard height="h-24" />
                <SkeletonCard height="h-24" />
                <SkeletonCard height="h-24" />
              </>
            ) : (
              <>
                {/* Total Screenings Card */}
                <div className="hedis-kpi-card group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 md:p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                      <Icon name="activity" size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded-full">
                      +15% this month
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats.completedPatientForms}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Screenings</p>
                    <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 mr-2">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '78%'}}></div>
                      </div>
                      <span>78% of target</span>
                    </div>
                  </div>
                </div>

                {/* Quality Compliance Card */}
                <div className="hedis-kpi-card group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 md:p-6 border border-green-200 dark:border-green-800 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-700 transition-colors">
                      <Icon name="shield-check" size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-green-100 dark:bg-green-800 rounded-full">
                      Excellent
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">92%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quality Compliance</p>
                    <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
                      <Icon name="trending-up" size={12} className="mr-1" />
                      <span>Above industry standard</span>
                    </div>
                  </div>
                </div>

                {/* Average Screening Time Card */}
                <div className="hedis-kpi-card group bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 md:p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-700 transition-colors">
                      <Icon name="clock" size={24} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded-full">
                      -2 min
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">12.5</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Screening Time (min)</p>
                    <div className="mt-3 flex items-center text-xs text-purple-600 dark:text-purple-400">
                      <Icon name="trending-down" size={12} className="mr-1" />
                      <span>Improved efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Pending Reviews Card */}
                <div className="hedis-kpi-card group bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 md:p-6 border border-amber-200 dark:border-amber-800 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-700 transition-colors">
                      <Icon name="eye" size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded-full">
                      {dashboardStats.savedPatientForms > 5 ? 'High' : 'Normal'}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dashboardStats.savedPatientForms}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
                    <div className="mt-3 flex items-center text-xs text-amber-600 dark:text-amber-400">
                      <Icon name="clock" size={12} className="mr-1" />
                      <span>Avg. 1.2 days to review</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Performance Analytics Section */}
        <div className="hedis-analytics-section mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {dashboardLoading ? (
              <>
                <SkeletonCard className="lg:col-span-2" height="h-64" />
                <SkeletonCard height="h-64" />
              </>
            ) : (
              <>
                {/* Screening Trends Chart */}
                <div className="hedis-chart-card lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="hedis-section-title text-lg font-semibold text-gray-900 dark:text-white">Screening Performance Trends</h3>
                    <div className="hedis-time-range-buttons flex space-x-2">
                      {['7D', '30D', '90D'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          className={`hedis-time-range-btn px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            selectedTimeRange === range
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hedis-chart-wrapper mb-4">
                    <LineChart data={chartData.screenings} title={`Screening Volume (${selectedTimeRange})`} color="blue" />
                  </div>
                  <div className="hedis-chart-metrics grid grid-cols-3 gap-4 text-center">
                    <div className="hedis-metric">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
                    </div>
                    <div className="hedis-metric">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">92%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quality Score</p>
                    </div>
                    <div className="hedis-metric">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">12.5</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Time (min)</p>
                    </div>
                  </div>
                </div>

                {/* M.I.L.A. AI Assistant Card - Enhanced */}
                <div className="hedis-mila-assistant-card bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white/20 rounded-lg mr-3">
                      <Icon name="bot" size={24} className="text-white" />
                    </div>
                    <h3 className="hedis-assistant-title text-lg font-semibold">M.I.L.A. AI Assistant</h3>
                  </div>
                  <p className="hedis-assistant-description text-sm text-blue-100 mb-6">
                    Your Medical Intelligence & Learning Assistant for HEDIS quality measures and patient screening guidance.
                  </p>
                  <div className="hedis-assistant-features space-y-3 mb-6">
                    <div className="flex items-center text-xs text-blue-100">
                      <Icon name="search" size={12} className="mr-2" />
                      <span>Quality measure lookup</span>
                    </div>
                    <div className="flex items-center text-xs text-blue-100">
                      <Icon name="check-circle" size={12} className="mr-2" />
                      <span>Screening validation</span>
                    </div>
                    <div className="flex items-center text-xs text-blue-100">
                      <Icon name="brain" size={12} className="mr-2" />
                      <span>Smart recommendations</span>
                    </div>
                  </div>
                  <HelperButton 
                    currentForm="HEDIS"
                    currentField="dashboard"
                    currentStep={1}
                    onNavigate={handleMILANavigation}
                  />
                </div>
              </>
            )}
          </div>
        </div>

      </div>
      </div>

      {/* Completed Screening List Modal */}
      {showCompletedScreeningListModal && (
        <CompletedScreeningListModal
          isOpen={showCompletedScreeningListModal}
          onClose={() => setShowCompletedScreeningListModal(false)}
          onFormSelect={handleCompletedFormSelect}
        />
      )}

      {/* Saved Screening List Modal */}
      {showSavedScreeningListModal && (
        <SavedScreeningListModal
          isOpen={showSavedScreeningListModal}
          onClose={() => setShowSavedScreeningListModal(false)}
          onFormSelect={handleSavedFormSelect}
          savedScreenings={savedScreenings}
        />
      )}

      {/* M.I.L.A. Assistant Button */}
      <HelperButton
        currentForm="NewScreeningForm"
        currentField="diabetesMellitus"
        currentStep={1}
        onNavigate={(destination) => {
          console.log('HEDIS navigation requested:', destination)
          // Handle HEDIS-specific navigation
          if (destination === 'hedis-screening') {
            // Navigate to new screening
            handleTaskClick('screening')
          } else if (destination === 'hedis-dashboard') {
            // Stay on dashboard
            console.log('Already on HEDIS dashboard')
          }
        }}
      />


    </div>
  )
} 
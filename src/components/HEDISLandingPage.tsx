import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import PatientSearchModal from './PatientSearchModal'
import NewScreeningForm from './NewScreeningForm'
import DatePicker from './DatePicker'

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
  }

  const handleFilterChange = (filterName: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  return (
    <div className="hedis-patient-search-step">
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

  const handleCheckboxChange = (field: 'ocularHistory' | 'ocularSurgery', value: string, checked: boolean) => {
    const currentValues = screeningDetails[field]
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)
    setScreeningDetails({ ...screeningDetails, [field]: newValues })
    
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
    } else {
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
      {/* Patient Screening Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Patient Screening Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Screening */}
          <div data-error={!!errors.dateOfScreening}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Date of Screening *
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
              Place of Service *
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
              PCP Location *
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Patient History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DM (Diabetes Mellitus) */}
          <div data-error={!!errors.diabetesMellitus}>
            <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300 mb-2">
              Diabetes Mellitus *
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
              DM Type {screeningDetails.diabetesMellitus === 'yes' ? '*' : '(Disabled)'}
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
              Ocular HX *
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
                      if (e.target.checked) {
                        handleCheckboxChange('ocularHistory', option.value, true)
                      } else {
                        handleCheckboxChange('ocularHistory', option.value, false)
                      }
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
              Ocular SX *
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
                      if (e.target.checked) {
                        handleCheckboxChange('ocularSurgery', option.value, true)
                      } else {
                        handleCheckboxChange('ocularSurgery', option.value, false)
                      }
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

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
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
          onClick={onNextStep}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Next</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
  setSavedForms: (forms: any) => void
  setDashboardStats: (stats: any) => void
  updateScreeningStep: (step: number, mode?: 'new' | 'edit' | 'view' | 'dashboard', formId?: string) => void
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
  setSavedForms,
  setDashboardStats,
  updateScreeningStep
}: RetinalImagesFormProps) {
  const handleInputChange = (field: keyof RetinalImages, value: any) => {
    setRetinalImages({ ...retinalImages, [field]: value })
    
    // Clear validation error for this field when user makes a selection
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
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
      } else {
        setRetinalImages({
          ...retinalImages,
          leftEyeImages: [...retinalImages.leftEyeImages, ...imageFiles].slice(0, 3)
        })
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Retinal Image Upload
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload retinal images for both eyes. Each eye requires up to 3 images for comprehensive screening.
        </p>
      </div>

      {/* Eyes Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Right Eye */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
              Right Eye (OD)
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {retinalImages.rightEyeImages.length}/3 images
              </span>
              {retinalImages.rightEyeImages.length === 3 && (
                <div className="flex items-center text-green-600">
                  {getIcon('check')}
                </div>
              )}
            </div>
          </div>

          {/* Missing Eye Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={retinalImages.rightEyeMissing}
                onChange={(e) => handleInputChange('rightEyeMissing', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Right eye (OD) images unavailable
              </span>
            </label>
          </div>

          {/* Upload Zone */}
          {!retinalImages.rightEyeMissing && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                retinalImages.rightEyeImages.length === 0
                  ? 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  : 'border-green-300 bg-green-50'
              }`}
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
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    {getIcon('upload')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop images here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF (max 3 images)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-green-700 mb-3">
                    {retinalImages.rightEyeImages.length} image(s) uploaded
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {retinalImages.rightEyeImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Right eye (OD) image ${index + 1}`}
                          className="w-full h-32 object-cover rounded border shadow-sm"
                        />
                        {/* Desktop X button */}
                        <button
                          onClick={() => removeImage('right', index)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-white hidden sm:flex"
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

          {retinalImages.rightEyeMissing && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Right eye (OD) images marked as unavailable. Please document reason in technician comments below.
              </p>
            </div>
          )}
        </div>

        {/* Left Eye */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="w-3 h-3 bg-green-600 rounded-full mr-3"></span>
              Left Eye (OS)
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {retinalImages.leftEyeImages.length}/3 images
              </span>
              {retinalImages.leftEyeImages.length === 3 && (
                <div className="flex items-center text-green-600">
                  {getIcon('check')}
                </div>
              )}
            </div>
          </div>

          {/* Missing Eye Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={retinalImages.leftEyeMissing}
                onChange={(e) => handleInputChange('leftEyeMissing', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Left eye (OS) images unavailable
              </span>
            </label>
          </div>

          {/* Upload Zone */}
          {!retinalImages.leftEyeMissing && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                retinalImages.leftEyeImages.length === 0
                  ? 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  : 'border-green-300 bg-green-50'
              }`}
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
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    {getIcon('upload')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop images here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF (max 3 images)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-green-700 mb-3">
                    {retinalImages.leftEyeImages.length} image(s) uploaded
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {retinalImages.leftEyeImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Left eye (OS) image ${index + 1}`}
                          className="w-full h-32 object-cover rounded border shadow-sm"
                        />
                        {/* Desktop X button */}
                        <button
                          onClick={() => removeImage('left', index)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-white hidden sm:flex"
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

          {retinalImages.leftEyeMissing && (
            <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Left eye (OS) images marked as unavailable. Please document reason in technician comments below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Technician Comments */}
      <div className="space-y-3">
        <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-300">
          Technician Comments
        </label>
        <textarea
          name="technicianComments"
          value={retinalImages.technicianComments}
          onChange={(e) => handleInputChange('technicianComments', e.target.value)}
          placeholder="Add any relevant notes about the image capture process, patient cooperation, or image quality..."
          rows={4}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 ${
            errors.technicianComments ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.technicianComments && (
          <p className="text-sm text-red-600">{errors.technicianComments}</p>
        )}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Upload Summary
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
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

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
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
          onClick={onNextStep}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Next</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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

function ReviewAndSubmitForm({ 
  patient, 
  screeningDetails, 
  retinalImages, 
  onEditStep,
  onComplete,
  onSave
}: ReviewAndSubmitFormProps) {
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
    <div className="screening-form-content">
      {/* Summary Header */}
      <div className="screening-form-section">
        <div className="flex items-center space-x-3 mb-6">
          {getIcon('check')}
          <div>
            <h3 className="screening-form-section-title">Ready to Submit</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please review all information before submitting the screening form.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information Summary */}
      <div className="screening-form-section">
        <h3 className="screening-form-section-title">Patient Information</h3>
        <div className="screening-form-grid">
          <div className="screening-form-field">
            <label className="screening-form-label">Patient Name</label>
            <div className="screening-form-field-disabled">
              {patient.firstName} {patient.lastName}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Patient ID</label>
            <div className="screening-form-field-disabled">
              {patient.patientId}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Date of Birth</label>
            <div className="screening-form-field-disabled">
              {patient.dateOfBirth}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">PCP Name</label>
            <div className="screening-form-field-disabled">
              {patient.pcpName}
            </div>
          </div>
        </div>
      </div>

      {/* Screening Details Summary */}
      <div className="screening-form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="screening-form-section-title">Screening Details</h3>
          <button
            onClick={() => onEditStep(2)}
            className="screening-form-button screening-form-button-secondary"
          >
            Edit
          </button>
        </div>
        <div className="screening-form-grid">
          <div className="screening-form-field">
            <label className="screening-form-label">Date of Screening</label>
            <div className="screening-form-field-disabled">
              {screeningDetails.dateOfScreening || 'Not specified'}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Place of Service</label>
            <div className="screening-form-field-disabled">
              {screeningDetails.placeOfService || 'Not specified'}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">PCP Location</label>
            <div className="screening-form-field-disabled">
              {screeningDetails.pcpLocation || 'Not specified'}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Diabetes Mellitus</label>
            <div className="screening-form-field-disabled">
              {screeningDetails.diabetesMellitus ? 
                `${screeningDetails.diabetesMellitus}${screeningDetails.diabetesType ? ` (${screeningDetails.diabetesType})` : ''}` : 
                'Not specified'}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Last Eye Exam</label>
            <div className="screening-form-field-disabled">
              {screeningDetails.lastEyeExam || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Retinal Images Summary */}
      <div className="screening-form-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="screening-form-section-title">Retinal Images</h3>
          <button
            onClick={() => onEditStep(3)}
            className="screening-form-button screening-form-button-secondary"
          >
            Edit
          </button>
        </div>
        <div className="screening-form-grid">
          <div className="screening-form-field">
            <label className="screening-form-label">Right Eye (OD)</label>
            <div className="screening-form-field-disabled">
              {retinalImages.rightEyeMissing ? 'Missing Eye' : 
               `${retinalImages.rightEyeImages.length} image(s) uploaded`}
            </div>
          </div>
          <div className="screening-form-field">
            <label className="screening-form-label">Left Eye (OS)</label>
            <div className="screening-form-field-disabled">
              {retinalImages.leftEyeMissing ? 'Missing Eye' : 
               `${retinalImages.leftEyeImages.length} image(s) uploaded`}
            </div>
          </div>
          {retinalImages.technicianComments && (
            <div className="screening-form-field col-span-2">
              <label className="screening-form-label">Technician Comments</label>
              <div className="screening-form-field-disabled">
                {retinalImages.technicianComments}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="screening-form-actions">
        <button
          onClick={onSave}
          className="screening-form-button screening-form-button-secondary"
        >
          Save for Later
        </button>
        <button
          onClick={onComplete}
          className="screening-form-button screening-form-button-primary"
        >
          Submit Screening
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
  
  // Mock completed screenings data
  const completedScreenings = [
    {
      id: 'completed-001',
      patientName: 'John Doe',
      patientId: '12345678',
      completedDate: '2024-03-15',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-002',
      patientName: 'Jane Smith',
      patientId: '87654321',
      completedDate: '2024-03-14',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-003',
      patientName: 'Robert Wilson',
      patientId: '11223344',
      completedDate: '2024-03-13',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-004',
      patientName: 'Mary Johnson',
      patientId: '22334455',
      completedDate: '2024-03-12',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-005',
      patientName: 'David Brown',
      patientId: '33445566',
      completedDate: '2024-03-11',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-006',
      patientName: 'Lisa Davis',
      patientId: '44556677',
      completedDate: '2024-03-10',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-007',
      patientName: 'Michael Wilson',
      patientId: '55667788',
      completedDate: '2024-03-09',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-008',
      patientName: 'Jennifer Taylor',
      patientId: '66778899',
      completedDate: '2024-03-08',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-009',
      patientName: 'Christopher Anderson',
      patientId: '77889900',
      completedDate: '2024-03-07',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-010',
      patientName: 'Amanda Martinez',
      patientId: '88990011',
      completedDate: '2024-03-06',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-011',
      patientName: 'Daniel Garcia',
      patientId: '99001122',
      completedDate: '2024-03-05',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-012',
      patientName: 'Nicole Rodriguez',
      patientId: '00112233',
      completedDate: '2024-03-04',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-013',
      patientName: 'Kevin Lopez',
      patientId: '11223344',
      completedDate: '2024-03-03',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-014',
      patientName: 'Stephanie Gonzalez',
      patientId: '22334455',
      completedDate: '2024-03-02',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-015',
      patientName: 'Brian Perez',
      patientId: '33445566',
      completedDate: '2024-03-01',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-016',
      patientName: 'Rachel Torres',
      patientId: '44556677',
      completedDate: '2024-02-29',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-017',
      patientName: 'Thomas Flores',
      patientId: '55667788',
      completedDate: '2024-02-28',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-018',
      patientName: 'Melissa Rivera',
      patientId: '66778899',
      completedDate: '2024-02-27',
      technician: 'Mike Chen',
      status: 'completed'
    },
    {
      id: 'completed-019',
      patientName: 'Steven Cooper',
      patientId: '77889900',
      completedDate: '2024-02-26',
      technician: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: 'completed-020',
      patientName: 'Laura Richardson',
      patientId: '88990011',
      completedDate: '2024-02-25',
      technician: 'Mike Chen',
      status: 'completed'
    }
  ]

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
                        <span>Completed: {screening.completedDate}</span>
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
}

function SavedScreeningListModal({ isOpen, onClose, onFormSelect }: SavedScreeningListModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'dateSaved' | 'patientName' | 'progress' | 'urgency'>('urgency')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
    // Mock saved screenings data
  const savedScreenings = [
    {
      id: 'saved-001',
      patientName: 'Alice Johnson',
      patientId: '55556666',
      dateSaved: '2025-07-23T01:41:00', // 5 days ago - 5 days until auto-delete
      progress: 'Step 1 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-002',
      patientName: 'David Brown',
      patientId: '77778888',
      dateSaved: '2025-07-21T23:33:00', // 7 days ago - SAFE
      progress: 'Step 2 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-003',
      patientName: 'Emily Davis',
      patientId: '99990000',
      dateSaved: '2025-07-19T17:47:00', // 9 days ago - SAFE
      progress: 'Step 3 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-004',
      patientName: 'Frank Miller',
      patientId: '11112222',
      dateSaved: '2025-07-17T09:28:00', // 11 days ago - SAFE
      progress: 'Step 4 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-005',
      patientName: 'Grace Lee',
      patientId: '33334444',
      dateSaved: '2025-07-15T22:56:00', // 13 days ago - SAFE
      progress: 'Step 1 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-006',
      patientName: 'Henry White',
      patientId: '55556666',
      dateSaved: '2025-07-13T11:43:00', // 15 days ago - SAFE
      progress: 'Step 2 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-007',
      patientName: 'Isabella Clark',
      patientId: '77778888',
      dateSaved: '2025-07-11T14:08:00', // 17 days ago - SAFE
      progress: 'Step 3 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-008',
      patientName: 'James Hall',
      patientId: '99990000',
      dateSaved: '2025-07-09T21:01:00', // 19 days ago - SAFE
      progress: 'Step 4 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-009',
      patientName: 'Katherine Young',
      patientId: '11112222',
      dateSaved: '2025-07-07T14:22:00', // 21 days ago - SAFE
      progress: 'Step 1 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-010',
      patientName: 'Lucas King',
      patientId: '33334444',
      dateSaved: '2025-07-05T02:38:00', // 23 days ago - SAFE
      progress: 'Step 2 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-011',
      patientName: 'Mia Wright',
      patientId: '55556666',
      dateSaved: '2025-07-03T16:34:00', // 25 days ago - SAFE
      progress: 'Step 3 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-012',
      patientName: 'Noah Green',
      patientId: '77778888',
      dateSaved: '2025-07-01T17:44:00', // 27 days ago - SAFE
      progress: 'Step 4 of 4',
      technician: 'Mike Chen'
    }
  ]

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
    return Math.max(0, 30 - daysSinceSaved)
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
        const aUrgency = getDaysUntilExpiry(a.dateSaved)
        const bUrgency = getDaysUntilExpiry(b.dateSaved)
        // Sort by urgency: urgent (1-5 days) first, then warning (6-10 days), then safe (11+ days)
        const aUrgencyScore = aUrgency <= 5 ? 0 : aUrgency <= 10 ? 1 : 2
        const bUrgencyScore = bUrgency <= 5 ? 0 : bUrgency <= 10 ? 1 : 2
        aValue = aUrgencyScore
        bValue = bUrgencyScore
        break
      default:
        aValue = a.patientName.toLowerCase()
        bValue = b.patientName.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
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
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hedis-list-search-input"
            />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy as 'dateSaved' | 'patientName' | 'progress' | 'urgency')
                setSortOrder(newSortOrder as 'asc' | 'desc')
              }}
              className="hedis-list-sort-select"
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
                          {urgencyLevel !== 'safe' && (
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

export default function HEDISLandingPage() {
  // State for current view and breadcrumb
  const [currentView, setCurrentView] = useState<'dashboard' | 'screening'>('dashboard')
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([])

  // State for screening form
  const [currentScreeningStep, setCurrentScreeningStep] = useState(1)
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

  // State for modals
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false)
  const [showCompletedScreeningListModal, setShowCompletedScreeningListModal] = useState(false)
  const [showSavedScreeningListModal, setShowSavedScreeningListModal] = useState(false)

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    completedPatientForms: 20,
    savedPatientForms: 12
  })

  // Dashboard state
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName, setUserName] = useState('John Smith')
  const [userRole, setUserRole] = useState('Field Technician')
  const [showSaveAlert, setShowSaveAlert] = useState(false)

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
    } else if (step) {
      // Fallback to URL params if no localStorage
      setCurrentScreeningStep(parseInt(step))
      if (mode) setFormMode(mode as 'new' | 'edit' | 'view')
      if (formId) setCurrentFormId(formId)
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
      // Handle reports navigation
      console.log('Navigate to reports')
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
    setShowCompletedScreeningListModal(false)
    updateScreeningStep(4, 'view', formId)
  }

  const handleSavedFormSelect = (formId: string) => {
    setShowSavedScreeningListModal(false)
    updateScreeningStep(2, 'edit', formId)
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
    setDashboardStats(prev => ({
      ...prev,
      completedPatientForms: prev.completedPatientForms + 1
    }))
    updateScreeningStep(0) // Back to dashboard
  }

  // Render screening sub-page if we're in screening flow
  if (currentScreeningStep > 0) {
    return (
      <div className="hedis-screening-page">
        <div className="hedis-screening-header">
          <div className="hedis-screening-breadcrumb">
            <button 
              onClick={() => updateScreeningStep(0)}
              className="hedis-screening-back-button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to HEDIS Dashboard
            </button>
          </div>
          <div className="hedis-screening-progress">
            <div className="hedis-screening-step-indicators">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`hedis-screening-step ${currentScreeningStep >= step ? 'hedis-screening-step-active' : 'hedis-screening-step-inactive'}`}
                >
                  <div className="hedis-screening-step-number">{step}</div>
                  <div className="hedis-screening-step-label">
                    {step === 1 && 'Patient Search'}
                    {step === 2 && 'Screening Details'}
                    {step === 3 && 'Retinal Images'}
                    {step === 4 && 'Review & Submit'}
                  </div>
                </div>
              ))}
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
                  setSavedForms={setSavedForms}
                  setDashboardStats={setDashboardStats}
                  updateScreeningStep={updateScreeningStep}
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

  // Original HEDIS landing page content
  return (
    <div className="hedis-landing-page">
      {/* Save Success Alert */}
      {showSaveAlert && (
        <div className="hedis-save-alert">
          <div className="hedis-save-alert-content">
            <div className="hedis-save-alert-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hedis-save-alert-message">
              <h4 className="hedis-save-alert-title">Form Saved Successfully!</h4>
              <p className="hedis-save-alert-description">
                Your patient screening form has been saved for later completion. 
                You have 5 business days to complete the form in a timely manner.
              </p>
            </div>
            <button 
              className="hedis-save-alert-close"
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

      {/* Header Section */}
      <div className="hedis-header">
        <div className="hedis-greeting-section">
          <h1 className="hedis-greeting">{getGreeting()}, {userName}!</h1>
          <div className="hedis-role-badge">({userRole})</div>
        </div>
        <div className="hedis-date-section">
          <div className="hedis-date-card">
            <div className="hedis-date-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="hedis-date-content">
              <div className="hedis-date-label">Today</div>
              <div className="hedis-date-value">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action - New Patient Screening */}
      <div className="hedis-primary-action-section">
        <div className="hedis-primary-action-card">
          <div className="hedis-primary-action-header">
            <div className="hedis-primary-action-icon">
              <div className="hedis-icon-badge">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              {getIcon('eye')}
            </div>
            <div className="hedis-primary-action-content">
              <h2 className="hedis-primary-action-title">New Patient Screening</h2>
              <p className="hedis-primary-action-description">
                Start a new patient screening form to collect comprehensive health data and assessments. 
                This is your primary workflow for patient evaluation and documentation.
              </p>
            </div>
          </div>
          <div className="hedis-primary-action-button">
            <button 
              className="hedis-hero-btn"
              onClick={() => handleTaskClick('screening')}
            >
              Start New Screening
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="hedis-secondary-actions-section">
        <div className="hedis-secondary-actions-grid">
          {/* HEDIS Reports */}
          <div className="hedis-secondary-action-card">
            <div className="hedis-secondary-action-header">
              <div className="hedis-secondary-action-icon">
                {getIcon('chart-bar')}
              </div>
              <div className="hedis-secondary-action-content">
                <h3 className="hedis-secondary-action-title">HEDIS Reports</h3>
                <p className="hedis-secondary-action-description">Generate and view HEDIS compliance reports</p>
              </div>
            </div>
            <div className="hedis-secondary-action-button">
              <button 
                className="hedis-secondary-btn"
                onClick={() => handleTaskClick('reports')}
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Dashboard Overview - Compact */}
          <div className="hedis-dashboard-compact">
            <h3 className="hedis-compact-title">Quick Access</h3>
            <div className="hedis-compact-grid">
              {dashboardCards.map((card) => (
                <div 
                  key={card.id}
                  className={`hedis-compact-card hedis-${card.id}-card group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  onClick={() => handleFormCardClick(card.id)}
                >
                  <div className={`hedis-compact-icon hedis-${card.id}-icon`}>
                    {getIcon(card.icon)}
                  </div>
                  <div className="hedis-compact-content">
                    <div className="hedis-compact-header">
                      <span className="hedis-compact-number">{card.number}</span>
                      <span className="hedis-compact-label">{card.label}</span>
                    </div>
                    <div className={`hedis-compact-badge ${card.id === 'completed' ? 'hedis-badge-view-only' : 'hedis-badge-continue-editing'}`}>
                      <span>{card.id === 'completed' ? 'View Only' : 'Continue Editing'}</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
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
        />
      )}
    </div>
  )
} 
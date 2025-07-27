import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import PatientSearchModal from './PatientSearchModal'
import NewScreeningForm from './NewScreeningForm'

// Patient Search Step Component
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

interface PatientSearchStepProps {
  onPatientSelect: (patient: Patient) => void
  onNextStep: () => void
}

function PatientSearchStep({ onPatientSelect, onNextStep }: PatientSearchStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      const mockResults: Patient[] = [
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
        }
      ]
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1000)
  }

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    onNextStep()
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
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearching}
              className="hedis-search-button"
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="hedis-search-results">
            <h3 className="hedis-results-title">Search Results</h3>
            <div className="hedis-results-list">
              {searchResults.map((patient) => (
                <div key={patient.id} className="hedis-result-card">
                  <div className="hedis-result-info">
                    <div className="hedis-result-name">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="hedis-result-details">
                      <span>ID: {patient.patientId}</span>
                      <span>DOB: {patient.dateOfBirth}</span>
                      <span>PCP: {patient.pcpName}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePatientSelect(patient)}
                    className="hedis-select-patient-button"
                  >
                    Select Patient
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
  
  // Mock saved screenings data
  const savedScreenings = [
    {
      id: 'saved-001',
      patientName: 'Alice Johnson',
      patientId: '55556666',
      lastModified: '2024-03-15',
      progress: 'Step 2 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-002',
      patientName: 'David Brown',
      patientId: '77778888',
      lastModified: '2024-03-14',
      progress: 'Step 3 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-003',
      patientName: 'Emily Davis',
      patientId: '99990000',
      lastModified: '2024-03-13',
      progress: 'Step 1 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-004',
      patientName: 'Frank Miller',
      patientId: '11112222',
      lastModified: '2024-03-12',
      progress: 'Step 4 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-005',
      patientName: 'Grace Lee',
      patientId: '33334444',
      lastModified: '2024-03-11',
      progress: 'Step 2 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-006',
      patientName: 'Henry White',
      patientId: '55556666',
      lastModified: '2024-03-10',
      progress: 'Step 3 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-007',
      patientName: 'Isabella Clark',
      patientId: '77778888',
      lastModified: '2024-03-09',
      progress: 'Step 1 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-008',
      patientName: 'James Hall',
      patientId: '99990000',
      lastModified: '2024-03-08',
      progress: 'Step 2 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-009',
      patientName: 'Katherine Young',
      patientId: '11112222',
      lastModified: '2024-03-07',
      progress: 'Step 3 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-010',
      patientName: 'Lucas King',
      patientId: '33334444',
      lastModified: '2024-03-06',
      progress: 'Step 1 of 4',
      technician: 'Mike Chen'
    },
    {
      id: 'saved-011',
      patientName: 'Mia Wright',
      patientId: '55556666',
      lastModified: '2024-03-05',
      progress: 'Step 4 of 4',
      technician: 'Sarah Johnson'
    },
    {
      id: 'saved-012',
      patientName: 'Noah Green',
      patientId: '77778888',
      lastModified: '2024-03-04',
      progress: 'Step 2 of 4',
      technician: 'Mike Chen'
    }
  ]

  const filteredScreenings = savedScreenings.filter(screening =>
    screening.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screening.patientId.includes(searchTerm)
  )

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
                <p>No saved screenings found.</p>
              </div>
            ) : (
              <div className="hedis-list-items">
                {filteredScreenings.map((screening) => (
                  <div 
                    key={screening.id}
                    className="hedis-list-item hedis-list-item-saved"
                    onClick={() => onFormSelect(screening.id)}
                  >
                    <div className="hedis-list-item-info">
                      <div className="hedis-list-item-name">{screening.patientName}</div>
                      <div className="hedis-list-item-details">
                        <span>ID: {screening.patientId}</span>
                        <span>Last Modified: {screening.lastModified}</span>
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

export default function HEDISLandingPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userRole, setUserRole] = useState('Field Technician')
  const [userName, setUserName] = useState('John Smith')
  const [savedFormsCount, setSavedFormsCount] = useState(12)
  const [showSaveAlert, setShowSaveAlert] = useState(false)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showScreeningForm, setShowScreeningForm] = useState(false)
  
  // URL-based step management for screening sub-page
  const [currentScreeningStep, setCurrentScreeningStep] = useState(0)
  const [screeningFormData, setScreeningFormData] = useState(null)
  
  // Enhanced form state management
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new')
  const [currentFormId, setCurrentFormId] = useState<string | null>(null)
  
  // Screening list modal states
  const [showCompletedListModal, setShowCompletedListModal] = useState(false)
  const [showSavedListModal, setShowSavedListModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // URL step management for screening sub-page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const step = urlParams.get('step')
    const mode = urlParams.get('mode')
    const formId = urlParams.get('formId')
    
    if (step && !isNaN(parseInt(step))) {
      setCurrentScreeningStep(parseInt(step))
    }
    
    if (mode) {
      setFormMode(mode as 'new' | 'edit' | 'view')
    }
    
    if (formId) {
      setCurrentFormId(formId)
    }
  }, [])

  const updateScreeningStep = (step: number, mode?: 'new' | 'edit' | 'view', formId?: string) => {
    setCurrentScreeningStep(step)
    if (mode) setFormMode(mode)
    if (formId) setCurrentFormId(formId)
    
    const url = new URL(window.location.href)
    if (step === 0) {
      url.searchParams.delete('step')
      url.searchParams.delete('mode')
      url.searchParams.delete('formId')
    } else {
      url.searchParams.set('step', step.toString())
      if (mode) url.searchParams.set('mode', mode)
      if (formId) url.searchParams.set('formId', formId)
    }
    window.history.pushState({}, '', url.toString())
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

  const dashboardStats = {
    completedForms: 20,
    savedForms: savedFormsCount
  }

  const dashboardCards = [
    {
      id: 'completed',
      icon: 'check-circle',
      number: dashboardStats.completedForms,
      label: 'Completed Patient Forms',
      description: 'Successfully completed and submitted forms',
      badge: 'View Only',
      badgeColor: 'green'
    },
    {
      id: 'saved',
      icon: 'save',
      number: dashboardStats.savedForms,
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
      setShowCompletedListModal(true)
    } else if (cardId === 'saved') {
      setShowSavedListModal(true)
    }
  }

  const handleCompletedFormSelect = (formId: string) => {
    setShowCompletedListModal(false)
    updateScreeningStep(4, 'view', formId)
  }

  const handleSavedFormSelect = (formId: string) => {
    setShowSavedListModal(false)
    updateScreeningStep(2, 'edit', formId)
  }

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient)
    updateScreeningStep(2, formMode, currentFormId || undefined) // Move to screening details with current mode
  }

  const handleScreeningFormClose = () => {
    setShowScreeningForm(false)
    updateScreeningStep(0) // Back to dashboard
  }

  const handleScreeningFormSave = () => {
    setSavedFormsCount(prev => prev + 1)
    setShowSaveAlert(true)
    setTimeout(() => setShowSaveAlert(false), 10000)
  }

  const handleScreeningFormComplete = () => {
    // Handle form completion
    console.log('Screening form completed')
    // Could navigate to completed form view or back to dashboard
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
              {/* Screening Details Component will go here */}
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
              {/* Retinal Images Component will go here */}
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
              {/* Review & Submit Component will go here */}
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

      {/* Patient Search Modal */}
      {showPatientSearch && (
        <PatientSearchModal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          onPatientSelect={handlePatientSelect}
        />
      )}

      {/* New Screening Form Modal */}
      {showScreeningForm && selectedPatient && (
        <NewScreeningForm
          patient={selectedPatient}
          isOpen={showScreeningForm}
          onClose={handleScreeningFormClose}
          onSave={handleScreeningFormSave}
          onComplete={handleScreeningFormComplete}
        />
      )}

      {/* Completed Screening List Modal */}
      {showCompletedListModal && (
        <CompletedScreeningListModal
          isOpen={showCompletedListModal}
          onClose={() => setShowCompletedListModal(false)}
          onFormSelect={handleCompletedFormSelect}
        />
      )}

      {/* Saved Screening List Modal */}
      {showSavedListModal && (
        <SavedScreeningListModal
          isOpen={showSavedListModal}
          onClose={() => setShowSavedListModal(false)}
          onFormSelect={handleSavedFormSelect}
        />
      )}
    </div>
  )
} 
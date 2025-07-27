import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'

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

interface PCP {
  id: string
  name: string
  location: string
  specialty: string
  patientCount: number
}

interface PatientSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onPatientSelect: (patient: Patient) => void
}

// Mock Data
const mockPatients: Patient[] = [
  {
    id: '1',
    patientId: '12345678',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    pcpName: 'Dr. Sarah Johnson',
    pcpLocation: 'Downtown Medical Center',
    lastVisit: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    patientId: '87654321',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1992-07-22',
    pcpName: 'Dr. Michael Chen',
    pcpLocation: 'Westside Clinic',
    lastVisit: '2024-02-03',
    status: 'active'
  },
  {
    id: '3',
    patientId: '11223344',
    firstName: 'Robert',
    lastName: 'Wilson',
    dateOfBirth: '1978-11-08',
    pcpName: 'Dr. Sarah Johnson',
    pcpLocation: 'Downtown Medical Center',
    lastVisit: '2024-01-28',
    status: 'active'
  },
  {
    id: '4',
    patientId: '55667788',
    firstName: 'Lisa',
    lastName: 'Thompson',
    dateOfBirth: '1990-05-12',
    pcpName: 'Dr. Emily Davis',
    pcpLocation: 'Northside Family Practice',
    lastVisit: '2024-02-10',
    status: 'active'
  },
  {
    id: '5',
    patientId: '99887766',
    firstName: 'David',
    lastName: 'Brown',
    dateOfBirth: '1983-09-30',
    pcpName: 'Dr. Michael Chen',
    pcpLocation: 'Westside Clinic',
    lastVisit: '2024-01-20',
    status: 'inactive'
  }
]

const mockPCPs: PCP[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    location: 'Downtown Medical Center',
    specialty: 'Family Medicine',
    patientCount: 245
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    location: 'Westside Clinic',
    specialty: 'Internal Medicine',
    patientCount: 189
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    location: 'Northside Family Practice',
    specialty: 'Family Medicine',
    patientCount: 312
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    location: 'Eastside Medical Group',
    specialty: 'Internal Medicine',
    patientCount: 156
  },
  {
    id: '5',
    name: 'Dr. Jennifer Martinez',
    location: 'Southside Healthcare',
    specialty: 'Family Medicine',
    patientCount: 203
  }
]

export default function PatientSearchModal({ isOpen, onClose, onPatientSelect }: PatientSearchModalProps) {
  const [activeTab, setActiveTab] = useState<'patient-id' | 'pcp'>('patient-id')
  const [patientIdSearchTerm, setPatientIdSearchTerm] = useState('')
  const [pcpSearchTerm, setPcpSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPCPAutocomplete, setShowPCPAutocomplete] = useState(false)
  const [filteredPCPs, setFilteredPCPs] = useState<PCP[]>([])
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    specialty: '',
    status: 'all'
  })
  const [debouncedPatientIdSearchTerm, setDebouncedPatientIdSearchTerm] = useState('')
  const [debouncedPcpSearchTerm, setDebouncedPcpSearchTerm] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Debounce patient ID search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPatientIdSearchTerm(patientIdSearchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [patientIdSearchTerm])

  // Debounce PCP search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPcpSearchTerm(pcpSearchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [pcpSearchTerm])

  // Auto-complete for PCP names
  useEffect(() => {
    if (activeTab === 'pcp' && pcpSearchTerm.trim()) {
      const filtered = mockPCPs.filter(pcp => 
        pcp.name.toLowerCase().includes(pcpSearchTerm.toLowerCase())
      )
      setFilteredPCPs(filtered)
      setShowPCPAutocomplete(filtered.length > 0)
    } else {
      setShowPCPAutocomplete(false)
    }
  }, [pcpSearchTerm, activeTab])

  // Get all patients with filters applied
  const getAllPatients = () => {
    let results = [...mockPatients]

    // Apply filters
    if (selectedFilters.location) {
      results = results.filter(patient => 
        patient.pcpLocation.toLowerCase().includes(selectedFilters.location.toLowerCase())
      )
    }

    if (selectedFilters.specialty) {
      const pcpSpecialties = mockPCPs.filter(pcp => 
        pcp.specialty.toLowerCase().includes(selectedFilters.specialty.toLowerCase())
      )
      results = results.filter(patient => 
        pcpSpecialties.some(pcp => pcp.name === patient.pcpName)
      )
    }

    if (selectedFilters.status !== 'all') {
      results = results.filter(patient => patient.status === selectedFilters.status)
    }

    return results
  }

  // Real-time search effect
  useEffect(() => {
    const currentSearchTerm = activeTab === 'patient-id' ? debouncedPatientIdSearchTerm : debouncedPcpSearchTerm
    
    if (!currentSearchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    // Simulate API delay
    const timer = setTimeout(() => {
      let results: Patient[] = []

      if (activeTab === 'patient-id') {
        results = mockPatients.filter(patient =>
          patient.patientId.includes(currentSearchTerm) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(currentSearchTerm.toLowerCase())
        )
      } else {
        const matchingPCPs = mockPCPs.filter(pcp =>
          pcp.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
        )
        results = mockPatients.filter(patient =>
          matchingPCPs.some(pcp => pcp.name === patient.pcpName)
        )
      }

      // Apply filters
      if (selectedFilters.location) {
        results = results.filter(patient =>
          patient.pcpLocation.toLowerCase().includes(selectedFilters.location.toLowerCase())
        )
      }

      if (selectedFilters.specialty) {
        const pcpSpecialties = mockPCPs.filter(pcp =>
          pcp.specialty.toLowerCase().includes(selectedFilters.specialty.toLowerCase())
        )
        results = results.filter(patient =>
          pcpSpecialties.some(pcp => pcp.name === patient.pcpName)
        )
      }

      if (selectedFilters.status !== 'all') {
        results = results.filter(patient => patient.status === selectedFilters.status)
      }

      setSearchResults(results)
      setIsLoading(false)
    }, 200) // Shorter delay for real-time search

    return () => clearTimeout(timer)
  }, [debouncedPatientIdSearchTerm, debouncedPcpSearchTerm, activeTab, selectedFilters])

    const handlePCPSelect = (pcp: PCP) => {
    setPcpSearchTerm(pcp.name)
    setShowPCPAutocomplete(false)
  }

  const handleSearch = () => {
    const currentSearchTerm = activeTab === 'patient-id' ? patientIdSearchTerm : pcpSearchTerm
    
    if (!currentSearchTerm.trim()) return

    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      let results: Patient[] = []
      
      if (activeTab === 'patient-id') {
        results = mockPatients.filter(patient => 
          patient.patientId.includes(currentSearchTerm) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(currentSearchTerm.toLowerCase())
        )
      } else {
        // Search by PCP - find patients under the searched PCP
        const matchingPCPs = mockPCPs.filter(pcp => 
          pcp.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
        )
        
        results = mockPatients.filter(patient => 
          matchingPCPs.some(pcp => pcp.name === patient.pcpName)
        )
      }

      // Apply filters
      if (selectedFilters.location) {
        results = results.filter(patient => 
          patient.pcpLocation.toLowerCase().includes(selectedFilters.location.toLowerCase())
        )
      }

      if (selectedFilters.specialty) {
        const pcpSpecialties = mockPCPs.filter(pcp => 
          pcp.specialty.toLowerCase().includes(selectedFilters.specialty.toLowerCase())
        )
        results = results.filter(patient => 
          pcpSpecialties.some(pcp => pcp.name === patient.pcpName)
        )
      }

      if (selectedFilters.status !== 'all') {
        results = results.filter(patient => patient.status === selectedFilters.status)
      }

      setSearchResults(results)
      setIsLoading(false)
    }, 500)
  }

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    onClose()
  }

  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      'search': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      'close': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      'plus': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      'chevron-down': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ),
      'chevron-up': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ),
      'copy': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
    
    return iconMap[iconName] || <div>Icon not found</div>
  }

  if (!isOpen) return null

  // Create portal to render modal at root level
  return createPortal(
    <div className="patient-search-modal-overlay">
      <div className="patient-search-modal">
        {/* Modal Header */}
        <div className="patient-search-modal-header">
          <h2 className="patient-search-modal-title">Patient Search</h2>
          <button 
            className="patient-search-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            {getIcon('close')}
          </button>
        </div>

        {/* Search Tabs */}
        <div className="patient-search-modal-tabs">
          <button
            className={`patient-search-tab ${activeTab === 'patient-id' ? 'patient-search-tab-active' : ''}`}
            onClick={() => setActiveTab('patient-id')}
          >
            Search By Patient ID
          </button>
          <button
            className={`patient-search-tab ${activeTab === 'pcp' ? 'patient-search-tab-active' : ''}`}
            onClick={() => setActiveTab('pcp')}
          >
            Search By PCP
          </button>
        </div>

        {/* Search Input */}
        <div className="patient-search-input-section">
          <label className="patient-search-input-label">
            {activeTab === 'patient-id' ? 'Search Patient ID' : 'Search by PCP Name'}
          </label>
          {activeTab === 'patient-id' && (
            <div className="patient-search-input-hint">
              <p>Patient ID format: 8 digits (e.g., 12345678)</p>
            </div>
          )}
          {activeTab === 'pcp' && (
            <div className="patient-search-input-hint">
              <p>Search by PCP name to find all patients under that provider</p>
            </div>
          )}
                      <div className="patient-search-input-container">
              <input
                type="text"
                className="patient-search-input"
                placeholder={activeTab === 'patient-id' ? 'Enter 8-digit ID (e.g., 12345678) or patient name...' : 'Enter PCP name...'}
                value={activeTab === 'patient-id' ? patientIdSearchTerm : pcpSearchTerm}
                onChange={(e) => {
                  if (activeTab === 'patient-id') {
                    setPatientIdSearchTerm(e.target.value)
                  } else {
                    setPcpSearchTerm(e.target.value)
                  }
                }}
              />
              {isLoading && (
                <div className="patient-search-loading-container">
                  <div className="patient-search-loading"></div>
                </div>
              )}
              {(activeTab === 'patient-id' ? patientIdSearchTerm : pcpSearchTerm) && !isLoading && (
                <button
                  className="patient-search-clear-button"
                  onClick={() => {
                    if (activeTab === 'patient-id') {
                      setPatientIdSearchTerm('')
                    } else {
                      setPcpSearchTerm('')
                    }
                  }}
                  title="Clear search"
                >
                  {getIcon('close')}
                </button>
              )}
            </div>
          
          {/* PCP Auto-complete */}
          {showPCPAutocomplete && (
            <div className="patient-search-autocomplete">
              {filteredPCPs.map((pcp) => (
                <div
                  key={pcp.id}
                  className="patient-search-autocomplete-item"
                  onClick={() => handlePCPSelect(pcp)}
                >
                  <div className="patient-search-autocomplete-name">{pcp.name}</div>
                  <div className="patient-search-autocomplete-details">
                    {pcp.specialty} • {pcp.location} • {pcp.patientCount} patients
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <div className="patient-search-filters">
          <div className="patient-search-filters-header">
            <div 
              className="patient-search-filters-title-section"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setShowAdvancedFilters(!showAdvancedFilters)
                }
              }}
              title={showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            >
              <h3 className="patient-search-filters-title">Advanced Filters</h3>
              <div className="patient-search-filters-toggle">
                {getIcon(showAdvancedFilters ? 'chevron-up' : 'chevron-down')}
              </div>
            </div>
            {showAdvancedFilters && (
              <button
                className="patient-search-filters-clear"
                onClick={() => setSelectedFilters({ location: '', specialty: '', status: 'all' })}
              >
                Clear All
              </button>
            )}
          </div>
          {showAdvancedFilters && (
            <div className="patient-search-filters-grid">
              <div className="patient-search-filter-group">
                <label className="patient-search-filter-label">Location</label>
                <input
                  type="text"
                  className="patient-search-filter-input"
                  placeholder="Filter by location..."
                  value={selectedFilters.location}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="patient-search-filter-group">
                <label className="patient-search-filter-label">Specialty</label>
                <input
                  type="text"
                  className="patient-search-filter-input"
                  placeholder="Filter by specialty..."
                  value={selectedFilters.specialty}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, specialty: e.target.value }))}
                />
              </div>
              <div className="patient-search-filter-group">
                <label className="patient-search-filter-label">Status</label>
                <select
                  className="patient-search-filter-select"
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Patients</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="patient-search-results">
          {searchResults.length > 0 ? (
            <div className="patient-search-table">
              <div className="patient-search-table-header">
                <div className="patient-search-table-cell">#</div>
                {activeTab === 'patient-id' ? (
                  <>
                    <div className="patient-search-table-cell">Patient ID</div>
                    <div className="patient-search-table-cell">Patient Name</div>
                    <div className="patient-search-table-cell">PCP Name</div>
                    <div className="patient-search-table-cell">PCP Location</div>
                  </>
                ) : (
                  <>
                    <div className="patient-search-table-cell">PCP Name</div>
                    <div className="patient-search-table-cell">Patient Name</div>
                    <div className="patient-search-table-cell">Patient ID</div>
                    <div className="patient-search-table-cell">PCP Location</div>
                  </>
                )}
                <div className="patient-search-table-cell">Actions</div>
              </div>
              <div className="patient-search-table-body">
                {searchResults.map((patient, index) => (
                  <div key={patient.id} className="patient-search-table-row">
                    <div className="patient-search-table-cell">
                      <span className="md:hidden">#</span>
                      {index + 1}
                    </div>
                    {activeTab === 'patient-id' ? (
                      <>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">Patient ID: </span>
                          {patient.patientId}
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">Patient Name: </span>
                          {patient.firstName} {patient.lastName}
                          <span className={`patient-status-badge patient-status-${patient.status}`}>
                            {patient.status}
                          </span>
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">PCP Name: </span>
                          {patient.pcpName}
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">PCP Location: </span>
                          {patient.pcpLocation}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">PCP Name: </span>
                          {patient.pcpName}
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">Patient Name: </span>
                          {patient.firstName} {patient.lastName}
                          <span className={`patient-status-badge patient-status-${patient.status}`}>
                            {patient.status}
                          </span>
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">Patient ID: </span>
                          {patient.patientId}
                        </div>
                        <div className="patient-search-table-cell">
                          <span className="md:hidden">PCP Location: </span>
                          {patient.pcpLocation}
                        </div>
                      </>
                    )}
                    <div className="patient-search-table-cell">
                      <button
                        className="patient-search-select-button"
                        onClick={() => handlePatientSelect(patient)}
                        title="Start Screening"
                      >
                        <span className="text-sm font-medium">Start Screening</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (activeTab === 'patient-id' ? patientIdSearchTerm : pcpSearchTerm) && !isLoading ? (
            <div className="patient-search-empty">
              <p>No patients found matching your search criteria.</p>
            </div>
          ) : (activeTab === 'patient-id' ? patientIdSearchTerm : pcpSearchTerm) && isLoading ? (
            <div className="patient-search-empty">
              <p>Searching...</p>
            </div>
          ) : (
            <div className="patient-search-table">
              <div className="patient-search-table-header">
                <div className="patient-search-table-cell">#</div>
                {activeTab === 'patient-id' ? (
                  <>
                    <div className="patient-search-table-cell">Patient ID</div>
                    <div className="patient-search-table-cell">Patient Name</div>
                    <div className="patient-search-table-cell">PCP Name</div>
                    <div className="patient-search-table-cell">PCP Location</div>
                  </>
                ) : (
                  <>
                    <div className="patient-search-table-cell">PCP Name</div>
                    <div className="patient-search-table-cell">Patient Name</div>
                    <div className="patient-search-table-cell">Patient ID</div>
                    <div className="patient-search-table-cell">PCP Location</div>
                  </>
                )}
                <div className="patient-search-table-cell">Actions</div>
              </div>
              <div className="patient-search-table-body">
                {/* Empty state - no data shown by default */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
} 
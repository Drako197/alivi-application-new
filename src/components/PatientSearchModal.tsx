import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPCPAutocomplete, setShowPCPAutocomplete] = useState(false)
  const [filteredPCPs, setFilteredPCPs] = useState<PCP[]>([])
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    specialty: '',
    status: 'all'
  })
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Auto-complete for PCP names
  useEffect(() => {
    if (activeTab === 'pcp' && searchTerm.trim()) {
      const filtered = mockPCPs.filter(pcp => 
        pcp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPCPs(filtered)
      setShowPCPAutocomplete(filtered.length > 0)
    } else {
      setShowPCPAutocomplete(false)
    }
  }, [searchTerm, activeTab])

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
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)

    // Simulate API delay
    const timer = setTimeout(() => {
      let results: Patient[] = []

      if (activeTab === 'patient-id') {
        results = mockPatients.filter(patient =>
          patient.patientId.includes(debouncedSearchTerm) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      } else {
        const matchingPCPs = mockPCPs.filter(pcp =>
          pcp.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
  }, [debouncedSearchTerm, activeTab, selectedFilters])

  const handlePCPSelect = (pcp: PCP) => {
    setSearchTerm(pcp.name)
    setShowPCPAutocomplete(false)
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      let results: Patient[] = []
      
      if (activeTab === 'patient-id') {
        results = mockPatients.filter(patient => 
          patient.patientId.includes(searchTerm) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      } else {
        // Search by PCP - find patients under the searched PCP
        const matchingPCPs = mockPCPs.filter(pcp => 
          pcp.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isLoading && (
                <div className="patient-search-loading-container">
                  <div className="patient-search-loading"></div>
                </div>
              )}
              {searchTerm && !isLoading && (
                <button
                  className="patient-search-clear-button"
                  onClick={() => setSearchTerm('')}
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
            <h3 className="patient-search-filters-title">Advanced Filters</h3>
            <button
              className="patient-search-filters-clear"
              onClick={() => setSelectedFilters({ location: '', specialty: '', status: 'all' })}
            >
              Clear All
            </button>
          </div>
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
        </div>

        {/* Search Results */}
        <div className="patient-search-results">
          {searchResults.length > 0 ? (
            <div className="patient-search-table">
              <div className="patient-search-table-header">
                <div className="patient-search-table-cell">#</div>
                <div className="patient-search-table-cell">Patient ID</div>
                <div className="patient-search-table-cell">Patient Name</div>
                <div className="patient-search-table-cell">PCP Name</div>
                <div className="patient-search-table-cell">PCP Location</div>
                <div className="patient-search-table-cell">Actions</div>
              </div>
              <div className="patient-search-table-body">
                {searchResults.map((patient, index) => (
                  <div key={patient.id} className="patient-search-table-row">
                    <div className="patient-search-table-cell">{index + 1}</div>
                    <div className="patient-search-table-cell">{patient.patientId}</div>
                    <div className="patient-search-table-cell">
                      {patient.firstName} {patient.lastName}
                      <span className={`patient-status-badge patient-status-${patient.status}`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="patient-search-table-cell">{patient.pcpName}</div>
                    <div className="patient-search-table-cell">{patient.pcpLocation}</div>
                    <div className="patient-search-table-cell">
                      <button
                        className="patient-search-select-button"
                        onClick={() => handlePatientSelect(patient)}
                        title="Select Patient"
                      >
                        {getIcon('plus')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm && !isLoading ? (
            <div className="patient-search-empty">
              <p>No patients found matching your search criteria.</p>
            </div>
          ) : searchTerm && isLoading ? (
            <div className="patient-search-empty">
              <p>Searching...</p>
            </div>
          ) : (
            <div className="patient-search-table">
              <div className="patient-search-table-header">
                <div className="patient-search-table-cell">#</div>
                <div className="patient-search-table-cell">Patient ID</div>
                <div className="patient-search-table-cell">Patient Name</div>
                <div className="patient-search-table-cell">PCP Name</div>
                <div className="patient-search-table-cell">PCP Location</div>
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
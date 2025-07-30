import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactElement } from 'react'
import HelperButton from './HelperButton'

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
  }
]

export default function PatientSearchModal({ isOpen, onClose, onPatientSelect }: PatientSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])

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

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = mockPatients.filter(patient => 
        patient.patientId.includes(searchTerm) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    onClose()
  }

  const getIcon = (iconName: string): ReactElement => {
    const iconMap: { [key: string]: ReactElement } = {
      'close': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    
    return iconMap[iconName] || <div>Icon not found</div>
  }

  if (!isOpen) return null



  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">


      {/* M.I.L.A. Assistant Button */}
      <HelperButton
        currentForm="PatientSearchModal"
        currentField="searchTerm"
        currentStep={1}
      />

      {/* Modal Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Search</h2>
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            {getIcon('close')}
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Search Patient ID or Name
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter patient ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-6 pt-0">
          {searchResults.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-white p-4 font-semibold text-sm uppercase tracking-wide">
                Search Results
              </div>
              <div className="bg-white dark:bg-gray-800">
                {searchResults.map((patient, index) => (
                  <div key={patient.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {patient.patientId} • PCP: {patient.pcpName}
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No patients found matching your search criteria.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Enter search criteria to find patients.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
} 
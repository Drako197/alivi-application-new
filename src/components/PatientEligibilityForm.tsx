import React, { useState } from 'react'
import Icon from './Icon'

interface PatientEligibilityFormProps {
  onBack?: () => void
}

export default function PatientEligibilityForm({ onBack }: PatientEligibilityFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    memberId: '',
    groupNumber: '',
    serviceDate: '',
    providerNpi: '',
    diagnosisCodes: '',
    procedureCodes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  if (submitted) {
    return (
      <div className="patient-eligibility-form">
        <div className="form-header">
          <button onClick={handleBack} className="back-button">
            <Icon name="arrow-left" size={20} />
            <span>Back to P.I.C. Actions</span>
          </button>
        </div>
        
        <div className="text-center py-12">
          <div className="mb-6">
            <Icon name="check-circle" size={64} className="text-green-500 mx-auto" />
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
    )
  }

  return (
    <div className="patient-eligibility-form">
      <div className="form-header">
        <button onClick={handleBack} className="back-button">
          <Icon name="arrow-left" size={20} />
          <span>Back to P.I.C. Actions</span>
        </button>
        <div>
          <h1 className="form-title">Request Patient Eligibility</h1>
          <p className="form-subtitle">Submit a patient eligibility request to check benefits and coverage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="eligibility-form">
        <div className="form-section">
          <h3 className="form-section-title">Patient Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="patientId" className="form-label">Patient ID *</label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter patient ID"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="firstName" className="form-label">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter first name"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="lastName" className="form-label">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter last name"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Member Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="memberId" className="form-label">Member ID *</label>
              <input
                type="text"
                id="memberId"
                name="memberId"
                value={formData.memberId}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter member ID"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="groupNumber" className="form-label">Group Number</label>
              <input
                type="text"
                id="groupNumber"
                name="groupNumber"
                value={formData.groupNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter group number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Service Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="serviceDate" className="form-label">Service Date *</label>
              <input
                type="date"
                id="serviceDate"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="providerNpi" className="form-label">Provider NPI *</label>
              <input
                type="text"
                id="providerNpi"
                name="providerNpi"
                value={formData.providerNpi}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter provider NPI"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Diagnosis & Procedure Codes</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="diagnosisCodes" className="form-label">Diagnosis Codes</label>
              <textarea
                id="diagnosisCodes"
                name="diagnosisCodes"
                value={formData.diagnosisCodes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter diagnosis codes (comma-separated)"
                rows={3}
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="procedureCodes" className="form-label">Procedure Codes</label>
              <textarea
                id="procedureCodes"
                name="procedureCodes"
                value={formData.procedureCodes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter procedure codes (comma-separated)"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Icon name="loader-2" size={20} className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Eligibility Request'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 
import React, { useState, useEffect, useMemo } from 'react'
import Icon from './Icon'
import { scrollToFirstError } from '../utils/validationUtils'

interface PrescriptionFormProps {
  onBack?: () => void
  onNext?: () => void
  onSave?: () => void
  onClear?: () => void
}

interface PrescriptionData {
  // Refractive Correction
  odSphere: string
  osSphere: string
  odCylinder: string
  osCylinder: string
  odAxis: string
  osAxis: string
  odAdd: string
  osAdd: string
  odBC: string
  osBC: string
  
  // Prism Correction
  odHorizontal: string
  osHorizontal: string
  odHorizontalDirection: string
  osHorizontalDirection: string
  odVertical: string
  osVertical: string
  odVerticalDirection: string
  osVerticalDirection: string
  odPrismType: string
  osPrismType: string
  
  // Slab Off
  slabOff: string
}

export default function PrescriptionForm({ 
  onBack, 
  onNext, 
  onSave, 
  onClear 
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState<PrescriptionData>({
    // Refractive Correction - Default values from the image
    odSphere: '+4.25',
    osSphere: '+4.00',
    odCylinder: '-0.50',
    osCylinder: '-0.75',
    odAxis: '2',
    osAxis: '2',
    odAdd: '0.0',
    osAdd: '0.0',
    odBC: '0.50',
    osBC: '0.50',
    
    // Prism Correction
    odHorizontal: '+4.25',
    osHorizontal: '+4.00',
    odHorizontalDirection: 'In',
    osHorizontalDirection: 'In',
    odVertical: '2',
    osVertical: '2',
    odVerticalDirection: 'Up',
    osVerticalDirection: 'Up',
    odPrismType: 'Decentered',
    osPrismType: 'Ground In',
    
    // Slab Off
    slabOff: 'OD'
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHelp, setShowHelp] = useState<string | null>(null)

  // Dropdown options
  const sphereOptions = [
    { value: '+4.25', label: '+4.25' },
    { value: '+4.00', label: '+4.00' },
    { value: '+3.75', label: '+3.75' },
    { value: '+3.50', label: '+3.50' },
    { value: '+3.25', label: '+3.25' },
    { value: '+3.00', label: '+3.00' },
    { value: '+2.75', label: '+2.75' },
    { value: '+2.50', label: '+2.50' },
    { value: '+2.25', label: '+2.25' },
    { value: '+2.00', label: '+2.00' },
    { value: '+1.75', label: '+1.75' },
    { value: '+1.50', label: '+1.50' },
    { value: '+1.25', label: '+1.25' },
    { value: '+1.00', label: '+1.00' },
    { value: '+0.75', label: '+0.75' },
    { value: '+0.50', label: '+0.50' },
    { value: '+0.25', label: '+0.25' },
    { value: '0.00', label: '0.00' },
    { value: '-0.25', label: '-0.25' },
    { value: '-0.50', label: '-0.50' },
    { value: '-0.75', label: '-0.75' },
    { value: '-1.00', label: '-1.00' },
    { value: '-1.25', label: '-1.25' },
    { value: '-1.50', label: '-1.50' },
    { value: '-1.75', label: '-1.75' },
    { value: '-2.00', label: '-2.00' },
    { value: '-2.25', label: '-2.25' },
    { value: '-2.50', label: '-2.50' },
    { value: '-2.75', label: '-2.75' },
    { value: '-3.00', label: '-3.00' },
    { value: '-3.25', label: '-3.25' },
    { value: '-3.50', label: '-3.50' },
    { value: '-3.75', label: '-3.75' },
    { value: '-4.00', label: '-4.00' },
    { value: '-4.25', label: '-4.25' },
    { value: '-4.50', label: '-4.50' },
    { value: '-4.75', label: '-4.75' },
    { value: '-5.00', label: '-5.00' }
  ]

  const cylinderOptions = [
    { value: '-0.50', label: '-0.50' },
    { value: '-0.75', label: '-0.75' },
    { value: '-1.00', label: '-1.00' },
    { value: '-1.25', label: '-1.25' },
    { value: '-1.50', label: '-1.50' },
    { value: '-1.75', label: '-1.75' },
    { value: '-2.00', label: '-2.00' },
    { value: '-2.25', label: '-2.25' },
    { value: '-2.50', label: '-2.50' },
    { value: '-2.75', label: '-2.75' },
    { value: '-3.00', label: '-3.00' },
    { value: '-3.25', label: '-3.25' },
    { value: '-3.50', label: '-3.50' },
    { value: '-3.75', label: '-3.75' },
    { value: '-4.00', label: '-4.00' },
    { value: '-4.25', label: '-4.25' },
    { value: '-4.50', label: '-4.50' },
    { value: '-4.75', label: '-4.75' },
    { value: '-5.00', label: '-5.00' },
    { value: '0.00', label: '0.00' },
    { value: '+0.25', label: '+0.25' },
    { value: '+0.50', label: '+0.50' },
    { value: '+0.75', label: '+0.75' },
    { value: '+1.00', label: '+1.00' },
    { value: '+1.25', label: '+1.25' },
    { value: '+1.50', label: '+1.50' },
    { value: '+1.75', label: '+1.75' },
    { value: '+2.00', label: '+2.00' },
    { value: '+2.25', label: '+2.25' },
    { value: '+2.50', label: '+2.50' },
    { value: '+2.75', label: '+2.75' },
    { value: '+3.00', label: '+3.00' },
    { value: '+3.25', label: '+3.25' },
    { value: '+3.50', label: '+3.50' },
    { value: '+3.75', label: '+3.75' },
    { value: '+4.00', label: '+4.00' },
    { value: '+4.25', label: '+4.25' },
    { value: '+4.50', label: '+4.50' },
    { value: '+4.75', label: '+4.75' },
    { value: '+5.00', label: '+5.00' }
  ]

  const axisOptions = Array.from({ length: 181 }, (_, i) => ({
    value: i.toString(),
    label: i.toString()
  }))

  const addOptions = [
    { value: '0.0', label: '0.0' },
    { value: '0.25', label: '0.25' },
    { value: '0.50', label: '0.50' },
    { value: '0.75', label: '0.75' },
    { value: '1.00', label: '1.00' },
    { value: '1.25', label: '1.25' },
    { value: '1.50', label: '1.50' },
    { value: '1.75', label: '1.75' },
    { value: '2.00', label: '2.00' },
    { value: '2.25', label: '2.25' },
    { value: '2.50', label: '2.50' },
    { value: '2.75', label: '2.75' },
    { value: '3.00', label: '3.00' }
  ]

  const bcOptions = [
    { value: '0.50', label: '0.50' },
    { value: '0.75', label: '0.75' },
    { value: '1.00', label: '1.00' },
    { value: '1.25', label: '1.25' },
    { value: '1.50', label: '1.50' },
    { value: '1.75', label: '1.75' },
    { value: '2.00', label: '2.00' },
    { value: '2.25', label: '2.25' },
    { value: '2.50', label: '2.50' },
    { value: '2.75', label: '2.75' },
    { value: '3.00', label: '3.00' }
  ]

  const directionOptions = [
    { value: 'In', label: 'In' },
    { value: 'Out', label: 'Out' },
    { value: 'Up', label: 'Up' },
    { value: 'Down', label: 'Down' }
  ]

  const prismTypeOptions = [
    { value: 'Decentered', label: 'Decentered' },
    { value: 'Ground In', label: 'Ground In' },
    { value: 'Slab Off', label: 'Slab Off' }
  ]

  const slabOffOptions = [
    { value: 'OD', label: 'OD' },
    { value: 'OS', label: 'OS' },
    { value: 'OU', label: 'OU' },
    { value: 'None', label: 'None' }
  ]

  // Helper functions
  const handleInputChange = (field: keyof PrescriptionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const copyODtoOS = () => {
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
  }

  const copyOStoOD = () => {
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
  }

  const clearAll = () => {
    setFormData({
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
      slabOff: ''
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    // Basic validation - ensure required fields are filled
    const requiredFields: (keyof PrescriptionData)[] = [
      'odSphere', 'osSphere', 'odCylinder', 'osCylinder', 
      'odAxis', 'osAxis', 'odAdd', 'osAdd', 'odBC', 'osBC'
    ]
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required'
      }
    })
    
    // Axis validation (0-180)
    if (formData.odAxis && (parseInt(formData.odAxis) < 0 || parseInt(formData.odAxis) > 180)) {
      newErrors.odAxis = 'Axis must be between 0 and 180'
    }
    if (formData.osAxis && (parseInt(formData.osAxis) < 0 || parseInt(formData.osAxis) > 180)) {
      newErrors.osAxis = 'Axis must be between 0 and 180'
    }
    
    setErrors(newErrors)
    
    // Scroll to first error on mobile if there are errors
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors)
    }
    
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setIsSubmitting(true)
      setTimeout(() => {
        setIsSubmitting(false)
        onNext?.()
        // Scroll to top on mobile when proceeding to next step
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 500)
    }
  }

  const handleSave = () => {
    if (validateForm()) {
      setIsSubmitting(true)
      setTimeout(() => {
        setIsSubmitting(false)
        onSave?.()
      }, 500)
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all prescription data?')) {
      clearAll()
      onClear?.()
    }
  }

  const handleBack = () => {
    onBack?.()
  }

  // Help tooltips
  const helpText = {
    sphere: 'The spherical power of the lens. Positive values correct farsightedness, negative values correct nearsightedness.',
    cylinder: 'The cylindrical power of the lens. Used to correct astigmatism.',
    axis: 'The orientation of the cylinder in degrees (0-180).',
    add: 'Additional power for reading or near vision.',
    bc: 'Base curve of the lens. Affects the fit and comfort of contact lenses.',
    horizontal: 'Horizontal prism power for eye alignment.',
    vertical: 'Vertical prism power for eye alignment.',
    direction: 'Direction of the prism effect.',
    prismType: 'Type of prism correction applied.',
    slabOff: 'Slab off prism to correct vertical imbalance.'
  }

  return (
    <div className="pic-prescription-form">
      <div className="pic-form-content">
        {/* Header */}
        <div className="pic-form-header flex items-center justify-between mb-6">
          <div className="pic-header-content">
            <h1 className="pic-form-title text-2xl font-bold text-gray-900 dark:text-white">
              Prescription Detail
            </h1>
            <p className="pic-form-subtitle text-gray-600 dark:text-gray-400 mt-1">
              Enter the patient's prescription parameters
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="pic-quick-actions flex gap-2">
            <button
              type="button"
              onClick={copyODtoOS}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 text-sm px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              title="Copy right eye values to left eye"
            >
              <Icon name="copy" size={16} className="mr-1 text-blue-600" />
              Copy OD→OS
            </button>
            <button
              type="button"
              onClick={copyOStoOD}
              className="bg-green-50 hover:bg-green-100 border border-green-300 text-green-700 text-sm px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
              title="Copy left eye values to right eye"
            >
              <Icon name="copy" size={16} className="mr-1 text-green-600" />
              Copy OS→OD
            </button>
          </div>
        </div>

        {/* Refractive Correction Section */}
        <div className="pic-refractive-correction-section bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="pic-section-header px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="pic-section-title text-lg font-semibold text-gray-900 dark:text-white">
              Refractive Correction <span className="text-red-500">*</span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Parameter Labels */}
              <div className="lg:col-span-1">
                <div className="h-10"></div> {/* Spacer for header */}
                <div className="space-y-4">
                  <div className="h-10 flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sphere</span>
                    <button
                      type="button"
                      onClick={() => setShowHelp(showHelp === 'sphere' ? null : 'sphere')}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="help-circle" size={16} />
                    </button>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cylinder</span>
                    <button
                      type="button"
                      onClick={() => setShowHelp(showHelp === 'cylinder' ? null : 'cylinder')}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Icon name="help-circle" size={16} />
                    </button>
                  </div>
                  <div className="h-10 flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Axis</span>
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
              <div className="lg:col-span-2">
                <div className="h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border border-blue-200 dark:border-blue-800">
                  <Icon name="eye" size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Right Eye (OD)</span>
                </div>
                <div className="space-y-4 border border-blue-200 dark:border-blue-800 rounded-b-lg p-4">
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odSphere}
                      onChange={(e) => handleInputChange('odSphere', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.odSphere ? 'border-red-500' : 'border-blue-300'}`}
                    >
                      <option value="">Select Sphere</option>
                      {sphereOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.odSphere && (
                      <p className="mt-1 text-sm text-red-600">{errors.odSphere}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odCylinder}
                      onChange={(e) => handleInputChange('odCylinder', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.odCylinder ? 'border-red-500' : 'border-blue-300'}`}
                    >
                      <option value="">Select Cylinder</option>
                      {cylinderOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.odCylinder && (
                      <p className="mt-1 text-sm text-red-600">{errors.odCylinder}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odAxis}
                      onChange={(e) => handleInputChange('odAxis', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.odAxis ? 'border-red-500' : 'border-blue-300'}`}
                    >
                      <option value="">Select Axis</option>
                      {axisOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.odAxis && (
                      <p className="mt-1 text-sm text-red-600">{errors.odAxis}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odAdd}
                      onChange={(e) => handleInputChange('odAdd', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.odAdd ? 'border-red-500' : 'border-blue-300'}`}
                    >
                      <option value="">Select Add</option>
                      {addOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.odAdd && (
                      <p className="mt-1 text-sm text-red-600">{errors.odAdd}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odBC}
                      onChange={(e) => handleInputChange('odBC', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.odBC ? 'border-red-500' : 'border-blue-300'}`}
                    >
                      <option value="">Select BC</option>
                      {bcOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.odBC && (
                      <p className="mt-1 text-sm text-red-600">{errors.odBC}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* OS (Left Eye) - Green theme */}
              <div className="lg:col-span-2">
                <div className="h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-t-lg border border-green-200 dark:border-green-800">
                  <Icon name="eye" size={16} className="text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Left Eye (OS)</span>
                </div>
                <div className="space-y-4 border border-green-200 dark:border-green-800 rounded-b-lg p-4">
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osSphere}
                      onChange={(e) => handleInputChange('osSphere', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.osSphere ? 'border-red-500' : 'border-green-300'}`}
                    >
                      <option value="">Select Sphere</option>
                      {sphereOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.osSphere && (
                      <p className="mt-1 text-sm text-red-600">{errors.osSphere}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osCylinder}
                      onChange={(e) => handleInputChange('osCylinder', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.osCylinder ? 'border-red-500' : 'border-green-300'}`}
                    >
                      <option value="">Select Cylinder</option>
                      {cylinderOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.osCylinder && (
                      <p className="mt-1 text-sm text-red-600">{errors.osCylinder}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osAxis}
                      onChange={(e) => handleInputChange('osAxis', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.osAxis ? 'border-red-500' : 'border-green-300'}`}
                    >
                      <option value="">Select Axis</option>
                      {axisOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.osAxis && (
                      <p className="mt-1 text-sm text-red-600">{errors.osAxis}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osAdd}
                      onChange={(e) => handleInputChange('osAdd', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.osAdd ? 'border-red-500' : 'border-green-300'}`}
                    >
                      <option value="">Select Add</option>
                      {addOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.osAdd && (
                      <p className="mt-1 text-sm text-red-600">{errors.osAdd}</p>
                    )}
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osBC}
                      onChange={(e) => handleInputChange('osBC', e.target.value)}
                      className={`form-select w-full border rounded-md pl-2.5 ${errors.osBC ? 'border-red-500' : 'border-green-300'}`}
                    >
                      <option value="">Select BC</option>
                      {bcOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.osBC && (
                      <p className="mt-1 text-sm text-red-600">{errors.osBC}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Help Tooltip */}
            {showHelp && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {helpText[showHelp as keyof typeof helpText]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Prism Correction Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prism Correction <span className="text-red-500">*</span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
              <div className="lg:col-span-2">
                <div className="h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border border-blue-200 dark:border-blue-800">
                  <Icon name="eye" size={16} className="text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Right Eye (OD)</span>
                </div>
                <div className="space-y-4 border border-blue-200 dark:border-blue-800 rounded-b-lg p-4">
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odHorizontal}
                      onChange={(e) => handleInputChange('odHorizontal', e.target.value)}
                      className="form-select w-full border border-blue-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Horizontal</option>
                      {sphereOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odHorizontalDirection}
                      onChange={(e) => handleInputChange('odHorizontalDirection', e.target.value)}
                      className="form-select w-full border border-blue-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Direction</option>
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odVertical}
                      onChange={(e) => handleInputChange('odVertical', e.target.value)}
                      className="form-select w-full border border-blue-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Vertical</option>
                      {axisOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odVerticalDirection}
                      onChange={(e) => handleInputChange('odVerticalDirection', e.target.value)}
                      className="form-select w-full border border-blue-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Direction</option>
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.odPrismType}
                      onChange={(e) => handleInputChange('odPrismType', e.target.value)}
                      className="form-select w-full border border-blue-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Prism Type</option>
                      {prismTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* OS (Left Eye) - Green theme */}
              <div className="lg:col-span-2">
                <div className="h-10 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-t-lg border border-green-200 dark:border-green-800">
                  <Icon name="eye" size={16} className="text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Left Eye (OS)</span>
                </div>
                <div className="space-y-4 border border-green-200 dark:border-green-800 rounded-b-lg p-4">
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osHorizontal}
                      onChange={(e) => handleInputChange('osHorizontal', e.target.value)}
                      className="form-select w-full border border-green-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Horizontal</option>
                      {sphereOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osHorizontalDirection}
                      onChange={(e) => handleInputChange('osHorizontalDirection', e.target.value)}
                      className="form-select w-full border border-green-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Direction</option>
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osVertical}
                      onChange={(e) => handleInputChange('osVertical', e.target.value)}
                      className="form-select w-full border border-green-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Vertical</option>
                      {axisOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osVerticalDirection}
                      onChange={(e) => handleInputChange('osVerticalDirection', e.target.value)}
                      className="form-select w-full border border-green-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Direction</option>
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="h-10 flex items-center">
                    <select
                      value={formData.osPrismType}
                      onChange={(e) => handleInputChange('osPrismType', e.target.value)}
                      className="form-select w-full border border-green-300 rounded-md pl-2.5"
                    >
                      <option value="">Select Prism Type</option>
                      {prismTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slab Off Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Slab Off <span className="text-red-500">*</span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slab Off
              </label>
                              <select
                  value={formData.slabOff}
                  onChange={(e) => handleInputChange('slabOff', e.target.value)}
                  className="form-select w-full border border-gray-300 rounded-md pl-2.5"
                >
                <option value="">Select Slab Off</option>
                {slabOffOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="btn-danger flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Icon name="x" size={16} />
              Clear Form
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <Icon name="save" size={16} />
              Save
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Icon name="arrow-left" size={16} />
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="loader-2" size={16} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <Icon name="arrow-right" size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
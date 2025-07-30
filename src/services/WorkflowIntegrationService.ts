// Workflow Integration Service for M.I.L.A.
// Handles form validation, auto-save, progress tracking, and smart navigation

export interface WorkflowStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  isRequired: boolean
  validationRules: ValidationRule[]
  dependencies: string[] // IDs of steps that must be completed first
}

export interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'length' | 'custom'
  message: string
  validator?: (value: any) => boolean
}

export interface WorkflowProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  progressPercentage: number
  estimatedTimeRemaining: number // in minutes
}

export interface AutoSaveData {
  formId: string
  formType: string
  stepData: Record<string, any>
  lastSaved: Date
  version: number
}

export interface SmartNavigation {
  nextStep: string
  previousStep: string
  skipToStep?: string
  reason: string
  confidence: number
}

export class WorkflowIntegrationService {
  private static workflows: Map<string, WorkflowStep[]> = new Map()
  private static autoSaveData: Map<string, AutoSaveData> = new Map()
  private static progressData: Map<string, WorkflowProgress> = new Map()

  // Initialize workflow for a form type
  static initializeWorkflow(formType: string): WorkflowStep[] {
    let workflow: WorkflowStep[] = []

    switch (formType) {
      case 'HEDIS':
        workflow = [
          {
            id: 'patient_search',
            title: 'Patient Search',
            description: 'Find and select the patient for screening',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'patientId', type: 'required', message: 'Patient ID is required' }
            ],
            dependencies: []
          },
          {
            id: 'screening_details',
            title: 'Screening Details',
            description: 'Enter screening information and diagnosis codes',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'diagnosis', type: 'required', message: 'Diagnosis code is required' },
              { field: 'screeningDate', type: 'required', message: 'Screening date is required' },
              { field: 'provider', type: 'required', message: 'Provider information is required' }
            ],
            dependencies: ['patient_search']
          },
          {
            id: 'retinal_images',
            title: 'Retinal Images',
            description: 'Upload and review retinal images',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'leftEyeImage', type: 'required', message: 'Left eye image is required' },
              { field: 'rightEyeImage', type: 'required', message: 'Right eye image is required' }
            ],
            dependencies: ['screening_details']
          },
          {
            id: 'review_submit',
            title: 'Review & Submit',
            description: 'Review all information and submit the screening',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'confirmation', type: 'required', message: 'Please confirm all information is correct' }
            ],
            dependencies: ['retinal_images']
          }
        ]
        break

      case 'ClaimsSubmission':
        workflow = [
          {
            id: 'patient_info',
            title: 'Patient Information',
            description: 'Enter patient demographics and insurance',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'patientName', type: 'required', message: 'Patient name is required' },
              { field: 'dateOfBirth', type: 'required', message: 'Date of birth is required' },
              { field: 'insuranceId', type: 'required', message: 'Insurance ID is required' }
            ],
            dependencies: []
          },
          {
            id: 'service_details',
            title: 'Service Details',
            description: 'Enter service codes and descriptions',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'procedureCodes', type: 'required', message: 'At least one procedure code is required' },
              { field: 'diagnosisCodes', type: 'required', message: 'At least one diagnosis code is required' }
            ],
            dependencies: ['patient_info']
          },
          {
            id: 'billing_info',
            title: 'Billing Information',
            description: 'Enter provider and billing details',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'providerNPI', type: 'required', message: 'Provider NPI is required' },
              { field: 'serviceDate', type: 'required', message: 'Service date is required' }
            ],
            dependencies: ['service_details']
          },
          {
            id: 'review_submit',
            title: 'Review & Submit',
            description: 'Review claim and submit',
            isCompleted: false,
            isRequired: true,
            validationRules: [
              { field: 'confirmation', type: 'required', message: 'Please confirm claim information' }
            ],
            dependencies: ['billing_info']
          }
        ]
        break

      default:
        workflow = []
    }

    this.workflows.set(formType, workflow)
    return workflow
  }

  // Validate current step
  static validateStep(formType: string, stepId: string, formData: Record<string, any>): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const workflow = this.workflows.get(formType)
    if (!workflow) {
      return { isValid: false, errors: ['Workflow not found'], warnings: [] }
    }

    const step = workflow.find(s => s.id === stepId)
    if (!step) {
      return { isValid: false, errors: ['Step not found'], warnings: [] }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Check dependencies
    const dependencyErrors = this.checkDependencies(workflow, stepId)
    errors.push(...dependencyErrors)

    // Validate fields
    step.validationRules.forEach(rule => {
      const value = formData[rule.field]
      const isValid = this.validateField(rule, value)
      
      if (!isValid) {
        errors.push(rule.message)
      }
    })

    // Check for warnings (non-critical issues)
    warnings.push(...this.generateWarnings(formData, step))

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Check step dependencies
  private static checkDependencies(workflow: WorkflowStep[], stepId: string): string[] {
    const step = workflow.find(s => s.id === stepId)
    if (!step) return ['Step not found']

    const errors: string[] = []
    
    step.dependencies.forEach(depId => {
      const depStep = workflow.find(s => s.id === depId)
      if (depStep && !depStep.isCompleted) {
        errors.push(`Step "${depStep.title}" must be completed first`)
      }
    })

    return errors
  }

  // Validate individual field
  private static validateField(rule: ValidationRule, value: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== ''
      
      case 'format':
        if (rule.field === 'npi') {
          return /^\d{10}$/.test(value)
        }
        if (rule.field === 'icd') {
          return /^[A-Z]\d{2}\.\d{1,2}$/.test(value)
        }
        if (rule.field === 'cpt') {
          return /^\d{5}$/.test(value)
        }
        return true
      
      case 'length':
        if (rule.field === 'phone') {
          return value && value.replace(/\D/g, '').length === 10
        }
        return true
      
      case 'custom':
        return rule.validator ? rule.validator(value) : true
      
      default:
        return true
    }
  }

  // Generate warnings for non-critical issues
  private static generateWarnings(formData: Record<string, any>, step: WorkflowStep): string[] {
    const warnings: string[] = []

    // Check for common issues
    if (step.id === 'screening_details' && formData.diagnosis) {
      if (!formData.procedureCodes || formData.procedureCodes.length === 0) {
        warnings.push('Consider adding procedure codes for this diagnosis')
      }
    }

    if (step.id === 'retinal_images') {
      if (formData.leftEyeImage && !formData.rightEyeImage) {
        warnings.push('Right eye image is missing')
      }
      if (formData.rightEyeImage && !formData.leftEyeImage) {
        warnings.push('Left eye image is missing')
      }
    }

    return warnings
  }

  // Auto-save functionality
  static autoSave(formId: string, formType: string, stepData: Record<string, any>): void {
    const autoSaveData: AutoSaveData = {
      formId,
      formType,
      stepData,
      lastSaved: new Date(),
      version: this.getNextVersion(formId)
    }

    this.autoSaveData.set(formId, autoSaveData)
    
    // Also save to localStorage for persistence
    localStorage.setItem(`autosave_${formId}`, JSON.stringify(autoSaveData))
  }

  // Load auto-saved data
  static loadAutoSave(formId: string): AutoSaveData | null {
    // Check memory first
    const memoryData = this.autoSaveData.get(formId)
    if (memoryData) return memoryData

    // Check localStorage
    const localStorageData = localStorage.getItem(`autosave_${formId}`)
    if (localStorageData) {
      try {
        const data = JSON.parse(localStorageData)
        this.autoSaveData.set(formId, data)
        return data
      } catch (error) {
        console.warn('Failed to parse auto-save data:', error)
      }
    }

    return null
  }

  // Get next version number for auto-save
  private static getNextVersion(formId: string): number {
    const existing = this.autoSaveData.get(formId)
    return existing ? existing.version + 1 : 1
  }

  // Track workflow progress
  static updateProgress(formId: string, currentStep: number, completedSteps: string[]): WorkflowProgress {
    const workflow = this.workflows.get(formId) || []
    const totalSteps = workflow.length
    const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100)
    
    // Estimate time remaining based on average time per step
    const averageTimePerStep = 3 // minutes
    const remainingSteps = totalSteps - completedSteps.length
    const estimatedTimeRemaining = remainingSteps * averageTimePerStep

    const progress: WorkflowProgress = {
      currentStep,
      totalSteps,
      completedSteps,
      progressPercentage,
      estimatedTimeRemaining
    }

    this.progressData.set(formId, progress)
    return progress
  }

  // Smart navigation suggestions
  static getSmartNavigation(
    formType: string,
    currentStep: string,
    formData: Record<string, any>
  ): SmartNavigation {
    const workflow = this.workflows.get(formType)
    if (!workflow) {
      return {
        nextStep: '',
        previousStep: '',
        reason: 'Workflow not found',
        confidence: 0
      }
    }

    const currentStepIndex = workflow.findIndex(s => s.id === currentStep)
    if (currentStepIndex === -1) {
      return {
        nextStep: '',
        previousStep: '',
        reason: 'Current step not found',
        confidence: 0
      }
    }

    const currentStepData = workflow[currentStepIndex]
    const validation = this.validateStep(formType, currentStep, formData)

    // Determine next step
    let nextStep = ''
    let reason = ''
    let confidence = 0.5

    if (validation.isValid) {
      // Can proceed to next step
      if (currentStepIndex < workflow.length - 1) {
        nextStep = workflow[currentStepIndex + 1].id
        reason = 'Current step is valid, proceeding to next step'
        confidence = 0.9
      } else {
        reason = 'All steps completed'
        confidence = 1.0
      }
    } else {
      // Cannot proceed due to validation errors
      reason = `Cannot proceed: ${validation.errors.join(', ')}`
      confidence = 0.1
    }

    // Determine previous step
    const previousStep = currentStepIndex > 0 ? workflow[currentStepIndex - 1].id : ''

    // Check for skip opportunities
    let skipToStep: string | undefined
    if (validation.isValid && this.canSkipStep(workflow, currentStepIndex, formData)) {
      skipToStep = this.findNextRequiredStep(workflow, currentStepIndex)
      if (skipToStep) {
        reason += ' - Optional step can be skipped'
        confidence = 0.8
      }
    }

    return {
      nextStep,
      previousStep,
      skipToStep,
      reason,
      confidence
    }
  }

  // Check if current step can be skipped
  private static canSkipStep(workflow: WorkflowStep[], currentIndex: number, formData: Record<string, any>): boolean {
    const step = workflow[currentIndex]
    if (!step) return false

    // Check if step is optional
    if (!step.isRequired) {
      // Check if all required fields are empty
      const hasRequiredData = step.validationRules.some(rule => {
        if (rule.type === 'required') {
          const value = formData[rule.field]
          return value !== undefined && value !== null && value !== ''
        }
        return false
      })

      return !hasRequiredData
    }

    return false
  }

  // Find next required step
  private static findNextRequiredStep(workflow: WorkflowStep[], currentIndex: number): string | undefined {
    for (let i = currentIndex + 1; i < workflow.length; i++) {
      if (workflow[i].isRequired) {
        return workflow[i].id
      }
    }
    return undefined
  }

  // Get workflow analytics
  static getWorkflowAnalytics(formType: string): {
    averageCompletionTime: number
    commonErrors: Array<{field: string, error: string, count: number}>
    stepCompletionRates: Record<string, number>
  } {
    // This would integrate with actual analytics data
    // For now, return mock data
    return {
      averageCompletionTime: 15, // minutes
      commonErrors: [
        { field: 'npi', error: 'Invalid NPI format', count: 25 },
        { field: 'icd', error: 'Invalid ICD-10 format', count: 18 },
        { field: 'cpt', error: 'Invalid CPT code', count: 12 }
      ],
      stepCompletionRates: {
        'patient_search': 0.95,
        'screening_details': 0.88,
        'retinal_images': 0.92,
        'review_submit': 0.98
      }
    }
  }

  // Clear all data for testing
  static clearAllData(): void {
    this.workflows.clear()
    this.autoSaveData.clear()
    this.progressData.clear()
    
    // Clear localStorage auto-save data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('autosave_')) {
        localStorage.removeItem(key)
      }
    })
  }
} 
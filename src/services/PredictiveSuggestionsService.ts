// Predictive Suggestions Service for M.I.L.A.
// Anticipates user needs based on context, form state, and user behavior

export interface PredictiveSuggestion {
  id: string
  type: 'code' | 'term' | 'field' | 'workflow' | 'provider' | 'eligibility'
  title: string
  description: string
  confidence: number // 0-1
  context: {
    formType?: string
    currentField?: string
    currentStep?: number
    userHistory?: string[]
    timeOfDay?: string
  }
  action: {
    type: 'search' | 'fill' | 'navigate' | 'explain'
    data?: any
  }
  priority: 'high' | 'medium' | 'low'
}

export interface UserBehavior {
  formType: string
  fieldName: string
  action: 'focus' | 'input' | 'search' | 'error'
  timestamp: Date
  value?: string
  error?: string
}

export interface FormContext {
  formType: string
  currentStep: number
  currentField: string
  completedFields: string[]
  formData: Record<string, any>
  userHistory: UserBehavior[]
}

export class PredictiveSuggestionsService {
  private static userBehaviorHistory: UserBehavior[] = []
  private static formContexts: Map<string, FormContext> = new Map()
  private static suggestionCache: Map<string, PredictiveSuggestion[]> = new Map()

  // Track user behavior for learning patterns
  static trackUserBehavior(behavior: UserBehavior): void {
    this.userBehaviorHistory.push(behavior)
    
    // Keep only last 100 behaviors to prevent memory bloat
    if (this.userBehaviorHistory.length > 100) {
      this.userBehaviorHistory = this.userBehaviorHistory.slice(-100)
    }

    // Update form context
    this.updateFormContext(behavior)
  }

  // Update form context based on user behavior
  private static updateFormContext(behavior: UserBehavior): void {
    const contextKey = `${behavior.formType}_${behavior.fieldName}`
    let context = this.formContexts.get(contextKey)
    
    if (!context) {
      context = {
        formType: behavior.formType,
        currentStep: 1,
        currentField: behavior.fieldName,
        completedFields: [],
        formData: {},
        userHistory: []
      }
    }

    context.userHistory.push(behavior)
    context.currentField = behavior.fieldName
    
    if (behavior.action === 'input' && behavior.value) {
      context.formData[behavior.fieldName] = behavior.value
    }
    
    if (behavior.action === 'focus') {
      context.completedFields = context.completedFields.filter(f => f !== behavior.fieldName)
    }

    this.formContexts.set(contextKey, context)
  }

  // Generate predictive suggestions based on current context
  static async generatePredictiveSuggestions(
    formType: string,
    currentField: string,
    currentStep: number,
    formData: Record<string, any> = {}
  ): Promise<PredictiveSuggestion[]> {
    const contextKey = `${formType}_${currentField}`
    const context = this.formContexts.get(contextKey)
    
    // Check cache first
    const cacheKey = `${contextKey}_${currentStep}_${JSON.stringify(formData)}`
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey)!
    }

    const suggestions: PredictiveSuggestion[] = []

    // 1. Field-specific suggestions
    suggestions.push(...await this.getFieldSpecificSuggestions(formType, currentField, formData))

    // 2. Workflow-based suggestions
    suggestions.push(...await this.getWorkflowBasedSuggestions(formType, currentStep, formData))

    // 3. User pattern-based suggestions
    suggestions.push(...await this.getPatternBasedSuggestions(context))

    // 4. Time-based suggestions
    suggestions.push(...await this.getTimeBasedSuggestions())

    // 5. Error prevention suggestions
    suggestions.push(...await this.getErrorPreventionSuggestions(formType, currentField, formData))

    // Sort by confidence and priority
    suggestions.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (b.priority === 'high' && a.priority !== 'high') return 1
      return b.confidence - a.confidence
    })

    // Cache results
    this.suggestionCache.set(cacheKey, suggestions)
    
    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  // Field-specific predictive suggestions
  private static async getFieldSpecificSuggestions(
    formType: string,
    fieldName: string,
    formData: Record<string, any>
  ): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = []

    switch (fieldName.toLowerCase()) {
      case 'diagnosis':
      case 'icd':
        suggestions.push({
          id: 'diabetes_codes',
          type: 'code',
          title: 'Common Diabetes Codes',
          description: 'Based on your form type, here are frequently used diabetes diagnosis codes',
          confidence: 0.9,
          context: { formType, currentField: fieldName },
          action: {
            type: 'search',
            data: { query: 'diabetes codes', category: 'ICD10' }
          },
          priority: 'high'
        })
        break

      case 'procedure':
      case 'cpt':
        suggestions.push({
          id: 'retinal_procedures',
          type: 'code',
          title: 'Retinal Imaging Procedures',
          description: 'Common retinal imaging procedures for diabetic eye care',
          confidence: 0.85,
          context: { formType, currentField: fieldName },
          action: {
            type: 'search',
            data: { query: 'retinal imaging', category: 'CPT' }
          },
          priority: 'high'
        })
        break

      case 'provider':
      case 'npi':
        suggestions.push({
          id: 'endocrinologists',
          type: 'provider',
          title: 'Endocrinologists Near You',
          description: 'Find endocrinologists specializing in diabetes care',
          confidence: 0.8,
          context: { formType, currentField: fieldName },
          action: {
            type: 'search',
            data: { specialty: 'Endocrinology', location: 'current' }
          },
          priority: 'medium'
        })
        break

      case 'insurance':
      case 'eligibility':
        suggestions.push({
          id: 'eligibility_check',
          type: 'eligibility',
          title: 'Check Insurance Eligibility',
          description: 'Verify patient insurance coverage for this service',
          confidence: 0.9,
          context: { formType, currentField: fieldName },
          action: {
            type: 'search',
            data: { service: 'eligibility verification' }
          },
          priority: 'high'
        })
        break
    }

    return suggestions
  }

  // Workflow-based predictive suggestions
  private static async getWorkflowBasedSuggestions(
    formType: string,
    currentStep: number,
    formData: Record<string, any>
  ): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = []

    if (formType === 'HEDIS') {
      switch (currentStep) {
        case 1: // Patient Search
          suggestions.push({
            id: 'patient_search_tips',
            type: 'workflow',
            title: 'Patient Search Tips',
            description: 'Use patient name, DOB, or member ID for faster search',
            confidence: 0.8,
            context: { formType, currentStep },
            action: { type: 'explain', data: { topic: 'patient_search_tips' } },
            priority: 'medium'
          })
          break

        case 2: // Screening Details
          if (formData.diagnosis) {
            suggestions.push({
              id: 'related_procedures',
              type: 'code',
              title: 'Related Procedures',
              description: 'Common procedures for this diagnosis',
              confidence: 0.85,
              context: { formType, currentStep },
              action: {
                type: 'search',
                data: { diagnosis: formData.diagnosis, category: 'CPT' }
              },
              priority: 'high'
            })
          }
          break

        case 3: // Retinal Images
          suggestions.push({
            id: 'retinal_codes',
            type: 'code',
            title: 'Retinal Imaging Codes',
            description: 'Common codes for retinal photography and imaging',
            confidence: 0.9,
            context: { formType, currentStep },
            action: {
              type: 'search',
              data: { query: 'retinal photography', category: 'CPT' }
            },
            priority: 'high'
          })
          break

        case 4: // Review & Submit
          suggestions.push({
            id: 'final_validation',
            type: 'workflow',
            title: 'Final Validation Checklist',
            description: 'Ensure all required fields are complete before submission',
            confidence: 0.95,
            context: { formType, currentStep },
            action: { type: 'explain', data: { topic: 'validation_checklist' } },
            priority: 'high'
          })
          break
      }
    }

    return suggestions
  }

  // Pattern-based suggestions from user behavior
  private static async getPatternBasedSuggestions(context?: FormContext): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = []

    if (!context) return suggestions

    // Analyze user patterns
    const recentBehaviors = context.userHistory.slice(-10)
    const searchPatterns = recentBehaviors.filter(b => b.action === 'search')
    const errorPatterns = recentBehaviors.filter(b => b.action === 'error')

    // Suggest based on frequent searches
    if (searchPatterns.length > 0) {
      const commonSearches = this.getCommonSearches(searchPatterns)
      commonSearches.forEach(search => {
        suggestions.push({
          id: `frequent_search_${search}`,
          type: 'code',
          title: `Frequently Used: ${search}`,
          description: `You often search for ${search} - here's quick access`,
          confidence: 0.7,
          context: { formType: context.formType },
          action: { type: 'search', data: { query: search } },
          priority: 'medium'
        })
      })
    }

    // Suggest based on common errors
    if (errorPatterns.length > 0) {
      const commonErrors = this.getCommonErrors(errorPatterns)
      commonErrors.forEach(error => {
        suggestions.push({
          id: `error_prevention_${error.field}`,
          type: 'field',
          title: `Prevent Common Error: ${error.field}`,
          description: `Common issue with ${error.field} - here's the correct format`,
          confidence: 0.8,
          context: { formType: context.formType },
          action: { type: 'explain', data: { topic: `error_prevention_${error.field}` } },
          priority: 'high'
        })
      })
    }

    return suggestions
  }

  // Time-based suggestions
  private static async getTimeBasedSuggestions(): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = []
    const hour = new Date().getHours()

    // Morning suggestions (8-11 AM)
    if (hour >= 8 && hour < 11) {
      suggestions.push({
        id: 'morning_workflow',
        type: 'workflow',
        title: 'Morning Workflow Optimization',
        description: 'Start your day efficiently with these common morning tasks',
        confidence: 0.6,
        context: { timeOfDay: 'morning' },
        action: { type: 'explain', data: { topic: 'morning_workflow' } },
        priority: 'medium'
      })
    }

    // Afternoon suggestions (2-5 PM)
    if (hour >= 14 && hour < 17) {
      suggestions.push({
        id: 'afternoon_review',
        type: 'workflow',
        title: 'Afternoon Review',
        description: 'Review and complete pending screenings from this morning',
        confidence: 0.7,
        context: { timeOfDay: 'afternoon' },
        action: { type: 'explain', data: { topic: 'afternoon_review' } },
        priority: 'medium'
      })
    }

    return suggestions
  }

  // Error prevention suggestions
  private static async getErrorPreventionSuggestions(
    formType: string,
    currentField: string,
    formData: Record<string, any>
  ): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = []

    // Common validation errors
    const validationRules = this.getValidationRules(formType, currentField)
    validationRules.forEach(rule => {
      suggestions.push({
        id: `validation_${rule.field}`,
        type: 'field',
        title: `Validation: ${rule.field}`,
        description: rule.message,
        confidence: 0.9,
        context: { formType, currentField },
        action: { type: 'explain', data: { topic: `validation_${rule.field}` } },
        priority: 'high'
      })
    })

    return suggestions
  }

  // Helper methods
  private static getCommonSearches(behaviors: UserBehavior[]): string[] {
    const searchCounts: Record<string, number> = {}
    behaviors.forEach(b => {
      if (b.value) {
        searchCounts[b.value] = (searchCounts[b.value] || 0) + 1
      }
    })
    return Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([search]) => search)
  }

  private static getCommonErrors(behaviors: UserBehavior[]): Array<{field: string, error: string}> {
    const errorCounts: Record<string, number> = {}
    behaviors.forEach(b => {
      if (b.error) {
        errorCounts[b.error] = (errorCounts[b.error] || 0) + 1
      }
    })
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([error]) => ({ field: 'unknown', error }))
  }

  private static getValidationRules(formType: string, fieldName: string): Array<{field: string, message: string}> {
    const rules: Array<{field: string, message: string}> = []

    switch (fieldName.toLowerCase()) {
      case 'npi':
        rules.push({
          field: 'NPI',
          message: 'NPI must be exactly 10 digits'
        })
        break
      case 'icd':
        rules.push({
          field: 'ICD-10',
          message: 'ICD-10 codes must be in format X00.00'
        })
        break
      case 'cpt':
        rules.push({
          field: 'CPT',
          message: 'CPT codes must be 5 digits'
        })
        break
    }

    return rules
  }

  // Clear cache and history for testing
  static clearCache(): void {
    this.suggestionCache.clear()
    this.userBehaviorHistory = []
    this.formContexts.clear()
  }
} 
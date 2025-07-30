// Proactive Suggestions Service for M.I.L.A. - Anticipates user needs and provides helpful suggestions
import PersonalizationService from './PersonalizationService'
import MedicalSpecialtiesService from './MedicalSpecialtiesService'

export interface ProactiveSuggestion {
  id: string
  type: 'contextual' | 'predictive' | 'educational' | 'reminder'
  title: string
  content: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  category: string
  icon?: string
  timestamp?: Date
}

export interface SuggestionContext {
  currentForm?: string
  currentField?: string
  currentStep?: number
  userInput?: string
  recentQueries?: string[]
  timeOfDay?: 'morning' | 'afternoon' | 'evening'
  userExperience?: 'new' | 'experienced' | 'expert'
}

class ProactiveSuggestionsService {
  private static readonly SUGGESTION_TRIGGERS = {
    FORM_FIELD_FOCUS: 'field_focus',
    FORM_COMPLETION: 'form_completion',
    FREQUENT_ERRORS: 'frequent_errors',
    TIME_BASED: 'time_based',
    PATTERN_BASED: 'pattern_based',
    CONTEXTUAL: 'contextual'
  }

  /**
   * Get proactive suggestions based on current context
   */
  static getProactiveSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const userStats = PersonalizationService.getUserStats()
    const preferences = PersonalizationService.getUserPreferences()

    // Contextual suggestions based on current form and field
    if (context.currentForm && context.currentField) {
      suggestions.push(...this.getContextualSuggestions(context))
    }

    // Predictive suggestions based on user patterns
    suggestions.push(...this.getPredictiveSuggestions(context))

    // Educational suggestions for new users
    if (userStats.sessionCount <= 3) {
      suggestions.push(...this.getEducationalSuggestions(context))
    }

    // Time-based suggestions
    suggestions.push(...this.getTimeBasedSuggestions(context))

    // Pattern-based suggestions
    suggestions.push(...this.getPatternBasedSuggestions(context))

    // Workflow-based suggestions
    suggestions.push(...this.getWorkflowBasedSuggestions(context))

    // Error prevention and data quality suggestions
    suggestions.push(...this.getErrorPreventionSuggestions(context))

    // Advanced learning and progressive disclosure
    suggestions.push(...this.getAdvancedLearningSuggestions(context))

    // Compliance and regulatory suggestions
    suggestions.push(...this.getComplianceSuggestions(context))

    return suggestions
      .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
      .slice(0, 3) // Limit to top 3 suggestions
  }

  /**
   * Get contextual suggestions based on current form and field
   */
  private static getContextualSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    if (!context.currentForm || !context.currentField) return suggestions

    // Form-specific suggestions
    switch (context.currentForm) {
      case 'PatientEligibilityForm':
        suggestions.push(...this.getPatientEligibilitySuggestions(context.currentField))
        break

      case 'ClaimsSubmissionForm':
        suggestions.push(...this.getClaimsSubmissionSuggestions(context.currentField))
        break

      case 'NewScreeningForm':
        suggestions.push(...this.getScreeningFormSuggestions(context.currentField))
        break

      case 'PrescriptionForm':
        suggestions.push(...this.getPrescriptionFormSuggestions(context.currentField))
        break
    }

    return suggestions
  }

  /**
   * Get PatientEligibilityForm specific suggestions
   */
  private static getPatientEligibilitySuggestions(field: string): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    switch (field) {
      case 'providerId':
        suggestions.push({
          id: 'provider-verification',
          type: 'contextual',
          title: 'Provider Verification',
          content: 'I can help you verify NPI numbers in real-time using the official CMS database. Just ask me to check any provider!',
          action: 'verify_provider',
          priority: 'high',
          category: 'provider',
          icon: 'user-check'
        })
        break

      case 'subscriberId':
        suggestions.push({
          id: 'subscriber-help',
          type: 'contextual',
          title: 'Subscriber ID Help',
          content: 'This should match the member ID on the patient\'s insurance card. It\'s typically found on the front of the card.',
          action: 'explain_field',
          priority: 'medium',
          category: 'form',
          icon: 'credit-card'
        })
        break

      case 'dependantSequence':
        suggestions.push({
          id: 'dependent-sequence',
          type: 'contextual',
          title: 'Dependent Sequence',
          content: '00 = Primary Subscriber, 01 = Spouse, 02+ = Children in birth order. Need help determining the right sequence?',
          action: 'explain_field',
          priority: 'medium',
          category: 'form',
          icon: 'users'
        })
        break

      case 'lastName':
      case 'firstName':
        suggestions.push({
          id: 'name-format',
          type: 'contextual',
          title: 'Name Format',
          content: 'Enter the legal name exactly as it appears on the insurance card. This is crucial for claims processing.',
          action: 'explain_field',
          priority: 'medium',
          category: 'form',
          icon: 'user'
        })
        break

      case 'dateOfBirth':
        suggestions.push({
          id: 'date-format',
          type: 'contextual',
          title: 'Date Format',
          content: 'Use MM/DD/YYYY format (e.g., 01/15/1985). This must match the insurance card exactly.',
          action: 'explain_field',
          priority: 'medium',
          category: 'form',
          icon: 'calendar'
        })
        break

      case 'diagnosisCodes':
        suggestions.push({
          id: 'diagnosis-codes',
          type: 'contextual',
          title: 'Diagnosis Code Lookup',
          content: 'Need help finding the right ICD-10 codes? I can search our comprehensive database for you.',
          action: 'search_codes',
          priority: 'high',
          category: 'codes',
          icon: 'search'
        })
        break
    }

    return suggestions
  }

  /**
   * Get ClaimsSubmissionForm specific suggestions
   */
  private static getClaimsSubmissionSuggestions(field: string): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Eye prescription fields
    if (field.includes('Sphere') || field.includes('Cylinder') || field.includes('Axis')) {
      suggestions.push({
        id: 'eye-terminology',
        type: 'contextual',
        title: 'Eye Terminology Help',
        content: 'OD = Right Eye, OS = Left Eye, OU = Both Eyes. Negative values for myopia, positive for hyperopia.',
        action: 'explain_terminology',
        priority: 'medium',
        category: 'terminology',
        icon: 'eye'
      })
    }

    // Service date fields
    if (field.includes('Date')) {
      suggestions.push({
        id: 'service-dates',
        type: 'contextual',
        title: 'Service Date Help',
        content: 'Enter the date range when services were provided. For single-day services, use the same date for both fields.',
        action: 'explain_field',
        priority: 'medium',
        category: 'form',
        icon: 'calendar'
      })
    }

    // Diagnosis codes
    if (field.includes('diagnosisCodes')) {
      suggestions.push({
        id: 'diagnosis-codes-claims',
        type: 'contextual',
        title: 'Diagnosis Code Order',
        content: 'Start with the primary diagnosis code first, then add secondary codes. I can help you find the right codes!',
        action: 'search_codes',
        priority: 'high',
        category: 'codes',
        icon: 'list'
      })
    }

    // Lens selection fields
    if (field.includes('lens') || field.includes('material') || field.includes('coating')) {
      suggestions.push({
        id: 'lens-selection',
        type: 'contextual',
        title: 'Lens Selection Help',
        content: 'I can help you find the right lens codes, materials, and coatings for optimal patient care.',
        action: 'lens_help',
        priority: 'medium',
          category: 'lens',
          icon: 'glasses'
        })
      }

      // Frame selection fields
      if (field.includes('frame') || field.includes('size') || field.includes('bridge')) {
        suggestions.push({
          id: 'frame-selection',
          type: 'contextual',
          title: 'Frame Selection Help',
          content: 'Need help with frame measurements, lens coatings, or finding the right frame codes?',
          action: 'frame_help',
          priority: 'medium',
          category: 'frame',
          icon: 'square'
        })
      }

      return suggestions
    }

    /**
     * Get NewScreeningForm specific suggestions
     */
    private static getScreeningFormSuggestions(field: string): ProactiveSuggestion[] {
      const suggestions: ProactiveSuggestion[] = []

      // Diabetes-related fields
      if (field.includes('diabetes') || field.includes('diabetic')) {
        suggestions.push({
          id: 'diabetes-codes',
          type: 'contextual',
          title: 'Diabetes Diagnosis Codes',
          content: 'I can help you find the right diabetes diagnosis codes: E11.9, E11.21, E11.22, and more.',
          action: 'search_codes',
          priority: 'high',
          category: 'codes',
          icon: 'activity'
        })
      }

      // Ocular history fields
      if (field.includes('ocular') || field.includes('history')) {
        suggestions.push({
          id: 'ocular-history',
          type: 'contextual',
          title: 'Ocular History Help',
          content: 'Common conditions: diabetic retinopathy, glaucoma, cataracts. I can help you find the right codes.',
          action: 'search_codes',
          priority: 'medium',
          category: 'codes',
          icon: 'eye'
        })
      }

      // Retinal imaging fields
      if (field.includes('retinal') || field.includes('image')) {
        suggestions.push({
          id: 'retinal-imaging',
          type: 'contextual',
          title: 'Retinal Imaging Help',
          content: 'I can help you verify image quality requirements and find the right CPT codes for retinal photography.',
          action: 'imaging_help',
          priority: 'medium',
          category: 'imaging',
          icon: 'camera'
        })
      }

      // Practice information fields
      if (field.includes('practice') || field.includes('phone') || field.includes('fax')) {
        suggestions.push({
          id: 'practice-info',
          type: 'contextual',
          title: 'Practice Information',
          content: 'Need help finding your practice\'s NPI number or verifying contact information?',
          action: 'practice_help',
          priority: 'low',
          category: 'practice',
          icon: 'building'
        })
      }

      return suggestions
    }

    /**
     * Get PrescriptionForm specific suggestions
     */
    private static getPrescriptionFormSuggestions(field: string): ProactiveSuggestion[] {
      const suggestions: ProactiveSuggestion[] = []

      // Sphere/Cylinder fields
      if (field.includes('Sphere') || field.includes('Cylinder')) {
        suggestions.push({
          id: 'prescription-conversion',
          type: 'contextual',
          title: 'Prescription Conversion',
          content: 'I can help you convert between different prescription formats and verify your calculations.',
          action: 'prescription_help',
          priority: 'medium',
          category: 'prescription',
          icon: 'calculator'
        })
      }

      // Axis fields
      if (field.includes('Axis')) {
        suggestions.push({
          id: 'axis-help',
          type: 'contextual',
          title: 'Axis Values',
          content: 'Axis values range from 0-180 degrees. I can help you determine the correct axis for astigmatism correction.',
          action: 'explain_field',
          priority: 'medium',
          category: 'prescription',
          icon: 'compass'
        })
      }

      // Prism fields
      if (field.includes('Prism') || field.includes('Horizontal') || field.includes('Vertical')) {
        suggestions.push({
          id: 'prism-help',
          type: 'contextual',
          title: 'Prism Correction',
          content: 'I can help you calculate prism corrections and determine the right prism values for your patient.',
          action: 'prism_help',
          priority: 'medium',
          category: 'prescription',
          icon: 'triangle'
        })
      }

      // Add power fields
      if (field.includes('Add')) {
        suggestions.push({
          id: 'add-power',
          type: 'contextual',
          title: 'Add Power Help',
          content: 'Add power is typically +0.75 to +3.50 for reading glasses. I can help you determine the right value.',
          action: 'explain_field',
          priority: 'medium',
          category: 'prescription',
          icon: 'plus'
        })
      }

      return suggestions
    }

  /**
   * Get predictive suggestions based on user patterns
   */
  private static getPredictiveSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const commonQueries = PersonalizationService.getCommonQueries(3)
    const favoriteCodes = PersonalizationService.getFavoriteCodes()

    // Suggest based on common queries
    if (commonQueries.length > 0) {
      const mostCommon = commonQueries[0]
      suggestions.push({
        id: 'frequent-query',
        type: 'predictive',
        title: 'Frequently Asked',
        content: `You often ask about "${mostCommon}". Would you like me to help with that?`,
        action: 'quick_query',
        priority: 'medium',
        category: 'prediction',
        icon: 'clock'
      })
    }

    // Suggest favorite codes
    if (favoriteCodes.length > 0) {
      suggestions.push({
        id: 'favorite-codes',
        type: 'predictive',
        title: 'Your Favorite Codes',
        content: `Quick access to your frequently used codes: ${favoriteCodes.slice(0, 3).join(', ')}`,
        action: 'show_favorites',
        priority: 'medium',
        category: 'codes',
        icon: 'star'
      })
    }

    return suggestions
  }

  /**
   * Get educational suggestions for new users
   */
  private static getEducationalSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    suggestions.push({
      id: 'welcome-tip',
      type: 'educational',
      title: 'Welcome to M.I.L.A.!',
      content: 'I\'m your Medical Intelligence & Learning Assistant. I can help with codes, terminology, and form guidance.',
      action: 'show_capabilities',
      priority: 'high',
      category: 'education',
      icon: 'graduation-cap'
    })

    suggestions.push({
      id: 'quick-start',
      type: 'educational',
      title: 'Quick Start Guide',
      content: 'Try asking me about medical terms like "OD", "OS", or diagnosis codes like "diabetes".',
      action: 'quick_start',
      priority: 'medium',
      category: 'education',
      icon: 'play'
    })

    return suggestions
  }

  /**
   * Get time-based suggestions
   */
  private static getTimeBasedSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

    // Morning suggestions
    if (timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning-tip',
        type: 'reminder',
        title: 'Good Morning!',
        content: 'Ready to start your day? I\'m here to help make your medical billing tasks easier and more efficient.',
        action: 'morning_greeting',
        priority: 'low',
        category: 'time',
        icon: 'sun'
      })
    }

    // Afternoon suggestions
    if (timeOfDay === 'afternoon') {
      suggestions.push({
        id: 'afternoon-tip',
        type: 'reminder',
        title: 'Afternoon Check-in',
        content: 'How\'s your day going? Need help with any complex billing scenarios?',
        action: 'afternoon_check',
        priority: 'low',
        category: 'time',
        icon: 'clock'
      })
    }

    // Evening suggestions
    if (timeOfDay === 'evening') {
      suggestions.push({
        id: 'evening-tip',
        type: 'reminder',
        title: 'Wrapping Up',
        content: 'Great work today! I\'m here if you need any last-minute help with your billing tasks.',
        action: 'evening_wrap',
        priority: 'low',
        category: 'time',
        icon: 'moon'
      })
    }

    return suggestions
  }

  /**
   * Get pattern-based suggestions
   */
  private static getPatternBasedSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const preferences = PersonalizationService.getUserPreferences()
    const formUsage = PersonalizationService.getFormUsageStats()

    // Suggest based on specialty preferences
    if (preferences.preferredSpecialties.length > 0) {
      const specialty = preferences.preferredSpecialties[0]
      const specialtyData = MedicalSpecialtiesService.getSpecialty(specialty)
      
      if (specialtyData) {
        suggestions.push({
          id: 'specialty-tip',
          type: 'predictive',
          title: `${specialtyData.name} Tips`,
          content: `Since you work with ${specialtyData.name}, here are some common codes: ${specialtyData.commonCodes.slice(0, 3).join(', ')}`,
          action: 'specialty_codes',
          priority: 'medium',
          category: 'specialty',
          icon: 'stethoscope'
        })
      }
    }

    // Suggest based on form usage patterns
    const mostUsedForm = Object.entries(formUsage).sort(([, a], [, b]) => b - a)[0]
    if (mostUsedForm && mostUsedForm[1] > 2) {
      suggestions.push({
        id: 'form-expertise',
        type: 'predictive',
        title: 'Form Expert',
        content: `You're quite experienced with ${mostUsedForm[0]}. Need any advanced tips?`,
        action: 'form_tips',
        priority: 'low',
        category: 'form',
        icon: 'file-text'
      })
    }

    return suggestions
  }

  /**
   * Get priority score for sorting
   */
  private static getPriorityScore(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  /**
   * Check if suggestion should be shown based on context
   */
  static shouldShowSuggestion(suggestion: ProactiveSuggestion, context: SuggestionContext): boolean {
    // Don't show if user is actively typing
    if (context.userInput && context.userInput.length > 0) {
      return false
    }

    // Don't show too many suggestions at once
    const recentSuggestions = this.getRecentSuggestions()
    if (recentSuggestions.length >= 3) {
      return false
    }

    // Don't show the same suggestion repeatedly
    const hasShownRecently = recentSuggestions.some(s => s.id === suggestion.id)
    if (hasShownRecently) {
      return false
    }

    return true
  }

  /**
   * Track shown suggestions
   */
  private static getRecentSuggestions(): ProactiveSuggestion[] {
    const stored = localStorage.getItem('mila_recent_suggestions')
    if (stored) {
      const suggestions = JSON.parse(stored)
      // Filter out suggestions older than 1 hour
      return suggestions.filter((s: any) => 
        new Date(s.timestamp).getTime() > Date.now() - 60 * 60 * 1000
      )
    }
    return []
  }

  /**
   * Record a shown suggestion
   */
  static recordShownSuggestion(suggestion: ProactiveSuggestion): void {
    const recent = this.getRecentSuggestions()
    recent.push({
      ...suggestion,
      timestamp: new Date()
    })
    
    // Keep only last 10 suggestions
    if (recent.length > 10) {
      recent.splice(0, recent.length - 10)
    }
    
    localStorage.setItem('mila_recent_suggestions', JSON.stringify(recent))
  }

  /**
   * Get contextual help for current field
   */
  static getFieldHelp(formName: string, fieldName: string): string | null {
    const fieldHelpMap: Record<string, Record<string, string>> = {
      'PatientEligibilityForm': {
        'providerId': 'Enter your 10-digit NPI number. I can help verify it in real-time!',
        'subscriberId': 'Find this on the front of the patient\'s insurance card.',
        'diagnosisCodes': 'Start with the primary diagnosis code. I can help you find the right codes!',
        'dateOfBirth': 'Use MM/DD/YYYY format (e.g., 01/15/1985)'
      },
      'ClaimsSubmissionForm': {
        'odSphere': 'Right eye sphere power. Negative for myopia, positive for hyperopia.',
        'osSphere': 'Left eye sphere power. Negative for myopia, positive for hyperopia.',
        'odCylinder': 'Right eye cylinder power for astigmatism correction.',
        'osCylinder': 'Left eye cylinder power for astigmatism correction.'
      }
    }

    return fieldHelpMap[formName]?.[fieldName] || null
  }

  /**
   * Get quick actions based on context
   */
  static getQuickActions(context: SuggestionContext): string[] {
    const actions: string[] = []

    if (context.currentForm === 'PatientEligibilityForm') {
      actions.push('Verify Provider', 'Find Diagnosis Codes', 'Check Insurance')
    }

    if (context.currentForm === 'ClaimsSubmissionForm') {
      actions.push('Eye Terminology', 'Procedure Codes', 'Form Validation')
    }

    // Add general actions
    actions.push('Medical Terms', 'Code Lookup', 'Provider Search')

    return actions
  }

  /**
   * Get workflow-based suggestions for multi-step forms and cross-form consistency
   */
  private static getWorkflowBasedSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Multi-step form guidance
    if (context.currentStep && context.currentForm) {
      suggestions.push(...this.getStepTransitionSuggestions(context))
    }

    // Cross-form data consistency
    suggestions.push(...this.getDataConsistencySuggestions(context))

    // Session management
    suggestions.push(...this.getSessionManagementSuggestions(context))

    return suggestions
  }

  /**
   * Get step transition suggestions
   */
  private static getStepTransitionSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    if (!context.currentForm || !context.currentStep) return suggestions

    switch (context.currentForm) {
      case 'ClaimsSubmissionForm':
        if (context.currentStep === 1) {
          suggestions.push({
            id: 'step-1-complete',
            type: 'reminder',
            title: 'Step 1 Complete',
            content: 'Great! You\'ve completed the patient information. Next, we\'ll need diagnosis codes and service details.',
            action: 'step_guidance',
            priority: 'medium',
            category: 'workflow',
            icon: 'check-circle'
          })
        } else if (context.currentStep === 2) {
          suggestions.push({
            id: 'step-2-complete',
            type: 'reminder',
            title: 'Step 2 Complete',
            content: 'Excellent! Claim details are ready. Now let\'s move to prescription details.',
            action: 'step_guidance',
            priority: 'medium',
            category: 'workflow',
            icon: 'check-circle'
          })
        } else if (context.currentStep === 3) {
          suggestions.push({
            id: 'step-3-complete',
            type: 'reminder',
            title: 'Step 3 Complete',
            content: 'Prescription details look good! Next, we\'ll select lens options.',
            action: 'step_guidance',
            priority: 'medium',
            category: 'workflow',
            icon: 'check-circle'
          })
        }
        break

      case 'NewScreeningForm':
        if (context.currentStep === 1) {
          suggestions.push({
            id: 'screening-step-1',
            type: 'reminder',
            title: 'Screening Details',
            content: 'Patient screening information complete. Next, we\'ll handle retinal images.',
            action: 'step_guidance',
            priority: 'medium',
            category: 'workflow',
            icon: 'camera'
          })
        } else if (context.currentStep === 2) {
          suggestions.push({
            id: 'screening-step-2',
            type: 'reminder',
            title: 'Images Uploaded',
            content: 'Retinal images uploaded successfully. Ready for final review and submission.',
            action: 'step_guidance',
            priority: 'medium',
            category: 'workflow',
            icon: 'check-circle'
          })
        }
        break
    }

    return suggestions
  }

  /**
   * Get data consistency suggestions
   */
  private static getDataConsistencySuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const formUsage = PersonalizationService.getFormUsageStats()

    // Check for consistent provider usage
    if (context.currentForm && formUsage[context.currentForm] > 1) {
      suggestions.push({
        id: 'consistent-provider',
        type: 'predictive',
        title: 'Provider Consistency',
        content: 'You often use the same provider across forms. Would you like me to auto-fill provider information?',
        action: 'auto_fill_provider',
        priority: 'medium',
        category: 'consistency',
        icon: 'repeat'
      })
    }

    // Check for common diagnosis patterns
    const commonQueries = PersonalizationService.getCommonQueries(3)
    if (commonQueries.some(query => query.toLowerCase().includes('diabetes'))) {
      suggestions.push({
        id: 'diabetes-pattern',
        type: 'predictive',
        title: 'Diabetes Pattern',
        content: 'I notice you often work with diabetes cases. I can help you find the right diabetes codes quickly.',
        action: 'quick_diabetes_codes',
        priority: 'medium',
        category: 'consistency',
        icon: 'activity'
      })
    }

    return suggestions
  }

  /**
   * Get session management suggestions
   */
  private static getSessionManagementSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const userStats = PersonalizationService.getUserStats()

    // Long session warning
    if (userStats.sessionCount > 5) {
      suggestions.push({
        id: 'session-break',
        type: 'reminder',
        title: 'Take a Break',
        content: 'You\'ve been working for a while. Consider taking a short break to stay fresh!',
        action: 'session_break',
        priority: 'low',
        category: 'session',
        icon: 'coffee'
      })
    }

    // Form completion progress
    if (context.currentForm && context.currentStep) {
      const progress = (context.currentStep / 5) * 100 // Assuming 5 steps max
      if (progress >= 75) {
        suggestions.push({
          id: 'form-completion',
          type: 'reminder',
          title: 'Almost Done!',
          content: `You're ${Math.round(progress)}% through this form. Need help with the final steps?`,
          action: 'completion_help',
          priority: 'medium',
          category: 'workflow',
          icon: 'target'
        })
      }
    }

    return suggestions
  }

  /**
   * Get error prevention and data quality suggestions
   */
  private static getErrorPreventionSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Common mistakes prevention
    suggestions.push(...this.getCommonMistakesSuggestions(context))

    // Data quality suggestions
    suggestions.push(...this.getDataQualitySuggestions(context))

    // Format validation suggestions
    suggestions.push(...this.getFormatValidationSuggestions(context))

    return suggestions
  }

  /**
   * Get common mistakes prevention suggestions
   */
  private static getCommonMistakesSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // NPI validation
    if (context.currentField === 'providerId') {
      suggestions.push({
        id: 'npi-validation',
        type: 'reminder',
        title: 'NPI Format Check',
        content: 'NPI numbers must be exactly 10 digits. I can help you verify this in real-time.',
        action: 'validate_npi',
        priority: 'high',
        category: 'validation',
        icon: 'shield-check'
      })
    }

    // Date format validation
    if (context.currentField?.includes('Date') || context.currentField === 'dateOfBirth') {
      suggestions.push({
        id: 'date-format-validation',
        type: 'reminder',
        title: 'Date Format',
        content: 'Use MM/DD/YYYY format (e.g., 01/15/1985). Future dates are not allowed.',
        action: 'validate_date',
        priority: 'medium',
        category: 'validation',
        icon: 'calendar'
      })
    }

    // Required field reminders
    if (context.currentField && this.isRequiredField(context.currentForm, context.currentField)) {
      suggestions.push({
        id: 'required-field',
        type: 'reminder',
        title: 'Required Field',
        content: 'This field is required for claims processing. Make sure to fill it out completely.',
        action: 'required_field_help',
        priority: 'high',
        category: 'validation',
        icon: 'alert-circle'
      })
    }

    return suggestions
  }

  /**
   * Get data quality suggestions
   */
  private static getDataQualitySuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Duplicate entry detection
    if (context.currentField?.includes('diagnosisCodes')) {
      suggestions.push({
        id: 'duplicate-codes',
        type: 'reminder',
        title: 'Duplicate Codes',
        content: 'Make sure you haven\'t entered the same diagnosis code twice. Each code should be unique.',
        action: 'check_duplicates',
        priority: 'medium',
        category: 'quality',
        icon: 'copy'
      })
    }

    // Inconsistent data detection
    if (context.currentField?.includes('Sphere') || context.currentField?.includes('Cylinder')) {
      suggestions.push({
        id: 'prescription-consistency',
        type: 'reminder',
        title: 'Prescription Consistency',
        content: 'Check that your sphere and cylinder values are consistent. I can help you verify the calculations.',
        action: 'verify_prescription',
        priority: 'medium',
        category: 'quality',
        icon: 'calculator'
      })
    }

    // Phone number format
    if (context.currentField?.includes('phone') || context.currentField?.includes('Phone')) {
      suggestions.push({
        id: 'phone-format',
        type: 'reminder',
        title: 'Phone Number Format',
        content: 'Use (XXX) XXX-XXXX format for phone numbers. This ensures proper formatting.',
        action: 'format_phone',
        priority: 'low',
        category: 'quality',
        icon: 'phone'
      })
    }

    return suggestions
  }

  /**
   * Get format validation suggestions
   */
  private static getFormatValidationSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Email format validation
    if (context.currentField?.includes('email') || context.currentField?.includes('Email')) {
      suggestions.push({
        id: 'email-format',
        type: 'reminder',
        title: 'Email Format',
        content: 'Please use a valid email format (e.g., user@domain.com). This is required for communications.',
        action: 'validate_email',
        priority: 'medium',
        category: 'validation',
        icon: 'mail'
      })
    }

    // Fax number format
    if (context.currentField?.includes('fax') || context.currentField?.includes('Fax')) {
      suggestions.push({
        id: 'fax-format',
        type: 'reminder',
        title: 'Fax Number Format',
        content: 'Use (XXX) XXX-XXXX format for fax numbers. Include area code.',
        action: 'format_fax',
        priority: 'low',
        category: 'validation',
        icon: 'printer'
      })
    }

    // ZIP code format
    if (context.currentField?.includes('zip') || context.currentField?.includes('ZIP')) {
      suggestions.push({
        id: 'zip-format',
        type: 'reminder',
        title: 'ZIP Code Format',
        content: 'Use 5-digit ZIP code format (e.g., 12345) or 9-digit format (e.g., 12345-6789).',
        action: 'format_zip',
        priority: 'low',
        category: 'validation',
        icon: 'map-pin'
      })
    }

    return suggestions
  }

  /**
   * Check if a field is required
   */
  private static isRequiredField(formName?: string, fieldName?: string): boolean {
    if (!formName || !fieldName) return false

    const requiredFields: Record<string, string[]> = {
      'PatientEligibilityForm': ['providerId', 'subscriberId', 'lastName', 'firstName', 'dateOfBirth'],
      'ClaimsSubmissionForm': ['providerId', 'serviceDateFrom', 'serviceDateTo', 'diagnosisCodes'],
      'NewScreeningForm': ['dateOfScreening', 'placeOfService', 'diabetesMellitus'],
      'PrescriptionForm': ['odSphere', 'osSphere', 'odCylinder', 'osCylinder']
    }

    return requiredFields[formName]?.includes(fieldName) || false
  }

  /**
   * Get advanced learning and progressive disclosure suggestions
   */
  private static getAdvancedLearningSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []
    const userStats = PersonalizationService.getUserStats()

    // Experience-based suggestions
    suggestions.push(...this.getExperienceBasedSuggestions(userStats))

    // Progressive disclosure suggestions
    suggestions.push(...this.getProgressiveDisclosureSuggestions(context))

    // Advanced feature suggestions
    suggestions.push(...this.getAdvancedFeatureSuggestions(userStats))

    return suggestions
  }

  /**
   * Get experience-based suggestions
   */
  private static getExperienceBasedSuggestions(userStats: any): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // New users (1-3 sessions)
    if (userStats.sessionCount <= 3) {
      suggestions.push({
        id: 'new-user-tips',
        type: 'educational',
        title: 'Getting Started',
        content: 'Try asking me about medical terms like "OD", "OS", or diagnosis codes like "diabetes". I\'m here to help you learn!',
        action: 'basic_tutorial',
        priority: 'high',
        category: 'education',
        icon: 'graduation-cap'
      })
    }

    // Experienced users (4-10 sessions)
    else if (userStats.sessionCount <= 10) {
      suggestions.push({
        id: 'intermediate-tips',
        type: 'educational',
        title: 'Intermediate Features',
        content: 'I can help you with complex code combinations and advanced billing scenarios. Try asking about multiple diagnosis codes.',
        action: 'intermediate_tutorial',
        priority: 'medium',
        category: 'education',
        icon: 'zap'
      })
    }

    // Expert users (10+ sessions)
    else {
      suggestions.push({
        id: 'expert-tips',
        type: 'educational',
        title: 'Expert Features',
        content: 'Need help with advanced billing scenarios, audits, or compliance issues? I can assist with complex cases.',
        action: 'expert_tutorial',
        priority: 'medium',
        category: 'education',
        icon: 'award'
      })
    }

    return suggestions
  }

  /**
   * Get progressive disclosure suggestions
   */
  private static getProgressiveDisclosureSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Basic help for new users
    if (context.userExperience === 'new') {
      suggestions.push({
        id: 'basic-help',
        type: 'educational',
        title: 'Basic Help',
        content: 'I can explain medical terminology and help you find simple diagnosis codes.',
        action: 'basic_help',
        priority: 'high',
        category: 'education',
        icon: 'help-circle'
      })
    }

    // Intermediate help for experienced users
    else if (context.userExperience === 'experienced') {
      suggestions.push({
        id: 'intermediate-help',
        type: 'educational',
        title: 'Intermediate Help',
        content: 'I can help you find diagnosis and procedure codes, and assist with form validation.',
        action: 'intermediate_help',
        priority: 'medium',
        category: 'education',
        icon: 'search'
      })
    }

    // Advanced help for expert users
    else if (context.userExperience === 'expert') {
      suggestions.push({
        id: 'advanced-help',
        type: 'educational',
        title: 'Advanced Help',
        content: 'I can help you with complex billing scenarios, compliance issues, and advanced form features.',
        action: 'advanced_help',
        priority: 'medium',
        category: 'education',
        icon: 'settings'
      })
    }

    return suggestions
  }

  /**
   * Get advanced feature suggestions
   */
  private static getAdvancedFeatureSuggestions(userStats: any): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Suggest advanced features for experienced users
    if (userStats.sessionCount > 5) {
      suggestions.push({
        id: 'batch-processing',
        type: 'predictive',
        title: 'Batch Processing',
        content: 'You have multiple similar claims. Would you like to learn about batch processing to save time?',
        action: 'batch_processing_help',
        priority: 'medium',
        category: 'advanced',
        icon: 'layers'
      })
    }

    // Suggest templates for frequent users
    if (userStats.sessionCount > 10) {
      suggestions.push({
        id: 'template-creation',
        type: 'predictive',
        title: 'Template Creation',
        content: 'I can help you create templates for frequently used information to speed up your workflow.',
        action: 'template_help',
        priority: 'medium',
        category: 'advanced',
        icon: 'file-text'
      })
    }

    // Suggest shortcuts for power users
    if (userStats.sessionCount > 15) {
      suggestions.push({
        id: 'keyboard-shortcuts',
        type: 'predictive',
        title: 'Keyboard Shortcuts',
        content: 'Learn keyboard shortcuts to navigate forms faster. Ctrl+S to save, Ctrl+N for new forms.',
        action: 'shortcuts_help',
        priority: 'low',
        category: 'advanced',
        icon: 'keyboard'
      })
    }

    return suggestions
  }

  /**
   * Get compliance and regulatory suggestions
   */
  private static getComplianceSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // HIPAA compliance suggestions
    suggestions.push(...this.getHIPAAComplianceSuggestions(context))

    // Billing compliance suggestions
    suggestions.push(...this.getBillingComplianceSuggestions(context))

    // Documentation suggestions
    suggestions.push(...this.getDocumentationSuggestions(context))

    return suggestions
  }

  /**
   * Get HIPAA compliance suggestions
   */
  private static getHIPAAComplianceSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Data security reminders
    suggestions.push({
      id: 'hipaa-security',
      type: 'reminder',
      title: 'HIPAA Security',
      content: 'Remember to log out when sharing your screen and ensure patient information is properly secured.',
      action: 'hipaa_guidance',
      priority: 'high',
      category: 'compliance',
      icon: 'shield'
    })

    // Patient privacy reminders
    suggestions.push({
      id: 'patient-privacy',
      type: 'reminder',
      title: 'Patient Privacy',
      content: 'Make sure patient information is properly secured and only accessed by authorized personnel.',
      action: 'privacy_guidance',
      priority: 'high',
      category: 'compliance',
      icon: 'user-check'
    })

    // Session timeout reminders
    suggestions.push({
      id: 'session-timeout',
      type: 'reminder',
      title: 'Session Management',
      content: 'Consider logging out after extended periods of inactivity to maintain HIPAA compliance.',
      action: 'session_guidance',
      priority: 'medium',
      category: 'compliance',
      icon: 'clock'
    })

    return suggestions
  }

  /**
   * Get billing compliance suggestions
   */
  private static getBillingComplianceSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Documentation requirements
    suggestions.push({
      id: 'documentation-requirements',
      type: 'reminder',
      title: 'Documentation Requirements',
      content: 'Make sure you have proper documentation for this claim. Medical necessity must be clearly documented.',
      action: 'documentation_help',
      priority: 'high',
      category: 'compliance',
      icon: 'file-text'
    })

    // Modifier suggestions
    if (context.currentForm === 'ClaimsSubmissionForm') {
      suggestions.push({
        id: 'modifier-suggestions',
        type: 'reminder',
        title: 'Modifier Requirements',
        content: 'Consider adding appropriate modifiers for this procedure. I can help you find the right modifiers.',
        action: 'modifier_help',
        priority: 'medium',
        category: 'compliance',
        icon: 'tag'
      })
    }

    // Coverage verification
    suggestions.push({
      id: 'coverage-verification',
      type: 'reminder',
      title: 'Coverage Verification',
      content: 'Have you verified this service is covered under the patient\'s insurance plan?',
      action: 'coverage_help',
      priority: 'medium',
      category: 'compliance',
      icon: 'check-circle'
    })

    return suggestions
  }

  /**
   * Get documentation suggestions
   */
  private static getDocumentationSuggestions(context: SuggestionContext): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = []

    // Medical necessity documentation
    if (context.currentForm === 'ClaimsSubmissionForm' || context.currentForm === 'NewScreeningForm') {
      suggestions.push({
        id: 'medical-necessity',
        type: 'reminder',
        title: 'Medical Necessity',
        content: 'Ensure medical necessity is clearly documented for this service. This is crucial for claims approval.',
        action: 'necessity_help',
        priority: 'high',
        category: 'compliance',
        icon: 'stethoscope'
      })
    }

    // Signature requirements
    if (context.currentForm === 'ClaimsSubmissionForm') {
      suggestions.push({
        id: 'signature-requirements',
        type: 'reminder',
        title: 'Signature Requirements',
        content: 'Make sure the claim has proper provider signatures. Electronic signatures are acceptable.',
        action: 'signature_help',
        priority: 'medium',
        category: 'compliance',
        icon: 'edit'
      })
    }

    // Audit trail suggestions
    suggestions.push({
      id: 'audit-trail',
      type: 'reminder',
      title: 'Audit Trail',
      content: 'Maintain proper audit trails for all billing activities. This helps with compliance and dispute resolution.',
      action: 'audit_help',
      priority: 'medium',
      category: 'compliance',
      icon: 'list'
    })

    return suggestions
  }
}

export default ProactiveSuggestionsService 
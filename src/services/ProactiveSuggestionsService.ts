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
        if (context.currentField === 'providerId') {
          suggestions.push({
            id: 'provider-verification',
            type: 'contextual',
            title: 'Provider Verification',
            content: 'I can help you verify NPI numbers in real-time. Just ask me to check any provider!',
            action: 'verify_provider',
            priority: 'high',
            category: 'provider',
            icon: 'user-check'
          })
        }
        if (context.currentField === 'diagnosisCodes') {
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
        }
        break

      case 'ClaimsSubmissionForm':
        if (context.currentField?.includes('Sphere') || context.currentField?.includes('Cylinder')) {
          suggestions.push({
            id: 'eye-terminology',
            type: 'contextual',
            title: 'Eye Terminology Help',
            content: 'OD = Right Eye, OS = Left Eye, OU = Both Eyes. Need help with other terms?',
            action: 'explain_terminology',
            priority: 'medium',
            category: 'terminology',
            icon: 'eye'
          })
        }
        break
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
}

export default ProactiveSuggestionsService 
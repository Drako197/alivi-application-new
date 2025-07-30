// Personalization Service for M.I.L.A. - Remembers user preferences and provides personalized assistance
export interface UserPreferences {
  userId: string
  preferredSpecialties: string[]
  commonQueries: string[]
  favoriteCodes: string[]
  formUsage: Record<string, number>
  lastActive: Date
  sessionCount: number
  preferredLanguage: 'technical' | 'simple' | 'detailed'
}

export interface QueryHistory {
  query: string
  timestamp: Date
  category: 'terminology' | 'codes' | 'provider' | 'form' | 'general'
  success: boolean
  responseTime: number
}

export interface PersonalizedSuggestion {
  type: 'quick-action' | 'reminder' | 'tip' | 'related-query'
  content: string
  relevance: number
  category: string
}

class PersonalizationService {
  private static STORAGE_KEY = 'mila_user_preferences'
  private static HISTORY_KEY = 'mila_query_history'
  private static SESSION_KEY = 'mila_session_data'

  /**
   * Get or create user preferences
   */
  static getUserPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }

    // Default preferences
    const defaultPreferences: UserPreferences = {
      userId: this.generateUserId(),
      preferredSpecialties: ['ophthalmology'],
      commonQueries: [],
      favoriteCodes: [],
      formUsage: {},
      lastActive: new Date(),
      sessionCount: 1,
      preferredLanguage: 'simple'
    }

    this.saveUserPreferences(defaultPreferences)
    return defaultPreferences
  }

  /**
   * Save user preferences
   */
  static saveUserPreferences(preferences: UserPreferences): void {
    preferences.lastActive = new Date()
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences))
  }

  /**
   * Update user preferences
   */
  static updatePreferences(updates: Partial<UserPreferences>): void {
    const preferences = this.getUserPreferences()
    const updated = { ...preferences, ...updates }
    this.saveUserPreferences(updated)
  }

  /**
   * Record a query in history
   */
  static recordQuery(query: string, category: string, success: boolean, responseTime: number): void {
    const history = this.getQueryHistory()
    const newEntry: QueryHistory = {
      query,
      timestamp: new Date(),
      category: category as any,
      success,
      responseTime
    }

    history.push(newEntry)
    
    // Keep only last 100 queries
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
  }

  /**
   * Get query history
   */
  static getQueryHistory(): QueryHistory[] {
    const stored = localStorage.getItem(this.HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * Get personalized suggestions based on user history
   */
  static getPersonalizedSuggestions(currentContext?: {
    form?: string
    field?: string
    specialty?: string
  }): PersonalizedSuggestion[] {
    const preferences = this.getUserPreferences()
    const history = this.getQueryHistory()
    const suggestions: PersonalizedSuggestion[] = []

    // Analyze recent queries to find patterns
    const recentQueries = history.slice(-10)
    const queryFrequency = this.analyzeQueryFrequency(recentQueries)
    const specialtyUsage = this.analyzeSpecialtyUsage(history)

    // Suggest based on current context
    if (currentContext?.form) {
      const formUsage = preferences.formUsage[currentContext.form] || 0
      if (formUsage > 0) {
        suggestions.push({
          type: 'reminder',
          content: `You've used this form ${formUsage} times before. Need help with a specific field?`,
          relevance: 0.9,
          category: 'form'
        })
      }
    }

    // Suggest based on specialty preferences
    if (currentContext?.specialty && preferences.preferredSpecialties.includes(currentContext.specialty)) {
      suggestions.push({
        type: 'tip',
        content: `Since you work with ${currentContext.specialty}, here are some common codes you might need:`,
        relevance: 0.8,
        category: 'specialty'
      })
    }

    // Suggest based on query patterns
    const mostCommonCategory = this.getMostCommonCategory(recentQueries)
    if (mostCommonCategory) {
      suggestions.push({
        type: 'quick-action',
        content: `You often ask about ${mostCommonCategory}. Would you like to learn more?`,
        relevance: 0.7,
        category: mostCommonCategory
      })
    }

    // Suggest favorite codes if user has them
    if (preferences.favoriteCodes.length > 0) {
      suggestions.push({
        type: 'reminder',
        content: `Your frequently used codes: ${preferences.favoriteCodes.slice(0, 3).join(', ')}`,
        relevance: 0.6,
        category: 'codes'
      })
    }

    // Suggest based on session count
    if (preferences.sessionCount === 1) {
      suggestions.push({
        type: 'tip',
        content: 'Welcome! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. I\'m here to help make your work easier!',
        relevance: 0.9,
        category: 'welcome'
      })
    }

    return suggestions.sort((a, b) => b.relevance - a.relevance)
  }

  /**
   * Add a favorite code
   */
  static addFavoriteCode(code: string): void {
    const preferences = this.getUserPreferences()
    if (!preferences.favoriteCodes.includes(code)) {
      preferences.favoriteCodes.push(code)
      this.saveUserPreferences(preferences)
    }
  }

  /**
   * Remove a favorite code
   */
  static removeFavoriteCode(code: string): void {
    const preferences = this.getUserPreferences()
    preferences.favoriteCodes = preferences.favoriteCodes.filter(c => c !== code)
    this.saveUserPreferences(preferences)
  }

  /**
   * Track form usage
   */
  static trackFormUsage(formName: string): void {
    const preferences = this.getUserPreferences()
    preferences.formUsage[formName] = (preferences.formUsage[formName] || 0) + 1
    this.saveUserPreferences(preferences)
  }

  /**
   * Update preferred specialties
   */
  static updatePreferredSpecialties(specialties: string[]): void {
    this.updatePreferences({ preferredSpecialties: specialties })
  }

  /**
   * Update preferred language style
   */
  static updateLanguagePreference(language: 'technical' | 'simple' | 'detailed'): void {
    this.updatePreferences({ preferredLanguage: language })
  }

  /**
   * Get user's preferred language style for responses
   */
  static getLanguageStyle(): 'technical' | 'simple' | 'detailed' {
    const preferences = this.getUserPreferences()
    return preferences.preferredLanguage
  }

  /**
   * Get user's most common queries
   */
  static getCommonQueries(limit: number = 5): string[] {
    const history = this.getQueryHistory()
    const queryCounts: Record<string, number> = {}

    history.forEach(entry => {
      queryCounts[entry.query] = (queryCounts[entry.query] || 0) + 1
    })

    return Object.entries(queryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query)
  }

  /**
   * Get user's preferred specialties
   */
  static getPreferredSpecialties(): string[] {
    const preferences = this.getUserPreferences()
    return preferences.preferredSpecialties
  }

  /**
   * Get user's favorite codes
   */
  static getFavoriteCodes(): string[] {
    const preferences = this.getUserPreferences()
    return preferences.favoriteCodes
  }

  /**
   * Get form usage statistics
   */
  static getFormUsageStats(): Record<string, number> {
    const preferences = this.getUserPreferences()
    return preferences.formUsage
  }

  /**
   * Increment session count
   */
  static incrementSessionCount(): void {
    const preferences = this.getUserPreferences()
    preferences.sessionCount += 1
    this.saveUserPreferences(preferences)
  }

  /**
   * Generate unique user ID
   */
  private static generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Analyze query frequency
   */
  private static analyzeQueryFrequency(queries: QueryHistory[]): Record<string, number> {
    const frequency: Record<string, number> = {}
    queries.forEach(query => {
      frequency[query.category] = (frequency[query.category] || 0) + 1
    })
    return frequency
  }

  /**
   * Analyze specialty usage from queries
   */
  private static analyzeSpecialtyUsage(history: QueryHistory[]): Record<string, number> {
    const specialtyKeywords = {
      'ophthalmology': ['eye', 'retinal', 'fundus', 'od', 'os', 'ou'],
      'cardiology': ['heart', 'cardiac', 'ekg', 'ecg', 'chf'],
      'endocrinology': ['diabetes', 'diabetic', 'insulin', 'glucose'],
      'nephrology': ['kidney', 'renal', 'dialysis', 'ckd'],
      'pulmonology': ['lung', 'respiratory', 'copd', 'asthma'],
      'gastroenterology': ['gi', 'stomach', 'colon', 'endoscopy'],
      'neurology': ['brain', 'stroke', 'seizure', 'migraine'],
      'orthopedics': ['bone', 'joint', 'fracture', 'arthritis']
    }

    const usage: Record<string, number> = {}
    
    history.forEach(entry => {
      const lowerQuery = entry.query.toLowerCase()
      Object.entries(specialtyKeywords).forEach(([specialty, keywords]) => {
        if (keywords.some(keyword => lowerQuery.includes(keyword))) {
          usage[specialty] = (usage[specialty] || 0) + 1
        }
      })
    })

    return usage
  }

  /**
   * Get most common category from recent queries
   */
  private static getMostCommonCategory(queries: QueryHistory[]): string | null {
    const frequency = this.analyzeQueryFrequency(queries)
    const entries = Object.entries(frequency)
    
    if (entries.length === 0) return null
    
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  /**
   * Clear all user data (for testing)
   */
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.HISTORY_KEY)
    localStorage.removeItem(this.SESSION_KEY)
  }

  /**
   * Get user statistics
   */
  static getUserStats(): {
    totalQueries: number
    sessionCount: number
    favoriteCodesCount: number
    preferredSpecialtiesCount: number
    mostUsedForm: string | null
  } {
    const preferences = this.getUserPreferences()
    const history = this.getQueryHistory()
    
    const formUsage = Object.entries(preferences.formUsage)
    const mostUsedForm = formUsage.length > 0 
      ? formUsage.reduce((a, b) => a[1] > b[1] ? a : b)[0]
      : null

    return {
      totalQueries: history.length,
      sessionCount: preferences.sessionCount,
      favoriteCodesCount: preferences.favoriteCodes.length,
      preferredSpecialtiesCount: preferences.preferredSpecialties.length,
      mostUsedForm
    }
  }
}

export default PersonalizationService 
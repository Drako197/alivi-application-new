// Date management service for saved patient screenings
// Handles progressive date reset to prevent auto-deletion

interface DateResetLog {
  lastCheck: string
  nextCheck: string
  formsUpdated: number
  totalForms: number
}

class ScreeningDateService {
  private static STORAGE_KEYS = {
    DATE_RESET_LOG: 'alivi_date_reset_log',
    SAVED_SCREENINGS: 'alivi_saved_screenings'
  }

  private static CHECK_INTERVAL_DAYS = 5
  private static MIN_DAYS_REMAINING = 5
  private static AUTO_DELETE_THRESHOLD_DAYS = 30 // Forms auto-delete after 30 days

  /**
   * Initialize the date management system
   * Should be called on app startup
   */
  static initialize(): void {
    console.log('Initializing ScreeningDateService...')
    
    // Check if it's time to run the date reset
    this.checkAndResetDates()
    
    // Set up interval for future checks (every 5 days)
    this.setupPeriodicCheck()
    
    console.log('ScreeningDateService initialized')
  }

  /**
   * Check if it's time to reset dates and perform the reset if needed
   */
  private static checkAndResetDates(): void {
    const log = this.getDateResetLog()
    const now = new Date()
    const nextCheckDate = new Date(log.nextCheck)

    // If it's time for a check or we've never checked before
    if (now >= nextCheckDate || !log.lastCheck) {
      console.log('Running date reset check...')
      this.performDateReset()
      this.updateDateResetLog()
    } else {
      console.log(`Next date reset check scheduled for: ${log.nextCheck}`)
    }
  }

  /**
   * Perform the actual date reset for saved screenings
   */
  private static performDateReset(): void {
    try {
      const savedScreenings = this.getSavedScreenings()
      let formsUpdated = 0
      const now = new Date()

      const updatedScreenings = savedScreenings.map(screening => {
        const savedDate = new Date(screening.dateSaved)
        const daysSinceSaved = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysUntilExpiration = this.AUTO_DELETE_THRESHOLD_DAYS - daysSinceSaved

        // If form has less than MIN_DAYS_REMAINING days until expiration, extend it
        if (daysUntilExpiration < this.MIN_DAYS_REMAINING) {
          console.log(`Extending expiration for screening ${screening.id} (${screening.patientName}) - was ${daysUntilExpiration} days, now ${this.MIN_DAYS_REMAINING + 5} days`)
          
          // Calculate new saved date to give it MIN_DAYS_REMAINING + 5 days until expiration
          const newSavedDate = new Date(now.getTime() - ((this.AUTO_DELETE_THRESHOLD_DAYS - this.MIN_DAYS_REMAINING - 5) * 24 * 60 * 60 * 1000))
          
          formsUpdated++
          return {
            ...screening,
            dateSaved: newSavedDate.toISOString()
          }
        }

        return screening
      })

      // Save updated screenings
      if (formsUpdated > 0) {
        localStorage.setItem(this.STORAGE_KEYS.SAVED_SCREENINGS, JSON.stringify(updatedScreenings))
        console.log(`Date reset completed: ${formsUpdated} forms updated`)
      } else {
        console.log('No forms needed date reset')
      }

      // Update the reset log
      this.updateDateResetLog(formsUpdated, updatedScreenings.length)

    } catch (error) {
      console.error('Error performing date reset:', error)
    }
  }

  /**
   * Set up periodic checking every 5 days
   */
  private static setupPeriodicCheck(): void {
    const intervalMs = this.CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000 // 5 days in milliseconds
    
    setInterval(() => {
      console.log('Running periodic date reset check...')
      this.performDateReset()
      this.updateDateResetLog()
    }, intervalMs)
  }

  /**
   * Get the date reset log
   */
  private static getDateResetLog(): DateResetLog {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DATE_RESET_LOG)
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading date reset log:', error)
    }

    // Return default log if none exists
    const now = new Date()
    const nextCheck = new Date(now.getTime() + (this.CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000))
    
    return {
      lastCheck: now.toISOString(),
      nextCheck: nextCheck.toISOString(),
      formsUpdated: 0,
      totalForms: 0
    }
  }

  /**
   * Update the date reset log
   */
  private static updateDateResetLog(formsUpdated?: number, totalForms?: number): void {
    try {
      const log = this.getDateResetLog()
      const now = new Date()
      const nextCheck = new Date(now.getTime() + (this.CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000))

      const updatedLog: DateResetLog = {
        lastCheck: now.toISOString(),
        nextCheck: nextCheck.toISOString(),
        formsUpdated: formsUpdated !== undefined ? formsUpdated : log.formsUpdated,
        totalForms: totalForms !== undefined ? totalForms : log.totalForms
      }

      localStorage.setItem(this.STORAGE_KEYS.DATE_RESET_LOG, JSON.stringify(updatedLog))
      console.log('Date reset log updated:', updatedLog)
    } catch (error) {
      console.error('Error updating date reset log:', error)
    }
  }

  /**
   * Get saved screenings from localStorage
   */
  private static getSavedScreenings(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SAVED_SCREENINGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading saved screenings:', error)
      return []
    }
  }

  /**
   * Get the current status of all saved screenings
   */
  static getScreeningsStatus(): {
    total: number
    urgent: number // < 5 days
    warning: number // 5-10 days
    safe: number // > 10 days
    nextCheck: string
    lastCheck: string
  } {
    const savedScreenings = this.getSavedScreenings()
    const log = this.getDateResetLog()
    const now = new Date()

    let urgent = 0
    let warning = 0
    let safe = 0

    savedScreenings.forEach(screening => {
      const savedDate = new Date(screening.dateSaved)
      const daysSinceSaved = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysUntilExpiration = this.AUTO_DELETE_THRESHOLD_DAYS - daysSinceSaved

      if (daysUntilExpiration < 5) {
        urgent++
      } else if (daysUntilExpiration < 10) {
        warning++
      } else {
        safe++
      }
    })

    return {
      total: savedScreenings.length,
      urgent,
      warning,
      safe,
      nextCheck: log.nextCheck,
      lastCheck: log.lastCheck
    }
  }

  /**
   * Force a date reset check (for testing or manual intervention)
   */
  static forceDateReset(): void {
    console.log('Forcing date reset...')
    this.performDateReset()
    this.updateDateResetLog()
  }

  /**
   * Get detailed information about screening expiration dates
   */
  static getExpirationDetails(): Array<{
    id: string
    patientName: string
    daysUntilExpiration: number
    status: 'urgent' | 'warning' | 'safe'
    originalDate: string
    adjustedDate?: string
  }> {
    const savedScreenings = this.getSavedScreenings()
    const now = new Date()

    return savedScreenings.map(screening => {
      const savedDate = new Date(screening.dateSaved)
      const daysSinceSaved = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysUntilExpiration = this.AUTO_DELETE_THRESHOLD_DAYS - daysSinceSaved

      let status: 'urgent' | 'warning' | 'safe'
      if (daysUntilExpiration < 5) {
        status = 'urgent'
      } else if (daysUntilExpiration < 10) {
        status = 'warning'
      } else {
        status = 'safe'
      }

      return {
        id: screening.id,
        patientName: screening.patientName,
        daysUntilExpiration,
        status,
        originalDate: screening.dateSaved
      }
    })
  }

  /**
   * Debug method to show current state
   */
  static debugCurrentState(): void {
    console.log('=== ScreeningDateService Debug ===')
    const status = this.getScreeningsStatus()
    const details = this.getExpirationDetails()
    const log = this.getDateResetLog()

    console.log('Status:', status)
    console.log('Date Reset Log:', log)
    console.log('Expiration Details:')
    details.forEach(detail => {
      console.log(`  ${detail.patientName}: ${detail.daysUntilExpiration} days (${detail.status})`)
    })
    console.log('=== End Debug ===')
  }
}

export default ScreeningDateService 
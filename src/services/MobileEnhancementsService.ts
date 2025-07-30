// Mobile Enhancements Service for M.I.L.A.
// Handles touch gestures, voice input, offline capabilities, and mobile optimizations

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'longPress' | 'doubleTap'
  direction?: 'left' | 'right' | 'up' | 'down'
  target: string
  action: string
  data?: any
}

export interface VoiceCommand {
  command: string
  description: string
  action: string
  data?: any
  confidence: number
}

export interface OfflineData {
  key: string
  data: any
  timestamp: Date
  expiresAt?: Date
}

export interface MobileOptimization {
  type: 'performance' | 'battery' | 'network' | 'storage'
  enabled: boolean
  settings: Record<string, any>
}

export class MobileEnhancementsService {
  private static touchGestures: Map<string, TouchGesture> = new Map()
  private static voiceCommands: Map<string, VoiceCommand> = new Map()
  private static offlineData: Map<string, OfflineData> = new Map()
  private static optimizations: Map<string, MobileOptimization> = new Map()
  private static isOnline: boolean = navigator.onLine

  // Initialize mobile enhancements
  static initialize(): void {
    this.setupTouchGestures()
    this.setupVoiceCommands()
    this.setupOfflineCapabilities()
    this.setupMobileOptimizations()
    this.setupNetworkListeners()
  }

  // Touch Gesture Management
  private static setupTouchGestures(): void {
    // Navigation gestures
    this.touchGestures.set('swipe_left', {
      type: 'swipe',
      direction: 'left',
      target: 'form_navigation',
      action: 'next_step'
    })

    this.touchGestures.set('swipe_right', {
      type: 'swipe',
      direction: 'right',
      target: 'form_navigation',
      action: 'previous_step'
    })

    this.touchGestures.set('swipe_up', {
      type: 'swipe',
      direction: 'up',
      target: 'mila_assistant',
      action: 'open_assistant'
    })

    this.touchGestures.set('swipe_down', {
      type: 'swipe',
      direction: 'down',
      target: 'form_navigation',
      action: 'close_modal'
    })

    // Form interaction gestures
    this.touchGestures.set('long_press_field', {
      type: 'longPress',
      target: 'form_field',
      action: 'show_field_help'
    })

    this.touchGestures.set('double_tap_code', {
      type: 'doubleTap',
      target: 'code_field',
      action: 'search_codes'
    })

    this.touchGestures.set('pinch_zoom', {
      type: 'pinch',
      target: 'image_viewer',
      action: 'zoom_image'
    })
  }

  // Voice Command Management
  private static setupVoiceCommands(): void {
    // Navigation commands
    this.voiceCommands.set('next_step', {
      command: 'next step',
      description: 'Navigate to the next form step',
      action: 'navigate_next',
      confidence: 0.9
    })

    this.voiceCommands.set('previous_step', {
      command: 'previous step',
      description: 'Navigate to the previous form step',
      action: 'navigate_previous',
      confidence: 0.9
    })

    this.voiceCommands.set('open_mila', {
      command: 'open mila',
      description: 'Open M.I.L.A. assistant',
      action: 'open_assistant',
      confidence: 0.95
    })

    this.voiceCommands.set('search_codes', {
      command: 'search codes',
      description: 'Search for medical codes',
      action: 'search_codes',
      confidence: 0.8
    })

    this.voiceCommands.set('help', {
      command: 'help',
      description: 'Get help with current field',
      action: 'show_help',
      confidence: 0.9
    })

    // Form-specific commands
    this.voiceCommands.set('save_form', {
      command: 'save form',
      description: 'Save current form data',
      action: 'save_form',
      confidence: 0.9
    })

    this.voiceCommands.set('submit_form', {
      command: 'submit form',
      description: 'Submit the current form',
      action: 'submit_form',
      confidence: 0.9
    })

    this.voiceCommands.set('clear_field', {
      command: 'clear field',
      description: 'Clear the current field',
      action: 'clear_field',
      confidence: 0.8
    })
  }

  // Offline Capabilities
  private static setupOfflineCapabilities(): void {
    // Cache essential data for offline use
    this.cacheOfflineData('medical_codes', {
      icd10: this.getOfflineICD10Codes(),
      cpt: this.getOfflineCPTCodes(),
      hcpcs: this.getOfflineHCPCSCodes()
    })

    this.cacheOfflineData('form_templates', {
      hedis: this.getOfflineHEDISTemplate(),
      claims: this.getOfflineClaimsTemplate()
    })

    this.cacheOfflineData('validation_rules', {
      npi: /^\d{10}$/,
      icd10: /^[A-Z]\d{2}\.\d{1,2}$/,
      cpt: /^\d{5}$/
    })
  }

  // Mobile Optimizations
  private static setupMobileOptimizations(): void {
    // Performance optimization
    this.optimizations.set('performance', {
      type: 'performance',
      enabled: true,
      settings: {
        lazyLoading: true,
        imageCompression: true,
        debounceInput: 300,
        maxCacheSize: '50MB'
      }
    })

    // Battery optimization
    this.optimizations.set('battery', {
      type: 'battery',
      enabled: true,
      settings: {
        reduceAnimations: true,
        backgroundSync: false,
        locationServices: false,
        autoSaveInterval: 30000 // 30 seconds
      }
    })

    // Network optimization
    this.optimizations.set('network', {
      type: 'network',
      enabled: true,
      settings: {
        requestTimeout: 10000,
        retryAttempts: 3,
        cacheStrategy: 'stale-while-revalidate',
        compression: true
      }
    })

    // Storage optimization
    this.optimizations.set('storage', {
      type: 'storage',
      enabled: true,
      settings: {
        maxStorageSize: '100MB',
        cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
        priorityData: ['user_preferences', 'form_data', 'medical_codes']
      }
    })
  }

  // Network Status Management
  private static setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.enableOfflineMode()
    })
  }

  // Touch Gesture Handlers
  static handleTouchGesture(gesture: TouchGesture, element: HTMLElement): void {
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipeGesture(gesture, element)
        break
      case 'longPress':
        this.handleLongPressGesture(gesture, element)
        break
      case 'doubleTap':
        this.handleDoubleTapGesture(gesture, element)
        break
      case 'pinch':
        this.handlePinchGesture(gesture, element)
        break
    }
  }

  private static handleSwipeGesture(gesture: TouchGesture, element: HTMLElement): void {
    // Implement swipe detection logic
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    })

    element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX
      endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const minSwipeDistance = 50

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && gesture.direction === 'right') {
          this.executeGestureAction(gesture.action, gesture.data)
        } else if (deltaX < 0 && gesture.direction === 'left') {
          this.executeGestureAction(gesture.action, gesture.data)
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && gesture.direction === 'down') {
          this.executeGestureAction(gesture.action, gesture.data)
        } else if (deltaY < 0 && gesture.direction === 'up') {
          this.executeGestureAction(gesture.action, gesture.data)
        }
      }
    })
  }

  private static handleLongPressGesture(gesture: TouchGesture, element: HTMLElement): void {
    let pressTimer: number

    element.addEventListener('touchstart', () => {
      pressTimer = window.setTimeout(() => {
        this.executeGestureAction(gesture.action, gesture.data)
      }, 500) // 500ms for long press
    })

    element.addEventListener('touchend', () => {
      clearTimeout(pressTimer)
    })
  }

  private static handleDoubleTapGesture(gesture: TouchGesture, element: HTMLElement): void {
    let lastTap = 0
    const doubleTapDelay = 300

    element.addEventListener('touchend', () => {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - lastTap
      
      if (tapLength < doubleTapDelay && tapLength > 0) {
        this.executeGestureAction(gesture.action, gesture.data)
      }
      lastTap = currentTime
    })
  }

  private static handlePinchGesture(gesture: TouchGesture, element: HTMLElement): void {
    // Implement pinch-to-zoom logic for image viewers
    element.addEventListener('gesturestart', (e) => {
      e.preventDefault()
    })

    element.addEventListener('gesturechange', (e) => {
      e.preventDefault()
      // Handle zoom scaling
      const gestureEvent = e as any
      const scale = gestureEvent.scale || 1
      this.executeGestureAction(gesture.action, { scale })
    })
  }

  // Voice Input Handlers
  static async startVoiceInput(): Promise<void> {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      this.processVoiceCommand(transcript)
    }

    recognition.start()
  }

  private static processVoiceCommand(transcript: string): void {
    let bestMatch: VoiceCommand | null = null
    let highestConfidence = 0

    this.voiceCommands.forEach((command) => {
      if (transcript.includes(command.command)) {
        const confidence = this.calculateVoiceConfidence(transcript, command.command)
        if (confidence > highestConfidence) {
          highestConfidence = confidence
          bestMatch = command
        }
      }
    })

    if (bestMatch && highestConfidence > 0.7) {
      this.executeVoiceCommand(bestMatch)
    }
  }

  private static calculateVoiceConfidence(transcript: string, command: string): number {
    const words = transcript.split(' ')
    const commandWords = command.split(' ')
    let matches = 0

    commandWords.forEach(word => {
      if (words.includes(word)) {
        matches++
      }
    })

    return matches / commandWords.length
  }

  private static executeVoiceCommand(command: VoiceCommand): void {
    console.log(`Executing voice command: ${command.command}`)
    this.executeGestureAction(command.action, command.data)
  }

  // Offline Data Management
  static cacheOfflineData(key: string, data: any, expiresAt?: Date): void {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: new Date(),
      expiresAt
    }

    this.offlineData.set(key, offlineData)
    
    // Also save to localStorage for persistence
    localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData))
  }

  static getOfflineData(key: string): any | null {
    const data = this.offlineData.get(key)
    if (data) {
      if (data.expiresAt && new Date() > data.expiresAt) {
        this.offlineData.delete(key)
        localStorage.removeItem(`offline_${key}`)
        return null
      }
      return data.data
    }

    // Check localStorage
    const localStorageData = localStorage.getItem(`offline_${key}`)
    if (localStorageData) {
      try {
        const parsed = JSON.parse(localStorageData)
        this.offlineData.set(key, parsed)
        return parsed.data
      } catch (error) {
        console.warn('Failed to parse offline data:', error)
      }
    }

    return null
  }

  private static syncOfflineData(): void {
    // Sync offline data when back online
    console.log('Syncing offline data...')
    // Implementation would sync cached data with server
  }

  private static enableOfflineMode(): void {
    console.log('Enabling offline mode...')
    // Switch to offline functionality
  }

  // Mobile Optimization Handlers
  static getOptimizationSettings(type: string): MobileOptimization | null {
    return this.optimizations.get(type) || null
  }

  static updateOptimizationSettings(type: string, settings: Record<string, any>): void {
    const optimization = this.optimizations.get(type)
    if (optimization) {
      optimization.settings = { ...optimization.settings, ...settings }
      this.optimizations.set(type, optimization)
    }
  }

  // Action Execution
  private static executeGestureAction(action: string, data?: any): void {
    switch (action) {
      case 'next_step':
        // Navigate to next step
        console.log('Navigating to next step')
        break
      case 'previous_step':
        // Navigate to previous step
        console.log('Navigating to previous step')
        break
      case 'open_assistant':
        // Open M.I.L.A. assistant
        console.log('Opening M.I.L.A. assistant')
        break
      case 'close_modal':
        // Close current modal
        console.log('Closing modal')
        break
      case 'show_field_help':
        // Show help for current field
        console.log('Showing field help')
        break
      case 'search_codes':
        // Search for medical codes
        console.log('Searching for codes')
        break
      case 'zoom_image':
        // Zoom image
        console.log('Zooming image')
        break
      default:
        console.log(`Executing action: ${action}`, data)
    }
  }

  // Offline Data Helpers
  private static getOfflineICD10Codes(): any[] {
    return [
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
      { code: 'E11.21', description: 'Type 2 diabetes mellitus with diabetic nephropathy' },
      { code: 'H35.01', description: 'Background diabetic retinopathy, right eye' },
      { code: 'Z79.4', description: 'Long-term (current) use of insulin' }
    ]
  }

  private static getOfflineCPTCodes(): any[] {
    return [
      { code: '92250', description: 'Fundus photography with interpretation and report' },
      { code: '92227', description: 'Remote imaging for detection of retinal disease' },
      { code: '92285', description: 'External ocular photography with interpretation and report' }
    ]
  }

  private static getOfflineHCPCSCodes(): any[] {
    return [
      { code: 'G0108', description: 'Diabetes outpatient self-management training services' },
      { code: 'G0402', description: 'Initial preventive physical examination' },
      { code: 'G0438', description: 'Annual wellness visit, includes a personalized prevention plan' }
    ]
  }

  private static getOfflineHEDISTemplate(): any {
    return {
      steps: ['patient_search', 'screening_details', 'retinal_images', 'review_submit'],
      fields: ['patientId', 'diagnosis', 'screeningDate', 'provider', 'leftEyeImage', 'rightEyeImage']
    }
  }

  private static getOfflineClaimsTemplate(): any {
    return {
      steps: ['patient_info', 'service_details', 'billing_info', 'review_submit'],
      fields: ['patientName', 'dateOfBirth', 'insuranceId', 'procedureCodes', 'diagnosisCodes', 'providerNPI', 'serviceDate']
    }
  }

  // Utility Methods
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  static getNetworkStatus(): boolean {
    return this.isOnline
  }

  static clearAllData(): void {
    this.touchGestures.clear()
    this.voiceCommands.clear()
    this.offlineData.clear()
    this.optimizations.clear()
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key)
      }
    })
  }
} 
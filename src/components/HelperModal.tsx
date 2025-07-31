import React, { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import PersonalizationService from '../services/PersonalizationService'
import ProactiveSuggestionsService, { type ProactiveSuggestion } from '../services/ProactiveSuggestionsService'
import { PredictiveSuggestionsService } from '../services/PredictiveSuggestionsService'
import PersonalizationSettings from './PersonalizationSettings'
import AIAssistantService from '../services/AIAssistantService'
import { createPortal } from 'react-dom'
import { getDemoUserFirstName } from '../utils/nameGenerator'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: {
    fieldName?: string
    formType?: string
    currentStep?: number
    lastCode?: string
    lastTopic?: string
  }
  animation?: 'typing' | 'fade-in' | 'slide-in'
}

interface HelperModalProps {
  isOpen: boolean
  onClose: () => void
  currentForm?: string
  currentField?: string
  currentStep?: number
  onFieldSuggestion?: (fieldName: string, suggestion: string) => void
  // New props for code selection mode
  isCodeSelectionMode?: boolean
  triggeringFieldName?: string
  triggeringFormName?: string
  onCodeSelect?: (code: string, description: string) => void
}

// Medical billing knowledge base
const MEDICAL_BILLING_KNOWLEDGE = {
  terminology: {
    'OD': 'Oculus Dexter - Right Eye',
    'OS': 'Oculus Sinister - Left Eye',
    'OU': 'Oculus Uterque - Both Eyes',
    'PCP': 'Primary Care Physician',
    'HEDIS': 'Healthcare Effectiveness Data and Information Set',
    'PIC': 'Provider Interface Center',
    'NPI': 'National Provider Identifier',
    'CPT': 'Current Procedural Terminology',
    'ICD': 'International Classification of Diseases',
    'HCPCS': 'Healthcare Common Procedure Coding System',
    'EOB': 'Explanation of Benefits',
    'ERA': 'Electronic Remittance Advice',
    'EDI': 'Electronic Data Interchange',
    'HIPAA': 'Health Insurance Portability and Accountability Act',
    'CMS': 'Centers for Medicare & Medicaid Services'
  },
  commonCodes: {
    'E11.9': 'Type 2 diabetes mellitus without complications',
    'E11.21': 'Type 2 diabetes mellitus with diabetic nephropathy',
    'E11.22': 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
    'H35.00': 'Unspecified background retinopathy',
    'H35.01': 'Mild nonproliferative diabetic retinopathy',
    'H35.02': 'Moderate nonproliferative diabetic retinopathy',
    'H35.03': 'Severe nonproliferative diabetic retinopathy',
    'H35.04': 'Proliferative diabetic retinopathy',
    'Z79.4': 'Long term (current) use of insulin',
    'Z79.84': 'Long term (current) use of oral hypoglycemic drugs',
    '92250': 'Fundus photography with interpretation and report',
    '92227': 'Imaging of retina for detection or monitoring of disease',
    '92228': 'Imaging of retina for detection or monitoring of disease; with remote analysis',
    '92229': 'Imaging of retina for detection or monitoring of disease; with point-of-care automated analysis'
  },
  formGuidance: {
    'PatientEligibilityForm': {
      'providerId': 'Enter your 10-digit National Provider Identifier (NPI) number. This is required for all claims submissions.',
      'subscriberId': 'Enter the patient\'s member ID as it appears on their insurance card. This is typically found on the front of the card.',
      'dependantSequence': 'Enter the dependent sequence number. 00 = primary subscriber, 01 = spouse, 02+ = children in order of birth.',
      'lastName': 'Enter the patient\'s legal last name exactly as it appears on their insurance card.',
      'firstName': 'Enter the patient\'s legal first name exactly as it appears on their insurance card.',
      'dateOfBirth': 'Enter the patient\'s date of birth in MM/DD/YYYY format.'
    },
    'ClaimsSubmissionForm': {
      'serviceDateFrom': 'Enter the date when services began. This should be the first date of the service period.',
      'serviceDateTo': 'Enter the date when services ended. For single-day services, this will be the same as the from date.',
      'diagnosisCodes': 'Enter the primary diagnosis code first, followed by any secondary codes. Use the most specific code available.',
      'odSphere': 'Enter the sphere power for the right eye. Use negative values for myopia, positive for hyperopia.',
      'osSphere': 'Enter the sphere power for the left eye. Use negative values for myopia, positive for hyperopia.',
      'odCylinder': 'Enter the cylinder power for the right eye. This corrects astigmatism.',
      'osCylinder': 'Enter the cylinder power for the left eye. This corrects astigmatism.',
      'odAxis': 'Enter the axis for the right eye (0-180 degrees). This indicates the orientation of the cylinder.',
      'osAxis': 'Enter the axis for the left eye (0-180 degrees). This indicates the orientation of the cylinder.'
    }
  }
}

export default function HelperModal({ 
  isOpen, 
  onClose, 
  currentForm, 
  currentField, 
  currentStep,
  onFieldSuggestion,
  // New props for code selection mode
  isCodeSelectionMode,
  triggeringFieldName,
  triggeringFormName,
  onCodeSelect
}: HelperModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<any[]>([])
  const [showPredictiveSuggestions, setShowPredictiveSuggestions] = useState(false)
  const [hasShownSuggestions, setHasShownSuggestions] = useState(false)
  const [hasWelcomedUser, setHasWelcomedUser] = useState(false)
  const [conversationContext, setConversationContext] = useState<{
    lastCode?: string
    lastTopic?: string
  }>({})
  const [codeSelectionMode, setCodeSelectionMode] = useState(false)
  const [availableCodes, setAvailableCodes] = useState<Array<{code: string, description: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check if user has been welcomed in this session
  useEffect(() => {
    const sessionWelcomed = sessionStorage.getItem('mila_welcomed_user')
    if (sessionWelcomed === 'true') {
      setHasWelcomedUser(true)
    }
  }, [])

  // Handle code selection mode
  useEffect(() => {
    if (isCodeSelectionMode && triggeringFieldName && triggeringFormName) {
      setCodeSelectionMode(true)
      loadAvailableCodes(triggeringFieldName, triggeringFormName)
    } else {
      setCodeSelectionMode(false)
      setAvailableCodes([])
    }
  }, [isCodeSelectionMode, triggeringFieldName, triggeringFormName])

  const loadAvailableCodes = (fieldName: string, formName: string) => {
    let codes: Array<{code: string, description: string}> = []
    
    if (fieldName === 'diagnosisCodes') {
      codes = [
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
        { code: 'E11.21', description: 'Type 2 diabetes mellitus with diabetic nephropathy' },
        { code: 'E11.22', description: 'Type 2 diabetes mellitus with diabetic chronic kidney disease' },
        { code: 'H35.00', description: 'Unspecified background retinopathy' },
        { code: 'H35.01', description: 'Mild nonproliferative diabetic retinopathy' },
        { code: 'H35.02', description: 'Moderate nonproliferative diabetic retinopathy' },
        { code: 'H35.03', description: 'Severe nonproliferative diabetic retinopathy' },
        { code: 'H35.04', description: 'Proliferative diabetic retinopathy' },
        { code: 'Z79.4', description: 'Long term (current) use of insulin' },
        { code: 'Z79.84', description: 'Long term (current) use of oral hypoglycemic drugs' }
      ]
    } else if (fieldName === 'procedureCodes') {
      codes = [
        { code: '92250', description: 'Fundus photography with interpretation and report' },
        { code: '92227', description: 'Imaging of retina for detection or monitoring of disease' },
        { code: '92228', description: 'Imaging of retina for detection or monitoring of disease; with remote analysis' },
        { code: '92229', description: 'Imaging of retina for detection or monitoring of disease; with point-of-care automated analysis' },
        { code: '92285', description: 'External ocular photography with interpretation and report' },
        { code: '92287', description: 'Ophthalmic biometry by partial coherence interferometry' }
      ]
    }
    
    setAvailableCodes(codes)
    
    // Add contextual message
    const demoName = getDemoUserFirstName()
    const message = `Hi ${demoName}! Here are the available ${fieldName.replace('Codes', ' codes')} for your ${formName} form. Click on any code to automatically insert it into your field:`
    addMessage('assistant', message, 'fade-in')
  }

  const handleCodeSelect = (code: string, description: string) => {
    if (onCodeSelect) {
      onCodeSelect(code, description)
    }
    
    // Add confirmation message
    addMessage('assistant', `✅ Code "${code}" has been inserted into your field!`, 'fade-in')
    
    // Close the modal after a short delay
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when assistant opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Add initial welcome message and setup personalization (only once per session)
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasWelcomedUser) {
      // Initialize personalization
      PersonalizationService.incrementSessionCount()
      
      // Get personalized welcome message
      const userStats = PersonalizationService.getUserStats()
      const preferences = PersonalizationService.getUserPreferences()
      
      let welcomeMessage = 'Hello! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. 👋\n\nI\'m here to make your medical billing experience smoother and more efficient. I can help you with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nWhat would you like to know? I\'m here to help! 💙'
      
      // Personalize message based on user experience
      const demoName = getDemoUserFirstName()
      if (userStats.sessionCount === 1) {
        welcomeMessage = `Welcome to M.I.L.A., ${demoName}! I'm your Medical Intelligence & Learning Assistant. 👋\n\nI'm excited to help you with medical billing! I can assist with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nLet's get started! What would you like to know? 💙`
      } else if (userStats.sessionCount > 5) {
        welcomeMessage = `Welcome back, ${demoName}! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. 👋\n\nGreat to see you again! I'm here to help with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nHow can I assist you today? 💙`
      }
      
      addMessage('assistant', welcomeMessage, 'fade-in')
      
      // Mark user as welcomed for this session
      setHasWelcomedUser(true)
      sessionStorage.setItem('mila_welcomed_user', 'true')
      
      // Show proactive suggestions after a short delay
      // DISABLED: Proactive suggestions turned off as requested
      // setTimeout(() => {
      //   showProactiveSuggestions()
      // }, 2000)
    }
  }, [isOpen, messages.length, hasWelcomedUser])

  // Reset suggestions when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasShownSuggestions(false)
      setShowPredictiveSuggestions(false)
      setPredictiveSuggestions([])
    }
  }, [isOpen])

  // Add predictive suggestions when assistant opens (only once per session)
  useEffect(() => {
    if (isOpen && currentForm && currentField && !hasShownSuggestions) {
      loadPredictiveSuggestions()
      setHasShownSuggestions(true)
    }
  }, [isOpen, currentForm, currentField, currentStep, hasShownSuggestions])

  const loadPredictiveSuggestions = async () => {
    try {
      console.log('Loading predictive suggestions for:', { currentForm, currentField, currentStep })
      
      // Generate contextual suggestions based on current form and field
      const contextualSuggestions = generateContextualSuggestions()
      
      if (contextualSuggestions.length > 0) {
        setPredictiveSuggestions(contextualSuggestions)
        setShowPredictiveSuggestions(true)
        
        // Add contextual message based on whether user has been welcomed
        const demoName = getDemoUserFirstName()
        if (!hasWelcomedUser) {
          const welcomeMessage = `Hi there, ${demoName}! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. I'm here to help with your ${currentForm} form. Here are some suggestions for the ${currentField} field:`
          addMessage('assistant', welcomeMessage, 'fade-in')
        } else {
          const contextualMessage = `I see you're working on the ${currentForm} form. Here are some helpful suggestions for the ${currentField} field:`
          addMessage('assistant', contextualMessage, 'fade-in')
        }
      } else {
        // Add general message if no specific suggestions
        const demoName = getDemoUserFirstName()
        if (!hasWelcomedUser) {
          const generalWelcome = `Hi there, ${demoName}! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. I'm here to help with your ${currentForm} form. You can ask me about codes, terminology, form help, or any medical billing questions!`
          addMessage('assistant', generalWelcome, 'fade-in')
        } else {
          const contextualMessage = `I'm here to help with your ${currentForm} form. You can ask me about codes, terminology, form help, or any medical billing questions!`
          addMessage('assistant', contextualMessage, 'fade-in')
        }
      }
    } catch (error) {
      console.error('Error loading predictive suggestions:', error)
      // Add fallback message
      const demoName = getDemoUserFirstName()
      if (!hasWelcomedUser) {
        const fallbackMessage = `Hi there, ${demoName}! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. I'm here to help with your medical billing questions!`
        addMessage('assistant', fallbackMessage, 'fade-in')
      } else {
        const fallbackMessage = `I'm here to help with your medical billing questions!`
        addMessage('assistant', fallbackMessage, 'fade-in')
      }
    }
  }

  const generateContextualSuggestions = () => {
    const suggestions = []
    
    // Contextual suggestions based on form and field
    if (currentForm === 'ClaimsSubmission') {
      switch (currentField) {
        case 'patient-information':
          suggestions.push({
            id: 'provider-validation',
            title: 'Validate Provider ID',
            description: 'Check NPI format and provider credentials',
            icon: 'user-check',
            action: { type: 'search', data: { query: 'validate provider NPI' } }
          })
          suggestions.push({
            id: 'patient-search',
            title: 'Search Patient Records',
            description: 'Find existing patient information',
            icon: 'search',
            action: { type: 'search', data: { query: 'search patient records' } }
          })
          break
        case 'claim-details':
          suggestions.push({
            id: 'diagnosis-codes',
            title: 'Search Diagnosis Codes',
            description: 'Find relevant ICD-10 codes for this claim',
            icon: 'file-text',
            action: { type: 'search', data: { query: 'diagnosis codes diabetes retinopathy' } }
          })
          suggestions.push({
            id: 'service-dates',
            title: 'Validate Service Dates',
            description: 'Check date format and coverage period',
            icon: 'calendar',
            action: { type: 'explain', data: { topic: 'service date validation' } }
          })
          break
        case 'prescription-details':
          suggestions.push({
            id: 'prescription-help',
            title: 'Prescription Guidance',
            description: 'Get help with OD/OS sphere and cylinder values',
            icon: 'eye',
            action: { type: 'explain', data: { topic: 'prescription parameters OD OS' } }
          })
          suggestions.push({
            id: 'calculation-help',
            title: 'Calculation Tools',
            description: 'Help with prescription calculations',
            icon: 'calculator',
            action: { type: 'search', data: { query: 'prescription calculation help' } }
          })
          break
        case 'lens-choice':
          suggestions.push({
            id: 'lens-selection',
            title: 'Lens Selection Guide',
            description: 'Choose the right lens type and coatings',
            icon: 'glasses',
            action: { type: 'explain', data: { topic: 'lens types and coatings' } }
          })
          suggestions.push({
            id: 'pd-measurements',
            title: 'PD Measurements',
            description: 'Calculate pupillary distance correctly',
            icon: 'ruler',
            action: { type: 'explain', data: { topic: 'PD measurement calculation' } }
          })
          break
        case 'frame-selection':
          suggestions.push({
            id: 'frame-measurements',
            title: 'Frame Measurements',
            description: 'Get help with frame sizing and adjustments',
            icon: 'package',
            action: { type: 'explain', data: { topic: 'frame measurements and sizing' } }
          })
          break
        case 'review-submit':
          suggestions.push({
            id: 'claim-validation',
            title: 'Claim Validation',
            description: 'Review claim completeness before submission',
            icon: 'check-circle',
            action: { type: 'explain', data: { topic: 'claim validation checklist' } }
          })
          suggestions.push({
            id: 'submission-guidance',
            title: 'Submission Guidance',
            description: 'Ensure proper claim submission format',
            icon: 'send',
            action: { type: 'explain', data: { topic: 'claim submission process' } }
          })
          break
      }
    } else if (currentForm === 'PatientEligibility') {
      switch (currentField) {
        case 'provider-information':
          suggestions.push({
            id: 'npi-validation',
            title: 'NPI Validation',
            description: 'Verify your National Provider Identifier',
            icon: 'user-check',
            action: { type: 'search', data: { query: 'validate NPI number' } }
          })
          suggestions.push({
            id: 'provider-search',
            title: 'Provider Search',
            description: 'Find provider information in database',
            icon: 'search',
            action: { type: 'search', data: { query: 'search provider database' } }
          })
          break
        case 'patient-information':
          suggestions.push({
            id: 'member-id-help',
            title: 'Member ID Help',
            description: 'Understanding member ID format and location',
            icon: 'credit-card',
            action: { type: 'explain', data: { topic: 'member ID format insurance card' } }
          })
          suggestions.push({
            id: 'dependent-sequence',
            title: 'Dependent Sequence',
            description: 'Understanding dependent sequence numbers',
            icon: 'users',
            action: { type: 'explain', data: { topic: 'dependent sequence numbers' } }
          })
          break
        case 'eligibility-check':
          suggestions.push({
            id: 'coverage-verification',
            title: 'Coverage Verification',
            description: 'Check patient coverage and benefits',
            icon: 'shield-check',
            action: { type: 'explain', data: { topic: 'coverage verification process' } }
          })
          suggestions.push({
            id: 'benefit-inquiry',
            title: 'Benefit Inquiry',
            description: 'Understand covered services and limitations',
            icon: 'info-circle',
            action: { type: 'explain', data: { topic: 'benefit inquiry process' } }
          })
          break
      }
    } else if (currentForm === 'HEDIS') {
      switch (currentField) {
        case 'screening-setup':
          suggestions.push({
            id: 'hedis-measures',
            title: 'HEDIS Measures',
            description: 'Understanding HEDIS quality measures',
            icon: 'chart-bar',
            action: { type: 'explain', data: { topic: 'HEDIS quality measures' } }
          })
          suggestions.push({
            id: 'screening-protocols',
            title: 'Screening Protocols',
            description: 'Standard screening procedures and guidelines',
            icon: 'clipboard-list',
            action: { type: 'explain', data: { topic: 'screening protocols' } }
          })
          break
        case 'patient-data':
          suggestions.push({
            id: 'data-collection',
            title: 'Data Collection',
            description: 'Required patient data for HEDIS measures',
            icon: 'database',
            action: { type: 'explain', data: { topic: 'HEDIS data collection requirements' } }
          })
          suggestions.push({
            id: 'quality-measures',
            title: 'Quality Measures',
            description: 'Understanding quality measure calculations',
            icon: 'target',
            action: { type: 'explain', data: { topic: 'quality measure calculations' } }
          })
          break
      }
    } else if (currentForm === 'Dashboard') {
      suggestions.push({
        id: 'quick-actions',
        title: 'Quick Actions',
        description: 'Common tasks and shortcuts',
        icon: 'bolt',
        action: { type: 'explain', data: { topic: 'dashboard quick actions' } }
      })
      suggestions.push({
        id: 'recent-activity',
        title: 'Recent Activity',
        description: 'View your recent form submissions',
        icon: 'clock',
        action: { type: 'search', data: { query: 'recent form submissions' } }
      })
      suggestions.push({
        id: 'statistics-help',
        title: 'Statistics Help',
        description: 'Understanding dashboard statistics',
        icon: 'chart-pie',
        action: { type: 'explain', data: { topic: 'dashboard statistics' } }
      })
    } else if (currentForm === 'PIC') {
      suggestions.push({
        id: 'pic-actions',
        title: 'PIC Actions',
        description: 'Provider Interface Center operations',
        icon: 'cog',
        action: { type: 'explain', data: { topic: 'PIC operations' } }
      })
      suggestions.push({
        id: 'provider-support',
        title: 'Provider Support',
        description: 'Provider assistance and resources',
        icon: 'headset',
        action: { type: 'search', data: { query: 'provider support resources' } }
      })
    }
    
    return suggestions
  }

  const handlePredictiveSuggestionClick = async (suggestion: any) => {
    try {
      // Process the suggestion action
      let response = ''
      
      switch (suggestion.action.type) {
        case 'search':
          response = await AIAssistantService.processUserInput(suggestion.action.data.query, {
            formType: currentForm,
            currentField: currentField,
            currentStep: currentStep
          })
          break
        case 'explain':
          response = await AIAssistantService.processUserInput(`explain ${suggestion.action.data.topic}`, {
            formType: currentForm,
            currentField: currentField,
            currentStep: currentStep
          })
          break
        default:
          response = `I'd be happy to help you with ${suggestion.title}! ${suggestion.description}`
      }
      
      addMessage('assistant', response, 'fade-in')
      setShowPredictiveSuggestions(false)
    } catch (error) {
      console.error('Error handling predictive suggestion:', error)
    }
  }

  // Provide contextual help when field changes
  useEffect(() => {
    if (currentForm && currentField && isOpen) {
      const formGuidance = MEDICAL_BILLING_KNOWLEDGE.formGuidance[currentForm as keyof typeof MEDICAL_BILLING_KNOWLEDGE.formGuidance]
      if (formGuidance && currentField in formGuidance) {
        const guidance = formGuidance[currentField as keyof typeof formGuidance]
        if (guidance) {
          addMessage('assistant', `💡 **Field Help**: ${guidance}`, 'slide-in')
        }
      }
    }
  }, [currentField, currentForm, isOpen])

  const addMessage = (type: 'user' | 'assistant', content: string, animation: 'typing' | 'fade-in' | 'slide-in' = 'fade-in', context?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      context,
      animation
    }
    setMessages(prev => [...prev, newMessage])
    
    // Update conversation context for assistant messages
    if (type === 'assistant' && context?.lastCode) {
      setConversationContext(prev => ({
        ...prev,
        lastCode: context.lastCode,
        lastTopic: context.lastTopic
      }))
    }
  }

  const showProactiveSuggestions = () => {
    const context = {
      currentForm,
      currentField,
      currentStep,
      userInput: inputValue
    }
    
    const suggestions = ProactiveSuggestionsService.getProactiveSuggestions(context)
    const filteredSuggestions = suggestions.filter(suggestion => 
      ProactiveSuggestionsService.shouldShowSuggestion(suggestion, context)
    )
    
    if (filteredSuggestions.length > 0) {
      setProactiveSuggestions(filteredSuggestions)
      setShowSuggestions(true)
      
      // Record shown suggestions
      filteredSuggestions.forEach(suggestion => {
        ProactiveSuggestionsService.recordShownSuggestion(suggestion)
      })
    }
  }

  const handleSuggestionClick = (suggestion: ProactiveSuggestion) => {
    setShowSuggestions(false)
    addMessage('user', suggestion.title, 'slide-in')
    
    // Record the interaction
    PersonalizationService.recordQuery(suggestion.title, suggestion.category, true, 0)
    
    // Process the suggestion
    setTimeout(() => {
      let response = ''
      switch (suggestion.action) {
        case 'verify_provider':
          response = 'I can help you verify provider NPI numbers! Just give me the NPI number or provider name and I\'ll search the official database for you.'
          break
        case 'search_codes':
          response = 'I\'d be happy to help you find diagnosis codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes" and I\'ll search our comprehensive database.'
          break
        case 'explain_terminology':
          response = 'I love explaining medical terminology! OD = Right Eye, OS = Left Eye, OU = Both Eyes. What other terms would you like me to explain?'
          break
        case 'show_favorites':
          const favoriteCodes = PersonalizationService.getFavoriteCodes()
          response = `Your favorite codes: ${favoriteCodes.join(', ')}. Need help with any of these?`
          break
        default:
          response = suggestion.content
      }
      addMessage('assistant', response, 'fade-in')
    }, 1000)
  }

  const processUserMessage = async (input: string) => {
    if (!input.trim()) return

    // Add user message
    addMessage('user', input, 'slide-in')

    // Process with enhanced AI service
    try {
      const response = await AIAssistantService.processUserInput(input, {
        formType: currentForm,
        currentField: currentField,
        currentStep: currentStep,
        formData: {} // Add form data if available
      })

      // Add assistant response
      addMessage('assistant', response, 'fade-in')
    } catch (error) {
      console.error('Error processing message:', error)
      addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.', 'fade-in')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()
    setInputValue('')

    // Record the query for personalization
    PersonalizationService.recordQuery(userInput, 'general', true, 0)

    setIsTyping(true)
    
    // Simulate AI processing time with typing animation
    setTimeout(async () => {
      await processUserMessage(userInput)
      setIsTyping(false)
      
      // Show new proactive suggestions after response
      // DISABLED: Proactive suggestions turned off as requested
      // setTimeout(() => {
      //   showProactiveSuggestions()
      // }, 1500)
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    let message = ''
    switch (action) {
      case 'terminology':
        message = 'I\'d love to help you with medical terminology! Here are some common terms:\n\n• **OD**: Right eye (Oculus Dexter)\n• **OS**: Left eye (Oculus Sinister)\n• **OU**: Both eyes (Oculus Uterque)\n• **PCP**: Primary Care Physician\n• **NPI**: National Provider Identifier\n• **HEDIS**: Healthcare Effectiveness Data and Information Set\n\nFeel free to ask about any other terms you encounter!'
        break
      case 'codes':
        message = 'I\'m here to help you find the right codes! Here are some common ones:\n\n• **E11.9**: Type 2 diabetes without complications\n• **H35.01**: Mild nonproliferative diabetic retinopathy\n• **H35.04**: Proliferative diabetic retinopathy\n• **Z79.4**: Long-term insulin use\n\nJust ask me about specific conditions and I\'ll search our comprehensive database for you!'
        break
      case 'form-help':
        message = 'I\'m here to make your forms easier! What specific field are you working on? I can explain what information is needed and how to enter it correctly. Just let me know which field you\'re stuck on!'
        break
    }
    if (message) {
      addMessage('assistant', message, 'fade-in')
    }
  }

  // Quick actions for common form field tasks
  const quickActions = [
    {
      id: 'field-help',
      label: 'Field Help',
      icon: 'help-circle',
      action: () => {
        if (currentField) {
          processUserMessage(`Help me with the ${currentField} field`)
        }
      }
    },
    {
      id: 'search-codes',
      label: 'Search Codes',
      icon: 'search',
      action: () => {
        processUserMessage('Search for medical codes')
      }
    },
    {
      id: 'validate-field',
      label: 'Validate',
      icon: 'check-circle',
      action: () => {
        if (currentField) {
          processUserMessage(`Validate the ${currentField} field`)
        }
      }
    },
    {
      id: 'next-step',
      label: 'Next Step',
      icon: 'arrow-right',
      action: () => {
        processUserMessage('What is the next step?')
      }
    }
  ]

  if (!isOpen) return null

  return (
    <>
      {isOpen && createPortal(
        <div className="ai-helper-modal fixed inset-0 z-[99999] flex items-end justify-end p-4">
          <div className="ai-helper-overlay absolute inset-0 bg-black/50" onClick={onClose} />
          
          <div className="ai-helper-container relative w-full max-w-md h-[600px] bg-white dark:bg-gray-900 rounded-t-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="ai-helper-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="ai-helper-icon w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="bot" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="ai-helper-title text-white font-semibold">M.I.L.A.</h3>
                  <p className="ai-helper-subtitle text-white/80 text-xs">Medical Intelligence & Learning Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="ai-helper-settings-btn p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Icon name="settings" size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="ai-helper-close-btn p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            {currentForm && currentField && (
              <div className="ai-helper-quick-actions p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="ai-helper-quick-actions-title text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Quick Actions for {currentField}
                </div>
                <div className="ai-helper-quick-actions-grid grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="ai-helper-quick-action-btn flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 text-xs"
                    >
                      <Icon name={action.icon} size={14} className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="ai-helper-messages flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-${message.animation || 'fade-in'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 transition-all duration-300 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg px-4 py-2 shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">M.I.L.A. is typing...</div>
                  </div>
                </div>
              )}

              {/* Proactive Suggestions - DISABLED */}
              {/* {showSuggestions && proactiveSuggestions.length > 0 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 shadow-md border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon name="lightbulb" size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">M.I.L.A. Suggestions</span>
                    </div>
                    <div className="space-y-2">
                      {proactiveSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start space-x-3">
                            {suggestion.icon && (
                              <Icon name={suggestion.icon} size={16} className="text-blue-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {suggestion.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {suggestion.content}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )} */}
              
              {/* Predictive Suggestions */}
              {showPredictiveSuggestions && predictiveSuggestions.length > 0 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 shadow-md border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon name="lightbulb" size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">M.I.L.A. Predictive Suggestions</span>
                    </div>
                    <div className="space-y-2">
                      {predictiveSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handlePredictiveSuggestionClick(suggestion)}
                          className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start space-x-3">
                            {suggestion.icon && (
                              <Icon name={suggestion.icon} size={16} className="text-blue-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {suggestion.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {suggestion.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowPredictiveSuggestions(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Code Selection Interface */}
              {codeSelectionMode && availableCodes.length > 0 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 shadow-md border border-green-200 dark:border-green-700 w-full">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon name="code" size={16} className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Codes</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {availableCodes.map((codeItem, index) => (
                        <button
                          key={index}
                          onClick={() => handleCodeSelect(codeItem.code, codeItem.description)}
                          className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 hover:shadow-md hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <Icon name="copy" size={14} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-mono font-medium text-gray-900 dark:text-white mb-1">
                                {codeItem.code}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {codeItem.description}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Icon name="arrow-right" size={14} className="text-green-500" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Click any code to automatically insert it into your field
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="ai-helper-input p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="ai-helper-form flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask M.I.L.A. anything..."
                  className="ai-helper-input-field flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="ai-helper-send-btn px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  <Icon name="send" size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Personalization Settings Modal */}
      <PersonalizationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  )
} 
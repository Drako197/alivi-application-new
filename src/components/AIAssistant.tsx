import React, { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import PersonalizationService from '../services/PersonalizationService'
import ProactiveSuggestionsService, { type ProactiveSuggestion } from '../services/ProactiveSuggestionsService'
import PersonalizationSettings from './PersonalizationSettings'

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

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  currentForm?: string
  currentField?: string
  currentStep?: number
  onFieldSuggestion?: (fieldName: string, suggestion: string) => void
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

export default function AIAssistant({ 
  isOpen, 
  onClose, 
  currentForm, 
  currentField, 
  currentStep,
  onFieldSuggestion 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [proactiveSuggestions, setProactiveSuggestions] = useState<ProactiveSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [conversationContext, setConversationContext] = useState<{
    lastCode?: string
    lastTopic?: string
  }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Add initial welcome message and setup personalization
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize personalization
      PersonalizationService.incrementSessionCount()
      
      // Get personalized welcome message
      const userStats = PersonalizationService.getUserStats()
      const preferences = PersonalizationService.getUserPreferences()
      
      let welcomeMessage = 'Hello! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. 👋\n\nI\'m here to make your medical billing experience smoother and more efficient. I can help you with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nWhat would you like to know? I\'m here to help! 💙'
      
      // Personalize message based on user experience
      if (userStats.sessionCount === 1) {
        welcomeMessage = 'Welcome to M.I.L.A.! I\'m your Medical Intelligence & Learning Assistant. 👋\n\nI\'m excited to help you with medical billing! I can assist with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nLet\'s get started! What would you like to know? 💙'
      } else if (userStats.sessionCount > 5) {
        welcomeMessage = 'Welcome back! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. 👋\n\nGreat to see you again! I\'m here to help with:\n\n• **Medical Terminology** - Understanding complex terms\n• **Diagnosis Codes** - Finding the right ICD-10 codes\n• **Procedure Codes** - Locating CPT codes with RVU values\n• **Provider Information** - Verifying NPI numbers\n• **Form Guidance** - Contextual help for form fields\n\nHow can I assist you today? 💙'
      }
      
      addMessage('assistant', welcomeMessage, 'fade-in')
      
      // Show proactive suggestions after a short delay
      // DISABLED: Proactive suggestions turned off as requested
      // setTimeout(() => {
      //   showProactiveSuggestions()
      // }, 2000)
    }
  }, [isOpen, messages.length])

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

  const processUserMessage = async (userInput: string) => {
    const input = userInput.toLowerCase().trim()
    
    // Check for terminology questions
    if (input.includes('what is') || input.includes('what does') || input.includes('meaning of')) {
      for (const [term, definition] of Object.entries(MEDICAL_BILLING_KNOWLEDGE.terminology)) {
        if (input.includes(term.toLowerCase())) {
          addMessage('assistant', `I'd be delighted to explain that for you! **${term}** stands for "${definition}". This is commonly used in medical billing and documentation to ensure clear communication.\n\nUnderstanding these terms helps make your work more efficient and accurate. Is there anything else you'd like me to clarify?`)
          return
        }
      }
    }

    // Check for specific code requests
    if (input.includes('diabetes') && input.includes('code')) {
      addMessage('assistant', `I'd be happy to help you with diabetes diagnosis codes! Here's a comprehensive list of the most commonly used codes for diabetes care:\n\n**Type 2 Diabetes:**\n• **E11.9**: Type 2 diabetes mellitus without complications\n• **E11.21**: Type 2 diabetes mellitus with diabetic nephropathy\n• **E11.22**: Type 2 diabetes mellitus with diabetic chronic kidney disease\n• **E11.29**: Type 2 diabetes mellitus with other diabetic kidney complication\n\n**Type 1 Diabetes:**\n• **E10.9**: Type 1 diabetes mellitus without complications\n• **E10.21**: Type 1 diabetes mellitus with diabetic nephropathy\n• **E10.22**: Type 1 diabetes mellitus with diabetic chronic kidney disease\n\n**Complications:**\n• **Z79.4**: Long term (current) use of insulin\n• **Z79.84**: Long term (current) use of oral hypoglycemic drugs\n\n**Retinopathy Codes:**\n• **H35.00**: Unspecified background retinopathy\n• **H35.01**: Mild nonproliferative diabetic retinopathy\n• **H35.02**: Moderate nonproliferative diabetic retinopathy\n• **H35.03**: Severe nonproliferative diabetic retinopathy\n• **H35.04**: Proliferative diabetic retinopathy\n\nI hope this helps make your coding work a bit easier! Let me know if you need any clarification on these codes.`)
      return
    }
    
    if (input.includes('retinopathy') && input.includes('code')) {
      addMessage('assistant', `I'd be delighted to help you with diabetic retinopathy diagnosis codes! Here's a comprehensive list of the codes you'll need for retinal screening and diabetic eye care:\n\n• **H35.00**: Unspecified background retinopathy\n• **H35.01**: Mild nonproliferative diabetic retinopathy\n• **H35.02**: Moderate nonproliferative diabetic retinopathy\n• **H35.03**: Severe nonproliferative diabetic retinopathy\n• **H35.04**: Proliferative diabetic retinopathy\n\n**Related Diabetes Codes:**\n• **E11.9**: Type 2 diabetes mellitus without complications\n• **E11.21**: Type 2 diabetes mellitus with diabetic nephropathy\n• **Z79.4**: Long term (current) use of insulin\n\nThese codes are essential for proper documentation of diabetic eye care. I hope this makes your coding work smoother!`)
      return
    }
    
    // Check for specific code searches (like "E11.9", "H35.01", etc.) - MUST BE FIRST
    for (const [code, description] of Object.entries(MEDICAL_BILLING_KNOWLEDGE.commonCodes)) {
      if (input.includes(code.toLowerCase())) {
        addMessage('assistant', `I'd be happy to help you with that code! **${code}**: ${description}\n\nThis code is commonly used in medical billing and documentation. Let me know if you need any additional information about it!`, 'fade-in', { lastCode: code, lastTopic: 'code_lookup' })
        return
      }
    }
    
    // Check for specific code lookups
    if (input.includes('code') || input.includes('icd') || input.includes('cpt')) {
      for (const [code, description] of Object.entries(MEDICAL_BILLING_KNOWLEDGE.commonCodes)) {
        if (input.includes(code.toLowerCase())) {
          addMessage('assistant', `I'd be happy to help you with that code! **${code}**: ${description}\n\nThis code is commonly used in medical billing and documentation. Let me know if you need any additional information about it!`)
          return
        }
      }
    }

    // Check for provider lookups
    if (input.includes('provider') || input.includes('doctor') || input.includes('npi') || input.includes('physician')) {
      addMessage('assistant', 'I\'d be happy to help you find provider information! I can assist you with searching by NPI number, provider name, or specialty. This helps ensure accurate billing and proper documentation.\n\nJust let me know what specific provider information you need, and I\'ll guide you through the process!')
      return
    }

    // Check for form-specific help
    if (input.includes('form') || input.includes('field') || input.includes('help')) {
      if (currentForm && currentField) {
        const formGuidance = MEDICAL_BILLING_KNOWLEDGE.formGuidance[currentForm as keyof typeof MEDICAL_BILLING_KNOWLEDGE.formGuidance]
        if (formGuidance && currentField in formGuidance) {
          const guidance = formGuidance[currentField as keyof typeof formGuidance]
          if (guidance) {
            addMessage('assistant', `I\'d be delighted to help you with that field! 💡 **${currentField} Help**: ${guidance}\n\nThis guidance helps ensure accurate and complete documentation. Let me know if you need any clarification!`)
            return
          }
        }
      }
    }

    // Check for follow-up questions about the last discussed code
    if (conversationContext.lastCode && (
      input.includes('more') || 
      input.includes('additional') || 
      input.includes('tell me more') ||
      input.includes('yes') ||
      input.includes('please')
    )) {
      const code = conversationContext.lastCode
      const description = MEDICAL_BILLING_KNOWLEDGE.commonCodes[code as keyof typeof MEDICAL_BILLING_KNOWLEDGE.commonCodes]
      
      if (description) {
        let additionalInfo = ''
        
        // Provide additional context based on the code
        if (code.startsWith('E11')) {
          additionalInfo = `\n\n**Additional Information for ${code}:**\n\n• **Category**: Type 2 Diabetes Mellitus\n• **Documentation Requirements**: Must specify if with/without complications\n• **Common Comorbidities**: Often used with Z79.4 (insulin use) or Z79.84 (oral medications)\n• **Billing Tips**: This is a primary diagnosis code - list it first on claims\n• **HEDIS Relevance**: Critical for diabetes care quality measures\n\n**Related Codes You Might Need:**\n• **E11.21**: With diabetic nephropathy\n• **E11.22**: With diabetic chronic kidney disease\n• **Z79.4**: Long-term insulin use\n• **Z79.84**: Long-term oral hypoglycemic use`
        } else if (code.startsWith('H35')) {
          additionalInfo = `\n\n**Additional Information for ${code}:**\n\n• **Category**: Diabetic Retinopathy\n• **Documentation Requirements**: Must specify severity level and laterality\n• **Common Procedures**: Often billed with 92250 (fundus photography)\n• **Billing Tips**: Use with primary diabetes code (E11.9)\n• **HEDIS Relevance**: Essential for diabetic eye care measures\n\n**Related Codes You Might Need:**\n• **92250**: Fundus photography with interpretation\n• **92227**: Retinal imaging for disease detection\n• **E11.9**: Type 2 diabetes (primary diagnosis)\n• **Z79.4**: Long-term insulin use`
        } else if (code.startsWith('Z79')) {
          additionalInfo = `\n\n**Additional Information for ${code}:**\n\n• **Category**: Long-term Drug Therapy\n• **Documentation Requirements**: Must specify current use and medication type\n• **Billing Tips**: Use as secondary diagnosis with primary condition\n• **HEDIS Relevance**: Important for medication adherence measures\n\n**Related Codes You Might Need:**\n• **E11.9**: Type 2 diabetes (primary diagnosis)\n• **H35.01**: Diabetic retinopathy (if applicable)\n• **92250**: Fundus photography (if retinal screening)`
        } else {
          additionalInfo = `\n\n**Additional Information for ${code}:**\n\n• **Documentation Requirements**: Ensure complete clinical documentation\n• **Billing Tips**: Verify code is current and appropriate for the service\n• **HEDIS Relevance**: Check if this code impacts quality measures\n\n**Need Help With:**\n• **Related codes** for this condition?\n• **Documentation requirements** for this code?\n• **Billing guidelines** for this service?`
        }
        
        addMessage('assistant', `I'd be delighted to provide more details about **${code}**! ${description}${additionalInfo}\n\nIs there anything specific about this code you'd like me to clarify further?`, 'fade-in', { lastCode: code, lastTopic: 'code_details' })
        return
      }
    }

    // General responses with M.I.L.A.'s personality
    if (input.includes('hello') || input.includes('hi')) {
      addMessage('assistant', 'Hello! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. I\'m here to help make your medical billing experience smoother and more efficient. How can I assist you today?')
    } else if (input.includes('thank')) {
      addMessage('assistant', 'You\'re very welcome! I\'m here to help make your work easier. Is there anything else I can assist you with?')
    } else if (input.includes('codes') || input.includes('icd')) {
      addMessage('assistant', 'I\'d be happy to help you find the right diagnosis codes! Here are some common categories:\n\n• **Diabetes Codes**: Ask "diabetes codes" for comprehensive diabetes ICD-10 codes\n• **Retinopathy Codes**: Ask "retinopathy codes" for diabetic retinopathy codes\n• **Specific Codes**: Ask about specific codes like "E11.9" or "H35.01"\n\nWhat specific condition or code are you looking for?')
    } else if (input.includes('terminology') || input.includes('terms')) {
      addMessage('assistant', 'I love explaining medical terminology! It helps everyone work more efficiently. Try asking about terms like "OD", "OS", "PCP", or "HEDIS" and I\'ll provide clear, helpful explanations.')
    } else {
      addMessage('assistant', 'Hi there! I\'m M.I.L.A., your Medical Intelligence & Learning Assistant. I\'m here to help with all your medical billing questions! You can ask me about:\n\n• **Medical Terminology** (OD, OS, PCP, etc.)\n• **Diagnosis Codes** (ICD-10)\n• **Procedure Codes** (CPT)\n• **Provider Information** (NPI lookup)\n• **Form Field Guidance** (contextual help)\n• **General Billing Questions**\n\nWhat would you like to know?')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()
    setInputValue('')
    addMessage('user', userInput, 'slide-in')

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Icon name="brain" size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">M.I.L.A.</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Medical Intelligence & Learning Assistant</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your friendly medical billing companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="M.I.L.A. Settings"
            >
              <Icon name="settings" size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon name="x" size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuickAction('terminology')}
              className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105"
            >
              Terminology
            </button>
            <button
              onClick={() => handleQuickAction('codes')}
              className="flex-1 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 hover:scale-105"
            >
              Codes
            </button>
            <button
              onClick={() => handleQuickAction('form-help')}
              className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 hover:scale-105"
            >
              Form Help
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask M.I.L.A. anything..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <Icon name="send" size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Personalization Settings Modal */}
      <PersonalizationSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
} 
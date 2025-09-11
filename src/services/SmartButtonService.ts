// Smart Button Service - Contextually aware button generation for M.I.L.A.
import type { InteractiveElement } from './EnhancedVisualResponseService'
import type { AIContext } from './AIAssistantService'

interface ButtonValidationResult {
  isValid: boolean
  reason?: string
  alternativeAction?: string
}

export class SmartButtonService {
  
  // Validate if a button action is appropriate for the current context
  static validateButtonAction(
    action: string, 
    context: AIContext, 
    responseContent: string,
    userInput?: string
  ): ButtonValidationResult {
    
    switch (action) {
      case 'search_code':
        return this.validateSearchCodeButton(responseContent, userInput, context)
      
      case 'search_provider':
        return this.validateSearchProviderButton(responseContent, userInput, context)
      
      case 'show_help':
        return this.validateShowHelpButton(responseContent, context)
      
      case 'try_again':
      case 'retry':
        return this.validateRetryButton(responseContent, userInput)
      
      case 'copy_code':
        return this.validateCopyCodeButton(responseContent)
      
      case 'navigate_pic_actions':
      case 'navigate_patient_eligibility':
      case 'navigate_claims_submission':
      case 'navigate_hedis_screening':
      case 'navigate_hedis_dashboard':
      case 'navigate_frames_lenses':
      case 'navigate_health_plans':
      case 'navigate_manual_eligibility':
        return this.validateNavigationButton(action, context)
      
      default:
        // Unknown action - be conservative and allow it
        return { isValid: true }
    }
  }

  // Validate search code button
  private static validateSearchCodeButton(
    responseContent: string, 
    userInput?: string,
    context?: AIContext
  ): ButtonValidationResult {
    
    // Don't show search code button if:
    // 1. User already searched for codes
    // 2. Response already contains specific codes
    // 3. User asked a non-code-related question
    
    if (userInput) {
      const searchTerms = ['search', 'find', 'lookup', 'codes']
      const alreadySearching = searchTerms.some(term => 
        userInput.toLowerCase().includes(term)
      )
      
      if (alreadySearching) {
        return {
          isValid: false,
          reason: 'User already performing a search',
          alternativeAction: 'show_help'
        }
      }

      // Don't show for navigation or help questions
      const nonCodeQuestions = [
        'where', 'how to', 'navigate', 'help', 'form', 'page', 'button'
      ]
      const isNonCodeQuestion = nonCodeQuestions.some(term =>
        userInput.toLowerCase().includes(term)
      )

      if (isNonCodeQuestion) {
        return {
          isValid: false,
          reason: 'Question is about navigation or help, not codes'
        }
      }
    }

    // Don't show if response already contains specific medical codes
    const codePatterns = [
      /[A-Z]\d{2}\.\d{1,2}/, // ICD-10 pattern
      /\d{5}/, // CPT pattern
      /[A-Z]\d{4}/ // Other medical codes
    ]
    
    const containsCodes = codePatterns.some(pattern => 
      pattern.test(responseContent)
    )
    
    if (containsCodes) {
      return {
        isValid: false,
        reason: 'Response already contains specific codes',
        alternativeAction: 'copy_code'
      }
    }

    return { isValid: true }
  }

  // Validate search provider button
  private static validateSearchProviderButton(
    responseContent: string,
    userInput?: string,
    context?: AIContext
  ): ButtonValidationResult {
    
    if (userInput) {
      const providerSearchTerms = ['provider', 'npi', 'doctor', 'physician']
      const isProviderRelated = providerSearchTerms.some(term =>
        userInput.toLowerCase().includes(term)
      )

      if (!isProviderRelated) {
        return {
          isValid: false,
          reason: 'Question is not provider-related'
        }
      }
    }

    return { isValid: true }
  }

  // Validate show help button
  private static validateShowHelpButton(
    responseContent: string,
    context?: AIContext
  ): ButtonValidationResult {
    
    // Always valid - help is always useful
    return { isValid: true }
  }

  // Validate retry button
  private static validateRetryButton(
    responseContent: string,
    userInput?: string
  ): ButtonValidationResult {
    
    // Only show retry if there was actually an error or no results
    const errorIndicators = [
      'error', 'failed', 'no results', 'not found', 'invalid', 'unavailable'
    ]
    
    const hasError = errorIndicators.some(indicator =>
      responseContent.toLowerCase().includes(indicator)
    )

    if (!hasError) {
      return {
        isValid: false,
        reason: 'No error to retry from'
      }
    }

    return { isValid: true }
  }

  // Validate copy code button
  private static validateCopyCodeButton(responseContent: string): ButtonValidationResult {
    
    // Only show if response contains a specific code
    const codePatterns = [
      /\*\*Code:\s*([A-Z0-9\.]+)\*\*/,
      /Code:\s*([A-Z0-9\.]+)/,
      /([A-Z]\d{2}\.\d{1,2}|\d{5}|[A-Z]\d{4})/
    ]
    
    const hasCode = codePatterns.some(pattern => pattern.test(responseContent))
    
    if (!hasCode) {
      return {
        isValid: false,
        reason: 'No specific code to copy'
      }
    }

    return { isValid: true }
  }

  // Validate navigation buttons
  private static validateNavigationButton(
    action: string,
    context?: AIContext
  ): ButtonValidationResult {
    
    // Always valid - navigation is always useful
    // But we could add logic here to avoid showing current page navigation
    
    return { isValid: true }
  }

  // Generate smart buttons based on context
  static generateSmartButtons(
    responseContent: string,
    userInput: string,
    context: AIContext,
    potentialButtons: Array<{ label: string; action: string; style?: string }>
  ): InteractiveElement[] {
    
    const validButtons: InteractiveElement[] = []
    
    for (const button of potentialButtons) {
      const validation = this.validateButtonAction(
        button.action,
        context,
        responseContent,
        userInput
      )
      
      if (validation.isValid) {
        validButtons.push({
          type: 'button',
          label: button.label,
          action: button.action,
          style: (button.style as any) || 'primary'
        })
      } else if (validation.alternativeAction) {
        // Replace with alternative action
        const alternativeLabel = this.getAlternativeLabel(validation.alternativeAction)
        if (alternativeLabel) {
          validButtons.push({
            type: 'button',
            label: alternativeLabel,
            action: validation.alternativeAction,
            style: (button.style as any) || 'info'
          })
        }
      }
    }
    
    return validButtons
  }

  // Get alternative button labels
  private static getAlternativeLabel(action: string): string | null {
    const labelMap: Record<string, string> = {
      'show_help': 'Get Help',
      'copy_code': 'Copy Code',
      'search_provider': 'Search Providers',
      'navigate_pic_actions': 'PIC Actions'
    }
    
    return labelMap[action] || null
  }

  // Generate contextual buttons based on response type
  static generateContextualButtons(
    responseContent: string,
    userInput: string,
    context: AIContext,
    responseType: 'gemini' | 'local' | 'error' | 'help' | 'navigation'
  ): InteractiveElement[] {
    
    const buttons: InteractiveElement[] = []
    
    switch (responseType) {
      case 'gemini':
        // For Gemini responses, focus on follow-up actions
        if (this.validateButtonAction('show_help', context, responseContent).isValid) {
          buttons.push({
            type: 'button',
            label: 'Related Help',
            action: 'show_help',
            style: 'info'
          })
        }
        break
        
      case 'local':
        // For local responses, offer expanded search if appropriate
        if (this.validateSearchCodeButton(responseContent, userInput, context).isValid) {
          buttons.push({
            type: 'button',
            label: 'Search More Codes',
            action: 'search_code',
            style: 'primary'
          })
        }
        break
        
      case 'error':
        // For errors, always offer retry
        buttons.push({
          type: 'button',
          label: 'Try Again',
          action: 'retry',
          style: 'primary'
        })
        break
        
      case 'help':
        // For help, offer practical actions
        buttons.push({
          type: 'button',
          label: 'PIC Actions',
          action: 'navigate_pic_actions',
          style: 'primary'
        })
        break
        
      case 'navigation':
        // Navigation responses already handled by specific navigation buttons
        break
    }
    
    return buttons
  }
}


// AI Assistant Service for medical billing assistance
import { MedicalAPIService } from './MedicalAPIService'
import { PredictiveSuggestionsService } from './PredictiveSuggestionsService'
import { WorkflowIntegrationService } from './WorkflowIntegrationService'
import { MobileEnhancementsService } from './MobileEnhancementsService'
import MedicalSpecialtiesService from './MedicalSpecialtiesService'

export interface CodeLookupResult {
  code: string
  description: string
  category: string
  validFrom: string
  validTo?: string
}

export interface ProviderLookupResult {
  npi: string
  name: string
  specialty: string
  address: string
  phone: string
}

export interface AIAssistantResponse {
  type: 'terminology' | 'code_lookup' | 'provider_lookup' | 'form_guidance' | 'general'
  content: string
  data?: any
  suggestions?: string[]
}

export class AIAssistantService {

  // Local knowledge base for immediate responses
  private static LOCAL_KNOWLEDGE = {
    terminology: {
      // General medical billing terms
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
      'CMS': 'Centers for Medicare & Medicaid Services',
      // Enhanced with specialty-specific terminology
      ...MedicalSpecialtiesService.getAllTerminology()
    },
    commonCodes: {
      // General codes
      'E11.9': 'Type 2 diabetes mellitus without complications',
      'E11.21': 'Type 2 diabetes mellitus with diabetic nephropathy',
      'E11.22': 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
      'Z79.4': 'Long term (current) use of insulin',
      'Z79.84': 'Long term (current) use of oral hypoglycemic drugs',
      // Enhanced with specialty-specific codes
      ...Object.fromEntries(
        MedicalSpecialtiesService.getAllCodes().map(code => [code, `Code: ${code}`])
      )
    }
  }

  // Enhanced processUserInput with new capabilities
  static async processUserInput(
    input: string,
    context: {
      formType?: string
      currentField?: string
      currentStep?: number
      formData?: Record<string, any>
    } = {}
  ): Promise<string> {
    const lowerInput = input.toLowerCase().trim()

    // Track user behavior for predictive suggestions
    if (context.formType && context.currentField) {
      PredictiveSuggestionsService.trackUserBehavior({
        formType: context.formType,
        fieldName: context.currentField,
        action: 'input',
        timestamp: new Date(),
        value: input
      })
    }

    // 1. Handle specific code lookups (ICD-10, CPT, HCPCS, Drug Codes, Lab Codes)
    if (this.isSpecificCodeLookup(lowerInput)) {
      return await this.handleSpecificCodeLookup(lowerInput)
    }

    // 2. Handle medical terminology
    if (this.isMedicalTerminology(lowerInput)) {
      return await this.handleMedicalTerminology(lowerInput)
    }

    // 3. Handle provider searches
    if (this.isProviderSearch(lowerInput)) {
      return await this.handleProviderSearch(lowerInput)
    }

    // 4. Handle eligibility checks
    if (this.isEligibilityCheck(lowerInput)) {
      return await this.handleEligibilityCheck(lowerInput)
    }

    // 5. Handle claims submission
    if (this.isClaimsSubmission(lowerInput)) {
      return await this.handleClaimsSubmission(lowerInput)
    }

    // 6. Handle workflow assistance
    if (this.isWorkflowAssistance(lowerInput)) {
      return await this.handleWorkflowAssistance(lowerInput, context)
    }

    // 7. Handle mobile-specific requests
    if (this.isMobileRequest(lowerInput)) {
      return await this.handleMobileRequest(lowerInput)
    }

    // 8. Handle general medical billing questions
    if (this.isGeneralQuestion(lowerInput)) {
      return await this.handleGeneralQuestion(lowerInput)
    }

    // 9. Handle specialty-specific questions
    if (this.isSpecialtyQuestion(lowerInput)) {
      return await this.handleSpecialtyQuestion(lowerInput)
    }

    // 10. Default response with enhanced capabilities
    return this.getEnhancedDefaultResponse(lowerInput, context)
  }

  private static isTerminologyQuestion(input: string): boolean {
    const terminologyKeywords = ['what is', 'what does', 'meaning of', 'define', 'term', 'abbreviation']
    return terminologyKeywords.some(keyword => input.includes(keyword))
  }

  private static isICD10Lookup(input: string): boolean {
    const icdKeywords = ['icd', 'diagnosis', 'condition', 'disease']
    return icdKeywords.some(keyword => input.includes(keyword))
  }

  private static isCPTLookup(input: string): boolean {
    const cptKeywords = ['cpt', 'procedure', 'service', 'treatment']
    return cptKeywords.some(keyword => input.includes(keyword))
  }

  private static isSpecialtyQuestion(input: string): boolean {
    const specialtyKeywords = ['specialty', 'specialist', 'ophthalmology', 'cardiology', 'endocrinology', 'nephrology', 'pulmonology', 'gastroenterology', 'neurology', 'orthopedics']
    return specialtyKeywords.some(keyword => input.includes(keyword))
  }

  private static isProviderLookup(input: string): boolean {
    const providerKeywords = ['provider', 'doctor', 'physician', 'npi', 'find doctor', 'lookup provider']
    return providerKeywords.some(keyword => input.includes(keyword))
  }

  private static isFormHelp(input: string): boolean {
    const formKeywords = ['form', 'field', 'help', 'how to', 'what do i enter']
    return formKeywords.some(keyword => input.includes(keyword))
  }

  private static async handleTerminologyQuestion(input: string): Promise<AIAssistantResponse> {
    // Check local knowledge first
    for (const [term, definition] of Object.entries(this.LOCAL_KNOWLEDGE.terminology)) {
      if (input.toLowerCase().includes(term.toLowerCase())) {
        return {
          type: 'terminology',
          content: `**${term}** stands for "${definition}". This is commonly used in medical billing and documentation. I hope this helps clarify things for you!`,
          data: { term, definition }
        }
      }
    }

    // Use medical terms API for enhanced terminology lookup
    try {
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length > 0) {
        const searchTerm = searchTerms[0]
        const result = await MedicalAPIService.searchMedicalTerms(searchTerm)
        
        if (result.success && result.data && result.data.length > 0) {
          const terms = result.data
          const content = terms.map(term => 
            `**${term.term}**: ${term.definition} (Category: ${term.category})`
          ).join('\n')
          
          return {
            type: 'terminology',
            content: `I found ${terms.length} medical term(s) for "${searchTerm}":\n\n${content}\n\nI hope this information is helpful for your work!`,
            data: { terms, searchTerm },
            suggestions: terms.map(term => term.term)
          }
        }
      }
    } catch (error) {
      console.error('Medical terms lookup error:', error)
    }

    // Fallback to general terminology help with M.I.L.A.'s personality
    return {
      type: 'terminology',
      content: 'I\'d be happy to help you with medical billing terminology! Medical terms can be confusing, but I\'m here to make them clearer. Try asking about terms like "OD", "OS", "PCP", "HEDIS", "NPI", or "CPT" and I\'ll provide helpful explanations.',
      suggestions: ['OD', 'OS', 'PCP', 'HEDIS', 'NPI', 'CPT']
    }
  }

  private static async handleICD10Lookup(input: string): Promise<AIAssistantResponse> {
    // Check local knowledge first
    for (const [code, description] of Object.entries(this.LOCAL_KNOWLEDGE.commonCodes)) {
      if (input.toLowerCase().includes(code.toLowerCase())) {
        return {
          type: 'code_lookup',
          content: `**${code}**: ${description}`,
          data: { code, description }
        }
      }
    }

    // Use real ICD-10 API
    try {
      // Extract search terms from input
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length === 0) {
        return {
          type: 'code_lookup',
          content: 'I can help you find diagnosis codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes".',
          suggestions: ['E11.9', 'H35.01', 'I10', 'H35.00']
        }
      }

      // Search using the first relevant term
      const searchTerm = searchTerms[0]
      const result = await MedicalAPIService.searchICD10Codes(searchTerm)
      
      if (result.success && result.data && result.data.length > 0) {
        const codes = result.data
        const content = codes.map(code => 
          `**${code.code}**: ${code.description}`
        ).join('\n')
        
        return {
          type: 'code_lookup',
          content: `Found ${codes.length} ICD-10 code(s) for "${searchTerm}":\n\n${content}`,
          data: { codes, searchTerm },
          suggestions: codes.slice(0, 3).map(code => code.code)
        }
      } else {
        return {
          type: 'code_lookup',
          content: `No ICD-10 codes found for "${searchTerm}". Try searching for a different condition or symptom.`,
          suggestions: ['diabetes', 'retinopathy', 'hypertension', 'cataracts']
        }
      }
    } catch (error) {
      console.error('ICD-10 lookup error:', error)
      return {
        type: 'code_lookup',
        content: 'I can help you find diagnosis codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes".',
        suggestions: ['E11.9', 'H35.01', 'I10', 'H35.00']
      }
    }
  }

  private static async handleCPTLookup(input: string): Promise<AIAssistantResponse> {
    try {
      // Extract search terms from input
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length === 0) {
        return {
          type: 'code_lookup',
          content: 'I can help you find procedure codes! Try asking about specific procedures like "retinal imaging" or "diabetes management".',
          suggestions: ['92250', '92227', '99213', '99214']
        }
      }

      // Search using the first relevant term
      const searchTerm = searchTerms[0]
      const result = await MedicalAPIService.searchCPTCodes(searchTerm)
      
      if (result.success && result.data && result.data.length > 0) {
        const codes = result.data
        const content = codes.map(code => 
          `**${code.code}**: ${code.description} (RVU: ${code.rvu || 'N/A'})`
        ).join('\n')
        
        return {
          type: 'code_lookup',
          content: `Found ${codes.length} CPT code(s) for "${searchTerm}":\n\n${content}`,
          data: { codes, searchTerm },
          suggestions: codes.slice(0, 3).map(code => code.code)
        }
      } else {
        return {
          type: 'code_lookup',
          content: `No CPT codes found for "${searchTerm}". Try searching for a different procedure or service.`,
          suggestions: ['retinal imaging', 'diabetes management', 'lab tests', 'office visit']
        }
      }
    } catch (error) {
      console.error('CPT lookup error:', error)
      return {
        type: 'code_lookup',
        content: 'I can help you find procedure codes! Try asking about specific procedures like "retinal imaging" or "diabetes management".',
        suggestions: ['92250', '92227', '99213', '99214']
      }
    }
  }

  private static handleSpecialtyQuestion(input: string): AIAssistantResponse {
    const lowerInput = input.toLowerCase()
    
    // Check for specific specialty mentions
    const specialties = MedicalSpecialtiesService.getSpecialties()
    const mentionedSpecialty = specialties.find(specialty => 
      lowerInput.includes(specialty)
    )

    if (mentionedSpecialty) {
      const specialtyData = MedicalSpecialtiesService.getSpecialty(mentionedSpecialty)
      if (specialtyData) {
        const content = `**${specialtyData.name}**\n\n` +
          `**Description**: ${specialtyData.description}\n\n` +
          `**Common Procedures**:\n${specialtyData.procedures.slice(0, 5).map(p => `• ${p}`).join('\n')}\n\n` +
          `**Common Conditions**:\n${specialtyData.conditions.slice(0, 5).map(c => `• ${c}`).join('\n')}\n\n` +
          `**Common Codes**: ${specialtyData.commonCodes.slice(0, 3).join(', ')}`

        return {
          type: 'general',
          content,
          data: { specialty: specialtyData },
          suggestions: specialtyData.commonCodes.slice(0, 3)
        }
      }
    }

    // General specialty information
    const allSpecialties = MedicalSpecialtiesService.getSpecialties()
    const content = `**Available Medical Specialties**:\n\n` +
      allSpecialties.map(specialty => {
        const data = MedicalSpecialtiesService.getSpecialty(specialty)
        return `• **${data?.name}**: ${data?.description}`
      }).join('\n')

    return {
      type: 'general',
      content,
      data: { specialties: allSpecialties },
      suggestions: allSpecialties.slice(0, 5)
    }
  }

  private static async handleProviderLookup(input: string): Promise<AIAssistantResponse> {
    try {
      // Extract NPI number or provider name from input
      const npiMatch = input.match(/\b\d{10}\b/) // Match 10-digit NPI
      const searchTerms = this.extractSearchTerms(input)
      
      if (npiMatch) {
        // Search by NPI number
        const npi = npiMatch[0]
        const result = await MedicalAPIService.searchProviderByNPI(npi)
        
        if (result.success && result.data) {
          const provider = result.data
          return {
            type: 'provider_lookup',
            content: `**Provider Found**:\n• **Name**: ${provider.name}\n• **NPI**: ${provider.npi}\n• **Specialty**: ${provider.specialty}\n• **Address**: ${provider.address}\n• **Phone**: ${provider.phone}`,
            data: { provider },
            suggestions: [provider.npi, provider.specialty]
          }
        } else {
          return {
            type: 'provider_lookup',
            content: `No provider found with NPI ${npi}. Please verify the NPI number.`,
            suggestions: ['Check NPI format', 'Search by name instead']
          }
        }
      } else if (searchTerms.length > 0) {
        // Search by name or specialty
        const searchTerm = searchTerms[0]
        const result = await MedicalAPIService.searchProviders(searchTerm)
        
        if (result.success && result.data && result.data.length > 0) {
          const providers = result.data
          const content = providers.map(provider => 
            `• **${provider.name}** (NPI: ${provider.npi}) - ${provider.specialty}`
          ).join('\n')
          
          return {
            type: 'provider_lookup',
            content: `Found ${providers.length} provider(s) for "${searchTerm}":\n\n${content}`,
            data: { providers, searchTerm },
            suggestions: providers.slice(0, 3).map(p => p.npi)
          }
        } else {
          return {
            type: 'provider_lookup',
            content: `No providers found for "${searchTerm}". Try searching by a different name or specialty.`,
            suggestions: ['Cardiology', 'Internal Medicine', 'Family Practice']
          }
        }
      } else {
        return {
          type: 'provider_lookup',
          content: 'I can help you find provider information! Try searching by NPI number, name, or specialty.',
          suggestions: ['Search by NPI', 'Search by name', 'Search by specialty']
        }
      }
    } catch (error) {
      console.error('Provider lookup error:', error)
      return {
        type: 'provider_lookup',
        content: 'I can help you find provider information! Try searching by name, specialty, or location.',
        suggestions: ['Search by name', 'Search by specialty', 'Search by location']
      }
    }
  }

  private static handleFormHelp(input: string, context: any): AIAssistantResponse {
    const formGuidance = {
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

    if (context.currentField) {
      const formGuidanceData = formGuidance[context.currentForm as keyof typeof formGuidance]
      if (formGuidanceData && context.currentField in formGuidanceData) {
        const guidance = formGuidanceData[context.currentField as keyof typeof formGuidanceData]
        if (guidance) {
          return {
            type: 'form_guidance',
            content: `💡 **${context.currentField} Help**: ${guidance}`,
            data: { field: context.currentField, guidance }
          }
        }
      }
    }

    return {
      type: 'form_guidance',
      content: 'I can help you with form fields! What specific field are you working on? I can explain what information is needed and how to enter it correctly.',
      suggestions: ['providerId', 'subscriberId', 'diagnosisCodes', 'odSphere', 'osSphere']
    }
  }

  private static handleGeneralQuestion(input: string): AIAssistantResponse {
    if (input.includes('hello') || input.includes('hi')) {
      return {
        type: 'general',
        content: 'Hello! How can I help you with your medical billing today?',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    } else if (input.includes('thank')) {
      return {
        type: 'general',
        content: 'You\'re welcome! Is there anything else I can help you with?',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    } else {
      return {
        type: 'general',
        content: 'I\'m here to help with medical billing questions! You can ask me about:\n• Terminology (OD, OS, PCP, etc.)\n• Diagnosis codes\n• Form field guidance\n• General billing questions',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    }
  }

  // Simulate external API calls (in real implementation, these would be actual API calls)
  private static async simulateExternalAPICall(type: string, query: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    switch (type) {
      case 'code_lookup':
        return {
          content: `Found codes matching "${query}":\n• E11.9: Type 2 diabetes mellitus without complications\n• H35.01: Mild nonproliferative diabetic retinopathy\n• Z79.4: Long term (current) use of insulin`,
          data: {
            codes: [
              { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
              { code: 'H35.01', description: 'Mild nonproliferative diabetic retinopathy' },
              { code: 'Z79.4', description: 'Long term (current) use of insulin' }
            ]
          }
        }
      
      case 'provider_lookup':
        return {
          content: `Found providers matching "${query}":\n• Dr. Sarah Johnson (NPI: 1234567890) - Cardiology\n• Dr. Michael Chen (NPI: 2345678901) - Internal Medicine\n• Dr. Emily Rodriguez (NPI: 3456789012) - Family Practice`,
          data: {
            providers: [
              { npi: '1234567890', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
              { npi: '2345678901', name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
              { npi: '3456789012', name: 'Dr. Emily Rodriguez', specialty: 'Family Practice' }
            ]
          }
        }
      
      default:
        throw new Error('Unknown API call type')
    }
  }

  // Get quick suggestions based on current context
  static getQuickSuggestions(context?: {
    currentForm?: string
    currentField?: string
    currentStep?: number
  }): string[] {
    if (context?.currentForm === 'PatientEligibilityForm') {
      return ['providerId', 'subscriberId', 'dependantSequence', 'lastName', 'firstName']
    } else if (context?.currentForm === 'ClaimsSubmissionForm') {
      return ['diagnosisCodes', 'odSphere', 'osSphere', 'odCylinder', 'osCylinder']
    }
    
    return ['Terminology', 'Codes', 'Form Help']
  }

  // Extract search terms from user input
  private static extractSearchTerms(input: string): string[] {
    const medicalTerms = [
      'diabetes', 'diabetic', 'retinopathy', 'eye', 'retinal', 'cataracts', 'glaucoma',
      'hypertension', 'nephropathy', 'kidney', 'heart', 'cardiac', 'pulmonary',
      'cancer', 'tumor', 'neoplasm', 'fracture', 'injury', 'trauma', 'infection',
      'bacterial', 'viral', 'fungal', 'allergy', 'asthma', 'copd', 'arthritis',
      'osteoporosis', 'depression', 'anxiety', 'stroke', 'seizure', 'migraine'
    ]
    
    const lowerInput = input.toLowerCase()
    return medicalTerms.filter(term => lowerInput.includes(term))
  }

  // Get contextual help for a specific field
  static getFieldHelp(formName: string, fieldName: string): string | null {
    const formGuidance = {
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

    const formGuidanceData = formGuidance[formName as keyof typeof formGuidance]
    if (formGuidanceData && fieldName in formGuidanceData) {
      return formGuidanceData[fieldName as keyof typeof formGuidanceData] || null
    }
    return null
  }

  // Enhanced specific code lookup with multiple code types
  private static isSpecificCodeLookup(input: string): boolean {
    const codePatterns = [
      /[A-Z]\d{2}\.\d{1,2}/, // ICD-10
      /\d{5}/, // CPT
      /[A-Z]\d{4}/, // HCPCS
      /[A-Z]\d{3}/, // Drug codes
      /\d{4}/ // Lab codes
    ]
    
    return codePatterns.some(pattern => pattern.test(input)) ||
           input.includes('icd') ||
           input.includes('cpt') ||
           input.includes('hcpcs') ||
           input.includes('drug') ||
           input.includes('lab') ||
           input.includes('code')
  }

  private static async handleSpecificCodeLookup(input: string): Promise<string> {
    // Check for specific code patterns
    const icd10Match = input.match(/[A-Z]\d{2}\.\d{1,2}/)
    const cptMatch = input.match(/\d{5}/)
    const hcpcsMatch = input.match(/[A-Z]\d{4}/)
    const drugMatch = input.match(/[A-Z]\d{3}/)
    const labMatch = input.match(/\d{4}/)

    if (icd10Match) {
      const code = icd10Match[0]
      const result = await MedicalAPIService.searchICD10Codes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that ICD-10 code! **${code}**: ${result[0].description}\n\nThis code is commonly used in medical billing and documentation. Let me know if you need any additional information about it!`
      }
    }

    if (cptMatch) {
      const code = cptMatch[0]
      const result = await MedicalAPIService.searchCPTCodes(code)
      if (result.length > 0) {
        return `I'd be delighted to help you with that CPT code! **${code}**: ${result[0].description}\n\nThis procedure code is essential for billing and documentation. Is there anything specific about this code you'd like me to clarify?`
      }
    }

    if (hcpcsMatch) {
      const code = hcpcsMatch[0]
      const result = await MedicalAPIService.searchHCPCSCodes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that HCPCS code! **${code}**: ${result[0].description}\n\nThis code is used for Medicare and other insurance billing. Let me know if you need any additional information!`
      }
    }

    if (drugMatch) {
      const code = drugMatch[0]
      const result = await MedicalAPIService.searchDrugCodes(code)
      if (result.length > 0) {
        return `I'd be delighted to help you with that drug code! **${code}**: ${result[0].description}\n\nThis code is used for medication billing and documentation. Is there anything specific about this medication you'd like me to clarify?`
      }
    }

    if (labMatch) {
      const code = labMatch[0]
      const result = await MedicalAPIService.searchLabCodes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that lab code! **${code}**: ${result[0].description}\n\nThis code is used for laboratory testing billing and documentation. Let me know if you need any additional information!`
      }
    }

    // General code search
    if (input.includes('diabetes') && input.includes('code')) {
      const codes = await MedicalAPIService.searchICD10Codes('diabetes')
      return `I'd be delighted to help you with diabetes codes! Here are some commonly used ICD-10 codes for diabetes:\n\n${codes.slice(0, 5).map(c => `• **${c.code}**: ${c.description}`).join('\n')}\n\nThese codes are essential for diabetes care documentation and billing. Would you like me to explain any of these codes in more detail?`
    }

    if (input.includes('retinopathy') && input.includes('code')) {
      const codes = await MedicalAPIService.searchICD10Codes('retinopathy')
      return `I'd be happy to help you with retinopathy codes! Here are some commonly used ICD-10 codes for diabetic retinopathy:\n\n${codes.slice(0, 5).map(c => `• **${c.code}**: ${c.description}`).join('\n')}\n\nThese codes are critical for diabetic eye care documentation. Would you like me to explain any of these codes in more detail?`
    }

    return `I'd be happy to help you find the right medical codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes" and I'll search our comprehensive database for you. You can also search for specific codes like "E11.9" or "92250" and I'll provide detailed information.`
  }

  // Enhanced medical terminology handling
  private static isMedicalTerminology(input: string): boolean {
    const medicalTerms = ['od', 'os', 'ou', 'pcp', 'npi', 'hedis', 'icd', 'cpt', 'hcpcs', 'ehr', 'emr']
    return medicalTerms.some(term => input.includes(term))
  }

  private static async handleMedicalTerminology(input: string): Promise<string> {
    const result = await MedicalAPIService.searchMedicalTerms(input)
    if (result.length > 0) {
      const term = result[0]
      return `I'd be delighted to explain that medical term! **${term.term.toUpperCase()}**: ${term.definition}\n\nThis is a common term in medical billing and documentation. Is there anything specific about this term you'd like me to clarify further?`
    }
    return `I'd be happy to help you understand medical terminology! Try asking about terms like "OD", "OS", "PCP", "NPI", or "HEDIS" and I'll provide clear explanations.`
  }

  // Enhanced provider search
  private static isProviderSearch(input: string): boolean {
    return input.includes('provider') || input.includes('doctor') || input.includes('physician') || input.includes('npi')
  }

  private static async handleProviderSearch(input: string): Promise<string> {
    const result = await MedicalAPIService.searchProviders({ name: input })
    if (result.length > 0) {
      const provider = result[0]
      return `I'd be happy to help you find provider information! Here's what I found:\n\n**${provider.name}**\nSpecialty: ${provider.specialty}\nAddress: ${provider.address}\nPhone: ${provider.phone}\n\nWould you like me to search for more providers or get additional information about this provider?`
    }
    return `I'd be delighted to help you find provider information! Try searching by name, specialty, or location and I'll search our provider directory for you.`
  }

  // Enhanced eligibility check
  private static isEligibilityCheck(input: string): boolean {
    return input.includes('eligibility') || input.includes('insurance') || input.includes('coverage')
  }

  private static async handleEligibilityCheck(input: string): Promise<string> {
    return `I'd be happy to help you check insurance eligibility! I can verify patient insurance coverage for specific services. To check eligibility, I'll need the patient ID and insurance information. Would you like me to guide you through the eligibility verification process?`
  }

  // Enhanced claims submission
  private static isClaimsSubmission(input: string): boolean {
    return input.includes('claim') || input.includes('submit') || input.includes('billing')
  }

  private static async handleClaimsSubmission(input: string): Promise<string> {
    return `I'd be delighted to help you with claims submission! I can assist with preparing and submitting medical claims. To submit a claim, I'll need the patient information, service details, and provider information. Would you like me to guide you through the claims submission process?`
  }

  // Enhanced workflow assistance
  private static isWorkflowAssistance(input: string): boolean {
    return input.includes('workflow') || input.includes('step') || input.includes('form') || input.includes('validation')
  }

  private static async handleWorkflowAssistance(input: string, context: any): Promise<string> {
    if (context.formType) {
      const workflow = WorkflowIntegrationService.initializeWorkflow(context.formType)
      const currentStep = workflow.find(s => s.id === context.currentField)
      
      if (currentStep) {
        return `I'd be happy to help you with the ${currentStep.title} step! This step involves ${currentStep.description}. Let me know if you need help with any specific fields or validation requirements.`
      }
    }
    
    return `I'd be delighted to help you with workflow assistance! I can guide you through form steps, validation requirements, and help ensure all required information is complete. What specific aspect of the workflow would you like help with?`
  }

  // Enhanced mobile request handling
  private static isMobileRequest(input: string): boolean {
    return input.includes('mobile') || input.includes('touch') || input.includes('voice') || input.includes('offline')
  }

  private static async handleMobileRequest(input: string): Promise<string> {
    if (input.includes('voice')) {
      return `I'd be happy to help you with voice input! You can use voice commands like "next step", "open mila", "search codes", or "help" to interact with me hands-free. Just tap the microphone icon to start voice input.`
    }
    
    if (input.includes('touch')) {
      return `I'd be delighted to help you with touch gestures! You can swipe left/right to navigate between steps, swipe up to open me, or long-press on fields for additional help. These gestures make mobile form completion much easier!`
    }
    
    if (input.includes('offline')) {
      return `I'd be happy to help you with offline capabilities! I can work offline and cache essential data like medical codes and form templates. When you're back online, I'll automatically sync any changes.`
    }
    
    return `I'd be delighted to help you with mobile features! I support touch gestures, voice input, offline capabilities, and mobile-optimized interfaces. What specific mobile feature would you like to learn more about?`
  }

  // Enhanced general question handling
  private static isGeneralQuestion(input: string): boolean {
    return input.includes('what') || input.includes('how') || input.includes('why') || input.includes('when')
  }

  // Enhanced default response with predictive suggestions
  private static getEnhancedDefaultResponse(input: string, context: any): string {
    let response = `Hi there! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. I'm here to help with all your medical billing questions! You can ask me about:\n\n• **Medical Terminology** (OD, OS, PCP, etc.)\n• **Diagnosis Codes** (ICD-10)\n• **Procedure Codes** (CPT, HCPCS)\n• **Drug & Lab Codes** (J-codes, 8-series)\n• **Provider Information** (NPI lookup)\n• **Insurance Eligibility** (coverage verification)\n• **Claims Submission** (billing assistance)\n• **Form Field Guidance** (contextual help)\n• **Workflow Assistance** (step-by-step guidance)\n• **Mobile Features** (touch, voice, offline)\n• **General Billing Questions**\n\nWhat would you like to know?`

    // Add context-specific suggestions
    if (context.formType && context.currentField) {
      response += `\n\n💡 **Smart Tip**: I can provide predictive suggestions based on your current form and field. Just let me know what you're working on!`
    }

    return response
  }
}

export default AIAssistantService 
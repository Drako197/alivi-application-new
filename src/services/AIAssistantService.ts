// AI Assistant Service for medical billing assistance
import MedicalAPIService, { type ICD10Code, type CPTCode, type MedicalTerm, type ProviderInfo } from './MedicalAPIService'
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

class AIAssistantService {

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

  // Process user input and generate appropriate response
  static async processUserInput(input: string, context?: {
    currentForm?: string
    currentField?: string
    currentStep?: number
  }): Promise<AIAssistantResponse> {
    const lowerInput = input.toLowerCase()

    // Check for specialty-specific questions
    if (this.isSpecialtyQuestion(lowerInput)) {
      return this.handleSpecialtyQuestion(input)
    }

    // Check for terminology questions
    if (this.isTerminologyQuestion(lowerInput)) {
      return await this.handleTerminologyQuestion(input)
    }

    // Check for ICD-10 code lookups
    if (this.isICD10Lookup(lowerInput)) {
      return await this.handleICD10Lookup(input)
    }

    // Check for CPT code lookups
    if (this.isCPTLookup(lowerInput)) {
      return await this.handleCPTLookup(input)
    }

    // Check for provider lookups
    if (this.isProviderLookup(lowerInput)) {
      return await this.handleProviderLookup(input)
    }

    // Check for form-specific help
    if (this.isFormHelp(lowerInput) && context?.currentForm) {
      return this.handleFormHelp(input, context)
    }

    // Default to general help
    return this.handleGeneralQuestion(input)
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
}

export default AIAssistantService 
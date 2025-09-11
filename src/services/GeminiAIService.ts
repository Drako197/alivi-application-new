// Google Gemini AI Service for enhanced medical billing assistance
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIContext } from './AIAssistantService'

// Gemini AI configuration
const GEMINI_CONFIG = {
  model: 'gemini-1.5-flash', // Free tier model
  maxTokens: 1000,
  temperature: 0.3, // Lower temperature for medical accuracy
  rateLimitDelay: 4000, // 4 seconds between requests (15 requests/minute limit)
}

// Request tracking for rate limiting
interface RequestTracker {
  count: number
  windowStart: number
  queue: Array<() => void>
}

export class GeminiAIService {
  private static genAI: GoogleGenerativeAI | null = null
  private static requestTracker: RequestTracker = {
    count: 0,
    windowStart: Date.now(),
    queue: []
  }

  // Initialize Gemini AI
  private static initializeGemini(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey || apiKey === 'your_api_key_here') {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.')
      }
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
    return this.genAI
  }

  // Rate limiting handler
  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const windowDuration = 60000 // 1 minute

    // Reset counter if window has passed
    if (now - this.requestTracker.windowStart > windowDuration) {
      this.requestTracker.count = 0
      this.requestTracker.windowStart = now
    }

    // If we're at the limit, wait
    if (this.requestTracker.count >= 15) {
      const waitTime = windowDuration - (now - this.requestTracker.windowStart)
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.requestTracker.count = 0
      this.requestTracker.windowStart = Date.now()
    }

    // Increment counter
    this.requestTracker.count++
  }

  // Enhanced medical billing prompt
  private static createMedicalBillingPrompt(input: string, context: AIContext): string {
    const systemContext = `You are M.I.L.A. (Medical Intelligence & Learning Assistant), a specialized AI assistant for medical billing professionals. 

CORE EXPERTISE:
- Medical billing and coding (ICD-10, CPT, HCPCS)
- Healthcare terminology and procedures
- Insurance eligibility and claims processing
- HEDIS quality measures
- Provider credentialing and NPI validation
- Prescription and eyewear coding

CURRENT CONTEXT:
- Form: ${context.formType || 'General'}
- Field: ${context.currentField || 'N/A'}
- Step: ${context.currentStep || 'N/A'}
- Device: ${context.deviceType || 'desktop'}

RESPONSE GUIDELINES:
1. Be accurate and professional
2. Provide specific, actionable information
3. Use medical billing terminology appropriately
4. Include relevant codes when applicable
5. Be concise but thorough
6. Always prioritize accuracy over speed
7. If unsure, say so rather than guess
8. For definition requests, provide comprehensive explanations with billing context
9. Offer related terms and follow-up suggestions when appropriate
10. Use clear, accessible language while maintaining medical accuracy

DEFINITION RESPONSE FORMAT:
When providing definitions, structure your response as:
- **Term**: Clear, concise definition
- **Medical Context**: How it relates to patient care
- **Billing Context**: How it affects coding and billing
- **Related Terms**: Other relevant terms to know
- **Follow-up Suggestions**: What else the user might want to know

SAFETY RULES:
- Never process or store PHI (Protected Health Information)
- Don't provide medical diagnoses or treatment advice
- Stick to billing, coding, and administrative guidance
- Always recommend consulting official sources for critical decisions

USER QUERY: ${input}

Please provide a helpful, accurate response focused on medical billing assistance. If this is a definition request, provide a comprehensive explanation with billing context and related information.`

    return systemContext
  }

  // Determine if query should use Gemini AI
  public static shouldUseGemini(input: string, context: AIContext): boolean {
    const input_lower = input.toLowerCase()
    
    // Use Gemini for complex reasoning and natural language queries
    const geminiIndicators = [
      // Complex questions
      'explain why', 'how does', 'what happens when', 'walk me through',
      'difference between', 'compare', 'relationship between',
      
      // Multi-step reasoning
      'step by step', 'process for', 'workflow', 'procedure',
      
      // Ambiguous or conversational queries
      'help me understand', 'confused about', 'not sure', 'clarify',
      
      // Complex medical scenarios
      'patient has', 'condition with', 'multiple', 'complicated case',
      
      // Billing strategy questions
      'best way to', 'should i', 'recommend', 'advice',
      
      // Context-dependent questions
      'in this case', 'for this situation', 'given that',
      
      // Enhanced definition and explanation requests
      'explain the difference', 'what is the difference', 'how are they different',
      'tell me more about', 'can you elaborate', 'provide more details',
      'what does this mean', 'what is the meaning', 'explain in detail',
      'comprehensive explanation', 'detailed definition', 'full explanation'
    ]

    // Don't use Gemini for simple lookups that local knowledge handles well
    const localKnowledgeIndicators = [
      // Direct code lookups
      /^[A-Z]\d{2}\.\d{1,2}$/, // ICD-10 pattern
      /^\d{5}$/, // CPT pattern
      /^[A-Z]{2,3}\d{3}$/, // Simple code pattern
      
      // Simple terminology
      'what is od', 'what is os', 'what is npi', 'what is cpt',
      
      // Form field help (handled by existing system)
      'help with field', 'field guidance', 'form help',
      
      // "Show all" requests - handled by local knowledge base
      'show me all', 'list all', 'show all', 'list me all'
    ]

    // Check if it matches local knowledge patterns
    for (const pattern of localKnowledgeIndicators) {
      if (typeof pattern === 'string' && input_lower.includes(pattern)) {
        return false
      }
      if (pattern instanceof RegExp && pattern.test(input)) {
        return false
      }
    }

    // Check if it matches Gemini indicators
    return geminiIndicators.some(indicator => input_lower.includes(indicator)) ||
           input.split(' ').length > 8 || // Long queries likely need reasoning
           input.includes('?') && input.split(' ').length > 4 // Complex questions
  }

  // Process user input with Gemini AI
  public static async processWithGemini(input: string, context: AIContext): Promise<string> {
    try {
      console.log('Processing with Gemini AI:', input)
      
      // Enforce rate limiting
      await this.enforceRateLimit()
      
      // Initialize Gemini
      const genAI = this.initializeGemini()
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.model })

      // Create enhanced prompt
      const prompt = this.createMedicalBillingPrompt(input, context)

      // Generate response
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: GEMINI_CONFIG.maxTokens,
          temperature: GEMINI_CONFIG.temperature,
        },
      })

      const response = result.response
      const text = response.text()

      // Validate response
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini')
      }

      console.log('Gemini AI response generated successfully')
      return text.trim()

    } catch (error) {
      console.error('Gemini AI error:', error)
      
      // Provide fallback response
      if (error instanceof Error && error.message.includes('API key')) {
        return "🔧 **Configuration Error**: Gemini AI is not properly configured. Please check your API key setup.\n\nI'll continue to help you with my built-in medical billing knowledge!"
      }
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        return "⏱️ **Rate Limit**: Too many requests to Gemini AI. Please wait a moment and try again.\n\nI can still help you with basic medical billing questions using my built-in knowledge!"
      }

      return "❌ **AI Service Temporarily Unavailable**: I'm having trouble connecting to the enhanced AI service, but I can still help you with medical billing questions using my built-in knowledge!\n\nTry rephrasing your question or ask about specific codes, terminology, or form guidance."
    }
  }

  // Test Gemini connection
  public static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testContext: AIContext = {
        formType: 'general',
        currentField: 'test',
        currentStep: 1,
        deviceType: 'desktop',
        timeOfDay: 'morning',
        sessionDuration: 0
      }

      const response = await this.processWithGemini('Test connection: What is medical billing?', testContext)
      
      if (response.includes('Configuration Error') || response.includes('AI Service Temporarily Unavailable')) {
        return { success: false, message: response }
      }

      return { 
        success: true, 
        message: `✅ Gemini AI connected successfully! Response length: ${response.length} characters` 
      }
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  // Get usage statistics
  public static getUsageStats(): { requestsThisMinute: number; timeToReset: number } {
    const now = Date.now()
    const timeToReset = Math.max(0, 60000 - (now - this.requestTracker.windowStart))
    
    return {
      requestsThisMinute: this.requestTracker.count,
      timeToReset
    }
  }
}

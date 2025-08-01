// Enhanced Visual Response Service - Item 11
export interface RichTextElement {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'list' | 'table' | 'highlight' | 'warning' | 'success' | 'info'
  content: string
  attributes?: Record<string, any>
  children?: RichTextElement[]
}

export interface InteractiveElement {
  type: 'button' | 'link' | 'form' | 'dropdown' | 'checkbox' | 'radio'
  label: string
  action: string
  data?: any
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  disabled?: boolean
}

export interface VisualIndicator {
  type: 'priority' | 'severity' | 'status' | 'progress'
  value: string | number
  color: 'red' | 'yellow' | 'green' | 'blue' | 'gray'
  icon?: string
  animated?: boolean
}

export interface AnimatedResponse {
  type: 'fade-in' | 'slide-in' | 'bounce' | 'pulse' | 'typing'
  duration: number
  delay?: number
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface EnhancedResponse {
  content: RichTextElement[]
  interactiveElements?: InteractiveElement[]
  visualIndicators?: VisualIndicator[]
  animations?: AnimatedResponse[]
  metadata?: {
    responseTime: number
    confidence: number
    source: string
    lastUpdated: Date
  }
}

export class EnhancedVisualResponseService {
  
  // Rich text formatting with markdown support
  static formatRichText(input: string): RichTextElement[] {
    const elements: RichTextElement[] = []
    
    // Split by markdown patterns
    const parts = input.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\)|^[-*+]\s|^\d+\.\s)/gm)
    
    parts.forEach(part => {
      if (!part.trim()) return
      
      if (part.startsWith('**') && part.endsWith('**')) {
        elements.push({
          type: 'bold',
          content: part.slice(2, -2)
        })
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        elements.push({
          type: 'italic',
          content: part.slice(1, -1)
        })
      } else if (part.startsWith('`') && part.endsWith('`')) {
        elements.push({
          type: 'code',
          content: part.slice(1, -1)
        })
      } else if (part.match(/^[-*+]\s/)) {
        elements.push({
          type: 'list',
          content: part.slice(2)
        })
      } else if (part.match(/^\d+\.\s/)) {
        elements.push({
          type: 'list',
          content: part.replace(/^\d+\.\s/, '')
        })
      } else {
        elements.push({
          type: 'text',
          content: part
        })
      }
    })
    
    return elements
  }

  // Create interactive elements
  static createInteractiveElements(actions: Array<{
    label: string
    action: string
    style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
    data?: any
  }>): InteractiveElement[] {
    return actions.map((action, index) => ({
      type: 'button',
      label: action.label,
      action: action.action,
      style: action.style || 'primary',
      data: action.data,
      disabled: false
    }))
  }

  // Create visual indicators
  static createVisualIndicators(indicators: Array<{
    type: 'priority' | 'severity' | 'status' | 'progress'
    value: string | number
    color: 'red' | 'yellow' | 'green' | 'blue' | 'gray'
    icon?: string
    animated?: boolean
  }>): VisualIndicator[] {
    return indicators.map(indicator => ({
      type: indicator.type,
      value: indicator.value,
      color: indicator.color,
      icon: indicator.icon,
      animated: indicator.animated || false
    }))
  }

  // Create animated responses
  static createAnimatedResponse(
    content: RichTextElement[],
    animation: AnimatedResponse
  ): EnhancedResponse {
    return {
      content,
      animations: [animation]
    }
  }

  // Enhanced response builder
  static buildEnhancedResponse(
    content: string,
    options: {
      interactiveElements?: InteractiveElement[]
      visualIndicators?: VisualIndicator[]
      animations?: AnimatedResponse[]
      metadata?: {
        responseTime: number
        confidence: number
        source: string
        lastUpdated: Date
      }
    } = {}
  ): EnhancedResponse {
    return {
      content: this.formatRichText(content),
      interactiveElements: options.interactiveElements,
      visualIndicators: options.visualIndicators,
      animations: options.animations,
      metadata: options.metadata
    }
  }

  // Create priority-based visual response
  static createPriorityResponse(
    content: string,
    priority: 'high' | 'medium' | 'low',
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    const colorMap = {
      high: 'red',
      medium: 'yellow',
      low: 'green'
    } as const

    const iconMap = {
      high: 'alert-triangle',
      medium: 'info',
      low: 'check-circle'
    } as const

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'priority',
        value: priority.toUpperCase(),
        color: colorMap[priority],
        icon: iconMap[priority],
        animated: priority === 'high'
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined,
      animations: priority === 'high' ? [{
        type: 'pulse',
        duration: 2000,
        easing: 'ease-in-out'
      }] : undefined
    })
  }

  // Create status-based visual response
  static createStatusResponse(
    content: string,
    status: 'success' | 'warning' | 'error' | 'info',
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    const colorMap = {
      success: 'green',
      warning: 'yellow',
      error: 'red',
      info: 'blue'
    } as const

    const iconMap = {
      success: 'check-circle',
      warning: 'alert-triangle',
      error: 'x-circle',
      info: 'info'
    } as const

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'status',
        value: status.toUpperCase(),
        color: colorMap[status],
        icon: iconMap[status],
        animated: status === 'error'
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined
    })
  }

  // Create progress-based visual response
  static createProgressResponse(
    content: string,
    progress: number,
    total: number,
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    const percentage = Math.round((progress / total) * 100)
    const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red'

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'progress',
        value: `${percentage}%`,
        color,
        animated: true
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined
    })
  }

  // Create search results with enhanced formatting
  static createSearchResultsResponse(
    query: string,
    results: Array<{
      code: string
      description: string
      relevance: number
      type: string
    }>,
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    const content = `**Search Results for "${query}"**\n\n${results.map((result, index) => 
      `${index + 1}. **${result.code}** - ${result.description} (${Math.round(result.relevance * 100)}% match)`
    ).join('\n')}`

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'status',
        value: `${results.length} results`,
        color: results.length > 0 ? 'green' : 'yellow',
        icon: 'search'
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined,
      animations: [{
        type: 'fade-in',
        duration: 500,
        delay: 100
      }]
    })
  }

  // Create code lookup response with enhanced formatting
  static createCodeLookupResponse(
    code: string,
    description: string,
    additionalInfo: {
      category?: string
      usage?: string
      examples?: string[]
      relatedCodes?: string[]
    },
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    let content = `**Code: ${code}**\n${description}\n\n`

    if (additionalInfo.category) {
      content += `**Category:** ${additionalInfo.category}\n`
    }
    if (additionalInfo.usage) {
      content += `**Usage:** ${additionalInfo.usage}\n`
    }
    if (additionalInfo.examples && additionalInfo.examples.length > 0) {
      content += `**Examples:**\n${additionalInfo.examples.map(ex => `• ${ex}`).join('\n')}\n`
    }
    if (additionalInfo.relatedCodes && additionalInfo.relatedCodes.length > 0) {
      content += `**Related Codes:**\n${additionalInfo.relatedCodes.map(rc => `• ${rc}`).join('\n')}`
    }

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'status',
        value: 'VALID',
        color: 'green',
        icon: 'check-circle'
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined,
      animations: [{
        type: 'slide-in',
        duration: 300,
        easing: 'ease-out'
      }]
    })
  }

  // Create error response with enhanced formatting
  static createErrorResponse(
    error: string,
    suggestions: string[],
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    let content = `**Error:** ${error}\n\n`

    if (suggestions.length > 0) {
      content += `**Suggestions:**\n${suggestions.map(s => `• ${s}`).join('\n')}`
    }

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'severity',
        value: 'ERROR',
        color: 'red',
        icon: 'x-circle',
        animated: true
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined
    })
  }

  // Create help response with enhanced formatting
  static createHelpResponse(
    topic: string,
    helpContent: string,
    relatedTopics: string[],
    actions?: Array<{ label: string; action: string; style?: string }>
  ): EnhancedResponse {
    let content = `**Help: ${topic}**\n\n${helpContent}\n\n`

    if (relatedTopics.length > 0) {
      content += `**Related Topics:**\n${relatedTopics.map(topic => `• ${topic}`).join('\n')}`
    }

    return this.buildEnhancedResponse(content, {
      visualIndicators: [{
        type: 'status',
        value: 'HELP',
        color: 'blue',
        icon: 'help-circle'
      }],
      interactiveElements: actions ? this.createInteractiveElements(actions) : undefined
    })
  }
} 
// Text formatting utilities for M.I.L.A. responses

export interface FormattedText {
  type: 'text' | 'list' | 'heading' | 'bold' | 'code'
  content: string
  items?: string[]
}

export class TextFormatter {
  
  // Convert markdown-style text to structured format for proper rendering
  static formatResponse(text: string): FormattedText[] {
    const lines = text.split('\n')
    const formatted: FormattedText[] = []
    let currentList: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Empty line - finalize any current list
      if (!line) {
        if (currentList.length > 0) {
          formatted.push({
            type: 'list',
            content: '',
            items: [...currentList]
          })
          currentList = []
        }
        continue
      }
      
      // Bullet point (• or - or *) - handle various formats
      if (line.match(/^[•\-\*]\s+/) || line.includes('• ')) {
        const listItem = line.replace(/^[•\-\*]\s+/, '').replace(/•\s+/, '').trim()
        if (listItem) {
          currentList.push(listItem)
        }
        continue
      }
      
      // Finalize any current list before processing other content
      if (currentList.length > 0) {
        formatted.push({
          type: 'list',
          content: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      // Heading (**text**)
      if (line.match(/^\*\*[^*]+\*\*:?$/)) {
        formatted.push({
          type: 'heading',
          content: line.replace(/\*\*/g, '').replace(/:$/, '')
        })
        continue
      }
      
      // Bold text within line
      if (line.includes('**') && !line.match(/^\*\*[^*]+\*\*:?$/)) {
        formatted.push({
          type: 'bold',
          content: line
        })
        continue
      }
      
      // Code (inline code with backticks)
      if (line.includes('`') || line.match(/^[A-Z0-9\.]+$/)) {
        formatted.push({
          type: 'code',
          content: line
        })
        continue
      }
      
      // Regular text
      formatted.push({
        type: 'text',
        content: line
      })
    }
    
    // Finalize any remaining list
    if (currentList.length > 0) {
      formatted.push({
        type: 'list',
        content: '',
        items: currentList
      })
    }
    
    return formatted
  }
  
  // Convert markdown bold to clean text (for processing)
  static stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/^[•\-\*]\s+/gm, '')    // Bullet points
  }
  
  // Check if text contains list items
  static hasListItems(text: string): boolean {
    // Check for bullet points at start of lines OR after newlines
    return /^[•\-\*]\s+/m.test(text) || /\n[•\-\*]\s+/m.test(text) || text.includes('• ')
  }
  
  // Extract list items from text
  static extractListItems(text: string): string[] {
    const lines = text.split('\n')
    const listItems: string[] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.match(/^[•\-\*]\s+/)) {
        listItems.push(trimmed.replace(/^[•\-\*]\s+/, '').trim())
      }
    }
    
    return listItems
  }
}

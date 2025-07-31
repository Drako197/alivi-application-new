/**
 * Utility functions for handling validation errors and scrolling
 */

/**
 * Scrolls to the first validation error element on mobile devices
 * @param errors - Object containing validation errors
 * @param delay - Optional delay before scrolling (default: 100ms)
 */
export const scrollToFirstError = (errors: { [key: string]: string }, delay: number = 100): void => {
  // Only run on mobile devices
  if (window.innerWidth >= 768) {
    return
  }

  setTimeout(() => {
    // Find the first error element
    const errorElements = document.querySelectorAll('[data-error="true"]')
    
    if (errorElements.length > 0) {
      const firstErrorElement = errorElements[0] as HTMLElement
      
      // Scroll to the error element with smooth behavior
      firstErrorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      
      // Add a subtle highlight effect
      firstErrorElement.style.transition = 'box-shadow 0.3s ease'
      firstErrorElement.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.3)'
      
      // Remove the highlight after 2 seconds
      setTimeout(() => {
        firstErrorElement.style.boxShadow = ''
      }, 2000)
    }
  }, delay)
}

/**
 * Scrolls to a specific error field by field name
 * @param fieldName - The name of the field with the error
 * @param delay - Optional delay before scrolling (default: 100ms)
 */
export const scrollToErrorField = (fieldName: string, delay: number = 100): void => {
  // Only run on mobile devices
  if (window.innerWidth >= 768) {
    return
  }

  setTimeout(() => {
    // Try to find the error element by field name
    const errorElement = document.querySelector(`[data-error-field="${fieldName}"]`) as HTMLElement
    
    if (errorElement) {
      errorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      
      // Add a subtle highlight effect
      errorElement.style.transition = 'box-shadow 0.3s ease'
      errorElement.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.3)'
      
      // Remove the highlight after 2 seconds
      setTimeout(() => {
        errorElement.style.boxShadow = ''
      }, 2000)
    }
  }, delay)
}

/**
 * Checks if there are any validation errors
 * @param errors - Object containing validation errors
 * @returns boolean indicating if there are any errors
 */
export const hasErrors = (errors: { [key: string]: string }): boolean => {
  return Object.keys(errors).length > 0
} 
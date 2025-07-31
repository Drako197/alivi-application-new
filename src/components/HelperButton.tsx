import React, { useState } from 'react'
import Icon from './Icon'
import HelperModal from './HelperModal'

interface HelperButtonProps {
  currentForm?: string
  currentField?: string
  currentStep?: number
  onFieldSuggestion?: (fieldName: string, suggestion: string) => void
  className?: string
}

export default function HelperButton({ 
  currentForm, 
  currentField, 
  currentStep,
  onFieldSuggestion,
  className = ''
}: HelperButtonProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  const handleOpenAssistant = () => {
    setIsAssistantOpen(true)
  }

  const handleCloseAssistant = () => {
    setIsAssistantOpen(false)
  }

  return (
    <>
      {/* Floating M.I.L.A. Assistant Button */}
      <div className={`fixed bottom-20 right-6 z-[99999] transition-all duration-300 ${isAssistantOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={handleOpenAssistant}
          className={`ai-helper-button w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 ${className}`}
          aria-label="Chat with M.I.L.A."
          title="Chat with M.I.L.A. - Medical Intelligence & Learning Assistant"
        >
          <div className="flex items-center justify-center w-full h-full">
            <Icon name="bot" size={24} className="text-white" />
          </div>
          
          {/* Pulse animation */}
          <div className="ai-helper-pulse absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping-slow opacity-20"></div>
        </button>
        
        {/* M.I.L.A. badge */}
        <div className="ai-helper-badge absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
          M.I.L.A.
        </div>
      </div>

      {/* AI Assistant Modal */}
      <HelperModal
        isOpen={isAssistantOpen}
        onClose={handleCloseAssistant}
        currentForm={currentForm}
        currentField={currentField}
        currentStep={currentStep}
        onFieldSuggestion={onFieldSuggestion}
      />
    </>
  )
} 
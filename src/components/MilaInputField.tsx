import React, { useState } from 'react'
import Icon from './Icon'

interface MilaInputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  fieldName: string
  formName: string
  onMilaTrigger: (fieldName: string, formName: string) => void
  disabled?: boolean
  error?: boolean
}

const MilaInputField: React.FC<MilaInputFieldProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  fieldName,
  formName,
  onMilaTrigger,
  disabled = false,
  error = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleMilaClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMilaTrigger(fieldName, formName)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input pr-10 ${error ? 'border-red-500' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* M.I.L.A. Icon */}
      <button
        type="button"
        onClick={handleMilaClick}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
          isHovered 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
            : 'bg-gradient-to-r from-blue-400/20 to-purple-500/20 text-blue-600 hover:from-blue-500/30 hover:to-purple-600/30'
        }`}
        title="Get help from M.I.L.A."
        disabled={disabled}
      >
        <Icon name="bot" size={16} />
      </button>
    </div>
  )
}

export default MilaInputField 
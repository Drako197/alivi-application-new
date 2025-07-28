import { useState, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
  hasError?: boolean
}

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  disabled = false,
  className = "",
  name,
  hasError
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowYearDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // When calendar opens, ensure current month shows selected date
  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [isOpen, selectedDate])

  // Update selected date when value prop changes
  useEffect(() => {
    if (value && value.trim() !== '') {
      const parsedDate = new Date(value)
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate)
        // Also set current month to show the selected date
        setCurrentMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1))
      }
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0)
    const daysInPrevMonth = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      })
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) // Keep as MM/DD/YYYY format
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange(formatDate(date))
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setFullYear(prev.getFullYear() - 1)
      } else {
        newMonth.setFullYear(prev.getFullYear() + 1)
      }
      return newMonth
    })
  }

  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1))
    setShowYearDropdown(false)
  }

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    // Generate years from 30 years ago to 5 years in the future (more focus on past)
    for (let i = currentYear - 30; i <= currentYear + 5; i++) {
      years.push(i)
    }
    return years
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate()
  }

  const getIcon = (iconName: string): ReactElement => {
    const icons: { [key: string]: ReactElement } = {
      calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      chevronLeft: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ),
      chevronRight: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      chevronUp: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ),
      chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )
    }
    return icons[iconName] || icons.calendar
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const yearOptions = generateYearOptions()

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getIcon('calendar')}
        </div>
        <input
          type="text"
          name={name}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 ${
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer'
          } ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
        />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-r-lg">
                {currentMonth.toLocaleDateString('en-US', { 
                  month: 'long'
                })}
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <span>{currentMonth.getFullYear()}</span>
                  {showYearDropdown ? getIcon('chevronUp') : getIcon('chevronDown')}
                </button>
                
                {/* Year Dropdown */}
                {showYearDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-32 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                          year === currentMonth.getFullYear() ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => navigateYear('prev')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Previous year"
              >
                {getIcon('chevronLeft')}
              </button>
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Previous month"
              >
                {getIcon('chevronLeft')}
              </button>
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Next month"
              >
                {getIcon('chevronRight')}
              </button>
              <button
                type="button"
                onClick={() => navigateYear('next')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Next year"
              >
                {getIcon('chevronRight')}
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(day.date)}
                className={`
                  w-10 h-10 text-sm rounded-full flex items-center justify-center transition-colors
                  ${day.isCurrentMonth 
                    ? 'text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-400'
                  }
                  ${isToday(day.date) 
                    ? 'bg-blue-100 text-blue-600 font-semibold' 
                    : ''
                  }
                  ${isSelected(day.date) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : ''
                  }
                  ${!day.isCurrentMonth && isSelected(day.date)
                    ? 'bg-blue-600 text-white'
                    : ''
                  }
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
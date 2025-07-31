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
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const days = getDaysInMonth(currentMonth)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange(formatDate(date))
    // Close calendar on mobile after selection
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setFullYear(newMonth.getFullYear() - 1)
      } else {
        newMonth.setFullYear(newMonth.getFullYear() + 1)
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
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i)
    }
    return years
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const getIcon = (iconName: string): ReactElement => {
    switch (iconName) {
      case 'calendar':
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'chevronLeft':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )
      case 'chevronRight':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )
      case 'chevronUp':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )
      case 'chevronDown':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )
      case 'x':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return <></>
    }
  }

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const yearOptions = generateYearOptions()

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Mobile: Enhanced touch-friendly input */}
      <div className="md:hidden">
        <div className="relative">
          <input
            type="text"
            name={name}
            value={value || ''}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`block w-full px-4 py-4 pr-16 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 text-base ${
              disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer active:bg-gray-50'
            } ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
          />
          <div className="absolute inset-y-0 right-0 pr-15 flex items-center pointer-events-none mobile-calendar-icon">
            {getIcon('calendar')}
          </div>
        </div>
      </div>

      {/* Desktop: Custom calendar input */}
      <div className="hidden md:block relative">
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

      {/* Full-Screen Mobile Calendar */}
      {isOpen && !disabled && isMobile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm mx-auto rounded-2xl shadow-2xl overflow-hidden">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Select Date</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  {getIcon('x')}
                </button>
              </div>
              
              {/* Selected Date Display */}
              {selectedDate && (
                <div className="mt-3 text-center">
                  <p className="text-blue-100 text-sm">Selected</p>
                  <p className="text-2xl font-bold">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Calendar Content */}
            <div className="p-6">
              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {getIcon('chevronLeft')}
                </button>
                
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentMonth.toLocaleDateString('en-US', { 
                      month: 'long'
                    })}
                  </h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowYearDropdown(!showYearDropdown)}
                      className="flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 hover:border-gray-300 transition-colors"
                    >
                      <span>{currentMonth.getFullYear()}</span>
                      {showYearDropdown ? getIcon('chevronUp') : getIcon('chevronDown')}
                    </button>
                    
                    {/* Year Dropdown */}
                    {showYearDropdown && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        {yearOptions.map((year) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-base ${
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
                
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {getIcon('chevronRight')}
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center text-lg font-medium text-gray-500 py-3">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(day.date)}
                    className={`
                      w-12 h-12 text-lg rounded-full flex items-center justify-center transition-all duration-200 font-medium
                      ${day.isCurrentMonth 
                        ? 'text-gray-900 hover:bg-gray-100 active:bg-gray-200' 
                        : 'text-gray-400'
                      }
                      ${isToday(day.date) 
                        ? 'bg-blue-100 text-blue-600 font-semibold ring-2 ring-blue-200' 
                        : ''
                      }
                      ${isSelected(day.date) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform scale-105' 
                        : ''
                      }
                      ${!day.isCurrentMonth && isSelected(day.date)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : ''
                      }
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    handleDateSelect(today)
                  }}
                  className="px-6 py-3 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 text-base font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Calendar Dropdown */}
      {isOpen && !disabled && !isMobile && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 md:w-80 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Left Arrow */}
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Previous month"
            >
              {getIcon('chevronLeft')}
            </button>
            
            {/* Centered Month and Year */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentMonth.toLocaleDateString('en-US', { 
                  month: 'long'
                })}
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <span>{currentMonth.getFullYear()}</span>
                  {showYearDropdown ? getIcon('chevronUp') : getIcon('chevronDown')}
                </button>
                
                {/* Year Dropdown */}
                {showYearDropdown && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-32 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-sm ${
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
            
            {/* Right Arrow */}
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Next month"
            >
              {getIcon('chevronRight')}
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(day.date)}
                className={`
                  w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all duration-200 font-medium
                  ${day.isCurrentMonth 
                    ? 'text-gray-900 hover:bg-gray-100 active:bg-gray-200' 
                    : 'text-gray-400'
                  }
                  ${isToday(day.date) 
                    ? 'bg-blue-100 text-blue-600 font-semibold ring-2 ring-blue-200' 
                    : ''
                  }
                  ${isSelected(day.date) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform scale-105' 
                    : ''
                  }
                  ${!day.isCurrentMonth && isSelected(day.date)
                    ? 'bg-blue-600 text-white shadow-lg'
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
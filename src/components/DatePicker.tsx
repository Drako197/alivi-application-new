import React, { useState, useEffect, useRef } from 'react'

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize selected date from value prop
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        setCurrentMonth(date)
      }
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date.toISOString().split('T')[0])
    console.log('Date object:', date)
    setSelectedDate(date)
    onChange(date.toISOString().split('T')[0])
    setIsOpen(false)
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

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    
    // Use toISOString().split('T')[0] for reliable date comparison
    const dateString = date.toISOString().split('T')[0]
    const selectedDateString = selectedDate.toISOString().split('T')[0]
    
    const isSelectedResult = dateString === selectedDateString
    
    if (isSelectedResult) {
      console.log('Date is selected:', dateString)
    }
    
    return isSelectedResult
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    
    console.log('Generating calendar for:', year, month + 1)
    console.log('First day of month:', firstDayOfMonth)
    console.log('Days in month:', daysInMonth)
    
    const days = []
    
    // Add previous month's days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
      const day = daysInPrevMonth - firstDayOfMonth + i + 1
      const date = new Date(prevYear, prevMonth, day)
      console.log(`Prev month day ${i + 1}: ${date.toISOString().split('T')[0]} (${day})`)
      days.push({
        date: date,
        isCurrentMonth: false
      })
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      console.log(`Current month day ${day}: ${date.toISOString().split('T')[0]}`)
      days.push({
        date: date,
        isCurrentMonth: true
      })
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const date = new Date(nextYear, nextMonth, day)
      console.log(`Next month day ${day}: ${date.toISOString().split('T')[0]}`)
      days.push({
        date: date,
        isCurrentMonth: false
      })
    }
    
    return days
  }

  const days = generateCalendarDays()

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
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
          } ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300'}`}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="md:absolute md:mt-2 fixed inset-0 z-50 bg-white md:bg-white md:rounded-lg md:shadow-lg md:border md:border-gray-200 md:p-4 md:w-80 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-2xl md:text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 md:gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-base md:text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDateSelect(day.date)}
                className={`
                  w-12 h-12 md:w-8 md:h-8 text-lg md:text-sm rounded-full flex items-center justify-center transition-colors
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
                `}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row justify-between mt-4 pt-4 border-t border-gray-200 gap-4 md:gap-0">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                handleDateSelect(today)
              }}
              className="px-4 py-4 md:py-2 text-lg md:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors w-full md:w-auto"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-4 md:py-2 text-lg md:text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full md:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
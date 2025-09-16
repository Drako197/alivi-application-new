import React, { useState } from 'react'
import Icon from '../Icon'

interface KPICard {
  id: string
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

interface KPICardsProps {
  data: KPICard[]
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const cardsPerPage = 3
  const totalPages = Math.ceil(data.length / cardsPerPage)
  
  // Navigation functions
  const goToPrevious = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }
  
  const goToNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }
  
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up'
      case 'down':
        return 'trending-down'
      case 'stable':
        return 'minus'
      default:
        return 'minus'
    }
  }

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') {
      return change > 0 ? 'text-green-600' : 'text-red-600'
    } else if (trend === 'down') {
      return change < 0 ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-600'
  }

  return (
    <div className="kpi-cards-carousel-container relative">
      {/* Carousel Header with Navigation */}
      <div className="kpi-cards-carousel-header flex items-center justify-between mb-4">
        <div className="kpi-cards-carousel-title">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Performance Indicators</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </p>
        </div>
        
        {/* Navigation Controls */}
        {totalPages > 1 && (
          <div className="kpi-cards-carousel-controls flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="kpi-cards-nav-button kpi-cards-nav-prev p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={totalPages <= 1}
            >
              <Icon name="chevron-left" size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <button
              onClick={goToNext}
              className="kpi-cards-nav-button kpi-cards-nav-next p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={totalPages <= 1}
            >
              <Icon name="chevron-right" size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div className="kpi-cards-carousel-content relative overflow-hidden">
        <div 
          className="kpi-cards-carousel-track flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div key={pageIndex} className="kpi-cards-page w-full flex-shrink-0">
              <div className="kpi-cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage).map((kpi) => (
                  <div
                    key={kpi.id}
                    className={`kpi-card kpi-card-${kpi.id} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="kpi-card-header flex items-center justify-between mb-3">
                      <h3 className="kpi-card-title text-sm font-medium text-gray-600 dark:text-gray-400 leading-tight">
                        {kpi.title}
                      </h3>
                      <div className={`kpi-card-status kpi-card-status-${kpi.status} inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)} flex-shrink-0 ml-2`}>
                        <span>{kpi.status}</span>
                      </div>
                    </div>
                    
                    <div className="kpi-card-content flex flex-col space-y-2">
                      <p className="kpi-card-value text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                        {kpi.value}
                      </p>
                      
                      <div className={`kpi-card-trend kpi-card-trend-${kpi.trend} flex items-center space-x-1 text-sm ${getTrendColor(kpi.trend, kpi.change)}`}>
                        <Icon name={getTrendIcon(kpi.trend) as any} size={14} />
                        <span className="kpi-card-change font-medium">
                          {Math.abs(kpi.change)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="kpi-card-footer mt-3">
                      <div className="kpi-card-period flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>vs last period</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {totalPages > 1 && (
        <div className="kpi-cards-carousel-dots flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`kpi-cards-dot w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default KPICards

import React, { useState, useEffect } from 'react'
import LottieLoader from './LottieLoader'

interface LoadingOverlayProps {
  isVisible: boolean
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  const [currentTask, setCurrentTask] = useState(0)
  
  const billingTasks = [
    "Counting medical codes like a pro...",
    "Organizing patient files with surgical precision...",
    "Calculating co-pays with mathematical wizardry...",
    "Decoding insurance hieroglyphics...",
    "Summoning the billing spirits...",
    "Teaching computers to speak medical jargon...",
    "Making sure the decimal points are in the right place...",
    "Consulting the ancient scrolls of medical billing...",
    "Brewing the perfect cup of billing coffee...",
    "Ensuring all the i's are dotted and t's are crossed..."
  ]

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentTask((prev) => (prev + 1) % billingTasks.length)
    }, 1200) // Change task every 1200ms (slower for better readability)

    return () => clearInterval(interval)
  }, [isVisible, billingTasks.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 max-w-lg mx-4 text-center shadow-2xl min-h-[400px] flex flex-col justify-center">
        <div className="mb-8">
          <LottieLoader size="large" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Welcome to Alivi!
        </h3>
        <div className="min-h-[60px] flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {billingTasks[currentTask]}
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            {billingTasks.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentTask 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay 
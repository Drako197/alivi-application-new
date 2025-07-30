import React, { useState, useEffect } from 'react'
import Icon from './Icon'
import PersonalizationService from '../services/PersonalizationService'
import MedicalSpecialtiesService from '../services/MedicalSpecialtiesService'

interface PersonalizationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function PersonalizationSettings({ isOpen, onClose }: PersonalizationSettingsProps) {
  const [activeTab, setActiveTab] = useState('preferences')
  const [preferences, setPreferences] = useState(PersonalizationService.getUserPreferences())
  const [userStats, setUserStats] = useState(PersonalizationService.getUserStats())
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([])
  const [commonQueries, setCommonQueries] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setPreferences(PersonalizationService.getUserPreferences())
      setUserStats(PersonalizationService.getUserStats())
      setFavoriteCodes(PersonalizationService.getFavoriteCodes())
      setCommonQueries(PersonalizationService.getCommonQueries(10))
    }
  }, [isOpen])

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const newSpecialties = checked
      ? [...preferences.preferredSpecialties, specialty]
      : preferences.preferredSpecialties.filter(s => s !== specialty)
    
    PersonalizationService.updatePreferredSpecialties(newSpecialties)
    setPreferences(prev => ({ ...prev, preferredSpecialties: newSpecialties }))
  }

  const handleLanguageChange = (language: 'technical' | 'simple' | 'detailed') => {
    PersonalizationService.updateLanguagePreference(language)
    setPreferences(prev => ({ ...prev, preferredLanguage: language }))
  }

  const handleRemoveFavoriteCode = (code: string) => {
    PersonalizationService.removeFavoriteCode(code)
    setFavoriteCodes(prev => prev.filter(c => c !== code))
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your personalization data? This cannot be undone.')) {
      PersonalizationService.clearAllData()
      setPreferences(PersonalizationService.getUserPreferences())
      setUserStats(PersonalizationService.getUserStats())
      setFavoriteCodes([])
      setCommonQueries([])
    }
  }

  const tabs = [
    { id: 'preferences', name: 'Preferences', icon: 'settings' },
    { id: 'statistics', name: 'Statistics', icon: 'bar-chart' },
    { id: 'favorites', name: 'Favorites', icon: 'star' },
    { id: 'history', name: 'History', icon: 'clock' }
  ]

  const specialties = MedicalSpecialtiesService.getSpecialties()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Icon name="user" size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">M.I.L.A. Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalize your experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="x" size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon name={tab.icon} size={16} className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Language Preference */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Communication Style</h4>
                <div className="space-y-3">
                  {[
                    { value: 'simple', label: 'Simple & Clear', description: 'Easy-to-understand explanations' },
                    { value: 'detailed', label: 'Detailed', description: 'Comprehensive explanations with examples' },
                    { value: 'technical', label: 'Technical', description: 'Professional medical terminology' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value={option.value}
                        checked={preferences.preferredLanguage === option.value}
                        onChange={() => handleLanguageChange(option.value as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialty Preferences */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Medical Specialties</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select the specialties you work with most often. M.I.L.A. will provide more relevant suggestions.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {specialties.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferredSpecialties.includes(specialty)}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your M.I.L.A. Usage</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.sessionCount}</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Sessions</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.totalQueries}</div>
                  <div className="text-sm text-green-800 dark:text-green-200">Total Queries</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.favoriteCodesCount}</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Favorite Codes</div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.preferredSpecialtiesCount}</div>
                  <div className="text-sm text-orange-800 dark:text-orange-200">Specialties</div>
                </div>
              </div>

              {userStats.mostUsedForm && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Most Used Form</h5>
                  <div className="text-lg text-gray-700 dark:text-gray-300">{userStats.mostUsedForm}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Favorite Codes</h4>
              
              {favoriteCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon name="star" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No favorite codes yet. M.I.L.A. will remember codes you use frequently.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favoriteCodes.map((code) => (
                    <div key={code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-mono text-gray-900 dark:text-white">{code}</span>
                      <button
                        onClick={() => handleRemoveFavoriteCode(code)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Icon name="trash-2" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Queries</h4>
              
              {commonQueries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Icon name="clock" size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No recent queries yet. Start chatting with M.I.L.A. to see your history here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {commonQueries.map((query, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-900 dark:text-white">{query}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClearData}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
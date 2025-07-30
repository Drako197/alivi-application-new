import React, { useState } from 'react'
import HelperButton from './HelperButton'
import PersonalizationService from '../services/PersonalizationService'
import ProactiveSuggestionsService from '../services/ProactiveSuggestionsService'
import ProactiveSuggestionsTest from './ProactiveSuggestionsTest'
import Icon from './Icon'

interface DemoFeature {
  id: string
  title: string
  description: string
  icon: string
  color: string
  demoAction?: () => void
}

export default function MILAEnhancedDemo() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [demoResults, setDemoResults] = useState<any>(null)
  const [showProactiveTest, setShowProactiveTest] = useState(false)

  const features: DemoFeature[] = [
    {
      id: 'animations',
      title: 'Custom Animations',
      description: 'Smooth transitions and engaging visual feedback for all interactions',
      icon: 'zap',
      color: 'blue',
      demoAction: () => {
        setDemoResults({
          type: 'animations',
          features: [
            'Fade-in message animations',
            'Slide-in user messages',
            'Typing indicators with bounce',
            'Hover effects and transitions',
            'Pulse animations for attention'
          ]
        })
      }
    },
    {
      id: 'personalization',
      title: 'Personalization',
      description: 'M.I.L.A. learns your preferences and adapts to your workflow',
      icon: 'user',
      color: 'purple',
      demoAction: () => {
        const stats = PersonalizationService.getUserStats()
        const preferences = PersonalizationService.getUserPreferences()
        setDemoResults({
          type: 'personalization',
          stats,
          preferences,
          features: [
            'Session tracking and history',
            'Favorite codes management',
            'Specialty preferences',
            'Language style preferences',
            'Form usage analytics'
          ]
        })
      }
    },
    {
      id: 'proactive',
      title: 'Proactive Suggestions',
      description: 'Intelligent suggestions that anticipate your needs',
      icon: 'lightbulb',
      color: 'yellow',
      demoAction: () => {
        const context = {
          currentForm: 'PatientEligibilityForm',
          currentField: 'providerId',
          userInput: ''
        }
        const suggestions = ProactiveSuggestionsService.getProactiveSuggestions(context)
        setDemoResults({
          type: 'proactive',
          suggestions,
          features: [
            'Contextual field suggestions',
            'Time-based recommendations',
            'Pattern-based predictions',
            'Educational tips for new users',
            'Specialty-specific guidance'
          ]
        })
      }
    },
    {
      id: 'api-integration',
      title: 'Real API Integration',
      description: 'Live medical databases and comprehensive code lookups',
      icon: 'database',
      color: 'green',
      demoAction: () => {
        setDemoResults({
          type: 'api-integration',
          features: [
            'ICD-10 code lookup (ICD10API.com)',
            'Provider verification (NPPES)',
            'CPT code search with RVU values',
            'Medical terminology database',
            'Specialty-specific knowledge base'
          ]
        })
      }
    },
    {
      id: 'personality',
      title: 'M.I.L.A. Personality',
      description: 'Friendly, professional, and soothing communication style',
      icon: 'heart',
      color: 'pink',
      demoAction: () => {
        setDemoResults({
          type: 'personality',
          features: [
            'Warm, encouraging responses',
            'Professional medical expertise',
            'Soothing and supportive tone',
            'Emoji usage for friendliness',
            'Contextual empathy'
          ],
          examples: [
            '"I\'d be happy to help you find the right diagnosis codes!"',
            '"Medical terms can be confusing, but I\'m here to make them clearer."',
            '"I hope this information is helpful for your work!"',
            '"Great work today! I\'m here if you need any last-minute help."'
          ]
        })
      }
    },
    {
      id: 'proactive-test',
      title: 'Proactive Suggestions Test',
      description: 'Comprehensive test of all enhanced proactive suggestion scenarios',
      icon: 'test-tube',
      color: 'red',
      demoAction: () => {
        setShowProactiveTest(true)
      }
    }
  ]

  const clearResults = () => {
    setDemoResults(null)
    setActiveFeature(null)
  }

  const resetPersonalization = () => {
    PersonalizationService.clearAllData()
    alert('Personalization data cleared! Refresh the page to see the reset.')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            M.I.L.A. Enhanced Features Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience the enhanced capabilities of M.I.L.A. - Medical Intelligence & Learning Assistant
          </p>
        </div>

        {/* Features Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 dark:from-${feature.color}-900/20 dark:to-${feature.color}-900/10 rounded-lg p-6 border border-${feature.color}-200 dark:border-${feature.color}-700 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                onClick={() => {
                  setActiveFeature(feature.id)
                  feature.demoAction?.()
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-${feature.color}-500 rounded-lg flex items-center justify-center`}>
                    <Icon name={feature.icon} size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <span>Click to demo</span>
                  <Icon name="arrow-right" size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Demo Results */}
          {demoResults && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeFeature && features.find(f => f.id === activeFeature)?.title} Demo Results
                </h3>
                <button
                  onClick={clearResults}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {demoResults.type === 'personalization' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                        <div className="text-2xl font-bold text-blue-600">{demoResults.stats.sessionCount}</div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">Sessions</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                        <div className="text-2xl font-bold text-green-600">{demoResults.stats.totalQueries}</div>
                        <div className="text-sm text-green-800 dark:text-green-200">Queries</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                        <div className="text-2xl font-bold text-purple-600">{demoResults.stats.favoriteCodesCount}</div>
                        <div className="text-sm text-purple-800 dark:text-purple-200">Favorites</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
                        <div className="text-2xl font-bold text-orange-600">{demoResults.stats.preferredSpecialtiesCount}</div>
                        <div className="text-sm text-orange-800 dark:text-orange-200">Specialties</div>
                      </div>
                    </div>
                  </div>
                )}

                {demoResults.type === 'proactive' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Proactive Suggestions</h4>
                    <div className="space-y-2">
                      {demoResults.suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon name={suggestion.icon || 'lightbulb'} size={16} className="text-yellow-500" />
                            <span className="font-medium text-gray-900 dark:text-white">{suggestion.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {demoResults.type === 'personality' && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">M.I.L.A. Personality Examples</h4>
                    <div className="space-y-2">
                      {demoResults.examples.map((example: string, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded p-3 border border-blue-200 dark:border-blue-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h4>
                  <ul className="space-y-1">
                    {demoResults.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Icon name="check" size={14} className="text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={resetPersonalization}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset Personalization Data
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Demo Results
            </button>
          </div>

          {/* M.I.L.A. Integration */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Try M.I.L.A. Live
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the M.I.L.A. assistant button to experience all these features in action!
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>Tip:</strong> Try asking M.I.L.A. about medical terms, codes, or form fields. 
                Watch how the responses become more personalized over time!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Suggestions Test */}
      {showProactiveTest && (
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Proactive Suggestions Test
              </h2>
              <button
                onClick={() => setShowProactiveTest(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <ProactiveSuggestionsTest />
          </div>
        </div>
      )}

      {/* M.I.L.A. Assistant Button */}
      <HelperButton
        currentForm="PatientEligibilityForm"
        currentField="providerId"
        currentStep={1}
      />
    </div>
  )
} 
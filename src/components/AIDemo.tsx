import React, { useState } from 'react'
import AIAssistantButton from './AIAssistantButton'
import MedicalAPIService from '../services/MedicalAPIService'
import Icon from './Icon'

export default function AIDemo() {
  const [demoResults, setDemoResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runDemo = async (demoType: string) => {
    setIsLoading(true)
    const results = []

    try {
      switch (demoType) {
        case 'icd10':
          // Demo ICD-10 code lookup
          const diabetesCodes = await MedicalAPIService.searchICD10Codes('diabetes')
          results.push({
            type: 'ICD-10 Codes',
            query: 'diabetes',
            result: diabetesCodes,
            description: 'Searching for diabetes-related ICD-10 codes'
          })

          const retinopathyCodes = await MedicalAPIService.searchICD10Codes('retinopathy')
          results.push({
            type: 'ICD-10 Codes',
            query: 'retinopathy',
            result: retinopathyCodes,
            description: 'Searching for retinopathy-related ICD-10 codes'
          })
          break

        case 'provider':
          // Demo provider lookup
          const providerResult = await MedicalAPIService.searchProviderByNPI('1234567890')
          results.push({
            type: 'Provider Lookup',
            query: 'NPI: 1234567890',
            result: providerResult,
            description: 'Looking up provider by NPI number'
          })

          const providersResult = await MedicalAPIService.searchProviders('cardiology')
          results.push({
            type: 'Provider Search',
            query: 'cardiology',
            result: providersResult,
            description: 'Searching for cardiology providers'
          })
          break

        case 'cache':
          // Demo cache functionality
          const cacheStats = MedicalAPIService.getCacheStats()
          results.push({
            type: 'Cache Statistics',
            query: 'cache stats',
            result: cacheStats,
            description: 'Current cache statistics'
          })
          break
      }

      setDemoResults(results)
    } catch (error) {
      console.error('Demo error:', error)
      results.push({
        type: 'Error',
        query: demoType,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        description: 'An error occurred during the demo'
      })
      setDemoResults(results)
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = () => {
    MedicalAPIService.clearCache()
    setDemoResults([])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          M.I.L.A. Demo
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This demo showcases M.I.L.A. (Medical Intelligence & Learning Assistant) capabilities with real medical API integrations.
        </p>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => runDemo('icd10')}
            disabled={isLoading}
            className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Icon name="search" size={20} className="mr-2" />
            ICD-10 Code Lookup
          </button>
          
          <button
            onClick={() => runDemo('provider')}
            disabled={isLoading}
            className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            <Icon name="user" size={20} className="mr-2" />
            Provider Lookup
          </button>
          
          <button
            onClick={() => runDemo('cache')}
            disabled={isLoading}
            className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            <Icon name="database" size={20} className="mr-2" />
            Cache Statistics
          </button>
        </div>

        {/* Clear Cache Button */}
        <div className="mb-8">
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear Cache
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Running demo...</span>
          </div>
        )}

        {/* Results */}
        {demoResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Demo Results
            </h2>
            
            {demoResults.map((result, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {result.type}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {result.description}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Query: {result.query}
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded border p-3">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Assistant Integration */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Try M.I.L.A.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click the M.I.L.A. assistant button to test real-time medical billing assistance.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Example Questions:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• "What does OD mean?"</li>
              <li>• "Find diabetes codes"</li>
              <li>• "Look up provider 1234567890"</li>
              <li>• "Help with provider ID field"</li>
              <li>• "What is HEDIS?"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Assistant Button */}
      <AIAssistantButton
        currentForm="AIDemo"
        currentField="demo"
        currentStep={1}
        onFieldSuggestion={(fieldName, suggestion) => {
          console.log(`AI Suggestion for ${fieldName}:`, suggestion)
        }}
      />
    </div>
  )
} 
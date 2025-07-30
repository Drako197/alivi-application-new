import React, { useState } from 'react'
import HelperButton from './HelperButton'
import MedicalAPIService from '../services/MedicalAPIService'
import Icon from './Icon'

interface DemoResult {
  type: string
  query: string
  result: any
  description: string
  timestamp: string
}

export default function AIEnhancedDemo() {
  const [demoResults, setDemoResults] = useState<DemoResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const runDemo = async (demoType: string) => {
    setIsLoading(true)
    const results: DemoResult[] = []

    try {
      switch (demoType) {
        case 'icd10':
          // Demo ICD-10 code lookup
          const diabetesCodes = await MedicalAPIService.searchICD10Codes('diabetes')
          results.push({
            type: 'ICD-10 Codes',
            query: 'diabetes',
            result: diabetesCodes,
            description: 'Searching for diabetes-related ICD-10 codes',
            timestamp: new Date().toLocaleTimeString()
          })

          const retinopathyCodes = await MedicalAPIService.searchICD10Codes('retinopathy')
          results.push({
            type: 'ICD-10 Codes',
            query: 'retinopathy',
            result: retinopathyCodes,
            description: 'Searching for retinopathy-related ICD-10 codes',
            timestamp: new Date().toLocaleTimeString()
          })

          const hypertensionCodes = await MedicalAPIService.searchICD10Codes('hypertension')
          results.push({
            type: 'ICD-10 Codes',
            query: 'hypertension',
            result: hypertensionCodes,
            description: 'Searching for hypertension-related ICD-10 codes',
            timestamp: new Date().toLocaleTimeString()
          })
          break

        case 'cpt':
          // Demo CPT code lookup
          const retinalCPTCodes = await MedicalAPIService.searchCPTCodes('retinal')
          results.push({
            type: 'CPT Codes',
            query: 'retinal imaging',
            result: retinalCPTCodes,
            description: 'Searching for retinal imaging CPT codes',
            timestamp: new Date().toLocaleTimeString()
          })

          const diabetesCPTCodes = await MedicalAPIService.searchCPTCodes('diabetes')
          results.push({
            type: 'CPT Codes',
            query: 'diabetes management',
            result: diabetesCPTCodes,
            description: 'Searching for diabetes management CPT codes',
            timestamp: new Date().toLocaleTimeString()
          })

          const labCPTCodes = await MedicalAPIService.searchCPTCodes('lab')
          results.push({
            type: 'CPT Codes',
            query: 'laboratory tests',
            result: labCPTCodes,
            description: 'Searching for laboratory test CPT codes',
            timestamp: new Date().toLocaleTimeString()
          })
          break

        case 'terminology':
          // Demo medical terminology lookup
          const odTerm = await MedicalAPIService.searchMedicalTerms('od')
          results.push({
            type: 'Medical Terms',
            query: 'OD',
            result: odTerm,
            description: 'Looking up ophthalmology terminology',
            timestamp: new Date().toLocaleTimeString()
          })

          const pcpTerm = await MedicalAPIService.searchMedicalTerms('pcp')
          results.push({
            type: 'Medical Terms',
            query: 'PCP',
            result: pcpTerm,
            description: 'Looking up healthcare terminology',
            timestamp: new Date().toLocaleTimeString()
          })

          const hedisTerm = await MedicalAPIService.searchMedicalTerms('hedis')
          results.push({
            type: 'Medical Terms',
            query: 'HEDIS',
            result: hedisTerm,
            description: 'Looking up quality measures terminology',
            timestamp: new Date().toLocaleTimeString()
          })
          break

        case 'provider':
          // Demo provider lookup
          const providerResult = await MedicalAPIService.searchProviderByNPI('1234567890')
          results.push({
            type: 'Provider Lookup',
            query: 'NPI: 1234567890',
            result: providerResult,
            description: 'Looking up provider by NPI number',
            timestamp: new Date().toLocaleTimeString()
          })

          const providersResult = await MedicalAPIService.searchProviders('cardiology')
          results.push({
            type: 'Provider Search',
            query: 'cardiology',
            result: providersResult,
            description: 'Searching for cardiology providers',
            timestamp: new Date().toLocaleTimeString()
          })
          break

        case 'cache':
          // Demo cache functionality
          const cacheStats = MedicalAPIService.getCacheStats()
          results.push({
            type: 'Cache Statistics',
            query: 'cache stats',
            result: cacheStats,
            description: 'Current cache statistics',
            timestamp: new Date().toLocaleTimeString()
          })
          break

        case 'comprehensive':
          // Run all demos
          const allResults = await Promise.all([
            MedicalAPIService.searchICD10Codes('diabetes'),
            MedicalAPIService.searchCPTCodes('retinal'),
            MedicalAPIService.searchMedicalTerms('od'),
            MedicalAPIService.searchProviderByNPI('1234567890')
          ])

          results.push(
            {
              type: 'Comprehensive Demo',
              query: 'All APIs',
              result: {
                icd10: allResults[0],
                cpt: allResults[1],
                terminology: allResults[2],
                provider: allResults[3]
              },
              description: 'Testing all medical APIs simultaneously',
              timestamp: new Date().toLocaleTimeString()
            }
          )
          break
      }

      setDemoResults(prev => [...prev, ...results])
    } catch (error) {
      console.error('Demo error:', error)
      results.push({
        type: 'Error',
        query: demoType,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        description: 'An error occurred during the demo',
        timestamp: new Date().toLocaleTimeString()
      })
      setDemoResults(prev => [...prev, ...results])
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = () => {
    MedicalAPIService.clearCache()
    setDemoResults([])
  }

  const clearResults = () => {
    setDemoResults([])
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'home' },
    { id: 'icd10', name: 'ICD-10 Codes', icon: 'search' },
    { id: 'cpt', name: 'CPT Codes', icon: 'code' },
    { id: 'terminology', name: 'Medical Terms', icon: 'book' },
    { id: 'provider', name: 'Provider Lookup', icon: 'user' },
    { id: 'results', name: 'Results', icon: 'database' }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            M.I.L.A. Enhanced Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showcasing M.I.L.A. (Medical Intelligence & Learning Assistant) capabilities with real medical API integrations.
          </p>
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
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ICD-10 Code Lookup
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                    Real-time diagnosis code search using official ICD-10 API
                  </p>
                  <button
                    onClick={() => runDemo('icd10')}
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    Test ICD-10 Lookup
                  </button>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    CPT Code Lookup
                  </h3>
                  <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                    Procedure code search with RVU values and modifiers
                  </p>
                  <button
                    onClick={() => runDemo('cpt')}
                    disabled={isLoading}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    Test CPT Lookup
                  </button>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Medical Terminology
                  </h3>
                  <p className="text-purple-800 dark:text-purple-200 text-sm mb-4">
                    Medical term definitions with categories and synonyms
                  </p>
                  <button
                    onClick={() => runDemo('terminology')}
                    disabled={isLoading}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    Test Terminology
                  </button>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Provider Verification
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 text-sm mb-4">
                    Real-time NPI lookup using official CMS database
                  </p>
                  <button
                    onClick={() => runDemo('provider')}
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    Test Provider Lookup
                  </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Cache Management
                  </h3>
                  <p className="text-red-800 dark:text-red-200 text-sm mb-4">
                    View cache statistics and clear cached data
                  </p>
                  <button
                    onClick={() => runDemo('cache')}
                    disabled={isLoading}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    View Cache Stats
                  </button>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Comprehensive Test
                  </h3>
                  <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-4">
                    Test all APIs simultaneously for performance
                  </p>
                  <button
                    onClick={() => runDemo('comprehensive')}
                    disabled={isLoading}
                    className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    Run All Tests
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={clearCache}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear Cache
                  </button>
                  <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'icd10' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  ICD-10 Code Lookup Demo
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  Test real-time ICD-10 diagnosis code lookup using the official API.
                </p>
                <button
                  onClick={() => runDemo('icd10')}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Running Demo...' : 'Run ICD-10 Demo'}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Example Queries:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• "Find diabetes codes"</li>
                  <li>• "Search for retinopathy diagnosis"</li>
                  <li>• "Hypertension ICD-10 codes"</li>
                  <li>• "Eye disease codes"</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'cpt' && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                  CPT Code Lookup Demo
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-4">
                  Test procedure code lookup with RVU values and modifiers.
                </p>
                <button
                  onClick={() => runDemo('cpt')}
                  disabled={isLoading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Running Demo...' : 'Run CPT Demo'}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Example Queries:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• "Retinal imaging procedures"</li>
                  <li>• "Diabetes management codes"</li>
                  <li>• "Laboratory test codes"</li>
                  <li>• "Office visit procedures"</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'terminology' && (
            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  Medical Terminology Demo
                </h3>
                <p className="text-purple-800 dark:text-purple-200 mb-4">
                  Test medical term definitions with categories and related terms.
                </p>
                <button
                  onClick={() => runDemo('terminology')}
                  disabled={isLoading}
                  className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Running Demo...' : 'Run Terminology Demo'}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Example Queries:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• "What does OD mean?"</li>
                  <li>• "Define PCP"</li>
                  <li>• "What is HEDIS?"</li>
                  <li>• "OS medical term"</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'provider' && (
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                  Provider Lookup Demo
                </h3>
                <p className="text-orange-800 dark:text-orange-200 mb-4">
                  Test provider verification using official NPPES database.
                </p>
                <button
                  onClick={() => runDemo('provider')}
                  disabled={isLoading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Running Demo...' : 'Run Provider Demo'}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Example Queries:
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• "Verify NPI 1234567890"</li>
                  <li>• "Find cardiology providers"</li>
                  <li>• "Search for Dr. Smith"</li>
                  <li>• "Internal medicine providers"</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Demo Results ({demoResults.length})
                </h3>
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear Results
                </button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Running demo...</span>
                </div>
              )}

              {demoResults.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Icon name="database" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No demo results yet. Run a demo to see results here.</p>
                </div>
              )}

              {demoResults.length > 0 && (
                <div className="space-y-4">
                  {demoResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {result.type}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {result.timestamp}
                        </span>
                      </div>
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
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Button */}
      <HelperButton
        currentForm="AIEnhancedDemo"
        currentField="demo"
        currentStep={1}
        onFieldSuggestion={(fieldName, suggestion) => {
          console.log(`AI Suggestion for ${fieldName}:`, suggestion)
        }}
      />
    </div>
  )
} 
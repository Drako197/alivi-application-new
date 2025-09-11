// Memory Test Component - for testing memory integration
import React, { useState, useEffect } from 'react'
import AIAssistantService from '../services/AIAssistantService'

interface MemoryTestProps {
  isOpen: boolean
  onClose: () => void
}

const MemoryTest: React.FC<MemoryTestProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [memoryStats, setMemoryStats] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      loadMemoryStats()
    }
  }, [isOpen])

  const loadMemoryStats = async () => {
    try {
      const stats = await AIAssistantService.getMemoryStatistics()
      setMemoryStats(stats)
    } catch (error) {
      console.error('Failed to load memory stats:', error)
    }
  }

  const runMemoryTest = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const results: string[] = []
    const testUserId = 'test_user_' + Date.now()
    
    try {
      // Test 1: Set user preference
      results.push('🧪 Test 1: Setting user preference...')
      const preferenceSet = await AIAssistantService.setUserPreference(
        testUserId,
        'response_style',
        'detailed',
        'high'
      )
      results.push(preferenceSet ? '✅ Preference set successfully' : '❌ Failed to set preference')
      
      // Test 2: Get user preference
      results.push('\n🧪 Test 2: Getting user preference...')
      const preference = await AIAssistantService.getUserPreference(
        testUserId,
        'response_style',
        'standard'
      )
      results.push(`✅ Retrieved preference: ${preference}`)
      
      // Test 3: Process input with memory
      results.push('\n🧪 Test 3: Processing input with memory...')
      const response = await AIAssistantService.processUserInput(
        'What is diabetes mellitus?',
        {
          userId: testUserId,
          sessionId: 'test_session',
          memoryEnabled: true,
          formType: 'claims_submission'
        }
      )
      results.push(`✅ Response generated: ${response.substring(0, 100)}...`)
      
      // Test 4: Get medical term stats
      results.push('\n🧪 Test 4: Getting medical term statistics...')
      const termStats = await AIAssistantService.getUserMedicalTermStats(testUserId)
      results.push(`✅ Found ${termStats.totalTerms} medical terms`)
      if (termStats.mostUsedTerms.length > 0) {
        results.push(`   Most used: ${termStats.mostUsedTerms[0].term} (${termStats.mostUsedTerms[0].usageCount} times)`)
      }
      
      // Test 5: Get personalized suggestions
      results.push('\n🧪 Test 5: Getting personalized suggestions...')
      const suggestions = await AIAssistantService.getPersonalizedSuggestions(testUserId)
      results.push(`✅ Generated ${suggestions.length} suggestions:`)
      suggestions.forEach((suggestion, index) => {
        results.push(`   ${index + 1}. ${suggestion}`)
      })
      
      // Test 6: Get conversation history
      results.push('\n🧪 Test 6: Getting conversation history...')
      const history = await AIAssistantService.getUserConversationHistory(testUserId, 5)
      results.push(`✅ Found ${history.length} conversations`)
      
      results.push('\n🎉 All memory tests completed successfully!')
      
    } catch (error) {
      results.push(`\n❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
      setTestResults(results)
    }
  }

  const clearTestData = async () => {
    try {
      const testUserId = 'test_user_' + Date.now()
      await AIAssistantService.clearUserMemory(testUserId)
      setTestResults(['🧹 Test data cleared'])
    } catch (error) {
      setTestResults([`❌ Failed to clear test data: ${error instanceof Error ? error.message : 'Unknown error'}`])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Memory Integration Test
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Memory Stats */}
        {memoryStats && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Memory Statistics</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Total Entries: {memoryStats.totalEntries}</p>
              <p>Entries by Type: {JSON.stringify(memoryStats.entriesByType)}</p>
              <p>Recent Activity: {memoryStats.recentActivity?.length || 0} items</p>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={runMemoryTest}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Memory Tests'}
          </button>
          <button
            onClick={clearTestData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Clear Test Data
          </button>
          <button
            onClick={loadMemoryStats}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Refresh Stats
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Results</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-mono whitespace-pre-line">
              {testResults.join('\n')}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Click "Run Memory Tests" to test all memory functionality</li>
            <li>Click "Clear Test Data" to remove test data from memory</li>
            <li>Click "Refresh Stats" to update memory statistics</li>
            <li>Make sure the memory server is running on port 3001</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MemoryTest


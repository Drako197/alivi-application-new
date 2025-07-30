import React, { useState, useEffect } from 'react'
import ProactiveSuggestionsService from '../services/ProactiveSuggestionsService'
import PersonalizationService from '../services/PersonalizationService'

interface TestResult {
  testName: string
  passed: boolean
  suggestions: any[]
  error?: string
}

export default function ProactiveSuggestionsTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runAllTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test 1: Form-specific contextual suggestions
    try {
      const patientEligibilitySuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'PatientEligibilityForm',
        currentField: 'providerId',
        currentStep: 1
      })
      
      results.push({
        testName: 'PatientEligibilityForm - Provider ID Suggestions',
        passed: patientEligibilitySuggestions.length > 0,
        suggestions: patientEligibilitySuggestions
      })
    } catch (error) {
      results.push({
        testName: 'PatientEligibilityForm - Provider ID Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Claims submission suggestions
    try {
      const claimsSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'ClaimsSubmissionForm',
        currentField: 'odSphere',
        currentStep: 3
      })
      
      results.push({
        testName: 'ClaimsSubmissionForm - Eye Prescription Suggestions',
        passed: claimsSuggestions.length > 0,
        suggestions: claimsSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'ClaimsSubmissionForm - Eye Prescription Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Screening form suggestions
    try {
      const screeningSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'NewScreeningForm',
        currentField: 'diabetesMellitus',
        currentStep: 1
      })
      
      results.push({
        testName: 'NewScreeningForm - Diabetes Suggestions',
        passed: screeningSuggestions.length > 0,
        suggestions: screeningSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'NewScreeningForm - Diabetes Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Prescription form suggestions
    try {
      const prescriptionSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'PrescriptionForm',
        currentField: 'odAxis',
        currentStep: 1
      })
      
      results.push({
        testName: 'PrescriptionForm - Axis Suggestions',
        passed: prescriptionSuggestions.length > 0,
        suggestions: prescriptionSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'PrescriptionForm - Axis Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 5: Workflow suggestions
    try {
      const workflowSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'ClaimsSubmissionForm',
        currentField: 'diagnosisCodes',
        currentStep: 2
      })
      
      results.push({
        testName: 'Workflow-Based Suggestions',
        passed: workflowSuggestions.length > 0,
        suggestions: workflowSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'Workflow-Based Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 6: Error prevention suggestions
    try {
      const errorPreventionSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'PatientEligibilityForm',
        currentField: 'dateOfBirth',
        currentStep: 1
      })
      
      results.push({
        testName: 'Error Prevention Suggestions',
        passed: errorPreventionSuggestions.length > 0,
        suggestions: errorPreventionSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'Error Prevention Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 7: Compliance suggestions
    try {
      const complianceSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'ClaimsSubmissionForm',
        currentField: 'diagnosisCodes',
        currentStep: 2
      })
      
      results.push({
        testName: 'Compliance Suggestions',
        passed: complianceSuggestions.length > 0,
        suggestions: complianceSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'Compliance Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 8: Integration suggestions
    try {
      const integrationSuggestions = ProactiveSuggestionsService.getProactiveSuggestions({
        currentForm: 'PatientEligibilityForm',
        currentField: 'providerId',
        currentStep: 1
      })
      
      results.push({
        testName: 'Integration Suggestions',
        passed: integrationSuggestions.length > 0,
        suggestions: integrationSuggestions
      })
    } catch (error) {
      results.push({
        testName: 'Integration Suggestions',
        passed: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const resetPersonalization = () => {
    PersonalizationService.clearAllData()
    alert('Personalization data cleared!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          M.I.L.A. Proactive Suggestions Test
        </h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={resetPersonalization}
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Reset Personalization
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Results
            </h2>
            
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.passed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {result.testName}
                  </h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.passed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                {result.error && (
                  <p className="text-red-600 dark:text-red-400 mt-2">
                    Error: {result.error}
                  </p>
                )}
                
                {result.suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Suggestions found: {result.suggestions.length}
                    </p>
                    <div className="space-y-2">
                      {result.suggestions.slice(0, 3).map((suggestion, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <strong>{suggestion.title}</strong>: {suggestion.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Summary
              </h3>
              <p className="text-blue-800 dark:text-blue-300">
                Tests Passed: {testResults.filter(r => r.passed).length} / {testResults.length}
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                Total Suggestions Generated: {testResults.reduce((sum, r) => sum + r.suggestions.length, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
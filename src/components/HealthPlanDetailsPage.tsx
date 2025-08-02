import { useState } from 'react'
import Icon from './Icon'

interface HealthPlanDetailsPageProps {
  onBack?: () => void
}

interface HealthPlanProvider {
  id: string
  name: string
  documents: HealthPlanDocument[]
}

interface HealthPlanDocument {
  id: string
  title: string
  year: string
  type: 'benefits' | 'medicaid' | 'billing' | 'coverage' | 'network' | 'formulary'
}

export default function HealthPlanDetailsPage({ onBack }: HealthPlanDetailsPageProps) {
  const [expandedProvider, setExpandedProvider] = useState<string>('avmed')

  // Comprehensive health plan providers data
  const healthPlanProviders: HealthPlanProvider[] = [
    {
      id: 'avmed',
      name: 'AvMed, Inc.',
      documents: [
        { id: 'avmed-1', title: 'AvMed Essencial Health Benefits', year: '2025', type: 'benefits' },
        { id: 'avmed-2', title: 'AvMed Essencial Health Benefits', year: '2024', type: 'benefits' },
        { id: 'avmed-3', title: 'AvMed Essencial Medicaid Choices', year: '2025', type: 'medicaid' },
        { id: 'avmed-4', title: 'AvMed Essencial Medicaid Choices', year: '2024', type: 'medicaid' },
        { id: 'avmed-5', title: 'AvMed Billing Structure', year: '2025', type: 'billing' },
        { id: 'avmed-6', title: 'AvMed Billing Structure', year: '2024', type: 'billing' }
      ]
    },
    {
      id: 'careplus',
      name: 'Care Plus Health Plans',
      documents: [
        { id: 'careplus-1', title: 'Care Plus Essential Health Benefits', year: '2024', type: 'benefits' },
        { id: 'careplus-2', title: 'Care Plus Medicaid Managed Care', year: '2024', type: 'medicaid' },
        { id: 'careplus-3', title: 'Care Plus Provider Network Directory', year: '2024', type: 'network' },
        { id: 'careplus-4', title: 'Care Plus Billing and Claims Guide', year: '2024', type: 'billing' },
        { id: 'careplus-5', title: 'Care Plus Formulary and Drug Coverage', year: '2024', type: 'formulary' }
      ]
    },
    {
      id: 'floridablue',
      name: 'Florida Blue',
      documents: [
        { id: 'floridablue-1', title: 'Florida Blue Essential Health Benefits', year: '2024', type: 'benefits' },
        { id: 'floridablue-2', title: 'Florida Blue Medicare Advantage Plans', year: '2024', type: 'benefits' },
        { id: 'floridablue-3', title: 'Florida Blue Provider Network', year: '2024', type: 'network' },
        { id: 'floridablue-4', title: 'Florida Blue Claims Processing Guide', year: '2024', type: 'billing' },
        { id: 'floridablue-5', title: 'Florida Blue Prescription Drug Coverage', year: '2024', type: 'formulary' },
        { id: 'floridablue-6', title: 'Florida Blue Vision Benefits', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'humana',
      name: 'Humana',
      documents: [
        { id: 'humana-1', title: 'Humana Medicare Advantage Benefits', year: '2024', type: 'benefits' },
        { id: 'humana-2', title: 'Humana Medicaid Managed Care', year: '2024', type: 'medicaid' },
        { id: 'humana-3', title: 'Humana Provider Network Directory', year: '2024', type: 'network' },
        { id: 'humana-4', title: 'Humana Claims and Billing Procedures', year: '2024', type: 'billing' },
        { id: 'humana-5', title: 'Humana Prescription Drug List', year: '2024', type: 'formulary' },
        { id: 'humana-6', title: 'Humana Vision and Dental Coverage', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'kaiser',
      name: 'Kaiser Permanente',
      documents: [
        { id: 'kaiser-1', title: 'Kaiser Permanente Health Benefits', year: '2024', type: 'benefits' },
        { id: 'kaiser-2', title: 'Kaiser Permanente Medicare Plans', year: '2024', type: 'benefits' },
        { id: 'kaiser-3', title: 'Kaiser Permanente Provider Network', year: '2024', type: 'network' },
        { id: 'kaiser-4', title: 'Kaiser Permanente Billing Guidelines', year: '2024', type: 'billing' },
        { id: 'kaiser-5', title: 'Kaiser Permanente Drug Formulary', year: '2024', type: 'formulary' },
        { id: 'kaiser-6', title: 'Kaiser Permanente Vision Services', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'aetna',
      name: 'Aetna',
      documents: [
        { id: 'aetna-1', title: 'Aetna Commercial Health Benefits', year: '2024', type: 'benefits' },
        { id: 'aetna-2', title: 'Aetna Medicare Advantage', year: '2024', type: 'benefits' },
        { id: 'aetna-3', title: 'Aetna Provider Network', year: '2024', type: 'network' },
        { id: 'aetna-4', title: 'Aetna Claims Processing Manual', year: '2024', type: 'billing' },
        { id: 'aetna-5', title: 'Aetna Prescription Drug Coverage', year: '2024', type: 'formulary' },
        { id: 'aetna-6', title: 'Aetna Vision Benefits', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'cigna',
      name: 'Cigna',
      documents: [
        { id: 'cigna-1', title: 'Cigna Health Benefits Guide', year: '2024', type: 'benefits' },
        { id: 'cigna-2', title: 'Cigna Medicare Solutions', year: '2024', type: 'benefits' },
        { id: 'cigna-3', title: 'Cigna Provider Network', year: '2024', type: 'network' },
        { id: 'cigna-4', title: 'Cigna Claims and Billing Guide', year: '2024', type: 'billing' },
        { id: 'cigna-5', title: 'Cigna Prescription Drug List', year: '2024', type: 'formulary' },
        { id: 'cigna-6', title: 'Cigna Vision Coverage', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'unitedhealth',
      name: 'UnitedHealthcare',
      documents: [
        { id: 'unitedhealth-1', title: 'UnitedHealthcare Commercial Plans', year: '2024', type: 'benefits' },
        { id: 'unitedhealth-2', title: 'UnitedHealthcare Medicare Advantage', year: '2024', type: 'benefits' },
        { id: 'unitedhealth-3', title: 'UnitedHealthcare Provider Network', year: '2024', type: 'network' },
        { id: 'unitedhealth-4', title: 'UnitedHealthcare Claims Processing', year: '2024', type: 'billing' },
        { id: 'unitedhealth-5', title: 'UnitedHealthcare Drug Formulary', year: '2024', type: 'formulary' },
        { id: 'unitedhealth-6', title: 'UnitedHealthcare Vision Benefits', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'anthem',
      name: 'Anthem Blue Cross Blue Shield',
      documents: [
        { id: 'anthem-1', title: 'Anthem Health Benefits', year: '2024', type: 'benefits' },
        { id: 'anthem-2', title: 'Anthem Medicare Plans', year: '2024', type: 'benefits' },
        { id: 'anthem-3', title: 'Anthem Provider Network', year: '2024', type: 'network' },
        { id: 'anthem-4', title: 'Anthem Claims and Billing', year: '2024', type: 'billing' },
        { id: 'anthem-5', title: 'Anthem Prescription Coverage', year: '2024', type: 'formulary' },
        { id: 'anthem-6', title: 'Anthem Vision Services', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'molina',
      name: 'Molina Healthcare',
      documents: [
        { id: 'molina-1', title: 'Molina Medicaid Managed Care', year: '2024', type: 'medicaid' },
        { id: 'molina-2', title: 'Molina Medicare Advantage', year: '2024', type: 'benefits' },
        { id: 'molina-3', title: 'Molina Provider Network', year: '2024', type: 'network' },
        { id: 'molina-4', title: 'Molina Claims Processing', year: '2024', type: 'billing' },
        { id: 'molina-5', title: 'Molina Drug Formulary', year: '2024', type: 'formulary' },
        { id: 'molina-6', title: 'Molina Vision Benefits', year: '2024', type: 'benefits' }
      ]
    },
    {
      id: 'wellcare',
      name: 'WellCare Health Plans',
      documents: [
        { id: 'wellcare-1', title: 'WellCare Medicare Advantage', year: '2024', type: 'benefits' },
        { id: 'wellcare-2', title: 'WellCare Medicaid Plans', year: '2024', type: 'medicaid' },
        { id: 'wellcare-3', title: 'WellCare Provider Network', year: '2024', type: 'network' },
        { id: 'wellcare-4', title: 'WellCare Claims and Billing', year: '2024', type: 'billing' },
        { id: 'wellcare-5', title: 'WellCare Prescription Coverage', year: '2024', type: 'formulary' },
        { id: 'wellcare-6', title: 'WellCare Vision Services', year: '2024', type: 'benefits' }
      ]
    }
  ]

  const handleProviderToggle = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? '' : providerId)
  }

  const handleViewDocument = (document: HealthPlanDocument) => {
    console.log('Viewing document:', document.title)
    // Here you would typically open the document in a new tab or modal
    window.open(`#${document.id}`, '_blank')
  }

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      benefits: 'heart',
      medicaid: 'shield',
      billing: 'dollar-sign',
      coverage: 'check-circle',
      network: 'users',
      formulary: 'pill'
    }
    return icons[type as keyof typeof icons] || 'file-text'
  }

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      benefits: 'text-blue-600',
      medicaid: 'text-green-600',
      billing: 'text-purple-600',
      coverage: 'text-indigo-600',
      network: 'text-orange-600',
      formulary: 'text-red-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Icon name="arrow-left" size={16} />
                  Back
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Health Plan Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Plans Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Health Plans
            </h2>
          </div>
          
          <div className="p-6">
            {healthPlanProviders.map((provider) => (
              <div key={provider.id} className="mb-4 last:mb-0">
                {/* Provider Header */}
                <button
                  onClick={() => handleProviderToggle(provider.id)}
                  className={`w-full flex justify-between items-center p-4 rounded-lg transition-colors ${
                    expandedProvider === provider.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="font-semibold">{provider.name}</span>
                  <Icon
                    name={expandedProvider === provider.id ? 'minus' : 'plus'}
                    size={20}
                    className={expandedProvider === provider.id ? 'text-white' : 'text-blue-600'}
                  />
                </button>

                {/* Provider Documents */}
                {expandedProvider === provider.id && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {provider.documents.map((document, index) => (
                      <div
                        key={document.id}
                        className={`flex justify-between items-center p-4 ${
                          index !== provider.documents.length - 1
                            ? 'border-b border-gray-200 dark:border-gray-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                            {index + 1}.
                          </span>
                          <div className="flex items-center gap-2">
                            <Icon
                              name={getDocumentTypeIcon(document.type)}
                              size={16}
                              className={getDocumentTypeColor(document.type)}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {document.title} {document.year}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                        >
                          <Icon name="external-link" size={14} />
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Information Footer */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Icon name="info" size={20} className="text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                About Health Plan Documents
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This page provides access to health plan documents, benefits guides, and provider information for major health insurance providers in Florida. 
                Click on any provider to view their available documents, or use the "View" button to access specific documents. 
                All documents are updated annually and provide current coverage information, billing procedures, and network details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
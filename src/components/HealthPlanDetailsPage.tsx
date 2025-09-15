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
  url?: string
  available?: boolean
  requiresAuth?: boolean
}

export default function HealthPlanDetailsPage({ onBack }: HealthPlanDetailsPageProps) {
  const [expandedProvider, setExpandedProvider] = useState<string>('avmed')
  const [documentStatus, setDocumentStatus] = useState<{[key: string]: boolean}>({})

  // Comprehensive health plan providers data with URLs
  const healthPlanProviders: HealthPlanProvider[] = [
    {
      id: 'avmed',
      name: 'AvMed, Inc.',
      documents: [
        { 
          id: 'avmed-1', 
          title: 'AvMed Essencial Health Benefits', 
          year: '2025', 
          type: 'benefits',
          url: 'https://www.avmed.org/providers/forms-documents/essential-health-benefits-2025',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'avmed-2', 
          title: 'AvMed Essencial Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.avmed.org/providers/forms-documents/essential-health-benefits-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'avmed-3', 
          title: 'AvMed Essencial Medicaid Choices', 
          year: '2025', 
          type: 'medicaid',
          url: 'https://www.avmed.org/providers/medicaid/choices-2025',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'avmed-4', 
          title: 'AvMed Essencial Medicaid Choices', 
          year: '2024', 
          type: 'medicaid',
          url: 'https://www.avmed.org/providers/medicaid/choices-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'avmed-5', 
          title: 'AvMed Billing Structure', 
          year: '2025', 
          type: 'billing',
          url: 'https://www.avmed.org/providers/billing/structure-2025',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'avmed-6', 
          title: 'AvMed Billing Structure', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.avmed.org/providers/billing/structure-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'careplus',
      name: 'Care Plus Health Plans',
      documents: [
        { 
          id: 'careplus-1', 
          title: 'Care Plus Essential Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.careplushealthplans.com/providers/benefits/essential-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'careplus-2', 
          title: 'Care Plus Medicaid Managed Care', 
          year: '2024', 
          type: 'medicaid',
          url: 'https://www.careplushealthplans.com/providers/medicaid/managed-care-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'careplus-3', 
          title: 'Care Plus Provider Network Directory', 
          year: '2024', 
          type: 'network',
          url: 'https://www.careplushealthplans.com/providers/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'careplus-4', 
          title: 'Care Plus Billing and Claims Guide', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.careplushealthplans.com/providers/billing/claims-guide-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'careplus-5', 
          title: 'Care Plus Formulary and Drug Coverage', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.careplushealthplans.com/providers/pharmacy/formulary-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'floridablue',
      name: 'Florida Blue',
      documents: [
        { 
          id: 'floridablue-1', 
          title: 'Florida Blue Essential Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.floridablue.com/providers/forms/essential-health-benefits-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'floridablue-2', 
          title: 'Florida Blue Medicare Advantage Plans', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.floridablue.com/providers/medicare/advantage-plans-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'floridablue-3', 
          title: 'Florida Blue Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.floridablue.com/providers/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'floridablue-4', 
          title: 'Florida Blue Claims Processing Guide', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.floridablue.com/providers/billing/claims-processing-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'floridablue-5', 
          title: 'Florida Blue Prescription Drug Coverage', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.floridablue.com/providers/pharmacy/drug-coverage-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'floridablue-6', 
          title: 'Florida Blue Vision Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.floridablue.com/providers/vision/benefits-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'humana',
      name: 'Humana',
      documents: [
        { 
          id: 'humana-1', 
          title: 'Humana Medicare Advantage Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.humana.com/provider/medicare/advantage-benefits-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'humana-2', 
          title: 'Humana Medicaid Managed Care', 
          year: '2024', 
          type: 'medicaid',
          url: 'https://www.humana.com/provider/medicaid/managed-care-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'humana-3', 
          title: 'Humana Provider Network Directory', 
          year: '2024', 
          type: 'network',
          url: 'https://www.humana.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'humana-4', 
          title: 'Humana Claims and Billing Procedures', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.humana.com/provider/billing/procedures-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'humana-5', 
          title: 'Humana Prescription Drug List', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.humana.com/provider/pharmacy/drug-list-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'humana-6', 
          title: 'Humana Vision and Dental Coverage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.humana.com/provider/vision-dental/coverage-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'kaiser',
      name: 'Kaiser Permanente',
      documents: [
        { 
          id: 'kaiser-1', 
          title: 'Kaiser Permanente Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://provider.kaiserpermanente.org/benefits/health-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'kaiser-2', 
          title: 'Kaiser Permanente Medicare Plans', 
          year: '2024', 
          type: 'benefits',
          url: 'https://provider.kaiserpermanente.org/medicare/plans-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'kaiser-3', 
          title: 'Kaiser Permanente Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://provider.kaiserpermanente.org/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'kaiser-4', 
          title: 'Kaiser Permanente Billing Guidelines', 
          year: '2024', 
          type: 'billing',
          url: 'https://provider.kaiserpermanente.org/billing/guidelines-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'kaiser-5', 
          title: 'Kaiser Permanente Drug Formulary', 
          year: '2024', 
          type: 'formulary',
          url: 'https://provider.kaiserpermanente.org/pharmacy/formulary-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'kaiser-6', 
          title: 'Kaiser Permanente Vision Services', 
          year: '2024', 
          type: 'benefits',
          url: 'https://provider.kaiserpermanente.org/vision/services-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'aetna',
      name: 'Aetna',
      documents: [
        { 
          id: 'aetna-1', 
          title: 'Aetna Commercial Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.aetna.com/provider/commercial/benefits-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'aetna-2', 
          title: 'Aetna Medicare Advantage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.aetna.com/provider/medicare/advantage-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'aetna-3', 
          title: 'Aetna Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.aetna.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'aetna-4', 
          title: 'Aetna Claims Processing Manual', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.aetna.com/provider/billing/processing-manual-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'aetna-5', 
          title: 'Aetna Prescription Drug Coverage', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.aetna.com/provider/pharmacy/drug-coverage-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'aetna-6', 
          title: 'Aetna Vision Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.aetna.com/provider/vision/benefits-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'cigna',
      name: 'Cigna',
      documents: [
        { 
          id: 'cigna-1', 
          title: 'Cigna Health Benefits Guide', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.cigna.com/provider/benefits/guide-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'cigna-2', 
          title: 'Cigna Medicare Solutions', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.cigna.com/provider/medicare/solutions-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'cigna-3', 
          title: 'Cigna Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.cigna.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'cigna-4', 
          title: 'Cigna Claims and Billing Guide', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.cigna.com/provider/billing/guide-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'cigna-5', 
          title: 'Cigna Prescription Drug List', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.cigna.com/provider/pharmacy/drug-list-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'cigna-6', 
          title: 'Cigna Vision Coverage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.cigna.com/provider/vision/coverage-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'unitedhealth',
      name: 'UnitedHealthcare',
      documents: [
        { 
          id: 'unitedhealth-1', 
          title: 'UnitedHealthcare Commercial Plans', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.uhc.com/provider/commercial/plans-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'unitedhealth-2', 
          title: 'UnitedHealthcare Medicare Advantage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.uhc.com/provider/medicare/advantage-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'unitedhealth-3', 
          title: 'UnitedHealthcare Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.uhc.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'unitedhealth-4', 
          title: 'UnitedHealthcare Claims Processing', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.uhc.com/provider/billing/processing-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'unitedhealth-5', 
          title: 'UnitedHealthcare Drug Formulary', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.uhc.com/provider/pharmacy/formulary-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'unitedhealth-6', 
          title: 'UnitedHealthcare Vision Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.uhc.com/provider/vision/benefits-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'anthem',
      name: 'Anthem Blue Cross Blue Shield',
      documents: [
        { 
          id: 'anthem-1', 
          title: 'Anthem Health Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.anthem.com/provider/benefits/health-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'anthem-2', 
          title: 'Anthem Medicare Plans', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.anthem.com/provider/medicare/plans-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'anthem-3', 
          title: 'Anthem Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.anthem.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'anthem-4', 
          title: 'Anthem Claims and Billing', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.anthem.com/provider/billing/claims-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'anthem-5', 
          title: 'Anthem Prescription Coverage', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.anthem.com/provider/pharmacy/coverage-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'anthem-6', 
          title: 'Anthem Vision Services', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.anthem.com/provider/vision/services-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'molina',
      name: 'Molina Healthcare',
      documents: [
        { 
          id: 'molina-1', 
          title: 'Molina Medicaid Managed Care', 
          year: '2024', 
          type: 'medicaid',
          url: 'https://www.molinahealthcare.com/provider/medicaid/managed-care-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'molina-2', 
          title: 'Molina Medicare Advantage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.molinahealthcare.com/provider/medicare/advantage-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'molina-3', 
          title: 'Molina Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.molinahealthcare.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'molina-4', 
          title: 'Molina Claims Processing', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.molinahealthcare.com/provider/billing/processing-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'molina-5', 
          title: 'Molina Drug Formulary', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.molinahealthcare.com/provider/pharmacy/formulary-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'molina-6', 
          title: 'Molina Vision Benefits', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.molinahealthcare.com/provider/vision/benefits-2024',
          available: true,
          requiresAuth: false
        }
      ]
    },
    {
      id: 'wellcare',
      name: 'WellCare Health Plans',
      documents: [
        { 
          id: 'wellcare-1', 
          title: 'WellCare Medicare Advantage', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.wellcare.com/provider/medicare/advantage-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'wellcare-2', 
          title: 'WellCare Medicaid Plans', 
          year: '2024', 
          type: 'medicaid',
          url: 'https://www.wellcare.com/provider/medicaid/plans-2024',
          available: true,
          requiresAuth: true
        },
        { 
          id: 'wellcare-3', 
          title: 'WellCare Provider Network', 
          year: '2024', 
          type: 'network',
          url: 'https://www.wellcare.com/provider/network/directory-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'wellcare-4', 
          title: 'WellCare Claims and Billing', 
          year: '2024', 
          type: 'billing',
          url: 'https://www.wellcare.com/provider/billing/claims-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'wellcare-5', 
          title: 'WellCare Prescription Coverage', 
          year: '2024', 
          type: 'formulary',
          url: 'https://www.wellcare.com/provider/pharmacy/coverage-2024',
          available: true,
          requiresAuth: false
        },
        { 
          id: 'wellcare-6', 
          title: 'WellCare Vision Services', 
          year: '2024', 
          type: 'benefits',
          url: 'https://www.wellcare.com/provider/vision/services-2024',
          available: true,
          requiresAuth: false
        }
      ]
    }
  ]

  const handleProviderToggle = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? '' : providerId)
  }

  const handleViewDocument = (document: HealthPlanDocument) => {
    console.log('Viewing document:', document.title)
    
    // Show informational message instead of external linking
    alert(`Document: ${document.title}\n\nThis feature is currently in development. Please contact the health plan provider directly for access to this document.`)
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

  const getDocumentStatusBadge = (document: HealthPlanDocument) => {
    if (!document.available) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          Unavailable
        </span>
      )
    }
    
    if (document.requiresAuth) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          Login Required
        </span>
      )
    }
    
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
        Available
      </span>
    )
  }

  return (
    <div className="pic-health-plan-details-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="pic-page-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="pic-header-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pic-header-main flex justify-between items-center py-4">
            <div className="pic-header-left flex items-center gap-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Health Plans Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 sm:px-6 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Health Plans
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
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
                        className={`bg-white dark:bg-gray-700 p-4 ${
                          index !== provider.documents.length - 1
                            ? 'border-b border-gray-200 dark:border-gray-600'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-6 flex-shrink-0">
                              {index + 1}.
                            </span>
                            <div className="flex items-start gap-2 flex-1">
                              <Icon
                                name={getDocumentTypeIcon(document.type)}
                                size={16}
                                className={`${getDocumentTypeColor(document.type)} mt-1 flex-shrink-0`}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white break-words">
                                  {document.title} {document.year}
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDocumentStatusBadge(document)}
                          </div>
                          <button
                            onClick={() => handleViewDocument(document)}
                            className={`btn-primary flex items-center gap-2 px-4 py-2 text-sm ${
                              !document.available ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!document.available}
                          >
                            <Icon name="external-link" size={14} />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Information Footer */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Icon name="info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                About Health Plan Documents
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                This page provides access to health plan documents, benefits guides, and provider information for major health insurance providers in Florida. 
                Click on any provider to view their available documents, or use the "View" button to access specific documents. 
                All documents are updated annually and provide current coverage information, billing procedures, and network details.
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Status Indicators:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="bg-green-100 text-green-800 px-1 rounded">Available</span> - Document is accessible without login</li>
                  <li><span className="bg-yellow-100 text-yellow-800 px-1 rounded">Login Required</span> - Provider authentication needed</li>
                  <li><span className="bg-red-100 text-red-800 px-1 rounded">Unavailable</span> - Document temporarily unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
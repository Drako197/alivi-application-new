import { useState } from 'react'
import Icon from './Icon'

interface FramesAndLensesPageProps {
  onBack?: () => void
}

interface DocumentItem {
  id: string
  title: string
  type: 'frames' | 'lenses'
  url?: string
  available?: boolean
  fileSize?: string
  lastUpdated?: string
}

export default function FramesAndLensesPage({ onBack }: FramesAndLensesPageProps) {
  const [activeTab, setActiveTab] = useState<'frames' | 'lenses'>('frames')

  // Frames Collection Documents
  const framesDocuments: DocumentItem[] = [
    {
      id: 'frames-1',
      title: 'Premium Collection Frame Kit.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/premium-collection-frame-kit.pdf',
      available: true,
      fileSize: '2.4 MB',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'frames-2',
      title: 'Premium Collection Frame Kit pics.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/premium-collection-frame-kit-pics.pdf',
      available: true,
      fileSize: '5.8 MB',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'frames-3',
      title: 'Platinum Quality Selection (01012015).pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/platinum-quality-selection-2015.pdf',
      available: true,
      fileSize: '3.2 MB',
      lastUpdated: '2015-01-01'
    },
    {
      id: 'frames-4',
      title: 'Grand Lux Frame Special Order Toddler Frames.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/grand-lux-toddler-frames.pdf',
      available: true,
      fileSize: '1.9 MB',
      lastUpdated: '2024-02-20'
    },
    {
      id: 'frames-5',
      title: 'Grand Lux Frame Kit.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/grand-lux-frame-kit.pdf',
      available: true,
      fileSize: '4.1 MB',
      lastUpdated: '2024-01-10'
    },
    {
      id: 'frames-6',
      title: 'MLH Frame Kit.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/mlh-frame-kit.pdf',
      available: true,
      fileSize: '2.7 MB',
      lastUpdated: '2024-01-08'
    },
    {
      id: 'frames-7',
      title: 'Designer Collection Frame Kit.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/designer-collection-frame-kit.pdf',
      available: true,
      fileSize: '6.3 MB',
      lastUpdated: '2024-03-01'
    },
    {
      id: 'frames-8',
      title: 'Kids Collection Frame Kit.pdf',
      type: 'frames',
      url: 'https://www.alivi.com/documents/frames/kids-collection-frame-kit.pdf',
      available: true,
      fileSize: '3.8 MB',
      lastUpdated: '2024-02-15'
    }
  ]

  // Lens Price List Documents
  const lensesDocuments: DocumentItem[] = [
    {
      id: 'lenses-1',
      title: 'Standard Lens Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/standard-lens-price-list-2024.pdf',
      available: true,
      fileSize: '1.2 MB',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'lenses-2',
      title: 'Premium Lens Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/premium-lens-price-list-2024.pdf',
      available: true,
      fileSize: '1.5 MB',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'lenses-3',
      title: 'Progressive Lens Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/progressive-lens-price-list-2024.pdf',
      available: true,
      fileSize: '1.8 MB',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'lenses-4',
      title: 'Contact Lens Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/contact-lens-price-list-2024.pdf',
      available: true,
      fileSize: '0.9 MB',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'lenses-5',
      title: 'Specialty Lens Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/specialty-lens-price-list-2024.pdf',
      available: true,
      fileSize: '2.1 MB',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'lenses-6',
      title: 'Coating and Treatment Price List 2024.pdf',
      type: 'lenses',
      url: 'https://www.alivi.com/documents/lenses/coating-treatment-price-list-2024.pdf',
      available: true,
      fileSize: '0.7 MB',
      lastUpdated: '2024-01-01'
    }
  ]

  const handleViewDocument = (document: DocumentItem) => {
    console.log('Viewing document:', document.title)
    
    if (document.url && document.available) {
      // Show external link warning
      const confirmed = window.confirm(
        `You are about to download: ${document.title}\n\nThis will open in a new tab. Do you want to continue?`
      )
      
      if (confirmed) {
        window.open(document.url, '_blank', 'noopener,noreferrer')
      }
    } else {
      // Show fallback message
      alert('This document is currently unavailable. Please contact support for access.')
    }
  }

  const getDocumentIcon = (type: string) => {
    return type === 'frames' ? 'eye' : 'tag'
  }

  const getDocumentColor = (type: string) => {
    return type === 'frames' ? 'text-blue-600' : 'text-green-600'
  }

  const getDocumentStatusBadge = (document: DocumentItem) => {
    if (!document.available) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          Unavailable
        </span>
      )
    }
    
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
        Available
      </span>
    )
  }

  const currentDocuments = activeTab === 'frames' ? framesDocuments : lensesDocuments

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
                Frames and Lenses
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabbed Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('frames')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'frames'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="eye" size={16} />
                  Frames Collection
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'lenses'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon name="tag" size={16} />
                  Lens Price List
                </div>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <div className="space-y-4">
              {currentDocuments.map((document, index) => (
                <div
                  key={document.id}
                  className={`flex justify-between items-center p-4 rounded-lg border ${
                    index !== currentDocuments.length - 1
                      ? 'border-gray-200 dark:border-gray-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                      {index + 1}.
                    </span>
                    <div className="flex items-center gap-3">
                      <Icon
                        name={getDocumentIcon(document.type)}
                        size={16}
                        className={getDocumentColor(document.type)}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {document.title}
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {document.fileSize}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Updated: {document.lastUpdated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDocumentStatusBadge(document)}
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
          </div>
        </div>

        {/* Information Footer */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Icon name="info" size={20} className="text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                About Frames and Lenses Documents
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                This page provides access to comprehensive frame collections and lens pricing information. 
                The Frames Collection includes various frame kits and selections, while the Lens Price List 
                contains current pricing for all lens types and treatments. All documents are regularly updated 
                to ensure accurate pricing and product information.
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Document Types:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><span className="bg-blue-100 text-blue-800 px-1 rounded">Frames Collection</span> - Frame kits, selections, and catalogs</li>
                  <li><span className="bg-green-100 text-green-800 px-1 rounded">Lens Price List</span> - Current pricing for all lens types and treatments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
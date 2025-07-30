import React from 'react'
import Icon from './Icon'

interface ReservedBenefitsViewProps {
  onBack?: () => void
  onPrint?: () => void
  onExport?: () => void
}

export default function ReservedBenefitsView({
  onBack,
  onPrint,
  onExport
}: ReservedBenefitsViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Icon name="arrow-left" size={16} />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Reserved Benefits
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onPrint}
                className="btn-secondary flex items-center gap-2"
              >
                <Icon name="printer" size={16} />
                Print
              </button>
              <button
                onClick={onExport}
                className="btn-primary flex items-center gap-2"
              >
                <Icon name="download" size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Benefits Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">$2,450</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">$1,200</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">$1,250</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Used</div>
            </div>
          </div>
        </div>

        {/* Benefits Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reserved Benefits Details
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Benefit Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Reserved Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Used Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Available</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Vision Exam</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$150.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$150.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Used
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Frames</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$200.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$200.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Used
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Lenses</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$300.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$300.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Used
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Contact Lenses</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$500.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$500.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Available
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Laser Surgery</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$1,000.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$1,000.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Available
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Additional Services</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$300.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$300.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Used
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Usage History */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usage History
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Vision Exam - Dr. Stern</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">07/15/2016 - $150.00</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Completed
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Frames & Lenses - Grand Lux Collection</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">07/15/2016 - $500.00</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Completed
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Additional Services - UV Coating</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">07/15/2016 - $300.00</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Plan Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Plan Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Plan Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">HUM MCR SPC314 B314 $115</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Member ID:</span>
                    <span className="font-medium text-gray-900 dark:text-white">H00967498-0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Effective Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">01/01/2016</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Expiration Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">12/31/2016</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Coverage Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Annual Limit:</span>
                    <span className="font-medium text-gray-900 dark:text-white">$2,450.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Deductible:</span>
                    <span className="font-medium text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Co-pay:</span>
                    <span className="font-medium text-gray-900 dark:text-white">$15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Network:</span>
                    <span className="font-medium text-gray-900 dark:text-white">In-Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <Icon name="arrow-left" size={16} />
            Back to Claim
          </button>
          <button
            onClick={onPrint}
            className="btn-secondary flex items-center gap-2"
          >
            <Icon name="printer" size={16} />
            Print Report
          </button>
          <button
            onClick={onExport}
            className="btn-primary flex items-center gap-2"
          >
            <Icon name="download" size={16} />
            Export Benefits
          </button>
        </div>
      </div>
    </div>
  )
} 
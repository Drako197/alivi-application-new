import React from 'react'
import Icon from './Icon'

interface ClaimAcceptedViewProps {
  onBack?: () => void
  onPrint?: () => void
  onViewReport?: () => void
  onViewBenefits?: () => void
}

export default function ClaimAcceptedView({
  onBack,
  onPrint,
  onViewReport,
  onViewBenefits
}: ClaimAcceptedViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim Accepted
            </h1>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onPrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Icon name="printer" size={16} />
                Print
              </button>
              <button
                onClick={onViewReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon name="file-text" size={16} />
                Optometric Report
              </button>
              <button
                onClick={onViewBenefits}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Icon name="check-circle" size={16} />
                View Reserved Benefits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Banner */}
      <div className="bg-green-500 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-lg">
            Please note your confirmation number: <strong>69-2167466</strong>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Florida Optometric Physicians Network */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Florida Optometric Physicians Network
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Tel: (305) 418-2025</p>
                <p>Toll Free: (877) 418-2025</p>
                <p>Fax: (305) 418-7627</p>
              </div>
            </div>

            {/* Provider */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Provider
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>(2) Jodi Stern</strong></p>
                <p>(69) Dr Stern's VHC @ Sunset</p>
                <p>8732 SW 72nd Street</p>
                <p>Miami, Fl 33173</p>
                <p>Phone: (305) 559-8370</p>
              </div>
            </div>

            {/* Eligibility ID */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Eligibility ID
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                H00967498-0
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Job Order */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Job Order
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                69-1267446
              </p>
            </div>

            {/* TDR */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                TDR (Transaction Date/Time)
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                07/15/2016 10:30:30 PM
              </p>
            </div>

            {/* Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                HUM MCR- $115
              </p>
            </div>

            {/* Date of Service */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Date of Service
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                07/15/2016 12:30:30 AM
              </p>
            </div>

            {/* Member */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Member
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                (216919) Shirley Singer
              </p>
            </div>

            {/* Sub ID */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sub ID
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                H00967498-0
              </p>
            </div>

            {/* Group */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Group
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                HUM MCR SPC314 B314 $115
              </p>
            </div>
          </div>
        </div>

        {/* Prescription Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prescription
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Eye</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Sphere</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Cylinder</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Axis</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Add</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">BC</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Segment Hgt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">OD</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">+4.25</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">-0.50</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">2.0</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.50</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.0</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">8MM</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">OS</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">+4.00</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">-0.75</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">2.0</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.0</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.50</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">8MM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Detail Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prescription Detail
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Eye</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Horizontal</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Direction</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Vertical</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Direction</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 dark:text-white">Prism Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">OD</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.5</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">In</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.5</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">Up</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">Decentered</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">OS</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.75</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">In</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">0.75</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">Up</td>
                      <td className="py-2 px-4 text-gray-600 dark:text-gray-300">Ground In</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Far:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">40MM</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Near:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">37MM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lens Instruction Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lens Instruction
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Vision Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">Bi-Focal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Lens Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">Blended 25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Material:</span>
                    <span className="text-gray-600 dark:text-gray-300">CR-39</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Tint Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">Grey Gradient 1/2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Lens Source:</span>
                    <span className="text-gray-600 dark:text-gray-300">Italy</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Edge:</span>
                    <span className="text-gray-600 dark:text-gray-300">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Thickness:</span>
                    <span className="text-gray-600 dark:text-gray-300">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Coating:</span>
                    <span className="text-gray-600 dark:text-gray-300">Standard ARC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Other:</span>
                    <span className="text-gray-600 dark:text-gray-300">SlabOff - OD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Extra:</span>
                    <span className="text-gray-600 dark:text-gray-300">UV, Scratch Resistant and UV Package</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frame Selection Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Frame Selection
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Frame Source:</span>
                    <span className="text-gray-600 dark:text-gray-300">Insurance Supplied - Grand Lux Collection</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Frame Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Rimless Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">XYL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Name:</span>
                    <span className="text-gray-600 dark:text-gray-300">U 20</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Color:</span>
                    <span className="text-gray-600 dark:text-gray-300">Tortoise</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Eye Size:</span>
                    <span className="text-gray-600 dark:text-gray-300">46</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Bridge:</span>
                    <span className="text-gray-600 dark:text-gray-300">20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Vertical:</span>
                    <span className="text-gray-600 dark:text-gray-300">20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">ED:</span>
                    <span className="text-gray-600 dark:text-gray-300">46</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Notes Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Claim Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Claim completed, Good for you!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Icon name="printer" size={16} />
            Print
          </button>
          <button
            onClick={onViewReport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="file-text" size={16} />
            Optometric Report
          </button>
          <button
            onClick={onViewBenefits}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Icon name="check-circle" size={16} />
            View Reserved Benefits
          </button>
        </div>
      </div>
    </div>
  )
} 
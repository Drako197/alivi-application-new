import Icon from './Icon'

interface ReservedBenefitsPageProps {
  onBack?: () => void
  onPrint?: () => void
  onExport?: () => void
}

export default function ReservedBenefitsPage({ 
  onBack, 
  onPrint,
  onExport
}: ReservedBenefitsPageProps) {
  // Mock data for reserved benefits page
  const reservedBenefitsData = {
    member: {
      id: "H00967498 00",
      name: "Singer Shirley",
      address: "400 North West 92nd Ave, Pembroke Pines, Fl 33027",
      dateOfBirth: "04/20/1943"
    },
    primaryCarePhysician: {
      id: "0000171392 PCP301",
      organization: "PPMG At Hallandale Inc.",
      phone: "(305) 418-2025",
      tollFree: "(877) 418-2025"
    },
    provider: {
      renderingProvider: "Jodi L. Stern",
      npi: "12345878995",
      taxId: "4584552455556X",
      license: "OPC2748",
      location: {
        name: "(69) Dr Stern's VHC @ Sunset",
        address: "8732 SW 72nd Street, Miami, Fl 33173",
        phone: "(305) 559-8370"
      }
    },
    eligibility: {
      certificateId: "4569578596",
      effectiveDate: "06/13/16",
      expiration: "07/30/16",
      group: "Hum MCR SPC314 B314",
      plan: "Hum MCR - $115"
    },
    benefits: [
      {
        description: "1 Routine Examp at $0 Co-Pay",
        benefit: "$115 Product Benefit, OR"
      },
      {
        description: "1 Pair(s) of Grand Lux Collection Eyeglasses, OR",
        benefit: "1 Free Lasik Procedure"
      },
      {
        description: "1 Discounted Eye Coloration Surgery",
        benefit: "1 $10 KP Procedure"
      }
    ],
    notes: "Reminder! All claims must be received within 90 days from the date of service. Claim appeals must be received within 60 days from the denial EOP. Expedite your payment with direct deposits. If you have not signed up for direct deposit please visit our web portal @ www.webportal.com"
  };

  // Financial summary data
  const financialSummary = {
    totalReserved: 2450,
    available: 1200,
    used: 1250
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('Export reserved benefits');
    }
  };

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
                Reserved Benefits
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-2"
              >
                <Icon name="printer" size={16} />
                Print
              </button>
              {onExport && (
                <button
                  onClick={handleExport}
                  className="btn-primary flex items-center gap-2"
                >
                  <Icon name="download" size={16} />
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Benefits Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">${financialSummary.totalReserved.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Reserved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">${financialSummary.available.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">${financialSummary.used.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Used</div>
            </div>
          </div>
        </div>

        {/* Network Banner */}
        <div className="bg-slate-600 text-white p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded">
                <Icon name="shield-check" size={24} className="text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold">In-Network Provider</h3>
                <p className="text-sm text-slate-200">Your benefits are active and available</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-200">Certificate ID</div>
              <div className="font-semibold">{reservedBenefitsData.eligibility.certificateId}</div>
            </div>
          </div>
        </div>

        {/* Member Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Member Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">Member ID:</span> {reservedBenefitsData.member.id}</div>
              <div><span className="font-medium">Name:</span> {reservedBenefitsData.member.name}</div>
              <div><span className="font-medium">Address:</span> {reservedBenefitsData.member.address}</div>
              <div><span className="font-medium">Date of Birth:</span> {reservedBenefitsData.member.dateOfBirth}</div>
            </div>
          </div>
        </div>

        {/* Primary Care Physician */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Primary Care Physician
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-medium">ID:</span> {reservedBenefitsData.primaryCarePhysician.id}</div>
              <div><span className="font-medium">Organization:</span> {reservedBenefitsData.primaryCarePhysician.organization}</div>
              <div><span className="font-medium">Phone:</span> Tel: {reservedBenefitsData.primaryCarePhysician.phone}</div>
              <div><span className="font-medium">Toll Free:</span> {reservedBenefitsData.primaryCarePhysician.tollFree}</div>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Provider Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendering Provider</div>
                <div className="text-sm">{reservedBenefitsData.provider.renderingProvider}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">NPI</div>
                <div className="text-sm">{reservedBenefitsData.provider.npi}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tax ID</div>
                <div className="text-sm">{reservedBenefitsData.provider.taxId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">License</div>
                <div className="text-sm">{reservedBenefitsData.provider.license}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Location</div>
              <div>{reservedBenefitsData.provider.location.name}</div>
              <div>{reservedBenefitsData.provider.location.address}</div>
              <div>{reservedBenefitsData.provider.location.phone}</div>
            </div>
          </div>
        </div>

        {/* Eligibility Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Eligibility Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate ID</div>
                <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.certificateId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Effective Date</div>
                <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.effectiveDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiration</div>
                <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.expiration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Group</div>
                <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.group}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan</div>
                <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.plan}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
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
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$150.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Eyeglasses</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$200.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$75.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$125.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Partially Used</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Contact Lenses</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$100.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$100.00</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">$0.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Used</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Benefits
            </h3>
          </div>
          <div className="p-6">
            {reservedBenefitsData.benefits.map((benefit, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{benefit.benefit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Important Notes
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">{reservedBenefitsData.notes}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 
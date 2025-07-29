import React from 'react'
import Icon from './Icon'

interface ReservedBenefitsPageProps {
  onBack?: () => void
  onNewSearch?: () => void
  onPrint?: () => void
}

export default function ReservedBenefitsPage({ 
  onBack, 
  onNewSearch, 
  onPrint 
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

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="hedis-screening-content">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reserved Benefits
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="btn-tertiary flex items-center gap-2"
          >
            <Icon name="printer" size={16} />
            Print
          </button>
          {onBack && (
            <button 
              onClick={onBack}
              className="btn-secondary flex items-center gap-2"
            >
              <Icon name="arrow-left" size={16} />
              Back
            </button>
          )}
          {/* New Search button hidden as search type is unclear */}
        </div>
      </div>

      {/* Network Banner */}
      <div className="bg-slate-600 text-white p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded">
              <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center">
                <Icon name="eye" size={20} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-600 font-bold text-sm">FOPN</div>
              <div className="text-slate-600 text-xs">FLORIDA OPTOMETRIC</div>
              <div className="text-slate-600 text-xs">- PHYSICIANS NETWORK</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Florida Optometric Physician Network</div>
          </div>
        </div>
      </div>

      {/* Member and PCP Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Member Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Member:
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Member ID:</span> {reservedBenefitsData.member.id}</div>
            <div><span className="font-medium">Name:</span> {reservedBenefitsData.member.name}</div>
            <div><span className="font-medium">Address:</span> {reservedBenefitsData.member.address}</div>
            <div><span className="font-medium">Date of Birth:</span> {reservedBenefitsData.member.dateOfBirth}</div>
          </div>
        </div>

        {/* Primary Care Physician Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Primary Care Physician:
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {reservedBenefitsData.primaryCarePhysician.id}</div>
            <div><span className="font-medium">Organization:</span> {reservedBenefitsData.primaryCarePhysician.organization}</div>
            <div><span className="font-medium">Phone:</span> Tel: {reservedBenefitsData.primaryCarePhysician.phone}</div>
            <div><span className="font-medium">Toll Free:</span> {reservedBenefitsData.primaryCarePhysician.tollFree}</div>
          </div>
        </div>
      </div>

      {/* Provider Details Banner */}
      <div className="bg-slate-500 text-white p-3 rounded-lg mb-6">
        <h3 className="text-lg font-semibold">Provider Details</h3>
      </div>

      {/* Provider Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Rendering Provider:</h4>
            <div className="text-sm">{reservedBenefitsData.provider.renderingProvider}</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">NPI:</h4>
            <div className="text-sm">{reservedBenefitsData.provider.npi}</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tax Identification Number:</h4>
            <div className="text-sm">{reservedBenefitsData.provider.taxId}</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">License:</h4>
            <div className="text-sm">{reservedBenefitsData.provider.license}</div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Location of Service:</h4>
            <div className="text-sm">
              <div>{reservedBenefitsData.provider.location.name}</div>
              <div>{reservedBenefitsData.provider.location.address}</div>
              <div>{reservedBenefitsData.provider.location.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Benefits
        </h3>
        
        {/* Eligibility Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Eligibility Certificate ID:</div>
            <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.certificateId}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Effective Date:</div>
            <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.effectiveDate}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiration:</div>
            <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.expiration}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Group:</div>
            <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.group}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan:</div>
            <div className="text-sm font-semibold">{reservedBenefitsData.eligibility.plan}</div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-3">
          {reservedBenefitsData.benefits.map((benefit, index) => (
            <div key={index} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium">{benefit.description}</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-sm font-medium">{benefit.benefit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notes
        </h3>
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {reservedBenefitsData.notes}
        </div>
      </div>
    </div>
  );
} 
// Medical Specialties Service - Enhanced knowledge base for different medical fields
export interface MedicalSpecialty {
  name: string
  description: string
  commonCodes: string[]
  terminology: Record<string, string>
  procedures: string[]
  conditions: string[]
}

export interface SpecialtyKnowledge {
  [specialty: string]: MedicalSpecialty
}

class MedicalSpecialtiesService {
  private static SPECIALTIES: SpecialtyKnowledge = {
    ophthalmology: {
      name: 'Ophthalmology',
      description: 'Medical specialty dealing with eye and vision care',
      commonCodes: ['92250', '92227', '92228', '92229', 'H35.00', 'H35.01', 'H35.04'],
      terminology: {
        'OD': 'Oculus Dexter - Right Eye',
        'OS': 'Oculus Sinister - Left Eye',
        'OU': 'Oculus Uterque - Both Eyes',
        'VA': 'Visual Acuity',
        'IOP': 'Intraocular Pressure',
        'DVA': 'Distance Visual Acuity',
        'NVA': 'Near Visual Acuity',
        'CF': 'Counting Fingers',
        'HM': 'Hand Motion',
        'LP': 'Light Perception',
        'NLP': 'No Light Perception'
      },
      procedures: [
        'Fundus Photography',
        'Retinal Imaging',
        'Visual Field Testing',
        'Tonometry',
        'Slit Lamp Examination',
        'Ophthalmoscopy',
        'Optical Coherence Tomography'
      ],
      conditions: [
        'Diabetic Retinopathy',
        'Glaucoma',
        'Cataracts',
        'Macular Degeneration',
        'Hypertensive Retinopathy',
        'Retinal Detachment',
        'Uveitis'
      ]
    },

    cardiology: {
      name: 'Cardiology',
      description: 'Medical specialty dealing with heart and cardiovascular system',
      commonCodes: ['99213', '99214', '99215', '93010', '93000', 'I10', 'I11.9', 'I25.10'],
      terminology: {
        'EKG': 'Electrocardiogram',
        'ECG': 'Electrocardiogram',
        'CABG': 'Coronary Artery Bypass Graft',
        'PCI': 'Percutaneous Coronary Intervention',
        'STEMI': 'ST-Elevation Myocardial Infarction',
        'NSTEMI': 'Non-ST-Elevation Myocardial Infarction',
        'CHF': 'Congestive Heart Failure',
        'CAD': 'Coronary Artery Disease',
        'HTN': 'Hypertension',
        'AF': 'Atrial Fibrillation'
      },
      procedures: [
        'Echocardiogram',
        'Stress Test',
        'Cardiac Catheterization',
        'Holter Monitor',
        'Event Monitor',
        'Cardiac MRI',
        'Nuclear Stress Test'
      ],
      conditions: [
        'Coronary Artery Disease',
        'Heart Failure',
        'Hypertension',
        'Atrial Fibrillation',
        'Valvular Heart Disease',
        'Cardiomyopathy',
        'Pericardial Disease'
      ]
    },

    endocrinology: {
      name: 'Endocrinology',
      description: 'Medical specialty dealing with hormones and metabolism',
      commonCodes: ['99213', '99214', 'E11.9', 'E11.21', 'E11.22', 'Z79.4', 'Z79.84'],
      terminology: {
        'DM': 'Diabetes Mellitus',
        'T1DM': 'Type 1 Diabetes Mellitus',
        'T2DM': 'Type 2 Diabetes Mellitus',
        'HbA1c': 'Hemoglobin A1c',
        'DKA': 'Diabetic Ketoacidosis',
        'HHNK': 'Hyperosmolar Hyperglycemic Nonketotic Syndrome',
        'TSH': 'Thyroid Stimulating Hormone',
        'T4': 'Thyroxine',
        'T3': 'Triiodothyronine',
        'FT4': 'Free Thyroxine'
      },
      procedures: [
        'Glucose Monitoring',
        'Insulin Administration',
        'Thyroid Function Tests',
        'Cortisol Testing',
        'Growth Hormone Testing',
        'Parathyroid Hormone Test',
        'Adrenal Function Tests'
      ],
      conditions: [
        'Type 1 Diabetes',
        'Type 2 Diabetes',
        'Hypothyroidism',
        'Hyperthyroidism',
        'Cushing Syndrome',
        'Addison Disease',
        'Pituitary Disorders'
      ]
    },

    nephrology: {
      name: 'Nephrology',
      description: 'Medical specialty dealing with kidney diseases',
      commonCodes: ['99213', '99214', 'E11.22', 'N18.1', 'N18.2', 'N18.3', 'N18.4', 'N18.5'],
      terminology: {
        'CKD': 'Chronic Kidney Disease',
        'ESRD': 'End Stage Renal Disease',
        'GFR': 'Glomerular Filtration Rate',
        'Cr': 'Creatinine',
        'BUN': 'Blood Urea Nitrogen',
        'HD': 'Hemodialysis',
        'PD': 'Peritoneal Dialysis',
        'AKI': 'Acute Kidney Injury',
        'UTI': 'Urinary Tract Infection',
        'BPH': 'Benign Prostatic Hyperplasia'
      },
      procedures: [
        'Dialysis',
        'Kidney Biopsy',
        'Renal Ultrasound',
        'CT Scan Kidney',
        'MRI Kidney',
        'Renal Function Tests',
        'Urinalysis'
      ],
      conditions: [
        'Chronic Kidney Disease',
        'Acute Kidney Injury',
        'Glomerulonephritis',
        'Pyelonephritis',
        'Nephrotic Syndrome',
        'Polycystic Kidney Disease',
        'Renal Artery Stenosis'
      ]
    },

    pulmonology: {
      name: 'Pulmonology',
      description: 'Medical specialty dealing with respiratory system',
      commonCodes: ['99213', '99214', 'J44.9', 'J45.909', 'J47', '94010', '94060'],
      terminology: {
        'COPD': 'Chronic Obstructive Pulmonary Disease',
        'PFT': 'Pulmonary Function Test',
        'FEV1': 'Forced Expiratory Volume in 1 second',
        'FVC': 'Forced Vital Capacity',
        'DLCO': 'Diffusing Capacity for Carbon Monoxide',
        'ABG': 'Arterial Blood Gas',
        'CPAP': 'Continuous Positive Airway Pressure',
        'BiPAP': 'Bilevel Positive Airway Pressure',
        'O2': 'Oxygen'
      },
      procedures: [
        'Pulmonary Function Test',
        'Bronchoscopy',
        'Chest X-Ray',
        'CT Scan Chest',
        'Arterial Blood Gas',
        'Sleep Study',
        'Thoracentesis'
      ],
      conditions: [
        'Chronic Obstructive Pulmonary Disease',
        'Asthma',
        'Pneumonia',
        'Pulmonary Embolism',
        'Interstitial Lung Disease',
        'Sleep Apnea',
        'Bronchiectasis'
      ]
    },

    gastroenterology: {
      name: 'Gastroenterology',
      description: 'Medical specialty dealing with digestive system',
      commonCodes: ['99213', '99214', 'K21.9', 'K25.9', 'K29.30', '43239', '43235'],
      terminology: {
        'GERD': 'Gastroesophageal Reflux Disease',
        'PUD': 'Peptic Ulcer Disease',
        'IBD': 'Inflammatory Bowel Disease',
        'UC': 'Ulcerative Colitis',
        'CD': 'Crohn Disease',
        'IBS': 'Irritable Bowel Syndrome',
        'EGD': 'Esophagogastroduodenoscopy',
        'COL': 'Colonoscopy',
        'ERCP': 'Endoscopic Retrograde Cholangiopancreatography',
        'EUS': 'Endoscopic Ultrasound'
      },
      procedures: [
        'Colonoscopy',
        'Upper Endoscopy',
        'ERCP',
        'Endoscopic Ultrasound',
        'Capsule Endoscopy',
        'Manometry',
        'pH Monitoring'
      ],
      conditions: [
        'Gastroesophageal Reflux Disease',
        'Peptic Ulcer Disease',
        'Inflammatory Bowel Disease',
        'Irritable Bowel Syndrome',
        'Celiac Disease',
        'Diverticulosis',
        'Hepatitis'
      ]
    },

    neurology: {
      name: 'Neurology',
      description: 'Medical specialty dealing with nervous system',
      commonCodes: ['99213', '99214', 'G40.909', 'G93.1', 'I63.9', '95816', '95819'],
      terminology: {
        'CVA': 'Cerebrovascular Accident',
        'TIA': 'Transient Ischemic Attack',
        'MS': 'Multiple Sclerosis',
        'ALS': 'Amyotrophic Lateral Sclerosis',
        'PD': 'Parkinson Disease',
        'AD': 'Alzheimer Disease',
        'EEG': 'Electroencephalogram',
        'EMG': 'Electromyography',
        'NCV': 'Nerve Conduction Velocity',
        'LP': 'Lumbar Puncture'
      },
      procedures: [
        'Electroencephalogram',
        'Electromyography',
        'Nerve Conduction Study',
        'Lumbar Puncture',
        'Brain MRI',
        'Spine MRI',
        'Carotid Ultrasound'
      ],
      conditions: [
        'Stroke',
        'Epilepsy',
        'Multiple Sclerosis',
        'Parkinson Disease',
        'Alzheimer Disease',
        'Migraine',
        'Peripheral Neuropathy'
      ]
    },

    orthopedics: {
      name: 'Orthopedics',
      description: 'Medical specialty dealing with musculoskeletal system',
      commonCodes: ['99213', '99214', 'M79.3', 'M79.359', 'S72.001A', '20610', '20611'],
      terminology: {
        'ORIF': 'Open Reduction Internal Fixation',
        'CRIF': 'Closed Reduction Internal Fixation',
        'THA': 'Total Hip Arthroplasty',
        'TKA': 'Total Knee Arthroplasty',
        'ACL': 'Anterior Cruciate Ligament',
        'MCL': 'Medial Collateral Ligament',
        'LCL': 'Lateral Collateral Ligament',
        'PCL': 'Posterior Cruciate Ligament',
        'CT': 'Computed Tomography',
        'MRI': 'Magnetic Resonance Imaging'
      },
      procedures: [
        'Joint Replacement',
        'Arthroscopy',
        'Fracture Repair',
        'Spine Surgery',
        'Joint Injection',
        'Casting',
        'Physical Therapy'
      ],
      conditions: [
        'Osteoarthritis',
        'Rheumatoid Arthritis',
        'Fractures',
        'Tendon Injuries',
        'Ligament Injuries',
        'Spine Disorders',
        'Sports Injuries'
      ]
    }
  }

  /**
   * Get all available specialties
   */
  static getSpecialties(): string[] {
    return Object.keys(this.SPECIALTIES)
  }

  /**
   * Get specialty information
   */
  static getSpecialty(specialty: string): MedicalSpecialty | null {
    return this.SPECIALTIES[specialty.toLowerCase()] || null
  }

  /**
   * Get terminology for a specialty
   */
  static getSpecialtyTerminology(specialty: string): Record<string, string> {
    const specialtyData = this.getSpecialty(specialty)
    return specialtyData?.terminology || {}
  }

  /**
   * Get common codes for a specialty
   */
  static getSpecialtyCodes(specialty: string): string[] {
    const specialtyData = this.getSpecialty(specialty)
    return specialtyData?.commonCodes || []
  }

  /**
   * Get procedures for a specialty
   */
  static getSpecialtyProcedures(specialty: string): string[] {
    const specialtyData = this.getSpecialty(specialty)
    return specialtyData?.procedures || []
  }

  /**
   * Get conditions for a specialty
   */
  static getSpecialtyConditions(specialty: string): string[] {
    const specialtyData = this.getSpecialty(specialty)
    return specialtyData?.conditions || []
  }

  /**
   * Search specialties by keyword
   */
  static searchSpecialties(keyword: string): string[] {
    const lowerKeyword = keyword.toLowerCase()
    return Object.keys(this.SPECIALTIES).filter(specialty => {
      const specialtyData = this.SPECIALTIES[specialty]
      return (
        specialtyData.name.toLowerCase().includes(lowerKeyword) ||
        specialtyData.description.toLowerCase().includes(lowerKeyword) ||
        specialtyData.conditions.some(condition => 
          condition.toLowerCase().includes(lowerKeyword)
        ) ||
        specialtyData.procedures.some(procedure => 
          procedure.toLowerCase().includes(lowerKeyword)
        )
      )
    })
  }

  /**
   * Get all terminology across all specialties
   */
  static getAllTerminology(): Record<string, string> {
    const allTerms: Record<string, string> = {}
    Object.values(this.SPECIALTIES).forEach(specialty => {
      Object.assign(allTerms, specialty.terminology)
    })
    return allTerms
  }

  /**
   * Get all common codes across all specialties
   */
  static getAllCodes(): string[] {
    const allCodes: string[] = []
    Object.values(this.SPECIALTIES).forEach(specialty => {
      allCodes.push(...specialty.commonCodes)
    })
    return [...new Set(allCodes)] // Remove duplicates
  }
}

export default MedicalSpecialtiesService 
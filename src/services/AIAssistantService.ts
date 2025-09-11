// AI Assistant Service for medical billing assistance
import { MedicalAPIService } from './MedicalAPIService'
import { PredictiveSuggestionsService } from './PredictiveSuggestionsService'
import { WorkflowIntegrationService } from './WorkflowIntegrationService'
import { MobileEnhancementsService } from './MobileEnhancementsService'
import MedicalSpecialtiesService from './MedicalSpecialtiesService'
import { GeminiAIService } from './GeminiAIService'
import { MemoryService } from './MemoryService'

export interface CodeLookupResult {
  code: string
  description: string
  category: string
  validFrom: string
  validTo?: string
}

export interface ProviderLookupResult {
  npi: string
  name: string
  specialty: string
  address: string
  phone: string
}

export interface AIAssistantResponse {
  type: 'terminology' | 'code_lookup' | 'provider_lookup' | 'form_guidance' | 'general' | 'suggestion' | 'proactive'
  content: string
  data?: any
  suggestions?: string[]
  proactiveAlerts?: string[]
}

// Enhanced context interface for better awareness
export interface AIContext {
  formType?: 'claims_submission' | 'patient_eligibility' | 'hedis_screening' | 'prescription' | 'pic_actions'
  currentField?: string
  currentStep?: number
  totalSteps?: number
  formData?: Record<string, any>
  previousFields?: string[]
  nextFields?: string[]
  userRole?: 'biller' | 'provider' | 'admin'
  deviceType?: 'desktop' | 'mobile'
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  sessionDuration?: number
  errorFields?: string[]
  validationErrors?: Record<string, string>
  userBehavior?: {
    fieldFocusTime: Record<string, number>
    commonErrors: Record<string, number>
    successfulPatterns: Record<string, number>
    formCompletionRate: number
    averageSessionTime: number
  }
  // Memory-related context
  userId?: string
  sessionId?: string
  userPreferences?: Record<string, any>
  memoryEnabled?: boolean
  // Advanced Context Awareness - Item 6
  advancedContext?: {
    // Enhanced form field tracking with detailed metadata
    fieldMetadata?: Record<string, {
      type: 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'textarea'
      required: boolean
      validation: string[]
      dependencies: string[]
      relatedFields: string[]
      lastModified: Date
      modificationCount: number
      averageTimeSpent: number
      commonValues: string[]
      errorHistory: string[]
    }>
    // Multi-step workflow context with step dependencies
    workflowContext?: {
      currentWorkflow: string
      workflowSteps: Array<{
        step: number
        name: string
        status: 'completed' | 'current' | 'pending' | 'skipped'
        dependencies: number[]
        estimatedTime: number
        actualTime?: number
        errors: string[]
        warnings: string[]
      }>
      workflowProgress: number
      workflowEfficiency: number
      bottlenecks: string[]
      optimizationOpportunities: string[]
    }
    // User session analysis with behavior patterns
    sessionAnalysis?: {
      sessionStartTime: Date
      sessionDuration: number
      activeTime: number
      idleTime: number
      formSwitches: number
      fieldFocusPatterns: Record<string, number>
      errorPatterns: Record<string, number>
      successPatterns: Record<string, number>
      userEfficiency: number
      learningCurve: 'beginner' | 'intermediate' | 'advanced'
      preferredWorkflow: string
      commonWorkflows: string[]
    }
    // Cross-form context for related workflows
    crossFormContext?: {
      relatedForms: Array<{
        formType: string
        lastAccessed: Date
        completionStatus: 'completed' | 'in_progress' | 'abandoned'
        sharedData: Record<string, any>
        dataConsistency: boolean
      }>
      dataFlow: Array<{
        fromForm: string
        toForm: string
        dataType: string
        lastSync: Date
        syncStatus: 'synced' | 'pending' | 'failed'
      }>
      workflowContinuity: boolean
      dataIntegrity: boolean
    }
    // Real-time context updates
    realTimeContext?: {
      lastActivity: Date
      currentAction: string
      pendingActions: string[]
      systemStatus: 'normal' | 'busy' | 'error'
      performanceMetrics: {
        responseTime: number
        accuracy: number
        userSatisfaction: number
      }
    }
  }
}

// Smart Suggestions Engine Interface
export interface SmartSuggestion {
  id: string
  type: 'code' | 'field' | 'workflow' | 'validation' | 'optimization'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  action?: string
  data?: any
}

// Proactive Assistance Interface
export interface ProactiveAlert {
  id: string
  type: 'error_prevention' | 'optimization' | 'compliance' | 'workflow' | 'validation'
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  actionable: boolean
  action?: string
  data?: any
}

export class AIAssistantService {

  // Local knowledge base for immediate responses
  private static LOCAL_KNOWLEDGE = {
    terminology: {
      // Eye-related terms
      'OD': 'Oculus Dexter - Right Eye',
      'OS': 'Oculus Sinister - Left Eye',
      'OU': 'Oculus Uterque - Both Eyes',
      
      // Healthcare providers and organizations
      'PCP': 'Primary Care Physician',
      'HEDIS': 'Healthcare Effectiveness Data and Information Set',
      'PIC': 'Provider Interface Center',
      'NPI': 'National Provider Identifier',
      'CMS': 'Centers for Medicare & Medicaid Services',
      
      // Medical coding systems
      'CPT': 'Current Procedural Terminology',
      'ICD': 'International Classification of Diseases',
      'HCPCS': 'Healthcare Common Procedure Coding System',
      
      // Billing and insurance terms
      'EOB': 'Explanation of Benefits',
      'ERA': 'Electronic Remittance Advice',
      'EDI': 'Electronic Data Interchange',
      'HIPAA': 'Health Insurance Portability and Accountability Act',
      
      // Medical conditions with comprehensive definitions
      'diabetes mellitus': 'A group of metabolic disorders characterized by high blood sugar levels over a prolonged period. Type 1 diabetes results from the pancreas not producing enough insulin, while Type 2 diabetes results from cells not responding properly to insulin. This condition requires careful management and monitoring.',
      'diabetes': 'A chronic medical condition where the body cannot properly regulate blood sugar levels. There are two main types: Type 1 (insulin-dependent) and Type 2 (non-insulin dependent). Both require medical management and lifestyle modifications.',
      'hypertension': 'High blood pressure - a condition where the force of blood against artery walls is consistently too high. Normal blood pressure is less than 120/80 mmHg. Hypertension increases the risk of heart disease, stroke, and kidney problems.',
      'cataract': 'A clouding of the lens in the eye that affects vision. Most cataracts develop slowly and don\'t disturb eyesight early on, but over time they can interfere with vision. Surgery is the only effective treatment.',
      'glaucoma': 'A group of eye conditions that damage the optic nerve, often caused by abnormally high pressure in the eye. It\'s one of the leading causes of blindness for people over 60 years old.',
      'macular degeneration': 'An eye disease that causes vision loss in the center of the visual field due to damage to the retina. It\'s a common cause of vision loss in older adults.',
      'diabetic retinopathy': 'A diabetes complication that affects the eyes, caused by damage to blood vessels in the retina. It can cause vision problems and blindness if left untreated.',
      
      // Medical procedures
      'fundus photography': 'A medical imaging technique that captures detailed photographs of the retina, optic disc, and macula. Used for diagnosing and monitoring eye diseases.',
      'dilation': 'The process of widening the pupil using eye drops to allow better examination of the retina and other internal structures of the eye.',
      'eye exam': 'A comprehensive examination of the eyes and vision system, including visual acuity testing, eye pressure measurement, and examination of internal eye structures.',
      
      // Medical devices and treatments
      'insulin': 'A hormone produced by the pancreas that regulates blood sugar levels. People with diabetes may need insulin therapy to manage their condition.',
      'glucose': 'A simple sugar that serves as the primary source of energy for the body\'s cells. Blood glucose levels are monitored in diabetes management.',
      'hemoglobin a1c': 'A blood test that measures average blood sugar levels over the past 2-3 months. Used to monitor diabetes control.',
      
      // Insurance and billing terms
      'copay': 'A fixed amount paid by the patient for covered healthcare services, typically due at the time of service.',
      'deductible': 'The amount a patient must pay for healthcare services before insurance coverage begins.',
      'coinsurance': 'The percentage of healthcare costs that a patient pays after meeting their deductible.',
      'prior authorization': 'Approval required from insurance before certain medical services or medications can be provided.',
      'formulary': 'A list of prescription drugs covered by an insurance plan, often organized by tiers with different copay amounts.'
    },
    commonCodes: {
      'E11.9': 'Type 2 diabetes mellitus without complications',
      'E11.21': 'Type 2 diabetes mellitus with diabetic nephropathy',
      'E11.22': 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
      'H35.00': 'Unspecified background retinopathy',
      'H35.01': 'Mild nonproliferative diabetic retinopathy',
      'H35.02': 'Moderate nonproliferative diabetic retinopathy',
      'H35.03': 'Severe nonproliferative diabetic retinopathy',
      'H35.04': 'Proliferative diabetic retinopathy',
      'Z79.4': 'Long term (current) use of insulin',
      'Z79.84': 'Long term (current) use of oral hypoglycemic drugs',
      '92250': 'Fundus photography with interpretation and report',
      '92227': 'Imaging of retina for detection or monitoring of disease',
      '92228': 'Imaging of retina for detection or monitoring of disease; with remote analysis',
      '92229': 'Imaging of retina for detection or monitoring of disease; with point-of-care automated analysis'
    },
    // Comprehensive CPT code lists for "show all" requests
    cptCodeSets: {
      'ophthalmology': [
        { code: '92002', description: 'Ophthalmological services: medical examination and evaluation with initiation of diagnostic and treatment program; intermediate, new patient' },
        { code: '92004', description: 'Ophthalmological services: medical examination and evaluation with initiation of diagnostic and treatment program; comprehensive, new patient' },
        { code: '92012', description: 'Ophthalmological services: medical examination and evaluation, with initiation or continuation of diagnostic and treatment program; intermediate, established patient' },
        { code: '92014', description: 'Ophthalmological services: medical examination and evaluation, with initiation or continuation of diagnostic and treatment program; comprehensive, established patient' },
        { code: '92025', description: 'Computerized corneal topography, unilateral or bilateral, with interpretation and report' },
        { code: '92060', description: 'Sensorimotor examination with multiple measurements of ocular deviation' },
        { code: '92081', description: 'Visual field examination, unilateral or bilateral, with interpretation and report; limited examination' },
        { code: '92082', description: 'Visual field examination, unilateral or bilateral, with interpretation and report; intermediate examination' },
        { code: '92083', description: 'Visual field examination, unilateral or bilateral, with interpretation and report; extended examination' },
        { code: '92132', description: 'Scanning computerized ophthalmic diagnostic imaging, anterior segment, with interpretation and report, unilateral or bilateral' },
        { code: '92133', description: 'Scanning computerized ophthalmic diagnostic imaging, posterior segment, with interpretation and report, unilateral or bilateral; optic nerve' },
        { code: '92134', description: 'Scanning computerized ophthalmic diagnostic imaging, posterior segment, with interpretation and report, unilateral or bilateral; retina' },
        { code: '92227', description: 'Imaging of retina for detection or monitoring of disease; with remote clinical staff review and report' },
        { code: '92228', description: 'Imaging of retina for detection or monitoring of disease; with remote physician or other qualified health care professional interpretation and report' },
        { code: '92229', description: 'Imaging of retina for detection or monitoring of disease; point-of-care autonomous analysis and report' },
        { code: '92235', description: 'Fluorescein angiography (includes multiframe imaging) with interpretation and report' },
        { code: '92240', description: 'Indocyanine-green angiography (includes multiframe imaging) with interpretation and report' },
        { code: '92250', description: 'Fundus photography with interpretation and report' },
        { code: '92273', description: 'Electroretinography (ERG), with interpretation and report' },
        { code: '92274', description: 'Electroretinography (ERG), with interpretation and report; multifocal' }
      ],
      'evaluation_management': [
        { code: '99201', description: 'Office or other outpatient visit for the evaluation and management of a new patient' },
        { code: '99202', description: 'Office or other outpatient visit for the evaluation and management of a new patient' },
        { code: '99203', description: 'Office or other outpatient visit for the evaluation and management of a new patient' },
        { code: '99204', description: 'Office or other outpatient visit for the evaluation and management of a new patient' },
        { code: '99205', description: 'Office or other outpatient visit for the evaluation and management of a new patient' },
        { code: '99211', description: 'Office or other outpatient visit for the evaluation and management of an established patient' },
        { code: '99212', description: 'Office or other outpatient visit for the evaluation and management of an established patient' },
        { code: '99213', description: 'Office or other outpatient visit for the evaluation and management of an established patient' },
        { code: '99214', description: 'Office or other outpatient visit for the evaluation and management of an established patient' },
        { code: '99215', description: 'Office or other outpatient visit for the evaluation and management of an established patient' }
      ],
      'surgery': [
        { code: '66820', description: 'Discission of secondary membranous cataract (opacified posterior lens capsule and/or anterior hyaloid); stab incision technique' },
        { code: '66821', description: 'Discission of secondary membranous cataract (opacified posterior lens capsule and/or anterior hyaloid); laser surgery' },
        { code: '66830', description: 'Removal of secondary membranous cataract (opacified posterior lens capsule and/or anterior hyaloid) with corneo-scleral section, with or without iridectomy' },
        { code: '66840', description: 'Removal of lens material; aspiration technique, 1 or more stages' },
        { code: '66850', description: 'Removal of lens material; phacofragmentation technique (mechanical or ultrasonic), with aspiration' },
        { code: '66852', description: 'Removal of lens material; pars plana approach, with or without vitrectomy' },
        { code: '66920', description: 'Removal of lens material; intracapsular' },
        { code: '66930', description: 'Removal of lens material; intracapsular, for dislocated lens' },
        { code: '66940', description: 'Removal of lens material; extracapsular (other than 66840, 66850, 66852)' },
        { code: '66982', description: 'Extracapsular cataract removal with insertion of intraocular lens prosthesis (1-stage procedure), manual or mechanical technique' },
        { code: '66983', description: 'Intracapsular cataract extraction with insertion of intraocular lens prosthesis (1 stage procedure)' },
        { code: '66984', description: 'Extracapsular cataract removal with insertion of intraocular lens prosthesis (1 stage procedure), manual or mechanical technique' }
      ]
    },
    // Additional comprehensive code sets
    icd10CodeSets: {
      'diabetes': [
        { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications' },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
        { code: 'E11.21', description: 'Type 2 diabetes mellitus with diabetic nephropathy' },
        { code: 'E11.22', description: 'Type 2 diabetes mellitus with diabetic chronic kidney disease' },
        { code: 'E11.311', description: 'Type 2 diabetes mellitus with unspecified diabetic retinopathy with macular edema' },
        { code: 'E11.319', description: 'Type 2 diabetes mellitus with unspecified diabetic retinopathy without macular edema' },
        { code: 'E11.321', description: 'Type 2 diabetes mellitus with mild nonproliferative diabetic retinopathy with macular edema' },
        { code: 'E11.329', description: 'Type 2 diabetes mellitus with mild nonproliferative diabetic retinopathy without macular edema' }
      ],
      'eye_conditions': [
        { code: 'H35.00', description: 'Unspecified background retinopathy' },
        { code: 'H35.01', description: 'Changes in retinal vascular appearance' },
        { code: 'H35.02', description: 'Exudative retinopathy' },
        { code: 'H25.9', description: 'Unspecified age-related cataract' },
        { code: 'H25.10', description: 'Age-related nuclear cataract, unspecified eye' },
        { code: 'H40.9', description: 'Unspecified glaucoma' }
      ],
      'common_conditions': [
        { code: 'I10', description: 'Essential (primary) hypertension' },
        { code: 'Z12.11', description: 'Encounter for screening for malignant neoplasm of colon' },
        { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
        { code: 'Z01.00', description: 'Encounter for examination of eyes and vision without abnormal findings' },
        { code: 'Z79.4', description: 'Long term (current) use of insulin' },
        { code: 'Z79.84', description: 'Long term (current) use of oral hypoglycemic drugs' }
      ]
    },
    hcpcsCodeSets: {
      'durable_medical_equipment': [
        { code: 'A4253', description: 'Blood glucose test or reagent strips for home blood glucose monitor' },
        { code: 'A4255', description: 'Platforms for home blood glucose monitor' },
        { code: 'E0607', description: 'Home blood glucose monitor' },
        { code: 'E1390', description: 'Oxygen concentrator, single delivery port' },
        { code: 'K0001', description: 'Standard wheelchair' },
        { code: 'K0002', description: 'Standard hemi (low seat) wheelchair' }
      ],
      'vision_services': [
        { code: 'V2020', description: 'Frames, purchases' },
        { code: 'V2100', description: 'Sphere, single vision, plano to plus or minus 4.00, per lens' },
        { code: 'V2101', description: 'Sphere, single vision, plus or minus 4.12 to plus or minus 7.00, per lens' },
        { code: 'V2200', description: 'Sphere, bifocal, plano to plus or minus 4.00, per lens' },
        { code: 'V2500', description: 'Contact lens, PMMA, spherical, per lens' },
        { code: 'V2510', description: 'Contact lens, gas permeable, spherical, per lens' }
      ]
    },
    posCodeSets: [
      { code: '11', description: 'Office (most common for routine visits)' },
      { code: '12', description: 'Home' },
      { code: '21', description: 'Inpatient Hospital' },
      { code: '22', description: 'On Campus-Outpatient Hospital' },
      { code: '23', description: 'Emergency Room – Hospital' },
      { code: '24', description: 'Ambulatory Surgical Center' },
      { code: '31', description: 'Skilled Nursing Facility' },
      { code: '49', description: 'Independent Clinic' },
      { code: '50', description: 'Federally Qualified Health Center' },
      { code: '71', description: 'Public Health Clinic' },
      { code: '72', description: 'Rural Health Clinic' },
      { code: '81', description: 'Independent Laboratory' },
      { code: '99', description: 'Other Place of Service' }
    ],
    modifierCodeSets: [
      { code: '22', description: 'Increased Procedural Services' },
      { code: '25', description: 'Significant, Separately Identifiable Evaluation and Management Service' },
      { code: '26', description: 'Professional Component' },
      { code: '50', description: 'Bilateral Procedure' },
      { code: '51', description: 'Multiple Procedures' },
      { code: '52', description: 'Reduced Services' },
      { code: '53', description: 'Discontinued Procedure' },
      { code: '59', description: 'Distinct Procedural Service' },
      { code: '76', description: 'Repeat Procedure by Same Physician' },
      { code: '77', description: 'Repeat Procedure by Another Physician' },
      { code: '90', description: 'Reference (Outside) Laboratory' },
      { code: '95', description: 'Synchronous Telemedicine Service' }
    ],
    drugCodeSets: [
      { code: 'J0135', description: 'Injection, adalimumab, 20 mg' },
      { code: 'J0178', description: 'Injection, aflibercept, 1 mg' },
      { code: 'J1100', description: 'Injection, dexamethasone sodium phosphate, 1 mg' },
      { code: 'J1745', description: 'Injection, infliximab, 10 mg' },
      { code: 'J2778', description: 'Injection, ranibizumab, 0.1 mg' },
      { code: 'J3590', description: 'Unclassified biologics' },
      { code: 'J7050', description: 'Infusion, normal saline solution, 250 cc' },
      { code: 'J7060', description: 'Infusion, normal saline solution, 500 ml' }
    ],
    labCodeSets: [
      { code: '80053', description: 'Comprehensive metabolic panel' },
      { code: '80061', description: 'Lipid panel' },
      { code: '82565', description: 'Creatinine; blood' },
      { code: '82947', description: 'Glucose; quantitative, blood' },
      { code: '83036', description: 'Hemoglobin; glycosylated (A1C)' },
      { code: '84153', description: 'Prostate specific antigen (PSA); total' },
      { code: '84443', description: 'Thyroid stimulating hormone (TSH)' },
      { code: '85025', description: 'Blood count; complete (CBC), automated' },
      { code: '87040', description: 'Culture, bacterial; blood, aerobic' }
    ],
    formGuidance: {
      'PatientEligibilityForm': {
        'providerId': 'Enter your 10-digit National Provider Identifier (NPI) number. This is required for all claims submissions.',
        'subscriberId': 'Enter the patient\'s member ID as it appears on their insurance card. This is typically found on the front of the card.',
        'dependantSequence': 'Enter the dependent sequence number. 00 = primary subscriber, 01 = spouse, 02+ = children in order of birth.',
        'lastName': 'Enter the patient\'s legal last name exactly as it appears on their insurance card.',
        'firstName': 'Enter the patient\'s legal first name exactly as it appears on their insurance card.',
        'dateOfBirth': 'Enter the patient\'s date of birth in MM/DD/YYYY format.'
      },
      'ClaimsSubmissionForm': {
        'serviceDateFrom': 'Enter the date when services began. This should be the first date of the service period.',
        'serviceDateTo': 'Enter the date when services ended. For single-day services, this will be the same as the from date.',
        'diagnosisCodes': 'Enter the primary diagnosis code first, followed by any secondary codes. Use the most specific code available.',
        'procedureCodes': 'Enter the procedure codes for services rendered. Include modifiers if applicable.',
        'units': 'Enter the number of units for this procedure. For most procedures, this is 1.',
        'uAndCCharge': 'Enter your usual and customary charge for this service.',
        'planAllowed': 'Enter the amount allowed by the insurance plan for this service.'
      }
    },
    applicationKnowledge: {
      pages: {
        'Frames and Lenses': {
          description: 'Comprehensive collection of frame and lens pricing information',
          location: 'PIC Actions → Frames and Lenses',
          documents: {
            'Standard Lens Price List 2024': 'Complete pricing for standard lenses including single vision, bifocal, and trifocal lenses',
            'Premium Lens Price List 2024': 'Premium lens options including high-index, polycarbonate, and specialty materials',
            'Progressive Lens Price List 2024': 'Progressive lens pricing for all brands and designs',
            'Contact Lens Price List 2024': 'Contact lens pricing including daily, weekly, and monthly options',
            'Specialty Lens Price List 2024': 'Specialty lenses for conditions like keratoconus, post-surgery, and custom designs',
            'Coating and Treatment Price List 2024': 'Anti-reflective, scratch-resistant, and other lens treatments',
            'Premium Collection Frame Kit': 'Premium frame collections with detailed specifications',
            'Grand Lux Frame Kit': 'Luxury frame collections and special orders',
            'Designer Collection Frame Kit': 'Designer brand frames and exclusive collections',
            'Kids Collection Frame Kit': 'Children\'s frames and safety options'
          },
          navigation: 'Access via PIC Actions page, then click "Frames and Lenses" action'
        },
        'Health Plan Details': {
          description: 'Comprehensive health plan provider information and documents',
          location: 'PIC Actions → Health Plan Details',
          providers: {
            'AvMed': 'Complete 2024-2025 benefits, Medicaid choices, and billing structure',
            'Care Plus': 'Essential health benefits and provider network information',
            'Florida Blue': 'Blue Cross Blue Shield of Florida plans and coverage',
            'Humana': 'Medicare Advantage and commercial plan details',
            'Kaiser': 'Integrated health system plans and benefits',
            'Aetna': 'Commercial and Medicare plans with detailed coverage',
            'Cigna': 'Global health service company plans and networks',
            'UnitedHealthcare': 'Comprehensive health benefits and provider networks',
            'Anthem': 'Blue Cross Blue Shield plans and coverage options',
            'Molina': 'Medicaid and Marketplace plan information',
            'WellCare': 'Medicare and Medicaid plan details'
          },
          documentTypes: {
            'benefits': 'Essential health benefits and coverage details',
            'medicaid': 'Medicaid plan options and eligibility',
            'billing': 'Billing structure and payment information',
            'coverage': 'Coverage details and limitations',
            'network': 'Provider network information',
            'formulary': 'Prescription drug coverage and formularies'
          },
          navigation: 'Access via PIC Actions page, then click "Health Plan Details" action'
        },
        'Reserved Benefits': {
          description: 'Patient benefit information and coverage details',
          location: 'Patient Eligibility Form → Step 3 Results',
          features: {
            'Financial Summary': 'Cost breakdown and patient responsibility',
            'Member Information': 'Patient demographics and eligibility',
            'Provider Information': 'Provider details and network status',
            'Benefits Details': 'Coverage information and limitations',
            'Available Benefits': 'List of covered services and procedures'
          },
          navigation: 'Complete Patient Eligibility Form to view reserved benefits'
        }
      },
      features: {
        'M.I.L.A. AI Assistant': {
          description: 'Intelligent assistant for medical billing and form guidance',
          capabilities: [
            'Medical code lookup and validation',
            'Form field guidance and explanations',
            'Terminology definitions',
            'Provider search assistance',
            'Workflow optimization suggestions',
            'Real-time error prevention',
            'Context-aware help and guidance'
          ],
          activation: 'Click the M.I.L.A. button (lightbulb icon) in any form'
        },
        'PIC Actions': {
          description: 'Provider Interface Center with quick access to common actions',
          availableActions: [
            'Health Plan Details - Access provider information and documents',
            'Frames and Lenses - View pricing and collections',
            'Request Patient Eligibility - Check patient coverage',
            'Submit Claims - Process insurance claims',
            'HEDIS Screening - Quality measure documentation'
          ],
          navigation: 'Main dashboard → PIC tab'
        }
      },
      helpTopics: {
        'lens pricing': {
          keywords: ['lens', 'pricing', 'price', 'cost', 'lenses', 'frame', 'frames'],
          response: 'I can help you find lens pricing information! The Frames and Lenses page contains comprehensive pricing for all lens types including Standard, Premium, Progressive, Contact, and Specialty lenses. You can access this information through the PIC Actions page by clicking "Frames and Lenses". The page includes separate price lists for different lens categories and frame collections.',
          action: 'Navigate to PIC Actions → Frames and Lenses'
        },
        'health plan information': {
          keywords: ['health plan', 'insurance', 'provider', 'benefits', 'coverage'],
          response: 'Health plan information is available in the Health Plan Details page. This includes comprehensive information for major providers like AvMed, Care Plus, Florida Blue, Humana, Kaiser, Aetna, Cigna, UnitedHealthcare, Anthem, Molina, and WellCare. Each provider has detailed documents for benefits, Medicaid, billing, coverage, network, and formulary information.',
          action: 'Navigate to PIC Actions → Health Plan Details'
        },
        'patient eligibility': {
          keywords: ['eligibility', 'patient', 'coverage', 'benefits', 'reserved'],
          response: 'Patient eligibility information can be accessed through the Request Patient Eligibility form. This will show you the patient\'s coverage details, reserved benefits, and financial information. Complete the form to view comprehensive benefit information including cost breakdowns and covered services.',
          action: 'Navigate to PIC Actions → Request Patient Eligibility'
        },
        'claims submission': {
          keywords: ['claims', 'submission', 'billing', 'submit', 'claim'],
          response: 'Claims submission is available through the Submit Claims form. This comprehensive form guides you through the entire claims process including patient information, diagnosis codes, procedure codes, and billing details. The form includes M.I.L.A. assistance for code lookup and validation.',
          action: 'Navigate to PIC Actions → Submit Claims'
        },
        'HEDIS screening': {
          keywords: ['hedis', 'screening', 'quality', 'measures', 'retinal'],
          response: 'HEDIS screening forms are available for quality measure documentation. These forms help document retinal imaging, patient demographics, and other quality measures required for HEDIS reporting. The forms include step-by-step guidance and validation.',
          action: 'Navigate to HEDIS tab → New Screening'
        }
      }
    }
  }

  // Smart Suggestions Engine - Item 7
  private static SMART_SUGGESTIONS_ENGINE = {
    // Suggestion patterns based on form context and user behavior
    patterns: {
      claims_submission: {
        step1: {
          suggestions: [
            { type: 'field', title: 'Provider ID Format', description: 'NPI must be 10 digits', confidence: 0.9 },
            { type: 'code', title: 'Common POS Codes', description: '11 for office, 22 for outpatient hospital', confidence: 0.8 },
            { type: 'validation', title: 'Date Validation', description: 'Service date cannot be in the future', confidence: 0.95 }
          ]
        },
        step2: {
          suggestions: [
            { type: 'code', title: 'Primary Diagnosis', description: 'List most significant diagnosis first', confidence: 0.9 },
            { type: 'workflow', title: 'Multiple Diagnoses', description: 'Use additional diagnosis codes for comorbidities', confidence: 0.8 }
          ]
        },
        step3: {
          suggestions: [
            { type: 'code', title: 'Procedure Codes', description: 'Use most specific code available', confidence: 0.9 },
            { type: 'validation', title: 'Modifier Usage', description: 'Add modifiers for additional information', confidence: 0.8 },
            { type: 'optimization', title: 'Bundling Check', description: 'Verify codes aren\'t bundled', confidence: 0.7 }
          ]
        }
      },
      patient_eligibility: {
        suggestions: [
          { type: 'field', title: 'Member ID Format', description: 'Check insurance card for correct format', confidence: 0.9 },
          { type: 'workflow', title: 'Real-time Check', description: 'Verify eligibility before proceeding', confidence: 0.95 }
        ]
      },
      hedis_screening: {
        suggestions: [
          { type: 'code', title: 'HEDIS Measures', description: 'Focus on quality measures for reporting', confidence: 0.9 },
          { type: 'compliance', title: 'Documentation', description: 'Ensure complete documentation for audit', confidence: 0.95 }
        ]
      },
      prescription: {
        suggestions: [
          { type: 'field', title: 'Prescription Details', description: 'Enter complete prescription information', confidence: 0.9 },
          { type: 'validation', title: 'Prescription Validation', description: 'Verify prescription accuracy', confidence: 0.95 }
        ]
      },
      pic_actions: {
        suggestions: [
          { type: 'workflow', title: 'PIC Actions', description: 'Complete required PIC actions', confidence: 0.9 },
          { type: 'compliance', title: 'Compliance Check', description: 'Ensure compliance with PIC requirements', confidence: 0.95 }
        ]
      }
    },

    // Intelligent suggestion algorithms
    algorithms: {
      // Context-aware suggestions based on current field and form data
      getContextualSuggestions: (context: AIContext): SmartSuggestion[] => {
        const suggestions: SmartSuggestion[] = []
        
        if (!context.formType || !context.currentField) return suggestions

        // Get base suggestions for form type and step
        const baseSuggestions = AIAssistantService.SMART_SUGGESTIONS_ENGINE.patterns[context.formType]?.[`step${context.currentStep}`]?.suggestions || []
        
        // Add contextual suggestions based on current field
        const fieldSuggestions = AIAssistantService.getFieldSpecificSuggestions(context.currentField, context)
        suggestions.push(...fieldSuggestions)

        // Add workflow suggestions based on form progress
        const workflowSuggestions = AIAssistantService.getWorkflowSuggestions(context)
        suggestions.push(...workflowSuggestions)

        // Add optimization suggestions based on user behavior
        const optimizationSuggestions = AIAssistantService.getOptimizationSuggestions(context)
        suggestions.push(...optimizationSuggestions)

        return suggestions.sort((a, b) => b.confidence - a.confidence)
      },

      // Predictive suggestions based on user behavior patterns
      getPredictiveSuggestions: (context: AIContext): SmartSuggestion[] => {
        const suggestions: SmartSuggestion[] = []
        
        if (!context.userBehavior) return suggestions

        // Analyze user behavior patterns
        const { fieldFocusTime, commonErrors, successfulPatterns } = context.userBehavior

        // Suggest based on common errors
        Object.entries(commonErrors).forEach(([field, errorCount]) => {
          if (errorCount > 2) {
            suggestions.push({
              id: `error_prevention_${field}`,
              type: 'validation',
              title: `Common Error Prevention`,
              description: `You've had ${errorCount} errors in ${field}. Consider double-checking this field.`,
              confidence: 0.8,
              priority: 'high'
            })
          }
        })

        // Suggest based on successful patterns
        Object.entries(successfulPatterns).forEach(([pattern, successCount]) => {
          if (successCount > 3) {
            suggestions.push({
              id: `optimization_${pattern}`,
              type: 'optimization',
              title: `Proven Pattern`,
              description: `This approach has worked ${successCount} times. Consider using it again.`,
              confidence: 0.9,
              priority: 'medium'
            })
          }
        })

        return suggestions
      },

      // Real-time validation suggestions
      getValidationSuggestions: (context: AIContext): SmartSuggestion[] => {
        const suggestions: SmartSuggestion[] = []
        
        if (!context.formData) return suggestions

        // Check for common validation issues
        const validationChecks = [
          { field: 'providerId', check: (value: string) => value && value.length !== 10, message: 'Provider ID must be 10 digits' },
          { field: 'serviceDate', check: (value: string) => value && new Date(value) > new Date(), message: 'Service date cannot be in the future' },
          { field: 'diagnosisCodes', check: (value: any[]) => value && value.length === 0, message: 'At least one diagnosis code is required' },
          { field: 'procedureCodes', check: (value: any[]) => value && value.length === 0, message: 'At least one procedure code is required' }
        ]

        validationChecks.forEach(({ field, check, message }) => {
          if (context.formData[field] && check(context.formData[field])) {
            suggestions.push({
              id: `validation_${field}`,
              type: 'validation',
              title: 'Validation Alert',
              description: message,
              confidence: 0.95,
              priority: 'high'
            })
          }
        })

        return suggestions
      }
    }
  }

  // Proactive Assistance Engine - Item 5
  private static PROACTIVE_ASSISTANCE_ENGINE = {
    // Proactive monitoring and alerting
    monitoring: {
      // Monitor form completion patterns
      trackFormProgress: (context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        if (!context.formType || !context.currentStep || !context.totalSteps) return alerts

        const progress = (context.currentStep / context.totalSteps) * 100
        
        // Alert for slow progress
        if (context.sessionDuration && context.sessionDuration > 300000 && progress < 50) { // 5 minutes
          alerts.push({
            id: 'slow_progress',
            type: 'workflow',
            title: 'Slow Progress Detected',
            message: 'You\'ve been on this form for a while. Would you like help with the current step?',
            severity: 'info',
            actionable: true,
            action: 'get_step_help'
          })
        }

        // Alert for incomplete required fields
        if (context.errorFields && context.errorFields.length > 0) {
          alerts.push({
            id: 'required_fields_missing',
            type: 'error_prevention',
            title: 'Required Fields Missing',
            message: `${context.errorFields.length} required field(s) need to be completed.`,
            severity: 'warning',
            actionable: true,
            action: 'show_field_help'
          })
        }

        return alerts
      },

      // Monitor for potential errors
      detectPotentialErrors: (context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        if (!context.formData) return alerts

        // Check for common billing errors
        const errorChecks = [
          {
            condition: (data: any) => data.providerId && data.providerId.length !== 10,
            alert: {
              id: 'invalid_provider_id',
              type: 'error_prevention' as const,
              title: 'Invalid Provider ID',
              message: 'Provider ID should be exactly 10 digits. Please verify the NPI number.',
              severity: 'warning' as const,
              actionable: true,
              action: 'validate_provider_id'
            }
          },
          {
            condition: (data: any) => data.serviceDate && new Date(data.serviceDate) > new Date(),
            alert: {
              id: 'future_service_date',
              type: 'error_prevention' as const,
              title: 'Future Service Date',
              message: 'Service date cannot be in the future. Please check the date.',
              severity: 'warning' as const,
              actionable: true,
              action: 'validate_service_date'
            }
          },
          {
            condition: (data: any) => data.diagnosisCodes && data.diagnosisCodes.length === 0,
            alert: {
              id: 'missing_diagnosis',
              type: 'error_prevention' as const,
              title: 'Missing Diagnosis Codes',
              message: 'At least one diagnosis code is required for claims submission.',
              severity: 'critical' as const,
              actionable: true,
              action: 'add_diagnosis_codes'
            }
          }
        ]

        errorChecks.forEach(({ condition, alert }) => {
          if (condition(context.formData)) {
            alerts.push(alert)
          }
        })

        return alerts
      },

      // Monitor for optimization opportunities
      detectOptimizationOpportunities: (context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        if (!context.formData) return alerts

        // Check for potential optimizations
        const optimizationChecks = [
          {
            condition: (data: any) => data.procedureCodes && data.procedureCodes.length > 5,
            alert: {
              id: 'multiple_procedures',
              type: 'optimization' as const,
              title: 'Multiple Procedures',
              message: 'You have multiple procedures. Consider checking for bundling opportunities.',
              severity: 'info' as const,
              actionable: true,
              action: 'check_bundling'
            }
          },
          {
            condition: (data: any) => data.diagnosisCodes && data.diagnosisCodes.length > 3,
            alert: {
              id: 'multiple_diagnoses',
              type: 'optimization' as const,
              title: 'Multiple Diagnoses',
              message: 'You have multiple diagnoses. Ensure they\'re in order of significance.',
              severity: 'info' as const,
              actionable: true,
              action: 'order_diagnoses'
            }
          }
        ]

        optimizationChecks.forEach(({ condition, alert }) => {
          if (condition(context.formData)) {
            alerts.push(alert)
          }
        })

        return alerts
      }
    },

    // Proactive assistance triggers
    triggers: {
      // Trigger based on user behavior
      onFieldFocus: (fieldName: string, context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        // Check if user has struggled with this field before
        if (context.userBehavior?.commonErrors?.[fieldName] > 1) {
          alerts.push({
            id: `field_help_${fieldName}`,
            type: 'error_prevention',
            title: 'Field Assistance Available',
            message: `You've had issues with ${fieldName} before. Would you like help?`,
            severity: 'info',
            actionable: true,
            action: 'get_field_help'
          })
        }

        return alerts
      },

      // Trigger based on form step
      onStepChange: (step: number, context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        // Provide step-specific guidance
        const stepGuidance = {
          1: 'Provider and patient information is required for all claims.',
          2: 'Diagnosis codes describe the patient\'s condition or reason for visit.',
          3: 'Procedure codes describe the services provided.',
          4: 'Review all information before submission.'
        }

        if (stepGuidance[step]) {
          alerts.push({
            id: `step_guidance_${step}`,
            type: 'workflow',
            title: `Step ${step} Guidance`,
            message: stepGuidance[step],
            severity: 'info',
            actionable: false
          })
        }

        return alerts
      },

      // Trigger based on time of day
      onTimeBased: (context: AIContext): ProactiveAlert[] => {
        const alerts: ProactiveAlert[] = []
        
        const hour = new Date().getHours()
        
        // Morning productivity tips
        if (hour >= 8 && hour <= 10) {
          alerts.push({
            id: 'morning_tips',
            type: 'optimization',
            title: 'Morning Productivity',
            message: 'Good morning! Consider batch processing similar claims for efficiency.',
            severity: 'info',
            actionable: false
          })
        }

        // Afternoon reminders
        if (hour >= 14 && hour <= 16) {
          alerts.push({
            id: 'afternoon_reminder',
            type: 'workflow',
            title: 'Afternoon Check-in',
            message: 'Remember to submit claims before end of day for faster processing.',
            severity: 'info',
            actionable: false
          })
        }

        return alerts
      }
    }
  }

  // Helper methods for Smart Suggestions Engine
  private static getFieldSpecificSuggestions(fieldName: string, context: AIContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    const fieldSuggestions = {
      'providerId': [
        {
          id: 'npi_format',
          type: 'field',
          title: 'NPI Format',
          description: 'NPI must be exactly 10 digits, no spaces or dashes',
          confidence: 0.95,
          priority: 'high'
        }
      ],
      'diagnosisCodes': [
        {
          id: 'primary_diagnosis',
          type: 'code',
          title: 'Primary Diagnosis',
          description: 'List the most significant diagnosis first',
          confidence: 0.9,
          priority: 'high'
        }
      ],
      'procedureCodes': [
        {
          id: 'specific_codes',
          type: 'code',
          title: 'Most Specific Code',
          description: 'Use the most specific procedure code available',
          confidence: 0.9,
          priority: 'high'
        }
      ],
      'serviceDate': [
        {
          id: 'date_validation',
          type: 'validation',
          title: 'Date Validation',
          description: 'Service date cannot be in the future',
          confidence: 0.95,
          priority: 'high'
        }
      ]
    }

    return fieldSuggestions[fieldName] || []
  }

  private static getWorkflowSuggestions(context: AIContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    if (!context.formType || !context.currentStep) return suggestions

    // Workflow suggestions based on form progress
    const workflowSuggestions = {
      claims_submission: {
        1: [
          {
            id: 'verify_provider',
            type: 'workflow',
            title: 'Verify Provider',
            description: 'Ensure provider is in-network before proceeding',
            confidence: 0.8,
            priority: 'medium'
          }
        ],
        2: [
          {
            id: 'check_eligibility',
            type: 'workflow',
            title: 'Check Eligibility',
            description: 'Verify patient eligibility for services',
            confidence: 0.9,
            priority: 'high'
          }
        ],
        3: [
          {
            id: 'review_codes',
            type: 'workflow',
            title: 'Review Codes',
            description: 'Double-check all codes for accuracy',
            confidence: 0.8,
            priority: 'medium'
          }
        ]
      }
    }

    return workflowSuggestions[context.formType]?.[context.currentStep] || []
  }

  private static getOptimizationSuggestions(context: AIContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    if (!context.userBehavior) return suggestions

    // Optimization suggestions based on user behavior
    const { formCompletionRate, averageSessionTime } = context.userBehavior

    if (formCompletionRate < 0.7) {
      suggestions.push({
        id: 'completion_rate',
        type: 'optimization',
        title: 'Form Completion',
        description: 'Consider completing forms in one session for better efficiency',
        confidence: 0.8,
        priority: 'medium'
      })
    }

    if (averageSessionTime > 600000) { // 10 minutes
      suggestions.push({
        id: 'session_time',
        type: 'optimization',
        title: 'Session Duration',
        description: 'Long sessions may indicate complexity. Consider breaking into smaller tasks',
        confidence: 0.7,
        priority: 'low'
      })
    }

    return suggestions
  }

  // Main method to get smart suggestions
  static getSmartSuggestions(context: AIContext): SmartSuggestion[] {
    const contextualSuggestions = AIAssistantService.SMART_SUGGESTIONS_ENGINE.algorithms.getContextualSuggestions(context)
    const predictiveSuggestions = AIAssistantService.SMART_SUGGESTIONS_ENGINE.algorithms.getPredictiveSuggestions(context)
    const validationSuggestions = AIAssistantService.SMART_SUGGESTIONS_ENGINE.algorithms.getValidationSuggestions(context)

    return [...contextualSuggestions, ...predictiveSuggestions, ...validationSuggestions]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Return top 5 suggestions
  }

  // Main method to get proactive alerts
  static getProactiveAlerts(context: AIContext): ProactiveAlert[] {
    const progressAlerts = AIAssistantService.PROACTIVE_ASSISTANCE_ENGINE.monitoring.trackFormProgress(context)
    const errorAlerts = AIAssistantService.PROACTIVE_ASSISTANCE_ENGINE.monitoring.detectPotentialErrors(context)
    const optimizationAlerts = AIAssistantService.PROACTIVE_ASSISTANCE_ENGINE.monitoring.detectOptimizationOpportunities(context)
    const timeAlerts = AIAssistantService.PROACTIVE_ASSISTANCE_ENGINE.triggers.onTimeBased(context)

    return [...progressAlerts, ...errorAlerts, ...optimizationAlerts, ...timeAlerts]
      .sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      })
  }

  // Enhanced processUserInput with memory integration
  static async processUserInput(
    input: string,
    context: AIContext = {}
  ): Promise<string> {
    console.log('🤖 Processing user input with memory-enhanced AI system:', input)
    
    // Initialize memory context
    const userId = context.userId || 'anonymous'
    const sessionId = context.sessionId || `session_${Date.now()}`
    const memoryEnabled = context.memoryEnabled !== false

    // Load user preferences from memory if available
    let userPreferences: Record<string, any> = {}
    if (memoryEnabled) {
      try {
        userPreferences = await MemoryService.getUserPreferences(userId)
        console.log('🧠 Loaded user preferences:', userPreferences)
      } catch (error) {
        console.warn('Failed to load user preferences:', error)
      }
    }

    // Enhanced context with memory data
    const enhancedContext: AIContext = {
      ...context,
      userId,
      sessionId,
      userPreferences,
      memoryEnabled
    }

    // Record medical term usage if applicable
    if (memoryEnabled && this.isTerminologyQuestion(input.toLowerCase())) {
      try {
        const medicalTerms = this.extractMedicalTerms(input)
        for (const term of medicalTerms) {
          await MemoryService.recordMedicalTermUsage(term, userId, ['definition_request'])
        }
        console.log('📚 Recorded medical term usage:', medicalTerms)
      } catch (error) {
        console.warn('Failed to record medical term usage:', error)
      }
    }

    // Store conversation context
    if (memoryEnabled) {
      try {
        await MemoryService.storeConversationContext(userId, sessionId, {
          formType: context.formType,
          currentField: context.currentField,
          currentStep: context.currentStep,
          deviceType: context.deviceType,
          userRole: context.userRole
        })
      } catch (error) {
        console.warn('Failed to store conversation context:', error)
      }
    }

    // Get smart suggestions and proactive alerts
    const suggestions = AIAssistantService.getSmartSuggestions(enhancedContext)
    const alerts = AIAssistantService.getProactiveAlerts(enhancedContext)

    let response: string

    // HYBRID ROUTING: Decide between local knowledge and Gemini AI
    try {
      console.log('🔍 Analyzing input for routing:', input)
      const shouldUseGemini = GeminiAIService.shouldUseGemini(input, enhancedContext)
      console.log('🤖 shouldUseGemini result:', shouldUseGemini)
      
      if (shouldUseGemini) {
        console.log('🧠 Routing to Gemini AI for enhanced reasoning')
        
        // Try Gemini AI first for complex queries
        const geminiResponse = await GeminiAIService.processWithGemini(input, enhancedContext)
        
        // If Gemini returns an error message, fall back to local processing
        if (geminiResponse.includes('Configuration Error') || 
            geminiResponse.includes('AI Service Temporarily Unavailable') ||
            geminiResponse.includes('Rate Limit')) {
          console.log('⚠️ Gemini fallback - using local knowledge')
          response = await AIAssistantService.processMainInput(input, enhancedContext)
          response = `${geminiResponse}\n\n---\n\n**Local Knowledge Response:**\n${response}`
        } else {
          response = `🧠 **Enhanced AI Response:**\n${geminiResponse}`
        }
      } else {
        console.log('⚡ Using local knowledge base for fast response')
        // Use local knowledge for simple queries, codes, and terminology
        response = await AIAssistantService.processMainInput(input, enhancedContext)
        console.log('📋 Local response generated:', response.substring(0, 100) + '...')
      }
    } catch (error) {
      console.error('Hybrid routing error:', error)
      // Always fall back to local knowledge if there's any error
      response = await AIAssistantService.processMainInput(input, enhancedContext)
      response = `⚠️ **Using Local Knowledge** (AI enhancement temporarily unavailable)\n\n${response}`
    }

    // Add personalization based on user preferences
    if (memoryEnabled && userPreferences.response_style === 'detailed') {
      response += `\n\n**📋 Additional Context:** This response is tailored to your detailed preference style.`
    }

    // Add related terms based on user's medical term usage
    if (memoryEnabled) {
      try {
        const termUsage = await MemoryService.getMedicalTermUsage(userId, 5)
        if (termUsage.length > 0) {
          const relatedTerms = termUsage.slice(0, 3).map(t => t.term)
          response += `\n\n**🔗 Related to your frequently asked terms:** ${relatedTerms.join(', ')}`
        }
      } catch (error) {
        console.warn('Failed to get medical term usage:', error)
      }
    }

    // Add smart suggestions to response if available
    if (suggestions.length > 0) {
      response += '\n\n**💡 Smart Suggestions:**\n'
      suggestions.forEach((suggestion, index) => {
        response += `${index + 1}. **${suggestion.title}** (${suggestion.priority} priority)\n   ${suggestion.description}\n\n`
      })
    }

    // Add proactive alerts to response if available
    if (alerts.length > 0) {
      response += '\n\n**⚠️ Proactive Alerts:**\n'
      alerts.forEach((alert, index) => {
        const icon = alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'
        response += `${index + 1}. ${icon} **${alert.title}**\n   ${alert.message}\n\n`
      })
    }

    // Store the conversation in memory
    if (memoryEnabled) {
      try {
        await MemoryService.saveConversation(
          userId,
          sessionId,
          [
            {
              role: 'user',
              content: input,
              timestamp: Date.now()
            },
            {
              role: 'assistant',
              content: response,
              timestamp: Date.now()
            }
          ],
          {
            formType: context.formType,
            currentField: context.currentField,
            currentStep: context.currentStep,
            deviceType: context.deviceType,
            userRole: context.userRole
          },
          `User asked: ${input.substring(0, 100)}...`
        )
      } catch (error) {
        console.warn('Failed to save conversation:', error)
      }
    }

    return response
  }

  // Helper method to extract medical terms from input
  private static extractMedicalTerms(input: string): string[] {
    const medicalTerms = [
      'diabetes mellitus', 'diabetes', 'hypertension', 'glaucoma', 'cataract',
      'diabetic retinopathy', 'macular degeneration', 'copay', 'deductible',
      'prior authorization', 'formulary', 'od', 'os', 'ou', 'npi', 'cpt',
      'icd', 'hcpcs', 'hedis', 'pcp', 'eob', 'era', 'edi', 'hipaa', 'cms'
    ]
    
    return medicalTerms.filter(term => 
      input.toLowerCase().includes(term.toLowerCase())
    )
  }

  // Helper method to process main input (existing logic)
  private static async processMainInput(input: string, context: AIContext): Promise<string> {
    console.log('📋 processMainInput called with:', input)
    const lowerInput = input.toLowerCase()
    
    // Check for application knowledge queries first
    const appKnowledgeResponse = this.handleApplicationKnowledgeQuery(input, context)
    if (appKnowledgeResponse) {
      return appKnowledgeResponse
    }
    
    // Check for terminology questions
    if (this.isTerminologyQuestion(lowerInput)) {
      const response = await this.handleTerminologyQuestion(input)
      return response.content
    }
    
    // Check for specific code lookups
    if (this.isSpecificCodeLookup(input)) {
      return await this.handleSpecificCodeLookup(input)
    }
    
    // Check for ICD-10 lookups
    if (this.isICD10Lookup(lowerInput)) {
      const response = await this.handleICD10Lookup(input)
      return response.content
    }
    
    // Check for CPT lookups
    if (this.isCPTLookup(lowerInput)) {
      const response = await this.handleCPTLookup(input)
      return response.content
    }
    
    // Check for specialty questions
    if (this.isSpecialtyQuestion(lowerInput)) {
      const response = this.handleSpecialtyQuestion(input)
      return response.content
    }
    
    // Check for provider lookups
    if (this.isProviderLookup(lowerInput)) {
      const response = await this.handleProviderLookup(input)
      return response.content
    }
    
    // Check for form help
    if (this.isFormHelp(lowerInput)) {
      const response = this.handleFormHelp(input, context)
      return response.content
    }
    
    // Check for medical terminology
    if (this.isMedicalTerminology(lowerInput)) {
      return await this.handleMedicalTerminology(input)
    }
    
    // Check for provider search
    if (this.isProviderSearch(lowerInput)) {
      return await this.handleProviderSearch(input)
    }
    
    // Check for eligibility check
    if (this.isEligibilityCheck(lowerInput)) {
      return await this.handleEligibilityCheck(input)
    }
    
    // Check for claims submission
    if (this.isClaimsSubmission(lowerInput)) {
      return await this.handleClaimsSubmission(input)
    }
    
    // Check for workflow assistance
    if (this.isWorkflowAssistance(lowerInput)) {
      return await this.handleWorkflowAssistance(input, context)
    }
    
    // Check for mobile requests
    if (this.isMobileRequest(lowerInput)) {
      return await this.handleMobileRequest(input)
    }
    
    // Check for general questions
    if (this.isGeneralQuestion(lowerInput)) {
      const response = this.handleGeneralQuestion(input)
      return response.content
    }
    
    // Use agile response system for all other queries including "show all" requests
    console.log('📋 Calling getAgileResponse for:', input)
    return await this.getAgileResponse(input, context)
  }

  private static handleApplicationKnowledgeQuery(input: string, context: AIContext): string | null {
    const lowerInput = input.toLowerCase()
    const knowledge = this.LOCAL_KNOWLEDGE.applicationKnowledge
    
    // Check for lens pricing queries
    if (lowerInput.includes('lens') && (lowerInput.includes('pricing') || lowerInput.includes('price') || lowerInput.includes('cost'))) {
      return `I can help you find lens pricing information! The Frames and Lenses page contains comprehensive pricing for all lens types including Standard, Premium, Progressive, Contact, and Specialty lenses.\n\n**📋 Available Information:**\n• Standard, Premium, and Progressive lens pricing\n• Contact lens options and pricing\n• Specialty lenses for specific conditions\n• Frame collections and pricing\n• Coating and treatment options\n\n**🔗 Navigation:** Go to PIC Actions → Click "Frames and Lenses" to access all pricing documents.`
    }
    
    // Check for health plan queries
    if (lowerInput.includes('health plan') || lowerInput.includes('insurance') || lowerInput.includes('provider')) {
      return `Health plan information is available in the Health Plan Details page. This includes comprehensive information for major providers like AvMed, Care Plus, Florida Blue, Humana, Kaiser, Aetna, Cigna, UnitedHealthcare, Anthem, Molina, and WellCare.\n\n**📋 Available Information:**\n• Essential health benefits and coverage details\n• Medicaid plan options and eligibility\n• Billing structure and payment information\n• Provider network information\n• Prescription drug formularies\n\n**🔗 Navigation:** Go to PIC Actions → Click "Health Plan Details" to access provider information and documents.`
    }
    
    // Check for patient eligibility queries
    if (lowerInput.includes('eligibility') || lowerInput.includes('patient') && lowerInput.includes('coverage')) {
      return `Patient eligibility information can be accessed through the Request Patient Eligibility form. This will show you the patient's coverage details, reserved benefits, and financial information.\n\n**📋 Available Information:**\n• Patient coverage and benefit details\n• Financial summary and cost breakdown\n• Reserved benefits information\n• Provider and member details\n• Available services and procedures\n\n**🔗 Navigation:** Go to PIC Actions → Click "Request Patient Eligibility" to check patient coverage.`
    }
    
    // Check for claims submission queries
    if (lowerInput.includes('claims') || lowerInput.includes('submission') || lowerInput.includes('billing')) {
      return `Claims submission is available through the Submit Claims form. This comprehensive form guides you through the entire claims process including patient information, diagnosis codes, procedure codes, and billing details.\n\n**📋 Available Features:**\n• Step-by-step claims submission process\n• M.I.L.A. assistance for code lookup and validation\n• Patient and provider information entry\n• Diagnosis and procedure code management\n• Billing and payment details\n\n**🔗 Navigation:** Go to PIC Actions → Click "Submit Claims" to start the claims submission process.`
    }
    
    // Check for HEDIS screening queries
    if (lowerInput.includes('hedis') || lowerInput.includes('screening') || lowerInput.includes('quality')) {
      return `HEDIS screening forms are available for quality measure documentation. These forms help document retinal imaging, patient demographics, and other quality measures required for HEDIS reporting.\n\n**📋 Available Features:**\n• Retinal imaging documentation\n• Patient demographic collection\n• Quality measure tracking\n• Step-by-step guidance and validation\n• Progress tracking and completion status\n\n**🔗 Navigation:** Go to HEDIS tab → Click "New Screening" to start HEDIS documentation.`
    }
    
    // Check for Manual Eligibility form queries
    if (lowerInput.includes('manual') && lowerInput.includes('eligibility') && (lowerInput.includes('form') || lowerInput.includes('help'))) {
      return `I can help you with Manual Eligibility forms! The Manual Eligibility Request form allows you to submit manual eligibility verification requests.\n\n**📋 Form Features:**\n• Submit manual eligibility requests\n• Patient information collection\n• Contact method selection (email/fax)\n• Provider information documentation\n• 48-hour processing time\n\n**🔗 Navigation:** Go to PIC Actions → Click "Manual Eligibility Request" to access the form.`
    }
    
    // Check for PIC forms queries (must come before general help to avoid conflicts)
    // More flexible pattern matching for PIC forms
    const picFormPatterns = [
      /pic.*form/i,
      /find.*pic/i,
      /help.*pic/i,
      /pic.*help/i,
      /pic.*find/i,
      /forms.*pic/i,
      /pic.*available/i,
      /what.*pic/i,
      /show.*pic/i
    ]
    
    if (picFormPatterns.some(pattern => pattern.test(lowerInput))) {
      return `I can help you with PIC forms! The PIC Actions page contains all the forms you need for medical billing and claims processing.\n\n**📋 Available Forms:**\n• **Request Patient Eligibility** - Check patient coverage and benefits\n• **Submit Claims** - Complete claims submission process\n• **Prescription Form** - Document prescription details\n• **Manual Eligibility Request** - Manual eligibility verification\n• **Health Plan Details** - Access provider information and documents\n• **Frames and Lenses** - Lens pricing and frame options\n\n**🔗 Navigation:** Go to PIC Actions to access all these forms and more.`
    }
    
    // Check for general help topics
    for (const [topic, info] of Object.entries(knowledge.helpTopics)) {
      if (info.keywords.some(keyword => lowerInput.includes(keyword))) {
        return `${info.response}\n\n**🔗 Action:** ${info.action}`
      }
    }
    
    // Check for general application features
    if (lowerInput.includes('mila') || lowerInput.includes('assistant') || lowerInput.includes('help')) {
      const milaInfo = knowledge.features['M.I.L.A. AI Assistant']
      return `M.I.L.A. is your intelligent assistant for medical billing and form guidance. Here's what I can help you with:\n\n**📋 Capabilities:**\n${milaInfo.capabilities.map(cap => `• ${cap}`).join('\n')}\n\n**🔗 Activation:** ${milaInfo.activation}`
    }
    
    // Check for PIC actions queries
    if (lowerInput.includes('pic') || lowerInput.includes('actions') || lowerInput.includes('quick access')) {
      const picInfo = knowledge.features['PIC Actions']
      return `The PIC Actions page provides quick access to common actions. Here's what's available:\n\n**📋 Available Actions:**\n${picInfo.availableActions.map(action => `• ${action}`).join('\n')}\n\n**🔗 Navigation:** ${picInfo.navigation}`
    }
    
    // If we get here, the query wasn't recognized - provide helpful suggestions
    if (lowerInput.includes('pic') || lowerInput.includes('form') || lowerInput.includes('help') || lowerInput.includes('find')) {
      return `I'd be happy to help you! It looks like you're asking about forms or PIC actions. Here are some things I can help you with:\n\n**📋 Common Requests:**\n• **PIC Forms** - Access all medical billing forms\n• **Patient Eligibility** - Check patient coverage\n• **Claims Submission** - Submit medical claims\n• **Health Plan Details** - Provider information\n• **Frames and Lenses** - Pricing information\n\n**💡 Try asking:**\n• "I need help with PIC forms"\n• "Show me the patient eligibility form"\n• "Where can I submit claims?"\n• "Help me find health plan information"\n\n**🔗 Quick Access:** Go to PIC Actions to see all available forms and tools.`
    }
    
    return null
  }

  private static isTerminologyQuestion(input: string): boolean {
    const terminologyKeywords = [
      'what is', 'what does', 'meaning of', 'define', 'term', 'abbreviation',
      'definition', 'explain', 'tell me about', 'describe', 'define the term',
      'what does the term', 'what is the definition', 'can you define',
      'explain the term', 'what is meant by', 'define diabetes', 'define hypertension',
      'explain diabetes', 'tell me about diabetes', 'what is diabetes mellitus'
    ]
    return terminologyKeywords.some(keyword => input.toLowerCase().includes(keyword))
  }

  private static isICD10Lookup(input: string): boolean {
    const icdKeywords = ['icd', 'diagnosis', 'condition', 'disease']
    return icdKeywords.some(keyword => input.includes(keyword))
  }

  private static isCPTLookup(input: string): boolean {
    const cptKeywords = ['cpt', 'procedure', 'service', 'treatment']
    return cptKeywords.some(keyword => input.includes(keyword))
  }

  private static isSpecialtyQuestion(input: string): boolean {
    const specialtyKeywords = ['specialty', 'specialist', 'ophthalmology', 'cardiology', 'endocrinology', 'nephrology', 'pulmonology', 'gastroenterology', 'neurology', 'orthopedics']
    return specialtyKeywords.some(keyword => input.includes(keyword))
  }

  private static isProviderLookup(input: string): boolean {
    const providerKeywords = ['provider', 'doctor', 'physician', 'npi', 'find doctor', 'lookup provider']
    return providerKeywords.some(keyword => input.includes(keyword))
  }

  private static isFormHelp(input: string): boolean {
    const formKeywords = ['form', 'field', 'help', 'how to', 'what do i enter']
    return formKeywords.some(keyword => input.includes(keyword))
  }

  // Helper methods for enhanced terminology processing
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    if (longer.length === 0) return 1.0
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  private static isBillingRelatedTerm(term: string): boolean {
    const billingTerms = [
      'copay', 'deductible', 'coinsurance', 'prior authorization', 'formulary',
      'eob', 'era', 'edi', 'hipaa', 'cms', 'cpt', 'icd', 'hcpcs', 'npi'
    ]
    return billingTerms.some(billingTerm => term.toLowerCase().includes(billingTerm))
  }

  private static getBillingContext(term: string): string {
    const contexts: { [key: string]: string } = {
      'copay': 'Patients pay this amount at the time of service.',
      'deductible': 'This amount must be met before insurance coverage begins.',
      'coinsurance': 'This percentage is paid by the patient after meeting the deductible.',
      'prior authorization': 'This approval is required before certain services can be provided.',
      'formulary': 'This list determines which medications are covered and at what cost.',
      'npi': 'This unique identifier is required for all healthcare providers.',
      'cpt': 'These codes describe medical procedures and services.',
      'icd': 'These codes classify diseases and medical conditions.',
      'hcpcs': 'These codes cover supplies, equipment, and services not included in CPT.'
    }
    return contexts[term.toLowerCase()] || 'This term is important for accurate billing and coding.'
  }

  private static getRelatedTerms(term: string): string[] {
    const relatedTermsMap: { [key: string]: string[] } = {
      'diabetes': ['diabetes mellitus', 'insulin', 'glucose', 'hemoglobin a1c', 'diabetic retinopathy'],
      'diabetes mellitus': ['diabetes', 'insulin', 'glucose', 'hemoglobin a1c', 'diabetic retinopathy'],
      'hypertension': ['blood pressure', 'cardiovascular', 'heart disease'],
      'glaucoma': ['eye pressure', 'optic nerve', 'vision loss'],
      'cataract': ['lens', 'vision', 'surgery'],
      'od': ['os', 'ou', 'eye', 'ophthalmology'],
      'os': ['od', 'ou', 'eye', 'ophthalmology'],
      'ou': ['od', 'os', 'eye', 'ophthalmology'],
      'copay': ['deductible', 'coinsurance', 'insurance'],
      'deductible': ['copay', 'coinsurance', 'insurance'],
      'coinsurance': ['copay', 'deductible', 'insurance']
    }
    return relatedTermsMap[term.toLowerCase()] || []
  }

  private static getTerminologySuggestions(term: string): string[] {
    const suggestionsMap: { [key: string]: string[] } = {
      'diabetes': [
        'Ask about diabetes billing codes',
        'Request information about diabetic eye complications',
        'Ask about diabetes management procedures'
      ],
      'hypertension': [
        'Ask about hypertension billing codes',
        'Request information about blood pressure monitoring',
        'Ask about cardiovascular risk factors'
      ],
      'glaucoma': [
        'Ask about glaucoma screening procedures',
        'Request information about eye pressure monitoring',
        'Ask about vision loss prevention'
      ],
      'od': [
        'Ask about OS (left eye)',
        'Request information about OU (both eyes)',
        'Ask about eye examination procedures'
      ],
      'copay': [
        'Ask about deductible amounts',
        'Request information about coinsurance',
        'Ask about insurance coverage details'
      ]
    }
    return suggestionsMap[term.toLowerCase()] || [
      'Ask for related billing codes',
      'Request more detailed information',
      'Ask about related procedures or conditions'
    ]
  }

  private static async handleTerminologyQuestion(input: string): Promise<AIAssistantResponse> {
    const inputLower = input.toLowerCase()
    
    // Enhanced matching with fuzzy logic for better term recognition
    const matchedTerms = []
    for (const [term, definition] of Object.entries(this.LOCAL_KNOWLEDGE.terminology)) {
      const termLower = term.toLowerCase()
      
      // Exact match
      if (inputLower.includes(termLower)) {
        matchedTerms.push({ term, definition, matchType: 'exact' })
      }
      // Partial match for compound terms
      else if (termLower.includes(' ') && termLower.split(' ').some(word => inputLower.includes(word))) {
        matchedTerms.push({ term, definition, matchType: 'partial' })
      }
      // Fuzzy match for similar terms
      else if (this.calculateSimilarity(inputLower, termLower) > 0.7) {
        matchedTerms.push({ term, definition, matchType: 'fuzzy' })
      }
    }

    // If we found matches, provide comprehensive response
    if (matchedTerms.length > 0) {
      const bestMatch = matchedTerms.find(m => m.matchType === 'exact') || matchedTerms[0]
      const { term, definition } = bestMatch
      
      let content = `**${term.toUpperCase()}**\n\n${definition}\n\n`
      
      // Add billing context if relevant
      if (this.isBillingRelatedTerm(term)) {
        content += `**Billing Context:** This term is commonly used in medical billing and coding. `
        content += this.getBillingContext(term)
      }
      
      // Add related terms
      const relatedTerms = this.getRelatedTerms(term)
      if (relatedTerms.length > 0) {
        content += `\n\n**Related Terms:** ${relatedTerms.join(', ')}`
      }
      
      // Add follow-up suggestions
      const suggestions = this.getTerminologySuggestions(term)
      
      return {
        type: 'terminology',
        content: content,
        data: { term, definition, relatedTerms },
        suggestions: suggestions
      }
    }

    // Use medical terms API for enhanced terminology lookup
    try {
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length > 0) {
        const searchTerm = searchTerms[0]
        const result = await MedicalAPIService.searchMedicalTerms(searchTerm)
        
        if (result.success && result.data && result.data.length > 0) {
          const terms = result.data
          const content = terms.map(term => 
            `**${term.term}**: ${term.definition} (Category: ${term.category})`
          ).join('\n')
          
          return {
            type: 'terminology',
            content: `I found ${terms.length} medical term(s) for "${searchTerm}":\n\n${content}\n\nIs there a specific aspect of these terms you'd like me to explain further?`,
            data: { terms, searchTerm },
            suggestions: [
              'Ask for more details about any of these terms',
              'Request billing codes related to these conditions',
              'Ask about treatment options or procedures'
            ]
          }
        }
      }
    } catch (error) {
      console.error('Medical terms lookup error:', error)
    }

    // Enhanced fallback with clarification options
    return {
      type: 'terminology',
      content: `I'd be happy to help you understand medical terminology! I can provide definitions for:\n\n• **Medical Conditions** (diabetes, hypertension, glaucoma, etc.)\n• **Medical Procedures** (eye exams, fundus photography, etc.)\n• **Billing Terms** (copay, deductible, prior authorization, etc.)\n• **Abbreviations** (OD, OS, PCP, NPI, etc.)\n• **Coding Systems** (ICD-10, CPT, HCPCS)\n\nCould you be more specific about what term you'd like me to define?`,
      suggestions: [
        'Try: "Define diabetes mellitus" or "What is hypertension?"',
        'Ask: "Explain OD and OS" or "What does PCP mean?"',
        'Request: "Define copay" or "What is prior authorization?"',
        'Say: "Tell me about glaucoma" or "Explain fundus photography"'
      ]
    }
  }

  private static async handleICD10Lookup(input: string): Promise<AIAssistantResponse> {
    // Check local knowledge first
    for (const [code, description] of Object.entries(this.LOCAL_KNOWLEDGE.commonCodes)) {
      if (input.toLowerCase().includes(code.toLowerCase())) {
        return {
          type: 'code_lookup',
          content: `**${code}**: ${description}`,
          data: { code, description }
        }
      }
    }

    // Use real ICD-10 API
    try {
      // Extract search terms from input
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length === 0) {
        return {
          type: 'code_lookup',
          content: 'I can help you find diagnosis codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes".',
          suggestions: ['E11.9', 'H35.01', 'I10', 'H35.00']
        }
      }

      // Search using the first relevant term
      const searchTerm = searchTerms[0]
      const result = await MedicalAPIService.searchICD10Codes(searchTerm)
      
      if (result.success && result.data && result.data.length > 0) {
        const codes = result.data
        const content = codes.map(code => 
          `**${code.code}**: ${code.description}`
        ).join('\n')
        
        return {
          type: 'code_lookup',
          content: `Found ${codes.length} ICD-10 code(s) for "${searchTerm}":\n\n${content}`,
          data: { codes, searchTerm },
          suggestions: codes.slice(0, 3).map(code => code.code)
        }
      } else {
        return {
          type: 'code_lookup',
          content: `No ICD-10 codes found for "${searchTerm}". Try searching for a different condition or symptom.`,
          suggestions: ['diabetes', 'retinopathy', 'hypertension', 'cataracts']
        }
      }
    } catch (error) {
      console.error('ICD-10 lookup error:', error)
      return {
        type: 'code_lookup',
        content: 'I can help you find diagnosis codes! Try asking about specific conditions like "diabetes codes" or "retinopathy codes".',
        suggestions: ['E11.9', 'H35.01', 'I10', 'H35.00']
      }
    }
  }

  private static async handleCPTLookup(input: string): Promise<AIAssistantResponse> {
    try {
      // Extract search terms from input
      const searchTerms = this.extractSearchTerms(input)
      if (searchTerms.length === 0) {
        return {
          type: 'code_lookup',
          content: 'I can help you find procedure codes! Try asking about specific procedures like "retinal imaging" or "diabetes management".',
          suggestions: ['92250', '92227', '99213', '99214']
        }
      }

      // Search using the first relevant term
      const searchTerm = searchTerms[0]
      const result = await MedicalAPIService.searchCPTCodes(searchTerm)
      
      if (result.success && result.data && result.data.length > 0) {
        const codes = result.data
        const content = codes.map(code => 
          `**${code.code}**: ${code.description} (RVU: ${code.rvu || 'N/A'})`
        ).join('\n')
        
        return {
          type: 'code_lookup',
          content: `Found ${codes.length} CPT code(s) for "${searchTerm}":\n\n${content}`,
          data: { codes, searchTerm },
          suggestions: codes.slice(0, 3).map(code => code.code)
        }
      } else {
        return {
          type: 'code_lookup',
          content: `No CPT codes found for "${searchTerm}". Try searching for a different procedure or service.`,
          suggestions: ['retinal imaging', 'diabetes management', 'lab tests', 'office visit']
        }
      }
    } catch (error) {
      console.error('CPT lookup error:', error)
      return {
        type: 'code_lookup',
        content: 'I can help you find procedure codes! Try asking about specific procedures like "retinal imaging" or "diabetes management".',
        suggestions: ['92250', '92227', '99213', '99214']
      }
    }
  }

  private static handleSpecialtyQuestion(input: string): AIAssistantResponse {
    const lowerInput = input.toLowerCase()
    
    // Check for specific specialty mentions
    const specialties = MedicalSpecialtiesService.getSpecialties()
    const mentionedSpecialty = specialties.find(specialty => 
      lowerInput.includes(specialty)
    )

    if (mentionedSpecialty) {
      const specialtyData = MedicalSpecialtiesService.getSpecialty(mentionedSpecialty)
      if (specialtyData) {
        const content = `**${specialtyData.name}**\n\n` +
          `**Description**: ${specialtyData.description}\n\n` +
          `**Common Procedures**:\n${specialtyData.procedures.slice(0, 5).map(p => `• ${p}`).join('\n')}\n\n` +
          `**Common Conditions**:\n${specialtyData.conditions.slice(0, 5).map(c => `• ${c}`).join('\n')}\n\n` +
          `**Common Codes**: ${specialtyData.commonCodes.slice(0, 3).join(', ')}`

        return {
          type: 'general',
          content,
          data: { specialty: specialtyData },
          suggestions: specialtyData.commonCodes.slice(0, 3)
        }
      }
    }

    // General specialty information
    const allSpecialties = MedicalSpecialtiesService.getSpecialties()
    const content = `**Available Medical Specialties**:\n\n` +
      allSpecialties.map(specialty => {
        const data = MedicalSpecialtiesService.getSpecialty(specialty)
        return `• **${data?.name}**: ${data?.description}`
      }).join('\n')

    return {
      type: 'general',
      content,
      data: { specialties: allSpecialties },
      suggestions: allSpecialties.slice(0, 5)
    }
  }

  private static async handleProviderLookup(input: string): Promise<AIAssistantResponse> {
    try {
      // Extract NPI number or provider name from input
      const npiMatch = input.match(/\b\d{10}\b/) // Match 10-digit NPI
      const searchTerms = this.extractSearchTerms(input)
      
      if (npiMatch) {
        // Search by NPI number
        const npi = npiMatch[0]
        const result = await MedicalAPIService.searchProviderByNPI(npi)
        
        if (result.success && result.data) {
          const provider = result.data
          return {
            type: 'provider_lookup',
            content: `**Provider Found**:\n• **Name**: ${provider.name}\n• **NPI**: ${provider.npi}\n• **Specialty**: ${provider.specialty}\n• **Address**: ${provider.address}\n• **Phone**: ${provider.phone}`,
            data: { provider },
            suggestions: [provider.npi, provider.specialty]
          }
        } else {
          return {
            type: 'provider_lookup',
            content: `No provider found with NPI ${npi}. Please verify the NPI number.`,
            suggestions: ['Check NPI format', 'Search by name instead']
          }
        }
      } else if (searchTerms.length > 0) {
        // Search by name or specialty
        const searchTerm = searchTerms[0]
        const result = await MedicalAPIService.searchProviders(searchTerm)
        
        if (result.success && result.data && result.data.length > 0) {
          const providers = result.data
          const content = providers.map(provider => 
            `• **${provider.name}** (NPI: ${provider.npi}) - ${provider.specialty}`
          ).join('\n')
          
          return {
            type: 'provider_lookup',
            content: `Found ${providers.length} provider(s) for "${searchTerm}":\n\n${content}`,
            data: { providers, searchTerm },
            suggestions: providers.slice(0, 3).map(p => p.npi)
          }
        } else {
          return {
            type: 'provider_lookup',
            content: `No providers found for "${searchTerm}". Try searching by a different name or specialty.`,
            suggestions: ['Cardiology', 'Internal Medicine', 'Family Practice']
          }
        }
      } else {
        return {
          type: 'provider_lookup',
          content: 'I can help you find provider information! Try searching by NPI number, name, or specialty.',
          suggestions: ['Search by NPI', 'Search by name', 'Search by specialty']
        }
      }
    } catch (error) {
      console.error('Provider lookup error:', error)
      return {
        type: 'provider_lookup',
        content: 'I can help you find provider information! Try searching by name, specialty, or location.',
        suggestions: ['Search by name', 'Search by specialty', 'Search by location']
      }
    }
  }

  private static handleFormHelp(input: string, context: any): AIAssistantResponse {
    const formGuidance = {
      'PatientEligibilityForm': {
        'providerId': 'Enter your 10-digit National Provider Identifier (NPI) number. This is required for all claims submissions.',
        'subscriberId': 'Enter the patient\'s member ID as it appears on their insurance card. This is typically found on the front of the card.',
        'dependantSequence': 'Enter the dependent sequence number. 00 = primary subscriber, 01 = spouse, 02+ = children in order of birth.',
        'lastName': 'Enter the patient\'s legal last name exactly as it appears on their insurance card.',
        'firstName': 'Enter the patient\'s legal first name exactly as it appears on their insurance card.',
        'dateOfBirth': 'Enter the patient\'s date of birth in MM/DD/YYYY format.'
      },
      'ClaimsSubmissionForm': {
        'serviceDateFrom': 'Enter the date when services began. This should be the first date of the service period.',
        'serviceDateTo': 'Enter the date when services ended. For single-day services, this will be the same as the from date.',
        'diagnosisCodes': 'Enter the primary diagnosis code first, followed by any secondary codes. Use the most specific code available.',
        'procedureCodes': 'Enter the procedure codes for services rendered. Include modifiers if applicable.',
        'units': 'Enter the number of units for this procedure. For most procedures, this is 1.',
        'uAndCCharge': 'Enter your usual and customary charge for this service.',
        'planAllowed': 'Enter the amount allowed by the insurance plan for this service.'
      }
    }

    if (context.currentField) {
      const formGuidanceData = formGuidance[context.currentForm as keyof typeof formGuidance]
      if (formGuidanceData && context.currentField in formGuidanceData) {
        const guidance = formGuidanceData[context.currentField as keyof typeof formGuidanceData]
        if (guidance) {
          return {
            type: 'form_guidance',
            content: `💡 **${context.currentField} Help**: ${guidance}`,
            data: { field: context.currentField, guidance }
          }
        }
      }
    }

    return {
      type: 'form_guidance',
      content: 'I can help you with form fields! What specific field are you working on? I can explain what information is needed and how to enter it correctly.',
      suggestions: ['providerId', 'subscriberId', 'diagnosisCodes', 'odSphere', 'osSphere']
    }
  }

  private static handleGeneralQuestion(input: string): AIAssistantResponse {
    if (input.includes('hello') || input.includes('hi')) {
      return {
        type: 'general',
        content: 'Hello! How can I help you with your medical billing today?',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    } else if (input.includes('thank')) {
      return {
        type: 'general',
        content: 'You\'re welcome! Is there anything else I can help you with?',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    } else {
      return {
        type: 'general',
        content: 'I\'m here to help with medical billing questions! You can ask me about:\n• Terminology (OD, OS, PCP, etc.)\n• Diagnosis codes\n• Form field guidance\n• General billing questions',
        suggestions: ['Terminology', 'Codes', 'Form Help']
      }
    }
  }

  // Simulate external API calls (in real implementation, these would be actual API calls)
  private static async simulateExternalAPICall(type: string, query: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    switch (type) {
      case 'code_lookup':
        return {
          content: `Found codes matching "${query}":\n• E11.9: Type 2 diabetes mellitus without complications\n• H35.01: Mild nonproliferative diabetic retinopathy\n• Z79.4: Long term (current) use of insulin`,
          data: {
            codes: [
              { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
              { code: 'H35.01', description: 'Mild nonproliferative diabetic retinopathy' },
              { code: 'Z79.4', description: 'Long term (current) use of insulin' }
            ]
          }
        }
      
      case 'provider_lookup':
        return {
          content: `Found providers matching "${query}":\n• Dr. Sarah Johnson (NPI: 1234567890) - Cardiology\n• Dr. Michael Chen (NPI: 2345678901) - Internal Medicine\n• Dr. Emily Rodriguez (NPI: 3456789012) - Family Practice`,
          data: {
            providers: [
              { npi: '1234567890', name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
              { npi: '2345678901', name: 'Dr. Michael Chen', specialty: 'Internal Medicine' },
              { npi: '3456789012', name: 'Dr. Emily Rodriguez', specialty: 'Family Practice' }
            ]
          }
        }
      
      default:
        throw new Error('Unknown API call type')
    }
  }

  // Get quick suggestions based on current context
  static getQuickSuggestions(context?: {
    currentForm?: string
    currentField?: string
    currentStep?: number
  }): string[] {
    if (context?.currentForm === 'PatientEligibilityForm') {
      return ['providerId', 'subscriberId', 'dependantSequence', 'lastName', 'firstName']
    } else if (context?.currentForm === 'ClaimsSubmissionForm') {
      return ['diagnosisCodes', 'odSphere', 'osSphere', 'odCylinder', 'osCylinder']
    }
    
    return ['Terminology', 'Codes', 'Form Help']
  }

  // Extract search terms from user input
  private static extractSearchTerms(input: string): string[] {
    const medicalTerms = [
      'diabetes', 'diabetic', 'retinopathy', 'eye', 'retinal', 'cataracts', 'glaucoma',
      'hypertension', 'nephropathy', 'kidney', 'heart', 'cardiac', 'pulmonary',
      'cancer', 'tumor', 'neoplasm', 'fracture', 'injury', 'trauma', 'infection',
      'bacterial', 'viral', 'fungal', 'allergy', 'asthma', 'copd', 'arthritis',
      'osteoporosis', 'depression', 'anxiety', 'stroke', 'seizure', 'migraine'
    ]
    
    const lowerInput = input.toLowerCase()
    return medicalTerms.filter(term => lowerInput.includes(term))
  }

  // Get contextual help for a specific field
  static getFieldHelp(formName: string, fieldName: string): string | null {
    const formGuidance = {
      'PatientEligibilityForm': {
        'providerId': 'Enter your 10-digit National Provider Identifier (NPI) number. This is required for all claims submissions.',
        'subscriberId': 'Enter the patient\'s member ID as it appears on their insurance card. This is typically found on the front of the card.',
        'dependantSequence': 'Enter the dependent sequence number. 00 = primary subscriber, 01 = spouse, 02+ = children in order of birth.',
        'lastName': 'Enter the patient\'s legal last name exactly as it appears on their insurance card.',
        'firstName': 'Enter the patient\'s legal first name exactly as it appears on their insurance card.',
        'dateOfBirth': 'Enter the patient\'s date of birth in MM/DD/YYYY format.'
      },
      'ClaimsSubmissionForm': {
        'serviceDateFrom': 'Enter the date when services began. This should be the first date of the service period.',
        'serviceDateTo': 'Enter the date when services ended. For single-day services, this will be the same as the from date.',
        'diagnosisCodes': 'Enter the primary diagnosis code first, followed by any secondary codes. Use the most specific code available.',
        'procedureCodes': 'Enter the procedure codes for services rendered. Include modifiers if applicable.',
        'units': 'Enter the number of units for this procedure. For most procedures, this is 1.',
        'uAndCCharge': 'Enter your usual and customary charge for this service.',
        'planAllowed': 'Enter the amount allowed by the insurance plan for this service.'
      }
    }

    const formGuidanceData = formGuidance[formName as keyof typeof formGuidance]
    if (formGuidanceData && fieldName in formGuidanceData) {
      return formGuidanceData[fieldName as keyof typeof formGuidanceData] || null
    }
    return null
  }

  // Enhanced specific code lookup with multiple code types
  private static isSpecificCodeLookup(input: string): boolean {
    const codePatterns = [
      /[A-Z]\d{2}\.\d{1,2}/, // ICD-10
      /\d{5}/, // CPT
      /[A-Z]\d{4}/, // HCPCS
      /[A-Z]\d{3}/, // Drug codes
      /\d{4}/ // Lab codes
    ]
    
    return codePatterns.some(pattern => pattern.test(input)) ||
           input.includes('icd') ||
           input.includes('cpt') ||
           input.includes('hcpcs') ||
           input.includes('drug') ||
           input.includes('lab') ||
           input.includes('code')
  }

  private static async handleSpecificCodeLookup(input: string): Promise<string> {
    // Check for specific code patterns
    const icd10Match = input.match(/[A-Z]\d{2}\.\d{1,2}/)
    const cptMatch = input.match(/\d{5}/)
    const hcpcsMatch = input.match(/[A-Z]\d{4}/)
    const drugMatch = input.match(/[A-Z]\d{3}/)
    const labMatch = input.match(/\d{4}/)

    if (icd10Match) {
      const code = icd10Match[0]
      const result = await MedicalAPIService.searchICD10Codes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that ICD-10 code! **${code}**: ${result[0].description}\n\nThis code is commonly used in medical billing and documentation. Let me know if you need any additional information about it!`
      }
    }

    if (cptMatch) {
      const code = cptMatch[0]
      const result = await MedicalAPIService.searchCPTCodes(code)
      if (result.length > 0) {
        return `I'd be delighted to help you with that CPT code! **${code}**: ${result[0].description}\n\nThis procedure code is essential for billing and documentation. Is there anything specific about this code you'd like me to clarify?`
      }
    }

    if (hcpcsMatch) {
      const code = hcpcsMatch[0]
      const result = await MedicalAPIService.searchHCPCSCodes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that HCPCS code! **${code}**: ${result[0].description}\n\nThis code is used for Medicare and other insurance billing. Let me know if you need any additional information!`
      }
    }

    if (drugMatch) {
      const code = drugMatch[0]
      const result = await MedicalAPIService.searchDrugCodes(code)
      if (result.length > 0) {
        return `I'd be delighted to help you with that drug code! **${code}**: ${result[0].description}\n\nThis code is used for medication billing and documentation. Is there anything specific about this medication you'd like me to clarify?`
      }
    }

    if (labMatch) {
      const code = labMatch[0]
      const result = await MedicalAPIService.searchLabCodes(code)
      if (result.length > 0) {
        return `I'd be happy to help you with that lab code! **${code}**: ${result[0].description}\n\nThis code is used for laboratory testing billing and documentation. Let me know if you need any additional information!`
      }
    }

    // Handle POS (Place of Service) codes
    if (input.toLowerCase().includes('pos') || input.toLowerCase().includes('place of service')) {
      const posCodes = this.LOCAL_KNOWLEDGE.posCodes
      const commonCodes = Object.entries(posCodes).slice(0, 8).map(([code, desc]) => `• **${code}** - ${desc}`).join('\n')
      
      return `Here are the most common **Place of Service (POS)** codes for optometry:\n\n${commonCodes}\n\n**Most commonly used**:\n• **11** - Office (routine eye exams)\n• **22** - Outpatient Hospital (specialized procedures)\n• **24** - Ambulatory Surgical Center (surgeries)\n\nWould you like me to explain any specific POS code or help you choose the right one for your situation?`
    }

    // Handle MOD (Modifier) codes
    if (input.toLowerCase().includes('mod') || input.toLowerCase().includes('modifier')) {
      const modCodes = this.LOCAL_KNOWLEDGE.modCodes
      const commonCodes = Object.entries(modCodes).slice(0, 8).map(([code, desc]) => `• **${code}** - ${desc}`).join('\n')
      
      return `Here are the most common **Modifier (MOD)** codes for optometry:\n\n${commonCodes}\n\n**Most commonly used**:\n• **25** - Separate E&M service (when exam + procedure same day)\n• **59** - Distinct procedural service\n• **76** - Repeat procedure by same doctor\n• **95** - Telemedicine service\n\nWould you like me to explain any specific modifier or help you choose the right one for your situation?`
    }

    // Generic code lookup response
    return `I'd be happy to help you with medical codes! I can assist with:\n\n• **ICD-10 codes** (diagnosis codes)\n• **CPT codes** (procedure codes)\n• **HCPCS codes** (Medicare/Medicaid codes)\n• **POS codes** (Place of Service)\n• **MOD codes** (Modifiers)\n• **Drug codes**\n• **Lab codes**\n\nJust ask me about any specific code or type of code you need help with!`
  }

  // Enhanced medical terminology handling
  private static isMedicalTerminology(input: string): boolean {
    const medicalTerms = ['od', 'os', 'ou', 'pcp', 'npi', 'hedis', 'icd', 'cpt', 'hcpcs', 'ehr', 'emr']
    return medicalTerms.some(term => input.includes(term))
  }

  private static async handleMedicalTerminology(input: string): Promise<string> {
    const result = await MedicalAPIService.searchMedicalTerms(input)
    if (result.length > 0) {
      const term = result[0]
      return `I'd be delighted to explain that medical term! **${term.term.toUpperCase()}**: ${term.definition}\n\nThis is a common term in medical billing and documentation. Is there anything specific about this term you'd like me to clarify further?`
    }
    return `I'd be happy to help you understand medical terminology! Try asking about terms like "OD", "OS", "PCP", "NPI", or "HEDIS" and I'll provide clear explanations.`
  }

  // Enhanced provider search
  private static isProviderSearch(input: string): boolean {
    return input.includes('provider') || input.includes('doctor') || input.includes('physician') || input.includes('npi')
  }

  private static async handleProviderSearch(input: string): Promise<string> {
    const result = await MedicalAPIService.searchProviders({ name: input })
    if (result.length > 0) {
      const provider = result[0]
      return `I'd be happy to help you find provider information! Here's what I found:\n\n**${provider.name}**\nSpecialty: ${provider.specialty}\nAddress: ${provider.address}\nPhone: ${provider.phone}\n\nWould you like me to search for more providers or get additional information about this provider?`
    }
    return `I'd be delighted to help you find provider information! Try searching by name, specialty, or location and I'll search our provider directory for you.`
  }

  // Enhanced eligibility check
  private static isEligibilityCheck(input: string): boolean {
    return input.includes('eligibility') || input.includes('insurance') || input.includes('coverage')
  }

  private static async handleEligibilityCheck(input: string): Promise<string> {
    return `I'd be happy to help you check insurance eligibility! I can verify patient insurance coverage for specific services. To check eligibility, I'll need the patient ID and insurance information. Would you like me to guide you through the eligibility verification process?`
  }

  // Enhanced claims submission
  private static isClaimsSubmission(input: string): boolean {
    return input.includes('claim') || input.includes('submit') || input.includes('billing')
  }

  private static async handleClaimsSubmission(input: string): Promise<string> {
    return `I'd be delighted to help you with claims submission! I can assist with preparing and submitting medical claims. To submit a claim, I'll need the patient information, service details, and provider information. Would you like me to guide you through the claims submission process?`
  }

  // Enhanced workflow assistance
  private static isWorkflowAssistance(input: string): boolean {
    return input.includes('workflow') || input.includes('step') || input.includes('form') || input.includes('validation')
  }

  private static async handleWorkflowAssistance(input: string, context: any): Promise<string> {
    if (context.formType) {
      const workflow = WorkflowIntegrationService.initializeWorkflow(context.formType)
      const currentStep = workflow.find(s => s.id === context.currentField)
      
      if (currentStep) {
        return `I'd be happy to help you with the ${currentStep.title} step! This step involves ${currentStep.description}. Let me know if you need help with any specific fields or validation requirements.`
      }
    }
    
    return `I'd be delighted to help you with workflow assistance! I can guide you through form steps, validation requirements, and help ensure all required information is complete. What specific aspect of the workflow would you like help with?`
  }

  // Enhanced mobile request handling
  private static isMobileRequest(input: string): boolean {
    return input.includes('mobile') || input.includes('touch') || input.includes('voice') || input.includes('offline')
  }

  private static async handleMobileRequest(input: string): Promise<string> {
    if (input.includes('voice')) {
      return `I'd be happy to help you with voice input! You can use voice commands like "next step", "open mila", "search codes", or "help" to interact with me hands-free. Just tap the microphone icon to start voice input.`
    }
    
    if (input.includes('touch')) {
      return `I'd be delighted to help you with touch gestures! You can swipe left/right to navigate between steps, swipe up to open me, or long-press on fields for additional help. These gestures make mobile form completion much easier!`
    }
    
    if (input.includes('offline')) {
      return `I'd be happy to help you with offline capabilities! I can work offline and cache essential data like medical codes and form templates. When you're back online, I'll automatically sync any changes.`
    }
    
    return `I'd be delighted to help you with mobile features! I support touch gestures, voice input, offline capabilities, and mobile-optimized interfaces. What specific mobile feature would you like to learn more about?`
  }

  // Enhanced general question handling
  private static isGeneralQuestion(input: string): boolean {
    return input.includes('what') || input.includes('how') || input.includes('why') || input.includes('when')
  }

  // Enhanced default response with predictive suggestions
  private static getEnhancedDefaultResponse(input: string, context: any): string {
    let response = `Hi there! I'm M.I.L.A., your Medical Intelligence & Learning Assistant. I'm here to help with all your medical billing questions! You can ask me about:\n\n• **Medical Terminology** (OD, OS, PCP, etc.)\n• **Diagnosis Codes** (ICD-10)\n• **Procedure Codes** (CPT, HCPCS)\n• **Drug & Lab Codes** (J-codes, 8-series)\n• **Provider Information** (NPI lookup)\n• **Insurance Eligibility** (coverage verification)\n• **Claims Submission** (billing assistance)\n• **Form Field Guidance** (contextual help)\n• **Workflow Assistance** (step-by-step guidance)\n• **Mobile Features** (touch, voice, offline)\n• **General Billing Questions**\n\nWhat would you like to know?`

    // Add context-specific suggestions
    if (context.formType && context.currentField) {
      response += `\n\n💡 **Smart Tip**: I can provide predictive suggestions based on your current form and field. Just let me know what you're working on!`
    }

    return response
  }

  // Enhanced intent recognition with confidence scoring
  private static analyzeIntent(input: string): { intent: string; confidence: number; keywords: string[] } {
    console.log('🎯 analyzeIntent called with:', input)
    const lowerInput = input.toLowerCase()
    console.log('🎯 lowerInput:', lowerInput)
    
    // Special handling for "show all" requests
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        lowerInput.includes('cpt')) {
      console.log('🎯 Intent Analysis: Detected show_all_cpt for input:', input)
      return { intent: 'show_all_cpt', confidence: 3, keywords: ['show', 'all', 'cpt'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        lowerInput.includes('icd')) {
      return { intent: 'show_all_icd10', confidence: 3, keywords: ['show', 'all', 'icd'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        lowerInput.includes('hcpcs')) {
      return { intent: 'show_all_hcpcs', confidence: 3, keywords: ['show', 'all', 'hcpcs'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        (lowerInput.includes('pos') || lowerInput.includes('place of service'))) {
      return { intent: 'show_all_pos', confidence: 3, keywords: ['show', 'all', 'pos'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        (lowerInput.includes('modifier') || lowerInput.includes('mod'))) {
      return { intent: 'show_all_modifiers', confidence: 3, keywords: ['show', 'all', 'modifiers'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        lowerInput.includes('drug')) {
      console.log('🎯 Intent Analysis: Detected show_all_drugs for input:', input)
      return { intent: 'show_all_drugs', confidence: 3, keywords: ['show', 'all', 'drug'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        lowerInput.includes('lab')) {
      return { intent: 'show_all_lab', confidence: 3, keywords: ['show', 'all', 'lab'] }
    }
    
    if ((lowerInput.includes('show') || lowerInput.includes('list')) && 
        (lowerInput.includes('all') || lowerInput.includes('every')) && 
        (lowerInput.includes('codes') || lowerInput.includes('icd'))) {
      return { intent: 'show_all_codes', confidence: 3, keywords: ['show', 'all', 'codes'] }
    }
    
    const intents = [
      { name: 'code_lookup', keywords: ['code', 'icd', 'cpt', 'hcpcs', 'diagnosis', 'procedure'], confidence: 0 },
      { name: 'terminology', keywords: ['what is', 'define', 'meaning', 'term', 'abbreviation'], confidence: 0 },
      { name: 'provider_search', keywords: ['provider', 'doctor', 'physician', 'npi', 'find'], confidence: 0 },
      { name: 'eligibility', keywords: ['eligibility', 'insurance', 'coverage', 'benefits'], confidence: 0 },
      { name: 'claims', keywords: ['claim', 'submit', 'billing', 'reimbursement'], confidence: 0 },
      { name: 'workflow', keywords: ['workflow', 'step', 'form', 'process', 'guidance'], confidence: 0 },
      { name: 'mobile', keywords: ['mobile', 'touch', 'voice', 'offline'], confidence: 0 },
      { name: 'general', keywords: ['what', 'how', 'why', 'when', 'help'], confidence: 0 }
    ]

    // Calculate confidence scores
    intents.forEach(intent => {
      intent.confidence = intent.keywords.reduce((score, keyword) => {
        if (lowerInput.includes(keyword)) {
          // Exact matches get higher scores
          if (lowerInput.includes(` ${keyword} `) || lowerInput.startsWith(keyword) || lowerInput.endsWith(keyword)) {
            return score + 2
          }
          return score + 1
        }
        return score
      }, 0)
    })

    // Find the highest confidence intent
    const bestIntent = intents.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )

    // Extract relevant keywords
    const keywords = bestIntent.keywords.filter(keyword => lowerInput.includes(keyword))

    return {
      intent: bestIntent.name,
      confidence: bestIntent.confidence,
      keywords
    }
  }

  // Advanced semantic analysis for better intent recognition
  private static analyzeSemanticContext(input: string, context: any): { semanticIntent: string; confidence: number; entities: string[] } {
    const lowerInput = input.toLowerCase()
    const entities: string[] = []
    
    // Extract medical entities
    const medicalTerms = ['diabetes', 'hypertension', 'cataract', 'glaucoma', 'macular degeneration', 'retinal detachment']
    const codes = ['e11.9', 'i10', 'h25.9', 'h40.9', 'h35.3', 'h33.2']
    const procedures = ['eye exam', 'dilation', 'fundus photography', 'tonometry', 'visual field']
    
    // Check for medical entities
    medicalTerms.forEach(term => {
      if (lowerInput.includes(term)) entities.push(term)
    })
    
    codes.forEach(code => {
      if (lowerInput.includes(code)) entities.push(code)
    })
    
    procedures.forEach(proc => {
      if (lowerInput.includes(proc)) entities.push(proc)
    })
    
    // Determine semantic intent based on entities and context
    let semanticIntent = 'general'
    let confidence = 0
    
    if (entities.length > 0) {
      if (entities.some(e => codes.includes(e))) {
        semanticIntent = 'code_specific'
        confidence = 3
      } else if (entities.some(e => medicalTerms.includes(e))) {
        semanticIntent = 'condition_specific'
        confidence = 2
      } else if (entities.some(e => procedures.includes(e))) {
        semanticIntent = 'procedure_specific'
        confidence = 2
      }
    }
    
    return { semanticIntent, confidence, entities }
  }

  // Dynamic response generation based on user behavior patterns
  private static generateDynamicResponse(input: string, context: any, semanticAnalysis: any): string {
    const { semanticIntent, entities } = semanticAnalysis
    
    // User behavior pattern analysis
    const userPatterns = this.analyzeUserPatterns(context)
    
    // Generate response based on semantic intent and user patterns
    switch (semanticIntent) {
      case 'code_specific':
        return this.generateCodeSpecificResponse(entities, userPatterns, context)
      case 'condition_specific':
        return this.generateConditionSpecificResponse(entities, userPatterns, context)
      case 'procedure_specific':
        return this.generateProcedureSpecificResponse(entities, userPatterns, context)
      default:
        return this.generatePatternBasedResponse(input, userPatterns, context)
    }
  }

  private static analyzeUserPatterns(context: any): any {
    const patterns = {
      formUsage: this.getFormUsagePattern(context),
      fieldFocus: this.getFieldFocusPattern(context),
      timeOfDay: this.getTimeOfDayPattern(),
      interactionFrequency: this.getInteractionFrequency(context)
    }
    
    return patterns
  }

  private static getFormUsagePattern(context: any): string {
    if (!context.formType) return 'unknown'
    
    const formPrefs = this.userPreferences.get(context.formType)
    if (formPrefs && formPrefs.interactionCount > 5) {
      return 'frequent_user'
    } else if (formPrefs && formPrefs.interactionCount > 2) {
      return 'moderate_user'
    } else {
      return 'new_user'
    }
  }

  private static getFieldFocusPattern(context: any): string {
    if (!context.currentField) return 'unknown'
    
    const fieldInteractions = this.conversationMemory
      .filter(memory => memory.context.currentField === context.currentField)
      .length
    
    if (fieldInteractions > 3) return 'field_expert'
    if (fieldInteractions > 1) return 'field_familiar'
    return 'field_new'
  }

  private static getTimeOfDayPattern(): string {
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 11) return 'morning_peak'
    if (hour >= 13 && hour <= 15) return 'afternoon_peak'
    if (hour >= 16 && hour <= 18) return 'evening_peak'
    return 'off_peak'
  }

  private static getInteractionFrequency(context: any): string {
    const recentInteractions = this.conversationMemory
      .filter(memory => 
        memory.timestamp > new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
      ).length
    
    if (recentInteractions > 5) return 'high_frequency'
    if (recentInteractions > 2) return 'moderate_frequency'
    return 'low_frequency'
  }

  private static generateCodeSpecificResponse(entities: string[], patterns: any, context: any): string {
    const codes = entities.filter(e => /^[a-z]\d+\.\d+$/i.test(e))
    
    if (codes.length > 0) {
      const code = codes[0].toUpperCase()
      return `I found the **${code}** code you're asking about. This is a commonly used diagnosis code in medical billing. Here's what you need to know:\n\n**Code Details:**\n• **${code}** - ${this.getCodeDescription(code)}\n• **Category:** ${this.getCodeCategory(code)}\n• **Usage:** ${this.getCodeUsage(code)}\n\n**Billing Context:** This code is frequently used in ${context.formType || 'medical billing'} and is essential for proper claim processing.`
    }
    
    return this.generateFallbackCodeResponse(entities, patterns, context)
  }

  private static generateConditionSpecificResponse(entities: string[], patterns: any, context: any): string {
    const conditions = entities.filter(e => ['diabetes', 'hypertension', 'cataract', 'glaucoma'].includes(e))
    
    if (conditions.length > 0) {
      const condition = conditions[0]
      return `I understand you're asking about **${condition}**. This is a common condition in medical billing with specific coding requirements:\n\n**Condition:** ${condition}\n**Primary Codes:** ${this.getConditionCodes(condition)}\n**HEDIS Impact:** ${this.getHEDISImpact(condition)}\n**Billing Considerations:** ${this.getBillingConsiderations(condition)}\n\nWould you like specific codes for ${condition} or help with related billing procedures?`
    }
    
    return this.generateFallbackConditionResponse(entities, patterns, context)
  }

  private static generateProcedureSpecificResponse(entities: string[], patterns: any, context: any): string {
    const procedures = entities.filter(e => ['eye exam', 'dilation', 'fundus photography'].includes(e))
    
    if (procedures.length > 0) {
      const procedure = procedures[0]
      return `I can help you with **${procedure}** billing. This procedure has specific coding and documentation requirements:\n\n**Procedure:** ${procedure}\n**Common CPT Codes:** ${this.getProcedureCodes(procedure)}\n**Documentation Requirements:** ${this.getDocumentationRequirements(procedure)}\n**Billing Tips:** ${this.getBillingTips(procedure)}\n\nWhat specific aspect of ${procedure} billing do you need help with?`
    }
    
    return this.generateFallbackProcedureResponse(entities, patterns, context)
  }

  private static generatePatternBasedResponse(input: string, patterns: any, context: any): string {
    // Generate response based on user patterns
    if (patterns.formUsage === 'frequent_user') {
      return `I notice you're a frequent user of ${context.formType || 'our forms'}. Let me provide you with advanced tips and shortcuts:\n\n**Pro Tips for Frequent Users:**\n• Use keyboard shortcuts for faster navigation\n• Save common codes as favorites\n• Enable auto-complete for frequently used fields\n\nWhat specific area would you like to optimize?`
    }
    
    if (patterns.fieldFocus === 'field_expert') {
      return `You seem very familiar with the ${context.currentField} field. Here are some advanced features you might not know about:\n\n**Advanced ${context.currentField} Features:**\n• Bulk import capabilities\n• Validation rules customization\n• Integration with external databases\n\nWould you like to explore these advanced features?`
    }
    
    if (patterns.interactionFrequency === 'high_frequency') {
      return `I see you're working intensively on forms right now. Here are some efficiency tips:\n\n**Efficiency Tips:**\n• Use tab navigation for faster field switching\n• Enable auto-save to prevent data loss\n• Use the bulk operations feature for multiple entries\n\nHow can I help you work more efficiently?`
    }
    
    return this.getEnhancedDefaultResponse(input, context)
  }

  // Helper methods for code and condition information
  private static getCodeDescription(code: string): string {
    const descriptions: { [key: string]: string } = {
      'E11.9': 'Type 2 diabetes mellitus without complications',
      'I10': 'Essential (primary) hypertension',
      'H25.9': 'Age-related cataract, unspecified',
      'H40.9': 'Glaucoma, unspecified',
      'H35.3': 'Macular degeneration',
      'H33.2': 'Retinal detachment'
    }
    return descriptions[code] || 'Medical diagnosis code'
  }

  private static getCodeCategory(code: string): string {
    if (code.startsWith('E')) return 'Endocrine, nutritional and metabolic diseases'
    if (code.startsWith('I')) return 'Diseases of the circulatory system'
    if (code.startsWith('H')) return 'Diseases of the eye and adnexa'
    return 'Medical diagnosis'
  }

  private static getCodeUsage(code: string): string {
    if (code.startsWith('E11')) return 'Diabetes care and HEDIS measures'
    if (code.startsWith('I10')) return 'Cardiovascular care and quality measures'
    if (code.startsWith('H25')) return 'Ophthalmology and cataract care'
    return 'General medical billing'
  }

  private static getConditionCodes(condition: string): string {
    const codes: { [key: string]: string } = {
      'diabetes': 'E11.9, E11.21, E11.22, Z79.4, Z79.84',
      'hypertension': 'I10, I11.9, I12.9, Z79.4',
      'cataract': 'H25.9, 66984, 66985, 66986',
      'glaucoma': 'H40.9, 92285, 92286, 92287'
    }
    return codes[condition] || 'Varies by specific condition'
  }

  private static getHEDISImpact(condition: string): string {
    const impacts: { [key: string]: string } = {
      'diabetes': 'Diabetes care measures (HbA1c, eye exam, foot exam)',
      'hypertension': 'Cardiovascular care measures (BP control)',
      'cataract': 'Preventive care and quality measures',
      'glaucoma': 'Specialty care and monitoring measures'
    }
    return impacts[condition] || 'Quality measure impact varies'
  }

  private static getBillingConsiderations(condition: string): string {
    const considerations: { [key: string]: string } = {
      'diabetes': 'Requires regular monitoring codes, preventive care codes, and medication management',
      'hypertension': 'Includes monitoring codes, medication management, and cardiovascular risk assessment',
      'cataract': 'Surgical codes, pre-op evaluation, and post-op care codes',
      'glaucoma': 'Specialty evaluation codes, monitoring codes, and treatment codes'
    }
    return considerations[condition] || 'Standard medical billing procedures apply'
  }

  private static getProcedureCodes(procedure: string): string {
    const codes: { [key: string]: string } = {
      'eye exam': '92310, 92285, 92250, 92227',
      'dilation': '92285, 92286, 92287',
      'fundus photography': '92250, 92227, 92228'
    }
    return codes[procedure] || 'Varies by specific procedure'
  }

  private static getDocumentationRequirements(procedure: string): string {
    const requirements: { [key: string]: string } = {
      'eye exam': 'Comprehensive exam documentation, medical necessity, and diagnosis codes',
      'dilation': 'Medical necessity documentation, patient consent, and follow-up plan',
      'fundus photography': 'Medical necessity, image documentation, and interpretation report'
    }
    return requirements[procedure] || 'Standard medical documentation requirements'
  }

  private static getBillingTips(procedure: string): string {
    const tips: { [key: string]: string } = {
      'eye exam': 'Use appropriate evaluation codes, document medical necessity, and include diagnosis codes',
      'dilation': 'Document medical necessity, use correct modifiers, and ensure proper coding',
      'fundus photography': 'Use imaging codes with interpretation, document medical necessity, and include diagnosis'
    }
    return tips[procedure] || 'Follow standard medical billing best practices'
  }

  // Fallback response generators
  private static generateFallbackCodeResponse(entities: string[], patterns: any, context: any): string {
    return `I can help you find specific medical codes. Based on your context, here are some relevant code categories:\n\n**Common Code Types:**\n• **ICD-10 Diagnosis Codes** - For patient conditions\n• **CPT Procedure Codes** - For medical services\n• **HCPCS Codes** - For supplies and equipment\n\nWhat specific type of code are you looking for?`
  }

  private static generateFallbackConditionResponse(entities: string[], patterns: any, context: any): string {
    return `I can help you with condition-specific billing and coding. Common conditions include:\n\n**Frequent Conditions:**\n• **Diabetes** - E11.9, E11.21, E11.22\n• **Hypertension** - I10, I11.9, I12.9\n• **Cataracts** - H25.9, 66984, 66985\n• **Glaucoma** - H40.9, 92285, 92286\n\nWhat specific condition are you working with?`
  }

  private static generateFallbackProcedureResponse(entities: string[], patterns: any, context: any): string {
    return `I can help you with procedure-specific billing. Common procedures include:\n\n**Frequent Procedures:**\n• **Eye Exams** - 92310, 92285, 92250\n• **Dilation** - 92285, 92286, 92287\n• **Fundus Photography** - 92250, 92227, 92228\n\nWhat specific procedure are you billing for?`
  }

  // Enhanced learning and conversation memory
  private static conversationMemory: Array<{
    userInput: string
    response: string
    context: any
    timestamp: Date
    success: boolean
  }> = []

  private static userPreferences: Map<string, any> = new Map()

  // Learn from user interactions
  private static learnFromInteraction(userInput: string, response: string, context: any, success: boolean) {
    this.conversationMemory.push({
      userInput,
      response,
      context,
      timestamp: new Date(),
      success
    })

    // Keep only last 50 interactions to prevent memory bloat
    if (this.conversationMemory.length > 50) {
      this.conversationMemory = this.conversationMemory.slice(-50)
    }

    // Learn user preferences
    if (context.formType) {
      const formPrefs = this.userPreferences.get(context.formType) || {}
      formPrefs.lastUsed = new Date()
      formPrefs.interactionCount = (formPrefs.interactionCount || 0) + 1
      this.userPreferences.set(context.formType, formPrefs)
    }
  }

  // Get personalized suggestions based on user history
  private static getPersonalizedSuggestions(context: any): string[] {
    const suggestions: string[] = []

    // Based on form type preferences
    if (context.formType) {
      const formPrefs = this.userPreferences.get(context.formType)
      if (formPrefs && formPrefs.interactionCount > 3) {
        suggestions.push(`I notice you use ${context.formType} forms frequently. I can help with common issues in this form type.`)
      }
    }

    // Based on recent successful interactions
    const recentSuccessful = this.conversationMemory
      .filter(memory => memory.success && memory.context.formType === context.formType)
      .slice(-3)

    if (recentSuccessful.length > 0) {
      const commonPatterns = this.analyzeCommonPatterns(recentSuccessful)
      suggestions.push(...commonPatterns)
    }

    return suggestions
  }

  private static analyzeCommonPatterns(memories: any[]): string[] {
    const patterns: string[] = []
    const keywords = new Map<string, number>()

    memories.forEach(memory => {
      const words = memory.userInput.toLowerCase().split(' ')
      words.forEach(word => {
        if (word.length > 3) {
          keywords.set(word, (keywords.get(word) || 0) + 1)
        }
      })
    })

    const topKeywords = Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)

    if (topKeywords.length > 0) {
      patterns.push(`You often ask about: ${topKeywords.join(', ')}`)
    }

    return patterns
  }

  // Enhanced response with learning
  private static async getAgileResponseWithLearning(input: string, context: any): Promise<string> {
    const intent = this.analyzeIntent(input)
    let response: string

    // Get response using agile system
    response = await this.getAgileResponse(input, context)

    // Learn from this interaction
    const success = !this.isGenericResponse(response)
    this.learnFromInteraction(input, response, context, success)

    // Add personalized suggestions if available
    const personalizedSuggestions = this.getPersonalizedSuggestions(context)
    if (personalizedSuggestions.length > 0 && success) {
      response += '\n\n💡 **Personalized Tip**: ' + personalizedSuggestions[0]
    }

    return response
  }

  // Enhanced response with multiple fallback strategies
  private static async getAgileResponse(input: string, context: any): Promise<string> {
    const intent = this.analyzeIntent(input)
    
    // Try semantic analysis first (most specific)
    const semanticAnalysis = this.analyzeSemanticContext(input, context)
    if (semanticAnalysis.confidence > 0) {
      const dynamicResponse = this.generateDynamicResponse(input, context, semanticAnalysis)
      if (dynamicResponse && !this.isGenericResponse(dynamicResponse)) {
        return dynamicResponse
      }
    }
    
    // Try contextual response second
    const contextualResponse = this.generateContextualResponse(input, context, intent)
    if (contextualResponse && !this.isGenericResponse(contextualResponse)) {
      return contextualResponse
    }
    
    // High confidence responses
    if (intent.confidence >= 2) {
      switch (intent.intent) {
        case 'show_all_cpt':
          return this.handleShowAllCPTCodes(input)
        case 'show_all_icd10':
          return this.handleShowAllICD10Codes(input)
        case 'show_all_hcpcs':
          return this.handleShowAllHCPCSCodes(input)
        case 'show_all_pos':
          return this.handleShowAllPOSCodes()
        case 'show_all_modifiers':
          return this.handleShowAllModifierCodes()
        case 'show_all_drugs':
          return this.handleShowAllDrugCodes()
        case 'show_all_lab':
          return this.handleShowAllLabCodes()
        case 'show_all_codes':
          return this.handleShowAllCodes(input)
        case 'code_lookup':
          return await this.handleSpecificCodeLookup(input)
        case 'terminology':
          return await this.handleMedicalTerminology(input)
        case 'provider_search':
          return await this.handleProviderSearch(input)
        case 'eligibility':
          return await this.handleEligibilityCheck(input)
        case 'claims':
          return await this.handleClaimsSubmission(input)
        case 'workflow':
          return await this.handleWorkflowAssistance(input, context)
        case 'mobile':
          return await this.handleMobileRequest(input)
        default:
          return await this.handleGeneralQuestion(input)
      }
    }

    // Medium confidence - try primary intent first, then fallbacks
    if (intent.confidence >= 1) {
      try {
        const primaryResponse = await this.tryPrimaryIntent(intent.intent, input, context)
        if (primaryResponse && !this.isGenericResponse(primaryResponse)) {
          return primaryResponse
        }
      } catch (error) {
        // Continue to fallback strategies
      }
    }

    // Low confidence - use multiple fallback strategies
    return await this.tryMultipleStrategies(input, context, intent.keywords)
  }

  private static async tryPrimaryIntent(intent: string, input: string, context: any): Promise<string | null> {
    try {
      switch (intent) {
        case 'code_lookup':
          return await this.handleSpecificCodeLookup(input)
        case 'terminology':
          return await this.handleMedicalTerminology(input)
        case 'provider_search':
          return await this.handleProviderSearch(input)
        case 'eligibility':
          return await this.handleEligibilityCheck(input)
        case 'claims':
          return await this.handleClaimsSubmission(input)
        case 'workflow':
          return await this.handleWorkflowAssistance(input, context)
        case 'mobile':
          return await this.handleMobileRequest(input)
        default:
          return await this.handleGeneralQuestion(input)
      }
    } catch (error) {
      return null
    }
  }

  private static async tryMultipleStrategies(input: string, context: any, keywords: string[]): Promise<string> {
    const strategies = [
      () => this.handleSpecificCodeLookup(input),
      () => this.handleMedicalTerminology(input),
      () => this.handleProviderSearch(input),
      () => this.handleEligibilityCheck(input),
      () => this.handleClaimsSubmission(input),
      () => this.handleWorkflowAssistance(input, context),
      () => this.handleMobileRequest(input),
      () => this.handleGeneralQuestion(input)
    ]

    // Try each strategy until we get a non-generic response
    for (const strategy of strategies) {
      try {
        const response = await strategy()
        if (response && !this.isGenericResponse(response)) {
          return response
        }
      } catch (error) {
        continue
      }
    }

    // If all strategies fail, provide contextual help
    return this.getContextualHelp(input, context, keywords)
  }

  private static isGenericResponse(response: string): boolean {
    const genericPhrases = [
      "I'd be happy to help",
      "I'd be delighted to help",
      "I can assist with",
      "What would you like to know",
      "How can I help"
    ]
    return genericPhrases.some(phrase => response.toLowerCase().includes(phrase.toLowerCase()))
  }

  private static getContextualHelp(input: string, context: any, keywords: string[]): string {
    let help = "I understand you're asking about medical billing. Let me help you more specifically:\n\n"

    // Add context-specific suggestions
    if (context.formType) {
      help += `**Current Form**: ${context.formType}\n`
      if (context.currentField) {
        help += `**Current Field**: ${context.currentField}\n`
      }
      help += "\n"
    }

    // Add keyword-based suggestions
    if (keywords.length > 0) {
      help += `**Based on your keywords**: ${keywords.join(', ')}\n\n`
    }

    help += "**I can help with**:\n"
    help += "• **Codes**: Ask about specific ICD-10, CPT, or HCPCS codes\n"
    help += "• **Terminology**: Ask 'What is [term]?' for definitions\n"
    help += "• **Providers**: Search for doctors by name or specialty\n"
    help += "• **Eligibility**: Check insurance coverage\n"
    help += "• **Claims**: Help with billing and submission\n"
    help += "• **Workflow**: Step-by-step form guidance\n"
    help += "• **Mobile**: Touch, voice, and offline features\n\n"

    help += "**Try asking**:\n"
    help += "• 'What is the code for diabetes?'\n"
    help += "• 'Define PCP'\n"
    help += "• 'Find a cardiologist'\n"
    help += "• 'Help with step 3'\n"

    return help
  }

  // Enhanced context-aware response generation
  private static generateContextualResponse(input: string, context: any, intent: any): string {
    const lowerInput = input.toLowerCase()
    
    // Form-specific contextual responses
    if (context.formType) {
      const formResponses = this.getFormSpecificResponses(context.formType, context.currentField, lowerInput)
      if (formResponses) return formResponses
    }

    // Field-specific contextual responses
    if (context.currentField) {
      const fieldResponses = this.getFieldSpecificResponses(context.currentField, lowerInput, context)
      if (fieldResponses) return fieldResponses
    }

    // Step-specific contextual responses
    if (context.currentStep) {
      const stepResponses = this.getStepSpecificResponses(context.currentStep, lowerInput, context)
      if (stepResponses) return stepResponses
    }

    // Intent-specific enhanced responses
    return this.getIntentSpecificResponse(intent, lowerInput, context)
  }

  private static getFormSpecificResponses(formType: string, currentField: string, input: string): string | null {
    const formResponses = {
      'claims_submission': {
        'providerId': `For the **Provider ID** field, you'll need the National Provider Identifier (NPI) of the healthcare provider. This is a unique 10-digit identification number. You can find this on the provider's business card, billing statements, or by searching our provider directory.`,
        'subscriberId': `The **Subscriber ID** is the member's insurance identification number. This is typically found on the patient's insurance card. It's usually a combination of letters and numbers, and may be called "Member ID" or "Policy Number" on some cards.`,
        'serviceDateFrom': `The **Service Date From** should be the date when the medical service was first provided. For ongoing treatments, use the date of the first service in the series.`,
        'diagnosisCodes': `**Diagnosis Codes** (ICD-10) describe the patient's condition or reason for the visit. The primary diagnosis should be listed first. Common codes include E11.9 for diabetes, Z00.00 for routine checkup, and Z51.11 for chemotherapy.`
      },
      'patient_eligibility': {
        'memberId': `The **Member ID** is the unique identifier assigned by the insurance company. This can be found on the patient's insurance card, often labeled as "Member ID," "Subscriber ID," or "Policy Number."`,
        'dateOfBirth': `Enter the patient's **Date of Birth** in MM/DD/YYYY format. This is used to verify eligibility and ensure proper claim processing.`,
        'effectiveDate': `The **Effective Date** is when the insurance coverage began. This is important for determining if services are covered under the current policy.`
      },
      'hedis_screening': {
        'screeningType': `**Screening Type** determines which HEDIS measures to track. Common types include diabetes care, cardiovascular disease, and preventive care measures.`,
        'measurementYear': `The **Measurement Year** is the calendar year for which HEDIS data is being collected. This affects which version of HEDIS specifications to use.`
      }
    }

    const formData = formResponses[formType as keyof typeof formResponses]
    if (formData && currentField && formData[currentField as keyof typeof formData]) {
      return formData[currentField as keyof typeof formData] as string
    }

    return null
  }

  private static getFieldSpecificResponses(fieldName: string, input: string, context: any): string | null {
    const fieldResponses = {
      'diagnosisCodes': this.getDiagnosisCodeResponse(input, context),
      'procedureCodes': this.getProcedureCodeResponse(input, context),
      'providerId': this.getProviderIdResponse(input, context),
      'subscriberId': this.getSubscriberIdResponse(input, context),
      'dateOfBirth': this.getDateOfBirthResponse(input, context),
      'serviceDateFrom': this.getServiceDateResponse(input, context),
      'serviceDateTo': this.getServiceDateResponse(input, context)
    }

    return fieldResponses[fieldName as keyof typeof fieldResponses] || null
  }

  private static getDiagnosisCodeResponse(input: string, context: any): string {
    if (input.includes('diabetes')) {
      return `For **diabetes-related diagnosis codes**, here are the most common ICD-10 codes:\n\n**Primary Codes:**\n• **E11.9** - Type 2 diabetes without complications (most common)\n• **E11.21** - Type 2 diabetes with diabetic nephropathy\n• **E11.22** - Type 2 diabetes with diabetic chronic kidney disease\n\n**Secondary Codes:**\n• **Z79.4** - Long-term use of insulin\n• **Z79.84** - Long-term use of oral hypoglycemic drugs\n• **Z00.00** - Encounter for general adult medical examination\n\n**HEDIS Impact:** These codes are essential for diabetes care measures and quality reporting.`
    }
    
    if (input.includes('hypertension') || input.includes('high blood pressure')) {
      return `For **hypertension diagnosis codes**, use these common ICD-10 codes:\n\n**Primary Codes:**\n• **I10** - Essential (primary) hypertension\n• **I11.9** - Hypertensive heart disease without heart failure\n• **I12.9** - Hypertensive chronic kidney disease\n\n**Secondary Codes:**\n• **Z79.4** - Long-term drug therapy for hypertension\n• **Z00.00** - Preventive care encounter\n\n**Quality Impact:** These codes support cardiovascular HEDIS measures and quality reporting.`
    }

    return null
  }

  private static getProcedureCodeResponse(input: string, context: any): string {
    if (input.includes('eye') || input.includes('vision') || input.includes('ophthalmology')) {
      return `For **ophthalmology procedure codes**, here are common CPT codes:\n\n• **92310** - Prescription of optical and physical characteristics of contact lens\n• **92285** - External ocular photography with interpretation\n• **92250** - Fundus photography with interpretation\n• **92227** - Remote imaging for detection of retinal disease\n• **92228** - Remote imaging for monitoring of retinal disease\n\nThese codes are frequently used for routine eye exams and specialized procedures.`
    }

    return null
  }

  private static getProviderIdResponse(input: string, context: any): string {
    return `The **Provider ID** field requires a valid National Provider Identifier (NPI). This is a unique 10-digit number assigned to healthcare providers by CMS. You can:\n\n• Find it on the provider's business card or billing statements\n• Search our provider directory by name or specialty\n• Look it up on the NPPES website\n\nNPIs are required for all healthcare claims and cannot be left blank.`
  }

  private static getSubscriberIdResponse(input: string, context: any): string {
    return `The **Subscriber ID** is the member's insurance identification number. This information is found on the patient's insurance card and may be labeled as:\n\n• Member ID\n• Policy Number\n• Subscriber Number\n• Member Number\n\nThis field is required for claim processing and eligibility verification.`
  }

  private static getDateOfBirthResponse(input: string, context: any): string {
    return `Enter the patient's **Date of Birth** in MM/DD/YYYY format (e.g., 01/15/1985). This information is used for:\n\n• Patient identification and verification\n• Age-specific benefit determinations\n• HEDIS measure calculations\n• Eligibility verification\n\nEnsure the date is accurate as it affects claim processing and coverage determinations.`
  }

  private static getServiceDateResponse(input: string, context: any): string {
    return `The **Service Date** should be the actual date when the medical service was provided. This is critical for:\n\n• Claim processing and reimbursement\n• Eligibility verification at time of service\n• HEDIS measure calculations\n• Audit compliance\n\nUse the date when the patient received the service, not when the claim is being submitted.`
  }

  private static getStepSpecificResponses(step: number, input: string, context: any): string | null {
    const stepResponses = {
      1: `You're on **Step 1** - Provider & Patient Information. This step collects essential identification data including provider NPI, subscriber information, and patient demographics. All fields marked with * are required for claim processing.`,
      2: `You're on **Step 2** - Claim Details. This step captures service dates, diagnosis codes, and claim-specific information. The diagnosis codes determine medical necessity and affect reimbursement rates.`,
      3: `You're on **Step 3** - Prescription Details. This step records optical prescription information including sphere, cylinder, axis, and prism values. This data is essential for optical claims.`,
      4: `You're on **Step 4** - Lens Choice. This step documents the specific lens materials, coatings, and features selected. These choices affect claim amounts and patient responsibility.`,
      5: `You're on **Step 5** - Insurance Information. This step verifies coverage details, copays, and benefit information. This data determines patient responsibility and claim approval.`,
      6: `You're on **Step 6** - Review & Submit. This final step allows you to review all information before submission. Ensure all required fields are complete and accurate.`
    }

    return stepResponses[step as keyof typeof stepResponses] || null
  }

  private static getIntentSpecificResponse(intent: any, input: string, context: any): string {
    switch (intent.intent) {
      case 'code_lookup':
        return this.getEnhancedCodeLookupResponse(input, context)
      case 'terminology':
        return this.getEnhancedTerminologyResponse(input, context)
      case 'provider_search':
        return this.getEnhancedProviderResponse(input, context)
      case 'eligibility':
        return this.getEnhancedEligibilityResponse(input, context)
      case 'claims':
        return this.getEnhancedClaimsResponse(input, context)
      case 'workflow':
        return this.getEnhancedWorkflowResponse(input, context)
      default:
        return this.getEnhancedGeneralResponse(input, context)
    }
  }

  private static getEnhancedCodeLookupResponse(input: string, context: any): string {
    if (input.includes('diabetes')) {
      return `Here are the most relevant **diabetes diagnosis codes** for medical billing:\n\n**Primary Codes:**\n• **E11.9** - Type 2 diabetes without complications (most common)\n• **E11.21** - Type 2 diabetes with diabetic nephropathy\n• **E11.22** - Type 2 diabetes with diabetic chronic kidney disease\n\n**Secondary Codes:**\n• **Z79.4** - Long-term use of insulin\n• **Z79.84** - Long-term use of oral hypoglycemic drugs\n• **Z00.00** - Encounter for general adult medical examination\n\n**HEDIS Impact:** These codes are essential for diabetes care measures and quality reporting.`
    }

    if (input.includes('hypertension')) {
      return `Here are the key **hypertension diagnosis codes** for cardiovascular measures:\n\n**Primary Codes:**\n• **I10** - Essential (primary) hypertension\n• **I11.9** - Hypertensive heart disease without heart failure\n• **I12.9** - Hypertensive chronic kidney disease\n\n**Secondary Codes:**\n• **Z79.4** - Long-term drug therapy for hypertension\n• **Z00.00** - Preventive care encounter\n\n**Quality Impact:** These codes support cardiovascular HEDIS measures and quality reporting.`
    }

    return `I can help you find specific medical codes. Try asking about:\n\n• "Diabetes diagnosis codes"\n• "Hypertension codes"\n• "Eye exam procedure codes"\n• "Preventive care codes"\n\nI'll provide the most relevant codes with their descriptions and usage context.`
  }

  private static getEnhancedTerminologyResponse(input: string, context: any): string {
    const terminologyMap = {
      'od': '**OD** stands for "Oculus Dexter" - the right eye. This is used in optical prescriptions and medical documentation.',
      'os': '**OS** stands for "Oculus Sinister" - the left eye. This is used in optical prescriptions and medical documentation.',
      'ou': '**OU** stands for "Oculus Uterque" - both eyes. This is used when the same prescription applies to both eyes.',
      'pcp': '**PCP** stands for "Primary Care Physician" - the main doctor responsible for coordinating a patient\'s healthcare.',
      'npi': '**NPI** stands for "National Provider Identifier" - a unique 10-digit number assigned to healthcare providers by CMS.',
      'hedis': '**HEDIS** stands for "Healthcare Effectiveness Data and Information Set" - quality measures used by health plans to assess performance.',
      'cpt': '**CPT** stands for "Current Procedural Terminology" - standardized codes for medical procedures and services.',
      'icd': '**ICD** stands for "International Classification of Diseases" - standardized codes for diagnoses and conditions.'
    }

    for (const [term, definition] of Object.entries(terminologyMap)) {
      if (input.includes(term)) {
        return definition
      }
    }

    return `I can explain medical terminology and abbreviations. Try asking about:\n\n• "What is OD/OS?"\n• "Define PCP"\n• "What does NPI mean?"\n• "Explain HEDIS"\n\nI'll provide clear definitions with context for medical billing.`
  }

  private static getEnhancedProviderResponse(input: string, context: any): string {
    return `I can help you find provider information. You can search by:\n\n• **Name** - Enter the provider's full name\n• **Specialty** - Search by medical specialty (e.g., cardiology, ophthalmology)\n• **Location** - Search by city or zip code\n• **NPI** - Search by National Provider Identifier\n\nI'll provide contact information, specialties, and practice details. What type of provider are you looking for?`
  }

  private static getEnhancedEligibilityResponse(input: string, context: any): string {
    return `I can help you check insurance eligibility. To verify coverage, I'll need:\n\n• **Member ID** - From the patient's insurance card\n• **Date of Birth** - Patient's birth date\n• **Service Date** - When the service will be provided\n• **Service Type** - Type of medical service\n\nI'll check coverage, copays, deductibles, and benefit information. Would you like to start an eligibility check?`
  }

  private static getEnhancedClaimsResponse(input: string, context: any): string {
    return `I can help you with claims submission. The process includes:\n\n• **Provider Information** - NPI and practice details\n• **Patient Information** - Demographics and insurance\n• **Service Details** - Dates, procedures, and diagnoses\n• **Billing Information** - Charges and payment details\n\nI'll guide you through each step and help ensure all required information is complete. What specific aspect of claims submission do you need help with?`
  }

  private static getEnhancedWorkflowResponse(input: string, context: any): string {
    if (context.formType) {
      return `I can help you with the ${context.formType} workflow. Each form has specific steps and requirements:\n\n• **Step-by-step guidance** for each form section\n• **Field validation** to ensure completeness\n• **Required vs optional** field identification\n• **Error resolution** for common issues\n\nWhat specific step or field are you working on?`
    }

    return `I can help you with form workflows and processes. I provide:\n\n• **Step-by-step guidance** for form completion\n• **Field-specific help** and validation\n• **Error resolution** for common issues\n• **Best practices** for efficient form completion\n\nWhat form or process are you working with?`
  }

  private static getEnhancedGeneralResponse(input: string, context: any): string {
    return `I'm here to help with medical billing and form completion. I can assist with:\n\n• **Code Lookups** - ICD-10, CPT, HCPCS codes\n• **Terminology** - Medical abbreviations and definitions\n• **Provider Information** - NPI lookups and contact details\n• **Eligibility Checks** - Insurance coverage verification\n• **Claims Submission** - Billing and reimbursement help\n• **Form Guidance** - Step-by-step form completion\n\nWhat specific area do you need help with?`
  }

  // Advanced Search & Discovery Engine - Item 8
  private static ADVANCED_SEARCH_ENGINE = {
    // Semantic search capabilities for medical terminology
    semanticSearch: {
      // Medical terminology synonyms and related terms
      terminologyMap: {
        'diabetes': ['diabetes mellitus', 'DM', 'type 1 diabetes', 'type 2 diabetes', 'diabetic'],
        'hypertension': ['HTN', 'high blood pressure', 'essential hypertension'],
        'glaucoma': ['open angle glaucoma', 'closed angle glaucoma', 'ocular hypertension'],
        'cataract': ['cataracts', 'lens opacity', 'senile cataract'],
        'retinopathy': ['diabetic retinopathy', 'hypertensive retinopathy', 'retinal disease'],
        'macular degeneration': ['AMD', 'age-related macular degeneration', 'macular disease'],
        'refraction': ['refractive error', 'vision correction', 'optical correction'],
        'ophthalmology': ['eye care', 'ocular', 'ophthalmic', 'vision care'],
        'optometry': ['vision care', 'eye exam', 'refraction', 'contact lens fitting']
      },

      // Fuzzy matching for code lookups
      fuzzyMatch: {
        // Common misspellings and variations
        variations: {
          'diabetes': ['diabetis', 'diabete', 'diabet'],
          'hypertension': ['hypertention', 'hypertens', 'htn'],
          'glaucoma': ['glacoma', 'glacoma', 'glac'],
          'cataract': ['cataracts', 'catarac', 'cat'],
          'retinopathy': ['retinopaty', 'retinop', 'ret'],
          'refraction': ['refract', 'refractn', 'ref'],
          'ophthalmology': ['ophthalm', 'ophthal', 'oph'],
          'optometry': ['optometr', 'optom', 'opt']
        },

        // Code variations and common errors
        codeVariations: {
          'E11.9': ['E119', 'E11.9', 'E11-9', 'E11 9'],
          'H35.00': ['H3500', 'H35.00', 'H35-00', 'H35 00'],
          '92250': ['92250', '9225', '922.50'],
          '92310': ['92310', '9231', '923.10']
        }
      },

      // Search history with personalized results
      searchHistory: {
        userSearches: new Map<string, Array<{
          query: string
          timestamp: Date
          results: any[]
          clicked: string[]
          success: boolean
        }>>(),

        // Get personalized search suggestions
        getPersonalizedSuggestions: (userId: string, query: string): string[] => {
          const userHistory = AIAssistantService.ADVANCED_SEARCH_ENGINE.searchHistory.userSearches.get(userId) || []
          const recentSearches = userHistory
            .filter(search => search.query.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
          
          return recentSearches.map(search => search.query)
        },

        // Record search activity
        recordSearch: (userId: string, query: string, results: any[], clicked: string[], success: boolean) => {
          const userHistory = AIAssistantService.ADVANCED_SEARCH_ENGINE.searchHistory.userSearches.get(userId) || []
          userHistory.push({
            query,
            timestamp: new Date(),
            results,
            clicked,
            success
          })
          
          // Keep only last 50 searches
          if (userHistory.length > 50) {
            userHistory.splice(0, userHistory.length - 50)
          }
          
          AIAssistantService.ADVANCED_SEARCH_ENGINE.searchHistory.userSearches.set(userId, userHistory)
        }
      },

      // Advanced filtering by specialty, code type, etc.
      advancedFiltering: {
        // Filter by medical specialty
        bySpecialty: (results: any[], specialty: string): any[] => {
          const specialtyKeywords = {
            'optometry': ['vision', 'refraction', 'contact lens', 'eye exam'],
            'ophthalmology': ['surgery', 'retinal', 'glaucoma', 'cataract'],
            'primary care': ['general', 'preventive', 'screening'],
            'cardiology': ['heart', 'cardiac', 'cardiovascular'],
            'endocrinology': ['diabetes', 'endocrine', 'hormone']
          }
          
          const keywords = specialtyKeywords[specialty.toLowerCase()] || []
          return results.filter(result => 
            keywords.some(keyword => 
              result.description?.toLowerCase().includes(keyword) ||
              result.code?.toLowerCase().includes(keyword)
            )
          )
        },

        // Filter by code type
        byCodeType: (results: any[], codeType: 'ICD10' | 'CPT' | 'HCPCS' | 'POS' | 'MOD'): any[] => {
          return results.filter(result => {
            if (codeType === 'ICD10') return /^[A-Z]\d{2}\.\d{1,2}$/.test(result.code)
            if (codeType === 'CPT') return /^\d{5}$/.test(result.code)
            if (codeType === 'HCPCS') return /^[A-Z]\d{4}$/.test(result.code)
            if (codeType === 'POS') return /^\d{2}$/.test(result.code)
            if (codeType === 'MOD') return /^\d{2}$|^[A-Z]{2}$/.test(result.code)
            return true
          })
        },

        // Filter by usage frequency
        byUsageFrequency: (results: any[], frequency: 'high' | 'medium' | 'low'): any[] => {
          const frequencyMap = {
            high: ['E11.9', '92250', '92310', '11', '25'],
            medium: ['H35.00', '92227', '92228', '22', '59'],
            low: ['Z79.4', '92229', '92285', '24', 'AS']
          }
          
          const targetCodes = frequencyMap[frequency] || []
          return results.filter(result => targetCodes.includes(result.code))
        }
      }
    },

    // Enhanced search algorithms
    algorithms: {
      // Semantic search with context awareness
      semanticSearch: (query: string, context: AIContext): any[] => {
        const results: any[] = []
        const queryLower = query.toLowerCase()
        
        // Search in terminology map
        Object.entries(AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.terminologyMap).forEach(([term, synonyms]) => {
          if (term.toLowerCase().includes(queryLower) || synonyms.some(s => s.toLowerCase().includes(queryLower))) {
            results.push({
              type: 'terminology',
              term,
              synonyms,
              relevance: term.toLowerCase().includes(queryLower) ? 1.0 : 0.8
            })
          }
        })
        
        // Search in common codes
        Object.entries(AIAssistantService.LOCAL_KNOWLEDGE.commonCodes).forEach(([code, description]) => {
          if (description.toLowerCase().includes(queryLower) || code.toLowerCase().includes(queryLower)) {
            results.push({
              type: 'code',
              code,
              description,
              relevance: description.toLowerCase().includes(queryLower) ? 1.0 : 0.7
            })
          }
        })
        
        return results.sort((a, b) => b.relevance - a.relevance)
      },

      // Fuzzy matching for approximate searches
      fuzzyMatch: (query: string): any[] => {
        const results: any[] = []
        const queryLower = query.toLowerCase()
        
        // Check for variations
        Object.entries(AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.fuzzyMatch.variations).forEach(([correct, variations]) => {
          if (variations.some(v => v.toLowerCase().includes(queryLower))) {
            results.push({
              type: 'correction',
              original: query,
              suggested: correct,
              confidence: 0.9
            })
          }
        })
        
        // Check for code variations
        Object.entries(AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.fuzzyMatch.codeVariations).forEach(([correct, variations]) => {
          if (variations.some(v => v.toLowerCase().includes(queryLower))) {
            results.push({
              type: 'code_correction',
              original: query,
              suggested: correct,
              confidence: 0.95
            })
          }
        })
        
        return results
      },

      // Advanced search with multiple criteria
      advancedSearch: (query: string, filters: {
        specialty?: string
        codeType?: 'ICD10' | 'CPT' | 'HCPCS' | 'POS' | 'MOD'
        frequency?: 'high' | 'medium' | 'low'
        context?: AIContext
      }): any[] => {
        // Start with semantic search
        let results = AIAssistantService.ADVANCED_SEARCH_ENGINE.algorithms.semanticSearch(query, filters.context || {})
        
        // Apply filters
        if (filters.specialty) {
          results = AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.advancedFiltering.bySpecialty(results, filters.specialty)
        }
        
        if (filters.codeType) {
          results = AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.advancedFiltering.byCodeType(results, filters.codeType)
        }
        
        if (filters.frequency) {
          results = AIAssistantService.ADVANCED_SEARCH_ENGINE.semanticSearch.advancedFiltering.byUsageFrequency(results, filters.frequency)
        }
        
        return results
      }
    }
  }

  // Missing handler functions for advanced features
  private static async handleSpecialtySpecificQuery(input: string, context: AIContext): Promise<string> {
    const specialtyKeywords = ['optometry', 'ophthalmology', 'primary care', 'diabetes', 'hypertension', 'preventive']
    const matchedSpecialty = specialtyKeywords.find(keyword => input.toLowerCase().includes(keyword))
    
    if (matchedSpecialty) {
      const specialtyInfo = this.ADVANCED_KNOWLEDGE.specialties[matchedSpecialty]
      if (specialtyInfo) {
        return `**${matchedSpecialty.charAt(0).toUpperCase() + matchedSpecialty.slice(1)} Specialty Information:**

**Common Procedures:** ${specialtyInfo.commonProcedures.join(', ')}
**Key Codes:** ${specialtyInfo.keyCodes.join(', ')}
**Documentation Focus:** ${specialtyInfo.documentationFocus}
**Billing Considerations:** ${specialtyInfo.billingConsiderations}

This specialty typically involves ${specialtyInfo.workflowDescription}.`
      }
    }
    
    return null
  }

  private static async handleTreatmentProtocolQuery(input: string, context: AIContext): Promise<string> {
    const protocolKeywords = ['diabetes', 'hypertension', 'preventive care']
    const matchedProtocol = protocolKeywords.find(keyword => input.toLowerCase().includes(keyword))
    
    if (matchedProtocol) {
      const protocolInfo = this.ADVANCED_KNOWLEDGE.treatmentProtocols[matchedProtocol]
      if (protocolInfo) {
        return `**${matchedProtocol.charAt(0).toUpperCase() + matchedProtocol.slice(1)} Treatment Protocol:**

**Assessment Frequency:** ${protocolInfo.assessmentFrequency}
**Key Metrics:** ${protocolInfo.keyMetrics.join(', ')}
**Documentation Requirements:** ${protocolInfo.documentationRequirements}
**Follow-up Schedule:** ${protocolInfo.followUpSchedule}

**Standard Workflow:** ${protocolInfo.standardWorkflow}`
      }
    }
    
    return null
  }

  private static async handleDocumentationTemplateQuery(input: string, context: AIContext): Promise<string> {
    const templateKeywords = ['template', 'documentation', 'note', 'chart']
    const hasTemplateRequest = templateKeywords.some(keyword => input.toLowerCase().includes(keyword))
    
    if (hasTemplateRequest) {
      const templates = this.ADVANCED_KNOWLEDGE.documentationTemplates
      return `**Documentation Templates Available:**

**Progress Note Template:**
${templates.progressNote}

**Assessment Template:**
${templates.assessment}

**Treatment Plan Template:**
${templates.treatmentPlan}

**Follow-up Template:**
${templates.followUp}

These templates ensure consistent documentation and compliance with medical standards.`
    }
    
    return null
  }

  private static async handleAuditTrailQuery(input: string, context: AIContext): Promise<string> {
    const auditKeywords = ['audit', 'compliance', 'trail', 'tracking']
    const hasAuditRequest = auditKeywords.some(keyword => input.toLowerCase().includes(keyword))
    
    if (hasAuditRequest) {
      const auditInfo = this.ADVANCED_KNOWLEDGE.auditTrail
      return `**Audit Trail Requirements:**

**Required Tracking:**
- ${auditInfo.requiredTracking.join('\n- ')}

**Compliance Standards:**
- ${auditInfo.complianceStandards.join('\n- ')}

**Documentation Timeline:** ${auditInfo.documentationTimeline}
**Retention Period:** ${auditInfo.retentionPeriod}

**Key Audit Points:**
- ${auditInfo.keyAuditPoints.join('\n- ')}

This ensures full compliance and traceability for all medical billing activities.`
    }
    
    return null
  }

  // Additional missing handler functions
  private static async handleCodeLookupWithRealTimeValidation(input: string, context: AIContext): Promise<string> {
    // Extract code from input
    const codeMatch = input.match(/\b([A-Z]\d{4}|\d{5}|E\d{2}\.\d{1,2}|Z\d{2}\.\d{1,2})\b/g)
    if (!codeMatch) return null
    
    const code = codeMatch[0]
    
    // Simulate real-time validation
    const validationResult = await this.validateCodeRealTime(code, context)
    
    if (validationResult.isValid) {
      return `**Code Validation Result:**

**Code:** ${code}
**Status:** ✅ VALID
**Description:** ${validationResult.description}
**Category:** ${validationResult.category}
**Effective Date:** ${validationResult.effectiveDate}
**Last Updated:** ${validationResult.lastUpdated}

**Usage Guidelines:**
- ${validationResult.usageGuidelines.join('\n- ')}

**Billing Considerations:**
- ${validationResult.billingConsiderations.join('\n- ')}`
    } else {
      return `**Code Validation Result:**

**Code:** ${code}
**Status:** ❌ INVALID
**Error:** ${validationResult.error}

**Suggestions:**
- ${validationResult.suggestions.join('\n- ')}`
    }
  }

  private static async handleInsurancePolicyLookup(input: string, context: AIContext): Promise<string> {
    // Extract insurance-related terms
    const insuranceTerms = ['insurance', 'policy', 'coverage', 'benefits', 'deductible', 'copay']
    const matchedTerm = insuranceTerms.find(term => input.toLowerCase().includes(term))
    
    if (matchedTerm) {
      const policyInfo = await this.getInsurancePolicyRealTime(matchedTerm, context)
      
      return `**Insurance Policy Information:**

**Term:** ${matchedTerm.charAt(0).toUpperCase() + matchedTerm.slice(1)}
**Coverage Type:** ${policyInfo.coverageType}
**Effective Date:** ${policyInfo.effectiveDate}
**Expiration Date:** ${policyInfo.expirationDate}

**Coverage Details:**
- ${policyInfo.coverageDetails.join('\n- ')}

**Requirements:**
- ${policyInfo.requirements.join('\n- ')}

**Documentation Needed:**
- ${policyInfo.documentationNeeded.join('\n- ')}`
    }
    
    return null
  }

  private static async handleComplianceGuidance(input: string, context: AIContext): Promise<string> {
    const complianceTerms = ['hipaa', 'compliance', 'regulations', 'privacy', 'security']
    const matchedTerm = complianceTerms.find(term => input.toLowerCase().includes(term))
    
    if (matchedTerm) {
      const complianceInfo = await this.getComplianceRequirementsRealTime(matchedTerm, context)
      
      return `**Compliance Guidance:**

**Area:** ${matchedTerm.charAt(0).toUpperCase() + matchedTerm.slice(1)}
**Regulation:** ${complianceInfo.regulation}
**Effective Date:** ${complianceInfo.effectiveDate}

**Requirements:**
- ${complianceInfo.requirements.join('\n- ')}

**Best Practices:**
- ${complianceInfo.bestPractices.join('\n- ')}

**Documentation Standards:**
- ${complianceInfo.documentationStandards.join('\n- ')}

**Audit Checklist:**
- ${complianceInfo.auditChecklist.join('\n- ')}`
    }
    
    return null
  }

  // Real-time validation functions
  private static async validateCodeRealTime(code: string, context: AIContext): Promise<any> {
    // Simulate real-time API call
    const apiResult = await this.simulateRealTimeAPICall('code_validation', code)
    
    if (apiResult.success) {
      return {
        isValid: true,
        description: apiResult.data.description || 'Valid medical code',
        category: apiResult.data.category || 'General',
        effectiveDate: apiResult.data.effectiveDate || '2024-01-01',
        lastUpdated: apiResult.data.lastUpdated || new Date().toISOString(),
        usageGuidelines: apiResult.data.usageGuidelines || ['Standard billing procedures apply'],
        billingConsiderations: apiResult.data.billingConsiderations || ['Verify coverage with insurance']
      }
    } else {
      return {
        isValid: false,
        error: apiResult.error || 'Code not found in current database',
        suggestions: apiResult.suggestions || ['Check code spelling', 'Verify code is current', 'Contact support']
      }
    }
  }

  private static async getInsurancePolicyRealTime(term: string, context: AIContext): Promise<any> {
    // Simulate real-time API call
    const apiResult = await this.simulateRealTimeAPICall('insurance_policy', term)
    
    if (apiResult.success) {
      return {
        coverageType: apiResult.data.coverageType || 'Standard Coverage',
        effectiveDate: apiResult.data.effectiveDate || '2024-01-01',
        expirationDate: apiResult.data.expirationDate || '2024-12-31',
        coverageDetails: apiResult.data.coverageDetails || ['Standard medical procedures covered'],
        requirements: apiResult.data.requirements || ['Valid provider ID required'],
        documentationNeeded: apiResult.data.documentationNeeded || ['Medical necessity documentation']
      }
    } else {
      return {
        coverageType: 'Unknown',
        effectiveDate: 'N/A',
        expirationDate: 'N/A',
        coverageDetails: ['Policy information not available'],
        requirements: ['Contact insurance provider'],
        documentationNeeded: ['Standard documentation required']
      }
    }
  }

  private static async getComplianceRequirementsRealTime(term: string, context: AIContext): Promise<any> {
    // Simulate real-time API call
    const apiResult = await this.simulateRealTimeAPICall('compliance', term)
    
    if (apiResult.success) {
      return {
        regulation: apiResult.data.regulation || 'Standard Compliance',
        effectiveDate: apiResult.data.effectiveDate || '2024-01-01',
        requirements: apiResult.data.requirements || ['Follow standard procedures'],
        bestPractices: apiResult.data.bestPractices || ['Document all interactions'],
        documentationStandards: apiResult.data.documentationStandards || ['Complete and accurate records'],
        auditChecklist: apiResult.data.auditChecklist || ['Verify all required fields completed']
      }
    } else {
      return {
        regulation: 'Standard Compliance',
        effectiveDate: '2024-01-01',
        requirements: ['Follow standard procedures'],
        bestPractices: ['Document all interactions'],
        documentationStandards: ['Complete and accurate records'],
        auditChecklist: ['Verify all required fields completed']
      }
    }
  }

  // Simulate real-time API calls
  private static async simulateRealTimeAPICall(type: string, query: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    
    // Simulate different API responses based on type
    switch (type) {
      case 'code_validation':
        // Simulate code validation API
        const validCodes = ['92250', 'E11.9', 'Z79.4', 'H35.00']
        const isValid = validCodes.includes(query)
        
        if (isValid) {
          return {
            success: true,
            data: {
              description: this.getCodeDescription(query),
              category: this.getCodeCategory(query),
              effectiveDate: '2024-01-01',
              lastUpdated: new Date().toISOString(),
              usageGuidelines: ['Standard billing procedures apply', 'Verify coverage with insurance'],
              billingConsiderations: ['Check insurance coverage', 'Document medical necessity']
            }
          }
        } else {
          return {
            success: false,
            error: 'Code not found in current database',
            suggestions: ['Check code spelling', 'Verify code is current', 'Contact support']
          }
        }
        
      case 'insurance_policy':
        // Simulate insurance policy API
        return {
          success: true,
          data: {
            coverageType: 'Standard Medical Coverage',
            effectiveDate: '2024-01-01',
            expirationDate: '2024-12-31',
            coverageDetails: ['Standard medical procedures covered', 'Preventive care included'],
            requirements: ['Valid provider ID required', 'Medical necessity documentation'],
            documentationNeeded: ['Medical necessity documentation', 'Provider credentials']
          }
        }
        
      case 'compliance':
        // Simulate compliance API
        return {
          success: true,
          data: {
            regulation: 'HIPAA Compliance Standards',
            effectiveDate: '2024-01-01',
            requirements: ['Follow standard procedures', 'Document all interactions'],
            bestPractices: ['Document all interactions', 'Maintain patient privacy'],
            documentationStandards: ['Complete and accurate records', 'Timely documentation'],
            auditChecklist: ['Verify all required fields completed', 'Check documentation accuracy']
          }
        }
        
      default:
        return {
          success: false,
          error: 'Unknown API type',
          suggestions: ['Try a different query', 'Contact support']
        }
    }
  }

  // Advanced knowledge base for specialty-specific queries and advanced features
  private static ADVANCED_KNOWLEDGE = {
    specialties: {
      optometry: {
        commonProcedures: ['Comprehensive eye exam', 'Refraction', 'Contact lens fitting', 'Glaucoma screening'],
        keyCodes: ['92250', '92310', '92311', '92312', '92313'],
        documentationFocus: 'Visual acuity, refractive error, and ocular health assessment',
        billingConsiderations: 'Verify medical necessity for routine exams, document findings thoroughly',
        workflowDescription: 'routine eye examinations, contact lens fittings, and vision correction services'
      },
      ophthalmology: {
        commonProcedures: ['Cataract surgery', 'Glaucoma treatment', 'Retinal procedures', 'Corneal surgery'],
        keyCodes: ['66984', '66174', '67028', '67108', '67113'],
        documentationFocus: 'Surgical procedures, post-operative care, and specialized treatments',
        billingConsiderations: 'Document surgical complexity, use appropriate modifiers, verify pre-authorization',
        workflowDescription: 'surgical procedures, specialized treatments, and complex ocular care'
      },
      'primary care': {
        commonProcedures: ['Annual physical', 'Chronic disease management', 'Preventive care', 'Health screenings'],
        keyCodes: ['99396', '99406', '99407', 'G0438', 'G0439'],
        documentationFocus: 'Comprehensive health assessment and chronic disease management',
        billingConsiderations: 'Document time spent, complexity of care, and preventive services',
        workflowDescription: 'comprehensive health assessments, chronic disease management, and preventive care'
      },
      diabetes: {
        commonProcedures: ['Diabetes management', 'Blood glucose monitoring', 'HbA1c testing', 'Foot examination'],
        keyCodes: ['E11.9', 'E11.21', 'E11.22', 'Z79.4', 'Z79.84'],
        documentationFocus: 'Diabetes control, complications assessment, and medication management',
        billingConsiderations: 'Document HbA1c levels, complications, and medication adherence',
        workflowDescription: 'diabetes management, monitoring, and complication prevention'
      },
      hypertension: {
        commonProcedures: ['Blood pressure monitoring', 'Cardiovascular assessment', 'Medication management'],
        keyCodes: ['I10', 'I11.9', 'I12.9', 'I13.2', 'Z79.4'],
        documentationFocus: 'Blood pressure control, cardiovascular risk assessment',
        billingConsiderations: 'Document BP readings, medication changes, and cardiovascular risk factors',
        workflowDescription: 'hypertension management and cardiovascular risk reduction'
      },
      preventive: {
        commonProcedures: ['Annual wellness visit', 'Immunizations', 'Cancer screenings', 'Health counseling'],
        keyCodes: ['G0438', 'G0439', 'G0447', 'G0448', 'G0449'],
        documentationFocus: 'Preventive services, risk assessment, and health promotion',
        billingConsiderations: 'Document preventive services provided, risk factors identified',
        workflowDescription: 'preventive care, health promotion, and wellness services'
      }
    },
    treatmentProtocols: {
      diabetes: {
        assessmentFrequency: 'Every 3-6 months',
        keyMetrics: ['HbA1c', 'Blood glucose', 'Blood pressure', 'Weight', 'Foot examination'],
        documentationRequirements: 'HbA1c results, medication changes, complications assessment',
        followUpSchedule: '3-6 month intervals based on control',
        standardWorkflow: 'Regular monitoring, medication adjustment, complication screening, and patient education'
      },
      hypertension: {
        assessmentFrequency: 'Every 3-6 months',
        keyMetrics: ['Blood pressure', 'Weight', 'Medication adherence', 'Side effects'],
        documentationRequirements: 'BP readings, medication changes, cardiovascular risk factors',
        followUpSchedule: 'Monthly to quarterly based on control',
        standardWorkflow: 'Regular BP monitoring, medication titration, lifestyle counseling, and risk factor management'
      },
      'preventive care': {
        assessmentFrequency: 'Annually',
        keyMetrics: ['Immunization status', 'Screening results', 'Risk factors', 'Health goals'],
        documentationRequirements: 'Preventive services provided, risk factors identified, follow-up recommendations',
        followUpSchedule: 'Annual wellness visits with interim screenings as needed',
        standardWorkflow: 'Comprehensive health assessment, preventive services, risk factor identification, and health promotion'
      }
    },
    documentationTemplates: {
      progressNote: `SUBJECTIVE:
Chief Complaint: [Patient's main concern]
History of Present Illness: [Detailed description of current symptoms]
Review of Systems: [Relevant system review]
Past Medical History: [Relevant medical history]
Medications: [Current medications]
Allergies: [Known allergies]

OBJECTIVE:
Vital Signs: [BP, HR, Temp, etc.]
Physical Examination: [Detailed exam findings]
Lab Results: [Relevant lab data]

ASSESSMENT:
Primary Diagnosis: [ICD-10 code and description]
Secondary Diagnoses: [Additional diagnoses if applicable]

PLAN:
Treatment Plan: [Specific treatment recommendations]
Medications: [Prescriptions and changes]
Follow-up: [Next appointment and monitoring]
Patient Education: [Instructions given to patient]`,
      
      assessment: `COMPREHENSIVE ASSESSMENT:
Patient Demographics: [Age, gender, contact info]
Chief Complaint: [Primary reason for visit]
History of Present Illness: [Detailed symptom timeline]
Past Medical History: [Relevant medical conditions]
Family History: [Relevant family medical history]
Social History: [Lifestyle factors, occupation]
Medication Review: [Current medications and compliance]
Allergy Assessment: [Known allergies and reactions]

PHYSICAL EXAMINATION:
Vital Signs: [Complete vital signs]
General Appearance: [Overall patient appearance]
Systematic Examination: [Detailed system-by-system exam]

DIAGNOSTIC IMPRESSION:
Primary Diagnoses: [Main diagnoses with ICD-10 codes]
Differential Diagnoses: [Other possible diagnoses]
Risk Factors: [Identified risk factors]

TREATMENT PLAN:
Immediate Interventions: [Urgent treatments needed]
Long-term Management: [Ongoing care plan]
Patient Education: [Educational needs identified]
Follow-up Plan: [Monitoring and follow-up schedule]`,
      
      treatmentPlan: `TREATMENT PLAN FOR [PATIENT NAME]:
Date: [Date of plan]
Provider: [Provider name]

DIAGNOSIS:
Primary: [ICD-10 code and description]
Secondary: [Additional diagnoses if applicable]

GOALS:
Short-term Goals: [Immediate treatment objectives]
Long-term Goals: [Overall health objectives]

INTERVENTIONS:
Medications: [Prescribed medications with dosages]
Procedures: [Planned procedures or treatments]
Lifestyle Modifications: [Diet, exercise, behavior changes]
Patient Education: [Educational topics and resources]

MONITORING:
Parameters to Monitor: [What to track]
Frequency of Monitoring: [How often to check]
Expected Outcomes: [What improvements to expect]

FOLLOW-UP:
Next Appointment: [When to return]
Contingency Plans: [What to do if problems arise]
Emergency Instructions: [When to seek immediate care]`,
      
      followUp: `FOLLOW-UP VISIT:
Date: [Visit date]
Provider: [Provider name]

CHIEF COMPLAINT:
Current Concerns: [Patient's current issues]

INTERIM HISTORY:
Since Last Visit: [What has happened since last visit]
Medication Changes: [Any medication adjustments]
Symptom Changes: [How symptoms have changed]

ASSESSMENT:
Current Status: [How patient is doing now]
Progress Toward Goals: [Progress on treatment goals]
New Issues: [Any new problems identified]

PLAN:
Continue Current Treatment: [What to continue]
Modify Treatment: [What to change]
New Interventions: [New treatments needed]
Next Follow-up: [When to return]`
    },
    auditTrail: {
      requiredTracking: [
        'All patient interactions and communications',
        'Medication changes and rationale',
        'Test orders and results',
        'Referrals and consultations',
        'Treatment plan modifications',
        'Patient education provided',
        'Informed consent documentation',
        'Quality measures and outcomes'
      ],
      complianceStandards: [
        'HIPAA privacy and security requirements',
        'CMS documentation guidelines',
        'State-specific medical board requirements',
        'Insurance carrier documentation standards',
        'Quality reporting program requirements',
        'Meaningful use criteria (if applicable)',
        'Audit and compliance monitoring',
        'Risk management protocols'
      ],
      documentationTimeline: 'All documentation must be completed within 24 hours of patient encounter',
      retentionPeriod: 'Medical records must be retained for minimum of 7 years (varies by state)',
      keyAuditPoints: [
        'Complete and accurate documentation',
        'Timely record completion',
        'Appropriate code selection',
        'Medical necessity documentation',
        'Consent and authorization records',
        'Quality measure reporting',
        'Compliance with billing guidelines',
        'Patient safety documentation'
      ]
    }
  }

  // Handle "show all CPT codes" requests with proper formatting
  private static handleShowAllCPTCodes(input: string): string {
    console.log('🚀 handleShowAllCPTCodes called with input:', input)
    const lowerInput = input.toLowerCase()
    let selectedCategory = 'all'
    
    // Determine which category based on user input
    if (lowerInput.includes('ophthalm') || lowerInput.includes('eye') || lowerInput.includes('vision')) {
      selectedCategory = 'ophthalmology'
    } else if (lowerInput.includes('surgery') || lowerInput.includes('surgical')) {
      selectedCategory = 'surgery'
    } else if (lowerInput.includes('evaluation') || lowerInput.includes('management') || lowerInput.includes('visit')) {
      selectedCategory = 'evaluation_management'
    }
    
    let response = '**📋 CPT Codes**\n\n'
    
    if (selectedCategory === 'all') {
      // Show all categories
      Object.entries(this.LOCAL_KNOWLEDGE.cptCodeSets).forEach(([category, codes]) => {
        const categoryTitle = category.replace('_', ' & ').replace(/\b\w/g, l => l.toUpperCase())
        response += `**${categoryTitle} Codes:**\n`
        codes.forEach(code => {
          response += `• **${code.code}** - ${code.description}\n`
        })
        response += '\n'
      })
    } else {
      // Show specific category
      const categoryTitle = selectedCategory.replace('_', ' & ').replace(/\b\w/g, l => l.toUpperCase())
      const codes = this.LOCAL_KNOWLEDGE.cptCodeSets[selectedCategory]
      response += `**${categoryTitle} Codes:**\n`
      codes.forEach(code => {
        response += `• **${code.code}** - ${code.description}\n`
      })
    }
    
    response += '\n💡 **Need a specific code?** Ask me about a particular procedure or condition!'
    return response
  }

  // Handle "show all codes" requests
  private static handleShowAllCodes(input: string): string {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('icd')) {
      return this.handleShowAllICD10Codes()
    } else if (lowerInput.includes('cpt')) {
      return this.handleShowAllCPTCodes(input)
    }
    
    // Show overview of all code types
    let response = '**📋 Medical Billing Code Categories**\n\n'
    
    response += '**ICD-10 Diagnosis Codes:**\n'
    Object.entries(this.knowledgeBase.commonCodes).slice(0, 10).forEach(([code, description]) => {
      if (code.match(/^[A-Z]/)) { // ICD-10 pattern
        response += `• **${code}** - ${description}\n`
      }
    })
    
    response += '\n**CPT Procedure Codes:**\n'
    Object.entries(this.knowledgeBase.commonCodes).slice(0, 10).forEach(([code, description]) => {
      if (code.match(/^\d/)) { // CPT pattern
        response += `• **${code}** - ${description}\n`
      }
    })
    
    response += '\n💡 **For complete lists, ask:**\n'
    response += '• "Show me all CPT codes"\n'
    response += '• "Show me all ICD-10 codes"\n'
    response += '• "List ophthalmology codes"\n'
    
    return response
  }

  // Handle "show all ICD-10 codes" requests
  private static handleShowAllICD10Codes(input: string): string {
    const lowerInput = input.toLowerCase()
    let selectedCategory = 'all'
    
    // Determine which category based on user input
    if (lowerInput.includes('diabetes')) {
      selectedCategory = 'diabetes'
    } else if (lowerInput.includes('eye') || lowerInput.includes('vision') || lowerInput.includes('retina')) {
      selectedCategory = 'eye_conditions'
    } else if (lowerInput.includes('common')) {
      selectedCategory = 'common_conditions'
    }
    
    let response = '**📋 ICD-10 Diagnosis Codes**\n\n'
    
    if (selectedCategory === 'all') {
      // Show all categories
      Object.entries(this.LOCAL_KNOWLEDGE.icd10CodeSets).forEach(([category, codes]) => {
        const categoryTitle = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        response += `**${categoryTitle}:**\n`
        codes.forEach(code => {
          response += `• **${code.code}** - ${code.description}\n`
        })
        response += '\n'
      })
    } else {
      // Show specific category
      const categoryTitle = selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      const codes = this.LOCAL_KNOWLEDGE.icd10CodeSets[selectedCategory]
      response += `**${categoryTitle}:**\n`
      codes.forEach(code => {
        response += `• **${code.code}** - ${code.description}\n`
      })
    }
    
    response += '\n💡 **Need more codes?** Ask me about specific conditions like "diabetes codes" or "eye condition codes"!'
    return response
  }

  // Handle "show all HCPCS codes" requests
  private static handleShowAllHCPCSCodes(input: string): string {
    const lowerInput = input.toLowerCase()
    let selectedCategory = 'all'
    
    if (lowerInput.includes('vision') || lowerInput.includes('glasses') || lowerInput.includes('contact')) {
      selectedCategory = 'vision_services'
    } else if (lowerInput.includes('equipment') || lowerInput.includes('durable')) {
      selectedCategory = 'durable_medical_equipment'
    }
    
    let response = '**📋 HCPCS Codes (Medicare/Medicaid)**\n\n'
    
    if (selectedCategory === 'all') {
      Object.entries(this.LOCAL_KNOWLEDGE.hcpcsCodeSets).forEach(([category, codes]) => {
        const categoryTitle = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        response += `**${categoryTitle}:**\n`
        codes.forEach(code => {
          response += `• **${code.code}** - ${code.description}\n`
        })
        response += '\n'
      })
    } else {
      const categoryTitle = selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      const codes = this.LOCAL_KNOWLEDGE.hcpcsCodeSets[selectedCategory]
      response += `**${categoryTitle}:**\n`
      codes.forEach(code => {
        response += `• **${code.code}** - ${code.description}\n`
      })
    }
    
    response += '\n💡 **HCPCS codes** are used for Medicare/Medicaid billing for supplies, equipment, and non-physician services!'
    return response
  }

  // Handle "show all POS codes" requests
  private static handleShowAllPOSCodes(): string {
    let response = '**📋 Place of Service (POS) Codes**\n\n'
    
    this.LOCAL_KNOWLEDGE.posCodeSets.forEach(code => {
      response += `• **${code.code}** - ${code.description}\n`
    })
    
    response += '\n💡 **POS codes** indicate where medical services were performed. Code **11** (Office) is most common for routine visits!'
    return response
  }

  // Handle "show all modifier codes" requests
  private static handleShowAllModifierCodes(): string {
    let response = '**📋 CPT Modifier Codes**\n\n'
    
    this.LOCAL_KNOWLEDGE.modifierCodeSets.forEach(code => {
      response += `• **${code.code}** - ${code.description}\n`
    })
    
    response += '\n💡 **Modifiers** provide additional information about procedures. **25** (Significant E&M) and **59** (Distinct Service) are commonly used!'
    return response
  }

  // Handle "show all drug codes" requests
  private static handleShowAllDrugCodes(): string {
    console.log('🚀 handleShowAllDrugCodes called')
    let response = '**📋 Drug Codes (J-Codes)**\n\n'
    
    this.LOCAL_KNOWLEDGE.drugCodeSets.forEach(code => {
      response += `• **${code.code}** - ${code.description}\n`
    })
    
    response += '\n💡 **J-codes** are used for injectable drugs, infusions, and certain oral drugs that cannot be self-administered!'
    return response
  }

  // Handle "show all lab codes" requests
  private static handleShowAllLabCodes(): string {
    let response = '**📋 Laboratory Codes (80000-89999 series)**\n\n'
    
    this.LOCAL_KNOWLEDGE.labCodeSets.forEach(code => {
      response += `• **${code.code}** - ${code.description}\n`
    })
    
    response += '\n💡 **Lab codes** are for pathology and laboratory procedures. **80053** (Comprehensive Metabolic Panel) is commonly ordered!'
    return response
  }

  // Test Gemini AI integration
  static async testGeminiIntegration(): Promise<{ success: boolean; message: string; usageStats?: any }> {
    console.log('🧪 Testing Gemini AI integration...')
    
    try {
      // Test connection
      const connectionTest = await GeminiAIService.testConnection()
      
      if (!connectionTest.success) {
        return connectionTest
      }

      // Test hybrid routing
      const testContext: AIContext = {
        formType: 'general',
        currentField: 'test',
        currentStep: 1,
        deviceType: 'desktop',
        timeOfDay: 'morning',
        sessionDuration: 0
      }

      // Test complex query (should route to Gemini)
      const complexQuery = "Explain the difference between ICD-10 and CPT codes and when to use each"
      const complexResponse = await this.processUserInput(complexQuery, testContext)

      // Test simple query (should use local knowledge)
      const simpleQuery = "What is OD?"
      const simpleResponse = await this.processUserInput(simpleQuery, testContext)

      // Get usage statistics
      const usageStats = GeminiAIService.getUsageStats()

      return {
        success: true,
        message: `✅ Gemini integration test successful!\n\nComplex Query Test: ${complexResponse.slice(0, 100)}...\n\nSimple Query Test: ${simpleResponse.slice(0, 100)}...`,
        usageStats
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Memory Management Helper Methods

  // Set user preference
  static async setUserPreference(
    userId: string,
    key: string,
    value: any,
    importance: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> {
    try {
      const result = await MemoryService.storeUserPreference(userId, key, value, importance)
      return result !== null
    } catch (error) {
      console.error('Failed to set user preference:', error)
      return false
    }
  }

  // Get user preference
  static async getUserPreference(userId: string, key: string, defaultValue?: any): Promise<any> {
    try {
      const preferences = await MemoryService.getUserPreferences(userId)
      return preferences[key] ?? defaultValue
    } catch (error) {
      console.error('Failed to get user preference:', error)
      return defaultValue
    }
  }

  // Get user's medical term usage statistics
  static async getUserMedicalTermStats(userId: string): Promise<{
    totalTerms: number
    mostUsedTerms: Array<{ term: string; usageCount: number }>
    recentTerms: Array<{ term: string; lastUsed: string }>
  }> {
    try {
      const termUsage = await MemoryService.getMedicalTermUsage(userId, 20)
      const mostUsedTerms = termUsage
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map(t => ({ term: t.term, usageCount: t.usageCount }))
      
      const recentTerms = termUsage
        .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
        .slice(0, 5)
        .map(t => ({ term: t.term, lastUsed: t.lastUsed }))

      return {
        totalTerms: termUsage.length,
        mostUsedTerms,
        recentTerms
      }
    } catch (error) {
      console.error('Failed to get medical term stats:', error)
      return {
        totalTerms: 0,
        mostUsedTerms: [],
        recentTerms: []
      }
    }
  }

  // Get user's conversation history
  static async getUserConversationHistory(userId: string, limit: number = 10): Promise<Array<{
    id: string
    summary: string
    createdAt: string
    messageCount: number
  }>> {
    try {
      const conversations = await MemoryService.getUserConversations(userId, limit)
      return conversations.map(conv => ({
        id: conv.id,
        summary: conv.summary || 'No summary available',
        createdAt: conv.createdAt,
        messageCount: conv.messages.length
      }))
    } catch (error) {
      console.error('Failed to get conversation history:', error)
      return []
    }
  }

  // Get personalized suggestions based on user's history
  static async getPersonalizedSuggestions(userId: string): Promise<string[]> {
    try {
      const termStats = await this.getUserMedicalTermStats(userId)
      const preferences = await MemoryService.getUserPreferences(userId)
      
      const suggestions: string[] = []
      
      // Suggest based on frequently used terms
      if (termStats.mostUsedTerms.length > 0) {
        const topTerm = termStats.mostUsedTerms[0]
        suggestions.push(`Ask about ${topTerm.term} billing codes`)
        suggestions.push(`Learn more about ${topTerm.term} complications`)
      }
      
      // Suggest based on user preferences
      if (preferences.response_style === 'detailed') {
        suggestions.push('Request comprehensive explanations for complex procedures')
      }
      
      if (preferences.medical_level === 'advanced') {
        suggestions.push('Ask about advanced billing strategies')
        suggestions.push('Request information about complex coding scenarios')
      }
      
      // Default suggestions if no history
      if (suggestions.length === 0) {
        suggestions.push('Ask about diabetes mellitus billing codes')
        suggestions.push('Learn about hypertension management procedures')
        suggestions.push('Request information about eye examination coding')
      }
      
      return suggestions.slice(0, 3) // Return top 3 suggestions
    } catch (error) {
      console.error('Failed to get personalized suggestions:', error)
      return ['Ask about medical billing codes', 'Learn about form completion', 'Request terminology definitions']
    }
  }

  // Clear user memory (for privacy/reset)
  static async clearUserMemory(userId: string): Promise<boolean> {
    try {
      // Get all user memories
      const memories = await MemoryService.getMemory(userId)
      
      // Delete each memory entry
      for (const memory of memories) {
        await MemoryService.deleteMemory(memory.id)
      }
      
      console.log(`Cleared ${memories.length} memory entries for user ${userId}`)
      return true
    } catch (error) {
      console.error('Failed to clear user memory:', error)
      return false
    }
  }

  // Get memory statistics for admin/debugging
  static async getMemoryStatistics(): Promise<any> {
    try {
      return await MemoryService.getMemoryStats()
    } catch (error) {
      console.error('Failed to get memory statistics:', error)
      return null
    }
  }
}

export default AIAssistantService 
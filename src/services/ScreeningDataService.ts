// Data service layer for managing screening data
export interface CompletedScreening {
  id: string
  patientName: string
  patientId: string
  dateCompleted: string
  technician: string
  status: string
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    dateOfBirth: string
    pcpName: string
    pcpLocation: string
    lastVisit: string
    status: 'active' | 'inactive'
  }
  screeningDetails: {
    dateOfScreening: string
    placeOfService: string
    pcpLocation: string
    practicePhone: string
    practiceFax: string
    practiceEmail: string
    practiceName: string
    practiceLocation: string
    officeContact: string
    diabetesMellitus: 'yes' | 'no' | ''
    diabetesType: 'type1' | 'type2' | ''
    lastEyeExam: string
    ocularHistory: string[]
    ocularSurgery: string[]
    ocularHistoryOther: string
    ocularSurgeryOther: string
  }
  retinalImages: {
    rightEyeMissing: boolean
    leftEyeMissing: boolean
    rightEyeImages: Array<{ base64: string; filename: string }> | File[]
    leftEyeImages: Array<{ base64: string; filename: string }> | File[]
    technicianComments: string
  }
}

export interface SavedScreening {
  id: string
  patientName: string
  patientId: string
  dateSaved: string
  progress: string
  technician: string
}

export interface DashboardStats {
  completedPatientForms: number
  savedPatientForms: number
}

class ScreeningDataService {
  private static STORAGE_KEYS = {
    COMPLETED_SCREENINGS: 'alivi_completed_screenings',
    SAVED_SCREENINGS: 'alivi_saved_screenings',
    DASHBOARD_STATS: 'alivi_dashboard_stats'
  }

  // Helper function to create File objects from image URLs
  private static async createImageFile(url: string, filename: string): Promise<File> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new File([blob], filename, { type: 'image/jpeg' })
    } catch (error) {
      console.error(`Error creating file from ${url}:`, error)
      // Return a fallback file if fetch fails
      return new File([''], filename, { type: 'image/jpeg' })
    }
  }

  // Helper function to create retinal image files
  private static async createRetinalImageFiles(): Promise<{ rightEyeImages: File[], leftEyeImages: File[] }> {
    const baseUrl = '/images/'
    
    // Create right eye images (using retinal-imaging-1.jpg and retinal-imaging-2.jpg)
    const rightEyeImages = await Promise.all([
      this.createImageFile(`${baseUrl}retinal-imaging-1.jpg`, 'right-eye-image-1.jpg'),
      this.createImageFile(`${baseUrl}retinal-imaging-2.jpg`, 'right-eye-image-2.jpg')
    ])

    // Create left eye images (using retinal-imaging-2.jpg and retinal-imaging-3.jpg)
    const leftEyeImages = await Promise.all([
      this.createImageFile(`${baseUrl}retinal-imaging-2.jpg`, 'left-eye-image-1.jpg'),
      this.createImageFile(`${baseUrl}retinal-imaging-3.jpg`, 'left-eye-image-2.jpg')
    ])

    return { rightEyeImages, leftEyeImages }
  }

  // Helper function to convert File to base64 string for storage
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Helper function to convert base64 string back to File object
  private static base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Initialize with default data if storage is empty
  private static async initializeDefaultData() {
    console.log('Checking localStorage for existing data...')
    // Initialize completed screenings if empty
    if (!localStorage.getItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS)) {
      console.log('No completed screenings found, initializing default data...')
      
      // Create retinal image files
      const { rightEyeImages, leftEyeImages } = await this.createRetinalImageFiles()
      
      // Convert File objects to base64 strings for storage
      const rightEyeImagesBase64 = await Promise.all(
        rightEyeImages.map(async (file, index) => ({
          base64: await this.fileToBase64(file),
          filename: `right-eye-image-${index + 1}.jpg`
        }))
      )
      
      const leftEyeImagesBase64 = await Promise.all(
        leftEyeImages.map(async (file, index) => ({
          base64: await this.fileToBase64(file),
          filename: `left-eye-image-${index + 1}.jpg`
        }))
      )
      
      const defaultCompletedScreenings: CompletedScreening[] = [
        {
          id: 'completed-001',
          patientName: 'Maria Rodriguez',
          patientId: '12345678',
          dateCompleted: '2025-01-15T10:30:00',
          technician: 'Sarah Johnson',
          status: 'Processed',
          patient: {
            id: 'patient-001',
            patientId: '12345678',
            firstName: 'Maria',
            lastName: 'Rodriguez',
            dateOfBirth: '1985-03-15',
            pcpName: 'Dr. Smith',
            pcpLocation: 'Miami Medical Center',
            lastVisit: '2024-12-10',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-15',
            placeOfService: 'Office Visit',
            pcpLocation: 'Miami Medical Center',
            practicePhone: '305-555-0100',
            practiceFax: '305-555-0101',
            practiceEmail: 'contact@miamimedical.com',
            practiceName: 'Miami Medical Center',
            practiceLocation: '123 Medical Plaza',
            officeContact: 'Dr. Smith',
            diabetesMellitus: 'yes',
            diabetesType: 'type2',
            lastEyeExam: '2024-06-15',
            ocularHistory: ['Glaucoma', 'Cataracts'],
            ocularSurgery: ['Cataract Surgery'],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Both eyes photographed successfully. Images clear and high quality.'
          }
        },
        {
          id: 'completed-002',
          patientName: 'Robert Chen',
          patientId: '87654321',
          dateCompleted: '2025-01-14T14:45:00',
          technician: 'Mike Chen',
          status: 'Processed',
          patient: {
            id: 'patient-002',
            patientId: '87654321',
            firstName: 'Robert',
            lastName: 'Chen',
            dateOfBirth: '1978-07-22',
            pcpName: 'Dr. Johnson',
            pcpLocation: 'Coral Gables Eye Care',
            lastVisit: '2024-11-28',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-14',
            placeOfService: 'Office Visit',
            pcpLocation: 'Coral Gables Eye Care',
            practicePhone: '305-555-0200',
            practiceFax: '305-555-0201',
            practiceEmail: 'contact@coralgableseye.com',
            practiceName: 'Coral Gables Eye Care',
            practiceLocation: '456 Eye Street',
            officeContact: 'Dr. Johnson',
            diabetesMellitus: 'no',
            diabetesType: '',
            lastEyeExam: '2024-08-20',
            ocularHistory: ['Myopia'],
            ocularSurgery: [],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Standard screening completed. No abnormalities detected.'
          }
        },
        {
          id: 'completed-003',
          patientName: 'Jennifer Williams',
          patientId: '11223344',
          dateCompleted: '2025-01-13T09:15:00',
          technician: 'Sarah Johnson',
          status: 'Processed',
          patient: {
            id: 'patient-003',
            patientId: '11223344',
            firstName: 'Jennifer',
            lastName: 'Williams',
            dateOfBirth: '1992-11-08',
            pcpName: 'Dr. Davis',
            pcpLocation: 'Broward Eye Associates',
            lastVisit: '2024-12-05',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-13',
            placeOfService: 'Office Visit',
            pcpLocation: 'Broward Eye Associates',
            practicePhone: '305-555-0300',
            practiceFax: '305-555-0301',
            practiceEmail: 'contact@browardeye.com',
            practiceName: 'Broward Eye Associates',
            practiceLocation: '789 Vision Blvd',
            officeContact: 'Dr. Davis',
            diabetesMellitus: 'yes',
            diabetesType: 'type1',
            lastEyeExam: '2024-09-12',
            ocularHistory: ['Diabetic Retinopathy'],
            ocularSurgery: ['Laser Treatment'],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Diabetic screening completed. Retinal images show stable condition.'
          }
        },
        {
          id: 'completed-004',
          patientName: 'Michael Thompson',
          patientId: '99887766',
          dateCompleted: '2025-01-12T14:30:00',
          technician: 'Mike Chen',
          status: 'Processed',
          patient: {
            id: 'patient-004',
            patientId: '99887766',
            firstName: 'Michael',
            lastName: 'Thompson',
            dateOfBirth: '1980-05-20',
            pcpName: 'Dr. Wilson',
            pcpLocation: 'Palm Beach Eye Institute',
            lastVisit: '2024-11-15',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-12',
            placeOfService: 'Office Visit',
            pcpLocation: 'Palm Beach Eye Institute',
            practicePhone: '561-555-0400',
            practiceFax: '561-555-0401',
            practiceEmail: 'contact@palmbeacheye.com',
            practiceName: 'Palm Beach Eye Institute',
            practiceLocation: '456 Palm Beach Blvd',
            officeContact: 'Dr. Wilson',
            diabetesMellitus: 'no',
            diabetesType: '',
            lastEyeExam: '2024-07-20',
            ocularHistory: ['Hypertension', 'High Cholesterol'],
            ocularSurgery: [],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Routine screening completed. No abnormalities detected. Both eyes photographed successfully.'
          }
        },
        {
          id: 'completed-005',
          patientName: 'Lisa Garcia',
          patientId: '55443322',
          dateCompleted: '2025-01-11T11:45:00',
          technician: 'Sarah Johnson',
          status: 'Processed',
          patient: {
            id: 'patient-005',
            patientId: '55443322',
            firstName: 'Lisa',
            lastName: 'Garcia',
            dateOfBirth: '1975-12-03',
            pcpName: 'Dr. Martinez',
            pcpLocation: 'Orlando Vision Center',
            lastVisit: '2024-10-28',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-11',
            placeOfService: 'Office Visit',
            pcpLocation: 'Orlando Vision Center',
            practicePhone: '407-555-0500',
            practiceFax: '407-555-0501',
            practiceEmail: 'contact@orlandovision.com',
            practiceName: 'Orlando Vision Center',
            practiceLocation: '789 Orlando Ave',
            officeContact: 'Dr. Martinez',
            diabetesMellitus: 'yes',
            diabetesType: 'type2',
            lastEyeExam: '2024-08-15',
            ocularHistory: ['Cataracts', 'Glaucoma'],
            ocularSurgery: ['Cataract Surgery'],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Comprehensive screening for diabetic patient with cataract history. Images show stable condition.'
          }
        },
        {
          id: 'completed-006',
          patientName: 'David Lee',
          patientId: '11223344',
          dateCompleted: '2025-01-10T16:20:00',
          technician: 'Mike Chen',
          status: 'Processed',
          patient: {
            id: 'patient-006',
            patientId: '11223344',
            firstName: 'David',
            lastName: 'Lee',
            dateOfBirth: '1988-09-14',
            pcpName: 'Dr. Kim',
            pcpLocation: 'Tampa Bay Eye Care',
            lastVisit: '2024-12-20',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-10',
            placeOfService: 'Office Visit',
            pcpLocation: 'Tampa Bay Eye Care',
            practicePhone: '813-555-0600',
            practiceFax: '813-555-0601',
            practiceEmail: 'contact@tampabayeye.com',
            practiceName: 'Tampa Bay Eye Care',
            practiceLocation: '321 Tampa Street',
            officeContact: 'Dr. Kim',
            diabetesMellitus: 'no',
            diabetesType: '',
            lastEyeExam: '2024-06-10',
            ocularHistory: ['Myopia'],
            ocularSurgery: [],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Standard screening completed. Patient has myopia but no other ocular conditions detected.'
          }
        },
        {
          id: 'completed-007',
          patientName: 'Amanda Foster',
          patientId: '66778899',
          dateCompleted: '2025-01-09T13:15:00',
          technician: 'Sarah Johnson',
          status: 'Processed',
          patient: {
            id: 'patient-007',
            patientId: '66778899',
            firstName: 'Amanda',
            lastName: 'Foster',
            dateOfBirth: '1990-03-25',
            pcpName: 'Dr. Patel',
            pcpLocation: 'Jacksonville Eye Associates',
            lastVisit: '2024-11-30',
            status: 'active'
          },
          screeningDetails: {
            dateOfScreening: '2025-01-09',
            placeOfService: 'Office Visit',
            pcpLocation: 'Jacksonville Eye Associates',
            practicePhone: '904-555-0700',
            practiceFax: '904-555-0701',
            practiceEmail: 'contact@jacksonvilleeye.com',
            practiceName: 'Jacksonville Eye Associates',
            practiceLocation: '654 Jacksonville Blvd',
            officeContact: 'Dr. Patel',
            diabetesMellitus: 'yes',
            diabetesType: 'type1',
            lastEyeExam: '2024-09-05',
            ocularHistory: ['Diabetic Retinopathy'],
            ocularSurgery: ['Laser Treatment'],
            ocularHistoryOther: '',
            ocularSurgeryOther: ''
          },
          retinalImages: {
            rightEyeMissing: false,
            leftEyeMissing: false,
            rightEyeImages: rightEyeImagesBase64,
            leftEyeImages: leftEyeImagesBase64,
            technicianComments: 'Diabetic retinopathy screening. Previous laser treatment appears effective. No new abnormalities detected.'
          }
        }
      ]
      localStorage.setItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS, JSON.stringify(defaultCompletedScreenings))
      console.log('Completed screenings initialized with', defaultCompletedScreenings.length, 'records')
    }

    // Initialize saved screenings if empty
    if (!localStorage.getItem(this.STORAGE_KEYS.SAVED_SCREENINGS)) {
      console.log('No saved screenings found, initializing default data...')
      const defaultSavedScreenings: SavedScreening[] = [
        {
          id: 'saved-001',
          patientName: 'Alice Johnson',
          patientId: '55556666',
          dateSaved: '2025-07-03T21:44:00', // 25 days ago - 5 days until auto-delete (URGENT)
          progress: 'Step 2 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-002',
          patientName: 'David Brown',
          patientId: '77778888',
          dateSaved: '2025-07-04T01:54:00', // 24 days ago - 6 days until auto-delete (URGENT)
          progress: 'Step 2 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-003',
          patientName: 'Emily Davis',
          patientId: '99990000',
          dateSaved: '2025-07-05T05:00:00', // 23 days ago - 7 days until auto-delete (WARNING)
          progress: 'Step 3 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-004',
          patientName: 'Frank Miller',
          patientId: '11112222',
          dateSaved: '2025-07-06T07:49:00', // 22 days ago - 8 days until auto-delete (WARNING)
          progress: 'Step 4 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-005',
          patientName: 'Grace Lee',
          patientId: '33334444',
          dateSaved: '2025-07-07T03:43:00', // 21 days ago - 9 days until auto-delete (WARNING)
          progress: 'Step 2 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-006',
          patientName: 'Henry White',
          patientId: '55556666',
          dateSaved: '2025-07-08T18:23:00', // 20 days ago - 10 days until auto-delete (WARNING)
          progress: 'Step 3 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-007',
          patientName: 'Isabella Clark',
          patientId: '77778888',
          dateSaved: '2025-07-09T17:07:00', // 19 days ago - 11 days until auto-delete (SAFE)
          progress: 'Step 4 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-008',
          patientName: 'James Hall',
          patientId: '99990000',
          dateSaved: '2025-07-10T06:14:00', // 18 days ago - 12 days until auto-delete (SAFE)
          progress: 'Step 2 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-009',
          patientName: 'Katherine Young',
          patientId: '11112222',
          dateSaved: '2025-07-11T21:28:00', // 17 days ago - 13 days until auto-delete (SAFE)
          progress: 'Step 3 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-010',
          patientName: 'Lucas King',
          patientId: '33334444',
          dateSaved: '2025-07-12T14:53:00', // 16 days ago - 14 days until auto-delete (SAFE)
          progress: 'Step 2 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-011',
          patientName: 'Mia Wright',
          patientId: '55556666',
          dateSaved: '2025-07-13T11:08:00', // 15 days ago - 15 days until auto-delete (SAFE)
          progress: 'Step 3 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-012',
          patientName: 'Noah Green',
          patientId: '77778888',
          dateSaved: '2025-07-14T06:15:00', // 14 days ago - 16 days until auto-delete (SAFE)
          progress: 'Step 4 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-013',
          patientName: 'Olivia Taylor',
          patientId: '99990000',
          dateSaved: '2025-07-15T13:54:00', // 13 days ago - 17 days until auto-delete (SAFE)
          progress: 'Step 2 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-014',
          patientName: 'Peter Anderson',
          patientId: '11112222',
          dateSaved: '2025-07-16T02:08:00', // 12 days ago - 18 days until auto-delete (SAFE)
          progress: 'Step 2 of 4',
          technician: 'Mike Chen'
        },
        {
          id: 'saved-015',
          patientName: 'Quinn Martinez',
          patientId: '33334444',
          dateSaved: '2025-07-17T07:59:00', // 11 days ago - 19 days until auto-delete (SAFE)
          progress: 'Step 3 of 4',
          technician: 'Sarah Johnson'
        },
        {
          id: 'saved-016',
          patientName: 'Rachel Wilson',
          patientId: '55556666',
          dateSaved: '2025-07-18T15:13:00', // 10 days ago - 20 days until auto-delete (SAFE)
          progress: 'Step 4 of 4',
          technician: 'Mike Chen'
        }
      ]
      localStorage.setItem(this.STORAGE_KEYS.SAVED_SCREENINGS, JSON.stringify(defaultSavedScreenings))
      console.log('Saved screenings initialized with', defaultSavedScreenings.length, 'records')
    }

    // Initialize dashboard stats if empty
    if (!localStorage.getItem(this.STORAGE_KEYS.DASHBOARD_STATS)) {
      console.log('No dashboard stats found, initializing default data...')
      const defaultStats: DashboardStats = {
        completedPatientForms: 7,
        savedPatientForms: 16
      }
      localStorage.setItem(this.STORAGE_KEYS.DASHBOARD_STATS, JSON.stringify(defaultStats))
      console.log('Dashboard stats initialized:', defaultStats)
    }
    console.log('Data initialization complete')
  }

  // Initialize the service
  static async initialize() {
    console.log('Initializing ScreeningDataService...')
    await this.initializeDefaultData()
    console.log('ScreeningDataService initialization complete')
  }

  // Force reinitialize all data (useful for testing)
  static async forceReinitialize() {
    console.log('Force reinitializing ScreeningDataService...')
    // Clear existing data
    localStorage.removeItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS)
    localStorage.removeItem(this.STORAGE_KEYS.SAVED_SCREENINGS)
    localStorage.removeItem(this.STORAGE_KEYS.DASHBOARD_STATS)
    // Reinitialize
    await this.initializeDefaultData()
    console.log('Force reinitialization complete')
  }

  // Completed Screenings Methods
  static getCompletedScreenings(): CompletedScreening[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading completed screenings:', error)
      return []
    }
  }

  static saveCompletedScreening(screening: CompletedScreening): void {
    try {
      const existing = this.getCompletedScreenings()
      existing.push(screening)
      localStorage.setItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS, JSON.stringify(existing))
      
      // Update dashboard stats
      this.updateDashboardStats({
        completedPatientForms: existing.length,
        savedPatientForms: this.getSavedScreenings().length
      })
    } catch (error) {
      console.error('Error saving completed screening:', error)
    }
  }

  static getCompletedScreeningById(id: string): CompletedScreening | null {
    const screenings = this.getCompletedScreenings()
    return screenings.find(screening => screening.id === id) || null
  }

  // Saved Screenings Methods
  static getSavedScreenings(): SavedScreening[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SAVED_SCREENINGS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading saved screenings:', error)
      return []
    }
  }

  static saveScreeningForLater(screening: SavedScreening): void {
    try {
      const existing = this.getSavedScreenings()
      existing.push(screening)
      localStorage.setItem(this.STORAGE_KEYS.SAVED_SCREENINGS, JSON.stringify(existing))
      
      // Update dashboard stats
      this.updateDashboardStats({
        completedPatientForms: this.getCompletedScreenings().length,
        savedPatientForms: existing.length
      })
    } catch (error) {
      console.error('Error saving screening for later:', error)
    }
  }

  static removeSavedScreening(id: string): void {
    try {
      const existing = this.getSavedScreenings()
      const filtered = existing.filter(screening => screening.id !== id)
      localStorage.setItem(this.STORAGE_KEYS.SAVED_SCREENINGS, JSON.stringify(filtered))
      
      // Update dashboard stats
      this.updateDashboardStats({
        completedPatientForms: this.getCompletedScreenings().length,
        savedPatientForms: filtered.length
      })
    } catch (error) {
      console.error('Error removing saved screening:', error)
    }
  }

  // Dashboard Stats Methods
  static getDashboardStats(): DashboardStats {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DASHBOARD_STATS)
      return data ? JSON.parse(data) : { completedPatientForms: 0, savedPatientForms: 0 }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      return { completedPatientForms: 0, savedPatientForms: 0 }
    }
  }

  static updateDashboardStats(stats: DashboardStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.DASHBOARD_STATS, JSON.stringify(stats))
    } catch (error) {
      console.error('Error updating dashboard stats:', error)
    }
  }

  static incrementCompletedCount(): void {
    const stats = this.getDashboardStats()
    stats.completedPatientForms += 1
    this.updateDashboardStats(stats)
  }

  static incrementSavedCount(): void {
    const stats = this.getDashboardStats()
    stats.savedPatientForms += 1
    this.updateDashboardStats(stats)
  }

  // Utility Methods
  static clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.COMPLETED_SCREENINGS)
      localStorage.removeItem(this.STORAGE_KEYS.SAVED_SCREENINGS)
      localStorage.removeItem(this.STORAGE_KEYS.DASHBOARD_STATS)
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  static exportData(): { completed: CompletedScreening[], saved: SavedScreening[], stats: DashboardStats } {
    return {
      completed: this.getCompletedScreenings(),
      saved: this.getSavedScreenings(),
      stats: this.getDashboardStats()
    }
  }

  // Debug method to check current data
  static debugCurrentData() {
    console.log('=== ScreeningDataService Debug ===')
    console.log('Completed screenings:', this.getCompletedScreenings().length)
    console.log('Saved screenings:', this.getSavedScreenings().length)
    console.log('Dashboard stats:', this.getDashboardStats())
    console.log('localStorage keys:')
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('alivi_')) {
        console.log(`  ${key}:`, localStorage.getItem(key) ? 'has data' : 'empty')
      }
    })
    console.log('=== End Debug ===')
  }
}

export default ScreeningDataService 
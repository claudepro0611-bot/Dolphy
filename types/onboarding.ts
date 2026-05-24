export interface PersonalInfo {
  lastName: string
  firstName: string
  middleName?: string
  birthDate: Date
  passportSeries: string
  passportNumber: string
  jshshir: string
}

export interface DocumentUrls {
  passportFront: string
  passportBack: string
  licenseFront: string
  licenseBack: string
  techPassport: string
  selfieWithPassport: string
}

export type VehicleType = 'damas' | 'labo' | 'isuzu' | 'fura' | 'gazel'

export interface VehicleInfo {
  vehicleType: VehicleType
  brand: string
  model: string
  year: number
  plateNumber: string
  capacityKg: number
  volumeM3: number
}

export interface VehiclePhotos {
  front: string
  back: string
  left: string
  right: string
  interior: string
}

export interface BankCard {
  cardNumber: string
  expiryDate: string
  holderName: string
}

export interface OnboardingState {
  phone: string
  personalInfo: PersonalInfo | null
  documents: DocumentUrls | null
  vehicleInfo: VehicleInfo | null
  vehiclePhotos: VehiclePhotos | null
  bankCard: BankCard | null
  currentStep: number
}

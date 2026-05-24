import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PersonalInfo, DocumentUrls, VehicleInfo, VehiclePhotos, BankCard } from '@/types/onboarding'

interface OnboardingStore {
  phone: string
  personalInfo: PersonalInfo | null
  documents: DocumentUrls | null
  vehicleInfo: VehicleInfo | null
  vehiclePhotos: VehiclePhotos | null
  bankCard: BankCard | null
  currentStep: number
  setPhone: (phone: string) => void
  setPersonalInfo: (info: PersonalInfo) => void
  setDocuments: (docs: DocumentUrls) => void
  setVehicleInfo: (info: VehicleInfo) => void
  setVehiclePhotos: (photos: VehiclePhotos) => void
  setBankCard: (card: BankCard) => void
  setCurrentStep: (step: number) => void
  reset: () => void
}

const initialState = {
  phone: '',
  personalInfo: null,
  documents: null,
  vehicleInfo: null,
  vehiclePhotos: null,
  bankCard: null,
  currentStep: 1,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,
      setPhone: (phone) => set({ phone }),
      setPersonalInfo: (personalInfo) => set({ personalInfo }),
      setDocuments: (documents) => set({ documents }),
      setVehicleInfo: (vehicleInfo) => set({ vehicleInfo }),
      setVehiclePhotos: (vehiclePhotos) => set({ vehiclePhotos }),
      setBankCard: (bankCard) => set({ bankCard }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      reset: () => set(initialState),
    }),
    { name: 'onboarding-storage' }
  )
)

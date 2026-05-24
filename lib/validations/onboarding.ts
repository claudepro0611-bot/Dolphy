import { z } from 'zod'
import { differenceInYears } from 'date-fns'

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri")
})

export const otpSchema = z.object({
  code: z.string().length(6, "6 ta raqam kiriting")
})

export const personalInfoSchema = z.object({
  lastName: z.string().min(2, "Kamida 2 harf").max(50),
  firstName: z.string().min(2, "Kamida 2 harf").max(50),
  middleName: z.string().optional(),
  birthDate: z.date({ error: "Tug'ilgan sanani kiriting" })
    .refine(date => {
      const age = differenceInYears(new Date(), date)
      return age >= 18 && age <= 70
    }, "Yosh 18-70 oralig'ida bo'lishi kerak"),
  passportSeries: z.string().regex(/^[A-Z]{2}$/, "Masalan: AA"),
  passportNumber: z.string().regex(/^\d{7}$/, "7 ta raqam"),
  jshshir: z.string().regex(/^\d{14}$/, "14 ta raqam bo'lishi kerak"),
})

export const vehicleSchema = z.object({
  vehicleType: z.enum(['damas', 'labo', 'isuzu', 'fura', 'gazel']),
  brand: z.string().min(2, "Markani kiriting"),
  model: z.string().min(1, "Modelni kiriting"),
  year: z.number().min(1990, "1990 dan katta").max(2024, "2024 dan kichik"),
  plateNumber: z.string().regex(/^\d{2}[A-Z]\d{3}[A-Z]{2}$/, "Format: 01A123BC"),
  capacityKg: z.number().min(100, "Kamida 100 kg").max(40000, "Ko'pi 40000 kg"),
  volumeM3: z.number().min(0.5, "Kamida 0.5 m³").max(120, "Ko'pi 120 m³"),
})

export const bankCardSchema = z.object({
  cardNumber: z.string()
    .regex(/^[0-9]{16}$/, "16 ta raqam kiriting")
    .refine(n => ['8600', '9860', '4169', '5614'].includes(n.slice(0, 4)),
      "Faqat Uzcard, Humo yoki Visa"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: OO/YY")
    .refine(val => {
      const [m, y] = val.split('/')
      return new Date(2000 + +y, +m - 1) > new Date()
    }, "Karta muddati o'tgan"),
  holderName: z.string().min(3, "To'liq ism kiriting"),
})

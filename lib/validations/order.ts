import { z } from "zod"

export const orderSchema = z.object({
  order_type: z.enum(["product", "service"]),
  product_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  client_id: z.string().uuid("Please select a client"),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
  form_data: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.order_type === "product") return !!data.product_id
    if (data.order_type === "service") return !!data.service_id
    return false
  },
  { message: "Please select a product or service", path: ["product_id"] }
)

export const ghanaCardFormSchema = z.object({
  applicant_name: z.string().min(2, "Full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  nationality: z.string().default("Ghanaian"),
  region: z.string().min(1, "Region is required"),
  district: z.string().min(1, "District is required"),
  community: z.string().optional(),
  phone_number: z.string().min(10, "Phone number is required"),
})

export const birthCertificateFormSchema = z.object({
  child_name: z.string().min(2, "Child's full name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  place_of_birth: z.string().min(1, "Place of birth is required"),
  father_name: z.string().min(2, "Father's name is required"),
  mother_name: z.string().min(2, "Mother's name is required"),
  hospital: z.string().optional(),
  district: z.string().min(1, "District is required"),
})

export const visaFormSchema = z.object({
  applicant_name: z.string().min(2, "Full name is required"),
  passport_number: z.string().min(5, "Passport number is required"),
  destination_country: z.string().min(2, "Destination country is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  travel_date: z.string().min(1, "Travel date is required"),
  return_date: z.string().optional(),
  purpose: z.string().optional(),
})

export type OrderInput = z.infer<typeof orderSchema>
export type GhanaCardFormInput = z.infer<typeof ghanaCardFormSchema>
export type BirthCertificateFormInput = z.infer<typeof birthCertificateFormSchema>
export type VisaFormInput = z.infer<typeof visaFormSchema>

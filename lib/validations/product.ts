import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.enum(["laptop", "accessory"]),
  brand: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string()).optional(),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  is_available: z.boolean().default(true),
})

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  base_price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.enum(["ghana_card", "birth_certificate", "visa"]),
  is_variable_pricing: z.boolean().default(false),
  required_documents: z.array(z.string()).optional(),
  processing_time_days: z.coerce.number().int().positive().optional(),
  is_available: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productSchema>
export type ServiceInput = z.infer<typeof serviceSchema>

import { z } from "zod"

export const pointConfigSchema = z.object({
  percentage_rate: z.coerce.number().min(0).max(100),
  conversion_rate: z.coerce.number().int().positive(),
  min_redemption_points: z.coerce.number().int().positive(),
})

export const redemptionRequestSchema = z.object({
  points_amount: z.coerce.number().int().positive("Points must be a positive number"),
  payout_method: z.string().min(5, "Please enter your payout details (e.g. Mobile Money number)"),
})

export type PointConfigInput = z.infer<typeof pointConfigSchema>
export type RedemptionRequestInput = z.infer<typeof redemptionRequestSchema>

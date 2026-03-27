import { createHmac, timingSafeEqual } from "crypto"

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature) return false

  const hash = createHmac("sha512", secret).update(body).digest("hex")

  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
  } catch {
    return false
  }
}

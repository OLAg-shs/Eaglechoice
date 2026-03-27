import { NextResponse } from "next/server"
import crypto from "crypto"
import { processSuccessfulPayment } from "@/lib/actions/payments"

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: "Missing config" }, { status: 500 })

  const body = await req.json()
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(JSON.stringify(body))
    .digest("hex")

  if (hash !== req.headers.get("x-paystack-signature")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const { event, data } = body

  if (event === "charge.success") {
    const reference = data.reference
    await processSuccessfulPayment(reference)
  }

  return NextResponse.json({ status: "ok" })
}

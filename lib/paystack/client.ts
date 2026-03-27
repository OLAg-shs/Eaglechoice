interface PaystackInitParams {
  email: string
  amount: number // in GHS, will be converted to pesewas
  reference: string
  callback_url: string
  metadata?: Record<string, unknown>
  channels?: string[]
}

interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: string
    reference: string
    amount: number
    currency: string
    channel: string
    paid_at: string
    metadata: Record<string, unknown>
  }
}

const PAYSTACK_BASE_URL = "https://api.paystack.co"

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  }
}

export async function initializeTransaction(
  params: PaystackInitParams
): Promise<PaystackInitResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert GHS to pesewas
      reference: params.reference,
      callback_url: params.callback_url,
      currency: "GHS",
      channels: params.channels || ["mobile_money", "card", "bank_transfer"],
      metadata: params.metadata || {},
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack initialization failed: ${error}`)
  }

  return response.json()
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paystack verification failed: ${error}`)
  }

  return response.json()
}

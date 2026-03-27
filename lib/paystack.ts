export async function initializePaystackTransaction(email: string, amount: number, metadata: any) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // convert to pesewas (GHS)
      currency: "GHS",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
      metadata,
    }),
  })

  return await response.json()
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  return await response.json()
}

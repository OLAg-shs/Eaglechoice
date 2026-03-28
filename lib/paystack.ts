export async function initializePaystackTransaction(
  email: string,
  amount: number,
  metadata: any,
  subaccountCode?: string,
  adminPercentage?: number
) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  const body: any = {
    email,
    amount: Math.round(amount * 100), // convert to pesewas (GHS)
    currency: "GHS",
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
    metadata,
  }

  // If agent has a Paystack subaccount, split automatically
  if (subaccountCode) {
    body.subaccount = subaccountCode
    body.transaction_charge = Math.round(amount * ((adminPercentage ?? 20) / 100) * 100)
    body.bearer = "subaccount" // subaccount bears its own charge
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

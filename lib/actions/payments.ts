"use server"

import { createClient } from "@/lib/supabase/server"
import { initializePaystackTransaction, verifyPaystackTransaction } from "@/lib/paystack"
import { revalidatePath } from "next/cache"

export async function createPaymentIntent(orderId: string) {
  const supabase = await createClient()

  // 1. Get order details
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*, profiles!orders_user_id_fkey(email)")
    .eq("id", orderId)
    .single()

  if (orderErr || !order) return { error: "Order not found" }

  // 2. Initialize Paystack
  const res = await initializePaystackTransaction(
    (order.profiles as any).email,
    order.total_amount,
    { order_id: orderId, user_id: order.user_id }
  )

  if (!res.status) return { error: res.message }

  // 3. Log payment in database
  const { error: payErr } = await supabase.from("payments").insert({
    order_id: orderId,
    user_id: order.user_id,
    amount: order.total_amount,
    paystack_reference: res.data.reference,
    paystack_access_code: res.data.access_code,
    status: "pending"
  })

  if (payErr) return { error: payErr.message }

  return { 
    success: true, 
    authorization_url: res.data.authorization_url,
    reference: res.data.reference 
  }
}

export async function processSuccessfulPayment(reference: string) {
  const supabase = await createClient()

  // 1. Verify with Paystack
  const res = await verifyPaystackTransaction(reference)
  if (!res.status || res.data.status !== "success") {
    return { error: "Payment verification failed" }
  }

  const orderId = res.data.metadata.order_id
  const totalAmount = res.data.amount / 100

  // 2. Update Payment record
  const { data: payment, error: payUpdateErr } = await supabase
    .from("payments")
    .update({ 
      status: "success", 
      paid_at: new Date().toISOString(),
      metadata: res.data
    })
    .eq("paystack_reference", reference)
    .select()
    .single()

  if (payUpdateErr) return { error: payUpdateErr.message }

  // 3. Update Order status
  const { data: order, error: orderUpdateErr } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .select()
    .single()

  if (orderUpdateErr) return { error: orderUpdateErr.message }

  // 4. Calculate Agent Commission (5%)
  if (order.client_id) {
    const commissionAmount = Number((order.total_amount * 0.05).toFixed(2))
    
    // We treat 1 GHS = 100 points for simplicity in the Points Ledger
    const pointsToAdd = Math.round(commissionAmount * 100)

    // Get current balance
    const { data: latestLedger } = await supabase
      .from("points_ledger")
      .select("balance_after")
      .eq("client_id", order.client_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const currentBalance = latestLedger?.balance_after || 0

    await supabase.from("points_ledger").insert({
      client_id: order.client_id,
      order_id: orderId,
      type: "earned",
      points: pointsToAdd,
      balance_after: currentBalance + pointsToAdd,
      description: `Commission (5%) for Order ${order.order_number}`
    })
    
    // Also notify agent
    await supabase.from("notifications").insert({
      user_id: order.client_id,
      type: "commission_earned",
      title: "Commission Earned! 🎉",
      content: `You earned GHS ${commissionAmount} (${pointsToAdd} points) from order ${order.order_number}.`,
      link: `/client/points`
    })
  }

  revalidatePath("/user/orders")
  revalidatePath("/admin/orders")
  
  return { success: true }
}

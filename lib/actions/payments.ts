"use server"

import { createClient } from "@/lib/supabase/server"
import { initializePaystackTransaction, verifyPaystackTransaction } from "@/lib/paystack"
import { revalidatePath } from "next/cache"

export async function createPaymentIntent(orderId: string) {
  const supabase = await createClient()

  // 1. Get order details incl. store and agent
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(`*, 
      customer:profiles!orders_user_id_fkey(email),
      store:stores!orders_store_id_fkey(is_official, commission_rate),
      agent:profiles!orders_client_id_fkey(paystack_subaccount_code, commission_rate)
    `)
    .eq("id", orderId)
    .single()

  if (orderErr || !order) return { error: "Order not found" }

  const isOfficial = (order.store as any)?.is_official ?? true
  const platformCommissionRate = isOfficial ? 0 : ((order.store as any)?.commission_rate || 0.05)
  
  // For Paystack subaccount splits (if we use subaccounts for sellers/agents)
  const agentSubaccountCode = (order.agent as any)?.paystack_subaccount_code as string | null
  
  // Paystack subaccount logic: 'percentage_charge' is what the main account KEEPS
  // If platform takes 5%, we send 95% to the subaccount.
  const platformPercentage = isOfficial ? 100 : (platformCommissionRate * 100)

  // 2. Initialize Paystack
  const res = await initializePaystackTransaction(
    (order.customer as any).email,
    order.total_amount,
    { order_id: orderId, user_id: order.user_id },
    agentSubaccountCode || undefined,
    platformPercentage
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
  
  // 2. Fetch Order with Store details
  const { data: order } = await supabase
    .from("orders")
    .select("*, store:stores!orders_store_id_fkey(id, is_official, owner_id, commission_rate)")
    .eq("id", orderId)
    .single()
    
  if (!order) return { error: "Order not found" }

  // 3. Update Payment record
  const { error: payUpdateErr } = await supabase
    .from("payments")
    .update({ 
      status: "success", 
      paid_at: new Date().toISOString(),
      metadata: res.data
    })
    .eq("paystack_reference", reference)

  if (payUpdateErr) return { error: payUpdateErr.message }

  // 4. Update Order status
  const { error: orderUpdateErr } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)

  if (orderUpdateErr) return { error: orderUpdateErr.message }

  // 5. Calculate Split Logic
  const isOfficial = (order.store as any)?.is_official ?? true
  const totalAmount = order.total_amount
  
  if (!isOfficial) {
    // EXTERNAL SELLER: 5% platform fee
    const platformFee = Number((totalAmount * 0.05).toFixed(2))
    const sellerEarnings = Number((totalAmount - platformFee).toFixed(2))
    const sellerId = (order.store as any).owner_id

    // Credit Seller (95%)
    const pointsToSeller = Math.round(sellerEarnings * 100)
    const { data: sellerLedger } = await supabase.from("points_ledger").select("balance_after").eq("user_id", sellerId).order("created_at", { ascending: false }).limit(1).single()
    const currentSellerBal = sellerLedger?.balance_after || 0
    
    await supabase.from("points_ledger").insert({
      user_id: sellerId,
      order_id: orderId,
      type: "earned",
      points: pointsToSeller,
      balance_after: currentSellerBal + pointsToSeller,
      description: `Sale Earnings (95%) for Order ${order.order_number}`
    })

    // Notify Seller
    await supabase.from("notifications").insert({
      user_id: sellerId,
      type: "order_paid",
      title: "New Sale! 💰",
      content: `You earned GHS ${sellerEarnings} from order ${order.order_number}.`,
      link: `/store`
    })
  }

  // 6. Handle Agent Commission (Separate 5% or points if applicable)
  if (order.client_id) {
    const agentCommission = Number((totalAmount * 0.05).toFixed(2))
    const pointsToAgent = Math.round(agentCommission * 100)

    const { data: agentLedger } = await supabase.from("points_ledger").select("balance_after").eq("client_id", order.client_id).order("created_at", { ascending: false }).limit(1).single()
    const currentAgentBal = agentLedger?.balance_after || 0

    await supabase.from("points_ledger").insert({
      client_id: order.client_id,
      order_id: orderId,
      type: "earned",
      points: pointsToAgent,
      balance_after: currentAgentBal + pointsToAgent,
      description: `Agent Commission for Order ${order.order_number}`
    })
    
    await supabase.from("notifications").insert({
      user_id: order.client_id,
      type: "commission_earned",
      title: "Commission Earned! 🎉",
      content: `You earned GHS ${agentCommission} (${pointsToAgent} points) from order ${order.order_number}.`,
      link: `/agent/points`
    })
  }

  revalidatePath("/client/orders")
  revalidatePath("/admin/orders")
  revalidatePath("/store")
  
  return { success: true }
}

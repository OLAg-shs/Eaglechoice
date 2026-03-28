"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { orderSchema } from "@/lib/validations/order"
import { ALLOWED_TRANSITIONS, NOTIFICATION_TYPES, ORDER_STATUS_LABELS } from "@/lib/constants"
import type { OrderStatus } from "@/lib/constants"

export async function getOrders(
  filters?: { status?: string; client_id?: string }
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  let query = supabase
    .from("orders")
    .select(`
      *,
      product:products(id, name, price, category),
      service:services(id, name, base_price, category),
      user_profile:profiles!orders_user_id_fkey(id, full_name, email),
      client_profile:profiles!orders_client_id_fkey(id, full_name, email)
    `)
    .order("created_at", { ascending: false })

  // Role-based filtering
  if (profile?.role === "client") {
    query = query.eq("client_id", user.id)
  } else if (profile?.role === "user") {
    query = query.eq("user_id", user.id)
  }
  // Admin sees all orders

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getOrder(id: string): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      product:products(id, name, price, category, specifications, images),
      service:services(id, name, base_price, category, required_documents, processing_time_days),
      user_profile:profiles!orders_user_id_fkey(id, full_name, email, phone),
      client_profile:profiles!orders_client_id_fkey(id, full_name, email, phone),
      payment:payments(id, amount, status, paystack_reference, paid_at)
    `)
    .eq("id", id)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createOrder(formData: FormData): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  let formDataParsed: Record<string, any> | undefined
  const formDataRaw = formData.get("form_data") as string
  if (formDataRaw) {
    try {
      formDataParsed = JSON.parse(formDataRaw)
    } catch {
      return { data: null, error: "Invalid form data format" }
    }
  }

  const rawData = {
    order_type: formData.get("order_type") as string,
    product_id: (formData.get("product_id") as string) || undefined,
    service_id: (formData.get("service_id") as string) || undefined,
    client_id: formData.get("client_id") as string,
    quantity: formData.get("quantity") as string || "1",
    notes: (formData.get("notes") as string) || undefined,
    form_data: formDataParsed,
  }

  const validated = orderSchema.safeParse(rawData)
  if (!validated.success) {
    return { data: null, error: validated.error.issues[0].message }
  }

  // Calculate total_amount based on product price * quantity or service base_price
  let total_amount = 0

  if (validated.data.order_type === "product" && validated.data.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("price")
      .eq("id", validated.data.product_id)
      .single()

    if (!product) {
      return { data: null, error: "Product not found" }
    }

    total_amount = product.price * validated.data.quantity
  } else if (validated.data.order_type === "service" && validated.data.service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("base_price")
      .eq("id", validated.data.service_id)
      .single()

    if (!service) {
      return { data: null, error: "Service not found" }
    }

    total_amount = service.base_price * validated.data.quantity
  }

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      client_id: validated.data.client_id,
      order_type: validated.data.order_type,
      product_id: validated.data.product_id || null,
      service_id: validated.data.service_id || null,
      quantity: validated.data.quantity,
      total_amount,
      notes: validated.data.notes || null,
      form_data: validated.data.form_data || null,
      status: "pending",
    })
    .select()
    .single()

  if (orderError) {
    return { data: null, error: orderError.message }
  }

  // Create conversation between user and client
  await supabase.from("conversations").insert({
    participant_1: user.id,
    participant_2: validated.data.client_id,
    conversation_type: "order",
    order_id: order.id,
  })

  // Create notification for client
  await supabase.from("notifications").insert({
    user_id: validated.data.client_id,
    type: NOTIFICATION_TYPES.NEW_ORDER,
    title: "New Order Received",
    content: `You have received a new ${validated.data.order_type} order.`,
    link: `/orders/${order.id}`,
    metadata: { order_id: order.id },
  })

  // Create notification for admin(s)
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins) {
    const adminNotifications = admins.map((admin) => ({
      user_id: admin.id,
      type: NOTIFICATION_TYPES.NEW_ORDER,
      title: "New Order Created",
      content: `A new ${validated.data.order_type} order has been placed.`,
      link: `/admin/orders/${order.id}`,
      metadata: { order_id: order.id },
    }))

    if (adminNotifications.length > 0) {
      await supabase.from("notifications").insert(adminNotifications)
    }
  }

  revalidatePath("/orders")
  revalidatePath("/admin/orders")
  revalidatePath("/dashboard")

  return { data: order, error: null }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  // Fetch current order
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*, user_profile:profiles!orders_user_id_fkey(full_name)")
    .eq("id", orderId)
    .single()

  if (fetchError || !order) {
    return { error: "Order not found" }
  }

  // Validate status transition
  const currentStatus = order.status as OrderStatus
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus]

  if (!allowedNext || !allowedNext.includes(newStatus as OrderStatus)) {
    return { error: `Cannot transition from "${currentStatus}" to "${newStatus}"` }
  }

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Create notification for the order's user about the status change
  const statusLabel = ORDER_STATUS_LABELS[newStatus as OrderStatus] || newStatus
  await supabase.from("notifications").insert({
    user_id: order.user_id,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: "Order Status Updated",
    content: `Your order status has been updated to "${statusLabel}".`,
    link: `/orders/${orderId}`,
    metadata: { order_id: orderId, new_status: newStatus },
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return { success: true }
}

export async function cancelOrder(orderId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Fetch current order
  const { data: order } = await supabase
    .from("orders")
    .select("status, user_id, client_id")
    .eq("id", orderId)
    .single()

  if (!order) {
    return { error: "Order not found" }
  }

  // Can only cancel if pending or in_progress
  if (order.status !== "pending" && order.status !== "in_progress") {
    return { error: "This order can no longer be cancelled" }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Notify relevant parties
  const notifyUserId = user.id === order.user_id ? order.client_id : order.user_id
  await supabase.from("notifications").insert({
    user_id: notifyUserId,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: "Order Cancelled",
    content: "An order has been cancelled.",
    link: `/orders/${orderId}`,
    metadata: { order_id: orderId, new_status: "cancelled" },
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/admin/orders")

  return { success: true }
}

export async function getClients(): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("role", "client")
    .eq("is_active", true)
    .order("full_name", { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateOrderTracking(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const orderId = formData.get("orderId") as string
  const eta = formData.get("eta") as string
  const location = formData.get("location") as string
  const bus_number = formData.get("bus_number") as string
  const file = formData.get("image") as File | null

  let image_url = formData.get("current_image_url") as string || ""

  if (file && file.size > 0) {
    const adminSupabase = await createAdminClient()
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `tracking/${orderId}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await adminSupabase.storage
      .from('files')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
      
    if (!uploadError) {
      const { data: { publicUrl } } = adminSupabase.storage.from('files').getPublicUrl(fileName)
      image_url = publicUrl
    }
  }

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("form_data, user_id, status")
    .eq("id", orderId)
    .single()

  if (fetchError || !order) return { error: "Order not found" }

  const currentFormData = order.form_data || {}
  const currentTracking = currentFormData.tracking || {}
  
  const newTracking = { 
    ...currentTracking, 
    eta: eta !== "" ? eta : currentTracking.eta, 
    location: location !== "" ? location : currentTracking.location, 
    bus_number: bus_number !== "" ? bus_number : currentTracking.bus_number, 
    image_url: image_url || currentTracking.image_url 
  }
  
  const newFormData = { ...currentFormData, tracking: newTracking }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ form_data: newFormData })
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  // Notify user
  await supabase.from("notifications").insert({
    user_id: order.user_id,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: "Logistics Package Update",
    content: "Your package tracking details have been updated.",
    link: `/user/orders/${orderId}`,
    metadata: { order_id: orderId, tracking_update: true },
  })

  revalidatePath("/client/orders")
  revalidatePath(`/user/orders/${orderId}`)
  revalidatePath("/admin/orders")

  return { success: true }
}

export async function uploadPaymentProof(formData: FormData): Promise<{ error?: string; success?: boolean; url?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const orderId = formData.get("orderId") as string
  const file = formData.get("proof") as File
  if (!file || file.size === 0) return { error: "No file selected" }

  const { data: order } = await supabase.from("orders").select("client_id, user_id, order_number").eq("id", orderId).single()
  if (!order) return { error: "Order not found" }
  if (order.user_id !== user.id) return { error: "Unauthorized" }

  const adminSupabase = await createAdminClient()
  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `receipts/${orderId}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await adminSupabase.storage.from('files').upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = adminSupabase.storage.from('files').getPublicUrl(fileName)

  const { data: existing } = await supabase.from("orders").select("form_data").eq("id", orderId).single()
  const fd = (existing?.form_data as Record<string, any>) || {}
  await supabase.from("orders").update({ form_data: { ...fd, payment_proof_url: publicUrl } }).eq("id", orderId)

  if (order.client_id) {
    await supabase.from("notifications").insert({
      user_id: order.client_id,
      type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
      title: "Payment Proof Submitted 📎",
      content: `Customer uploaded a payment receipt for order ${order.order_number}. Please verify.`,
      link: `/client/orders`,
      metadata: { order_id: orderId },
    })
  }

  revalidatePath(`/user/orders/${orderId}`)
  return { success: true, url: publicUrl }
}

export async function confirmPaymentProof(orderId: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: order } = await supabase.from("orders").select("user_id, order_number, client_id").eq("id", orderId).single()
  if (!order) return { error: "Order not found" }

  await supabase.from("orders").update({ status: "processing" }).eq("id", orderId)

  await supabase.from("notifications").insert({
    user_id: order.user_id,
    type: NOTIFICATION_TYPES.ORDER_STATUS,
    title: "Payment Confirmed ✅",
    content: `Your payment for order ${order.order_number} has been verified. We're now processing your order!`,
    link: `/user/orders/${orderId}`,
    metadata: { order_id: orderId },
  })

  revalidatePath(`/client/orders`)
  revalidatePath(`/user/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { success: true }
}


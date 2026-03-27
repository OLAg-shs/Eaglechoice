"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { pointConfigSchema, redemptionRequestSchema } from "@/lib/validations/points"
import { NOTIFICATION_TYPES } from "@/lib/constants"

export async function getPointConfig(): Promise<{ data: any | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("point_config")
    .select("*")
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updatePointConfig(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const rawData = {
    percentage_rate: formData.get("percentage_rate") as string,
    conversion_rate: formData.get("conversion_rate") as string,
    min_redemption_points: formData.get("min_redemption_points") as string,
  }

  const validated = pointConfigSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  // Get existing config to get the id
  const { data: existing } = await supabase
    .from("point_config")
    .select("id")
    .single()

  if (!existing) {
    return { error: "Point config not found" }
  }

  const { error } = await supabase
    .from("point_config")
    .update(validated.data)
    .eq("id", existing.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/points")
  return { success: true }
}

export async function getPointsBalance(
  clientId?: string
): Promise<{ balance: number; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { balance: 0, error: "Not authenticated" }
  }

  const targetId = clientId || user.id

  // Fetch the latest ledger entry for balance_after
  const { data, error } = await supabase
    .from("points_ledger")
    .select("balance_after")
    .eq("client_id", targetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { balance: 0, error: error.message }
  }

  return { balance: data?.balance_after ?? 0, error: null }
}

export async function getPointsLedger(
  clientId?: string,
  limit: number = 50
): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const targetId = clientId || user.id

  const { data, error } = await supabase
    .from("points_ledger")
    .select("*")
    .eq("client_id", targetId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function requestRedemption(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user is a client
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "client") {
    return { error: "Only clients can request point redemptions" }
  }

  const rawData = {
    points_amount: formData.get("points_amount") as string,
    payout_method: formData.get("payout_method") as string,
  }

  const validated = redemptionRequestSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  // Get current balance
  const { balance, error: balanceError } = await getPointsBalance()
  if (balanceError) {
    return { error: balanceError }
  }

  if (balance < validated.data.points_amount) {
    return { error: "Insufficient points balance" }
  }

  // Get point config for min redemption and conversion rate
  const { data: config } = await getPointConfig()
  if (!config) {
    return { error: "Point configuration not found" }
  }

  if (validated.data.points_amount < config.min_redemption_points) {
    return { error: `Minimum redemption is ${config.min_redemption_points} points` }
  }

  // Calculate GHS amount
  const ghs_amount = validated.data.points_amount / config.conversion_rate

  // Insert redemption request
  const { error: insertError } = await supabase
    .from("redemption_requests")
    .insert({
      client_id: user.id,
      points_amount: validated.data.points_amount,
      ghs_amount,
      payout_method: validated.data.payout_method,
      status: "pending",
    })

  if (insertError) {
    return { error: insertError.message }
  }

  // Notify admin(s)
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")

  if (admins) {
    const adminNotifications = admins.map((admin) => ({
      user_id: admin.id,
      type: NOTIFICATION_TYPES.REDEMPTION_UPDATE,
      title: "New Redemption Request",
      content: `A client has requested to redeem ${validated.data.points_amount} points.`,
      link: "/admin/points/redemptions",
      metadata: { client_id: user.id, points_amount: validated.data.points_amount },
    }))

    if (adminNotifications.length > 0) {
      await supabase.from("notifications").insert(adminNotifications)
    }
  }

  revalidatePath("/points")
  revalidatePath("/admin/points")

  return { success: true }
}

export async function reviewRedemption(
  requestId: string,
  action: "approved" | "rejected",
  notes?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can review redemption requests" }
  }

  // Fetch the redemption request
  const { data: request } = await supabase
    .from("redemption_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (!request) {
    return { error: "Redemption request not found" }
  }

  if (request.status !== "pending") {
    return { error: "This request has already been reviewed" }
  }

  if (action === "approved") {
    // Validate client still has enough points
    const { balance, error: balanceError } = await getPointsBalance(request.client_id)
    if (balanceError) {
      return { error: balanceError }
    }

    if (balance < request.points_amount) {
      return { error: "Client no longer has sufficient points for this redemption" }
    }

    // Insert negative points_ledger entry
    const newBalance = balance - request.points_amount
    const { error: ledgerError } = await supabase
      .from("points_ledger")
      .insert({
        client_id: request.client_id,
        type: "redeemed",
        points: -request.points_amount,
        balance_after: newBalance,
        description: `Redeemed ${request.points_amount} points (${request.ghs_amount} GHS)`,
        reference_id: requestId,
      })

    if (ledgerError) {
      return { error: ledgerError.message }
    }

    // Update redemption status
    const { error: updateError } = await supabase
      .from("redemption_requests")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", requestId)

    if (updateError) {
      return { error: updateError.message }
    }
  } else {
    // Rejected - just update status
    const { error: updateError } = await supabase
      .from("redemption_requests")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", requestId)

    if (updateError) {
      return { error: updateError.message }
    }
  }

  // Notify client
  await supabase.from("notifications").insert({
    user_id: request.client_id,
    type: NOTIFICATION_TYPES.REDEMPTION_UPDATE,
    title: `Redemption ${action === "approved" ? "Approved" : "Rejected"}`,
    content:
      action === "approved"
        ? `Your redemption of ${request.points_amount} points has been approved. ${request.ghs_amount} GHS will be sent to you.`
        : `Your redemption request for ${request.points_amount} points has been rejected.${notes ? ` Reason: ${notes}` : ""}`,
    link: "/points",
    metadata: { redemption_id: requestId, action },
  })

  revalidatePath("/points")
  revalidatePath("/admin/points")
  revalidatePath("/admin/points/redemptions")

  return { success: true }
}

export async function getRedemptionRequests(
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
    .from("redemption_requests")
    .select(`
      *,
      client:profiles!redemption_requests_client_id_fkey(id, full_name, email)
    `)
    .order("created_at", { ascending: false })

  // Role-based filtering
  if (profile?.role === "client") {
    query = query.eq("client_id", user.id)
  }
  // Admin sees all

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

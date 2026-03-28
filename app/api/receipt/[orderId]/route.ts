import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { formatCurrency } from "@/lib/utils"

export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: order } = await supabase
    .from("orders")
    .select(`*, products(name, brand, images), services(name, category), profiles!orders_user_id_fkey(full_name, email), agent:profiles!orders_client_id_fkey(full_name, phone)`)
    .eq("id", orderId)
    .single()

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (order.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const itemName = order.products?.name || order.services?.name || "Item"
  const agentName = (order.agent as any)?.full_name || "Your Agent"
  const customerName = (order.profiles as any)?.full_name || "Customer"
  const customerEmail = (order.profiles as any)?.email || ""
  const paidAt = order.updated_at ? new Date(order.updated_at).toLocaleDateString("en-GH", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString()

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Eagle Choice Receipt – ${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f8f8f8; display: flex; justify-content: center; padding: 40px 20px; }
    .receipt { background: white; max-width: 560px; width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 40px 30px; color: white; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .logo-icon { width: 44px; height: 44px; background: #f59e0b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .receipt-title { font-size: 13px; text-transform: uppercase; letter-spacing: 4px; opacity: 0.6; margin-bottom: 6px; }
    .order-number { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
    .strip { background: #f59e0b; height: 4px; }
    .body { padding: 32px 40px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #9ca3af; font-weight: 700; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 14px; color: #374151; }
    .row-value { font-size: 14px; font-weight: 600; color: #111827; text-align: right; }
    .total-row { background: linear-gradient(135deg, #fef3c7, #fffbeb); border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
    .total-label { font-size: 14px; font-weight: 700; color: #92400e; }
    .total-value { font-size: 28px; font-weight: 900; color: #d97706; }
    .paid-badge { background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase; }
    .footer { background: #f9fafb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .print-btn { display: block; margin: 24px auto 0; background: #f59e0b; color: white; border: none; padding: 12px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">🦅</div>
        <span class="logo-text">Eagle Choice</span>
      </div>
      <div class="receipt-title">Payment Receipt</div>
      <div class="order-number">${order.order_number}</div>
    </div>
    <div class="strip"></div>
    <div class="body">
      <div class="section">
        <div class="section-title">Customer</div>
        <div class="row"><span class="row-label">Name</span><span class="row-value">${customerName}</span></div>
        <div class="row"><span class="row-label">Email</span><span class="row-value">${customerEmail}</span></div>
        <div class="row"><span class="row-label">Date</span><span class="row-value">${paidAt}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Order Details</div>
        <div class="row"><span class="row-label">Item</span><span class="row-value">${itemName}</span></div>
        <div class="row"><span class="row-label">Quantity</span><span class="row-value">${order.quantity}</span></div>
        <div class="row"><span class="row-label">Handled by</span><span class="row-value">${agentName}</span></div>
        <div class="row"><span class="row-label">Status</span><span class="paid-badge">${order.status}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Payment</div>
        <div class="total-row">
          <span class="total-label">Total Paid</span>
          <span class="total-value">GH₵ ${Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      Eagle Choice &bull; Trusted Laptop & Services Platform<br/>
      For enquiries contact your assigned agent.<br/>
      This is an official Eagle Choice receipt.
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}

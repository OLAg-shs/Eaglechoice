import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: agents } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client")
    .eq("is_verified", true)
    .order("full_name")

  return NextResponse.json({ agents: agents || [] })
}

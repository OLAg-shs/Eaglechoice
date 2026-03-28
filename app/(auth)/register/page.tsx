"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Loader2, ShoppingCart, Store } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

function SubmitBtn({ label, color }: { label: string; color: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-bold text-white text-sm mt-1 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ background: color }}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Creating account..." : label}
    </button>
  )
}

function Field({ id, name, type = "text", placeholder, label, color }: {
  id: string; name: string; type?: string; placeholder: string; label: string; color: string
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</label>
      <input
        id={id} name={name} type={type} placeholder={placeholder} required={type !== "tel"}
        minLength={type === "password" ? 8 : undefined}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
      />
    </div>
  )
}

export default function RegisterPage() {
  const [buyerError, setBuyerError] = useState("")
  const [sellerError, setSellerError] = useState("")

  async function handleBuyer(fd: FormData) {
    setBuyerError("")
    fd.set("role", "user")
    const r = await signUp(fd)
    if (r?.error) setBuyerError(r.error)
    else window.location.href = "/login?registered=1"
  }

  async function handleSeller(fd: FormData) {
    setSellerError("")
    fd.set("role", "seller")
    const r = await signUp(fd)
    if (r?.error) setSellerError(r.error)
    else window.location.href = "/sell/setup?new=1"
  }

  return (
    // Fixed overlay — escapes the auth card layout completely
    <div className="fixed inset-0 z-[9999] flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── BUYER PANEL (left) ── */}
      <div className="relative flex-1 group cursor-pointer overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d2657 50%, #1a3a8a 100%)" }}>

        {/* Glow blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          style={{ background: "#3b82f6" }} />

        {/* Default state — icon + text centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 transition-all duration-500 ease-in-out group-hover:-translate-y-8 group-hover:opacity-0 pointer-events-none select-none">
          <div className="h-28 w-28 rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-2xl">
            <ShoppingCart className="h-14 w-14 text-blue-300" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Buyer</h2>
            <p className="text-blue-200/60 text-sm mt-2 max-w-[200px]">Browse stores & shop from anywhere in Ghana</p>
          </div>
          <p className="text-blue-300/50 text-xs animate-bounce mt-2">Hover to sign up</p>
        </div>

        {/* Hover state — form slides up */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none group-hover:pointer-events-auto">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Create Buyer Account</h2>
                <p className="text-blue-200/50 text-xs">Browse & shop from all stores</p>
              </div>
            </div>

            {buyerError && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-2.5 text-xs text-red-300">{buyerError}</div>
            )}

            <form action={handleBuyer} className="space-y-3">
              <Field id="b_name" name="full_name" placeholder="John Mensah" label="Full Name" color="#93c5fd" />
              <Field id="b_email" name="email" type="email" placeholder="you@example.com" label="Email" color="#93c5fd" />
              <Field id="b_phone" name="phone" type="tel" placeholder="+233XXXXXXXXX" label="Phone (Optional)" color="#93c5fd" />
              <Field id="b_pw" name="password" type="password" placeholder="Min. 8 characters" label="Password" color="#93c5fd" />
              <SubmitBtn label="Join as Buyer →" color="#2563eb" />
            </form>
          </div>
        </div>

        {/* Eagle Choice watermark */}
        <div className="absolute top-6 left-6 text-white/20 text-xs font-bold tracking-widest">EAGLE CHOICE</div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative w-px shrink-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/25 to-transparent" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gray-950 border border-white/20 flex items-center justify-center">
          <span className="text-white/30 text-[9px] font-black">OR</span>
        </div>
      </div>

      {/* ── SELLER PANEL (right) ── */}
      <div className="relative flex-1 group cursor-pointer overflow-hidden"
        style={{ background: "linear-gradient(160deg, #12041f 0%, #3b0764 50%, #581c87 100%)" }}>

        {/* Glow blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
          style={{ background: "#a855f7" }} />

        {/* Default state */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 transition-all duration-500 ease-in-out group-hover:-translate-y-8 group-hover:opacity-0 pointer-events-none select-none">
          <div className="h-28 w-28 rounded-3xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shadow-2xl">
            <Store className="h-14 w-14 text-purple-300" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Seller</h2>
            <p className="text-purple-200/60 text-sm mt-2 max-w-[200px]">Open your store & sell to thousands of buyers</p>
          </div>
          <p className="text-purple-300/50 text-xs animate-bounce mt-2">Hover to sign up</p>
        </div>

        {/* Hover state — form slides up */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out pointer-events-none group-hover:pointer-events-auto">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-xl bg-purple-500/30 border border-purple-400/30 flex items-center justify-center">
                <Store className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Create Seller Account</h2>
                <p className="text-purple-200/50 text-xs">Launch your store on the next step</p>
              </div>
            </div>

            {sellerError && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-2.5 text-xs text-red-300">{sellerError}</div>
            )}

            <form action={handleSeller} className="space-y-3">
              <Field id="s_name" name="full_name" placeholder="Jane Ofori" label="Full Name" color="#d8b4fe" />
              <Field id="s_email" name="email" type="email" placeholder="you@example.com" label="Email" color="#d8b4fe" />
              <Field id="s_phone" name="phone" type="tel" placeholder="+233XXXXXXXXX" label="Phone (Optional)" color="#d8b4fe" />
              <Field id="s_pw" name="password" type="password" placeholder="Min. 8 characters" label="Password" color="#d8b4fe" />
              <SubmitBtn label="Open My Store →" color="#7c3aed" />
            </form>
          </div>
        </div>

        {/* Already have account */}
        <div className="absolute bottom-6 right-6 text-white/20 text-xs font-bold tracking-widest">EAGLE CHOICE</div>
      </div>

      {/* Already have account — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <p className="text-white/30 text-xs text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-white/60 hover:text-white underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

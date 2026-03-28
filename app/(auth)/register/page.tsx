"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ShoppingCart, Store, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/actions/auth"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full font-semibold border-none shadow-md transition-all hover:-translate-y-0.5" disabled={pending}>
      {pending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating account...</> : label}
    </Button>
  )
}

type Mode = "buyer" | "seller" | null

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>(null)
  const [error, setError] = useState("")
  const [hovered, setHovered] = useState<"buyer" | "seller" | null>(null)
  const router = useRouter()

  async function handleBuyerSubmit(formData: FormData) {
    setError("")
    formData.set("role", "user")
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      window.location.href = "/login?registered=1"
    }
  }

  async function handleSellerSubmit(formData: FormData) {
    setError("")
    formData.set("role", "seller")
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      window.location.href = "/sell/setup?new=1"
    }
  }

  const activeHover = hovered ?? mode

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-gray-950" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT: BUYER ── */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ease-in-out overflow-hidden"
        style={{
          flex: activeHover === "seller" ? "0 0 35%" : activeHover === "buyer" ? "0 0 65%" : "1",
          opacity: activeHover === "seller" ? 0.55 : 1,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)",
        }}
        onMouseEnter={() => setHovered("buyer")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => mode !== "buyer" && setMode("buyer")}
      >
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-sm w-full">
          <div className="h-20 w-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm shadow-xl shadow-blue-500/20">
            <ShoppingCart className="h-10 w-10 text-blue-400" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">I&apos;m a Buyer</h2>
            <p className="mt-2 text-sm text-blue-200/70">Browse stores, place orders, track deliveries</p>
          </div>

          <ul className="space-y-2 w-full">
            {["Shop from multiple stores", "Live order tracking", "Secure Paystack checkout", "Earn reward points"].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-blue-100/80">
                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {mode === "buyer" ? (
            <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
              {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">{error}</div>}
              <form action={handleBuyerSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="b_full_name" className="text-blue-200 text-xs">Full Name</Label>
                  <Input id="b_full_name" name="full_name" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="b_email" className="text-blue-200 text-xs">Email</Label>
                  <Input id="b_email" name="email" type="email" placeholder="you@example.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="b_phone" className="text-blue-200 text-xs">Phone (Optional)</Label>
                  <Input id="b_phone" name="phone" type="tel" placeholder="+233XXXXXXXXX" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="b_password" className="text-blue-200 text-xs">Password</Label>
                  <Input id="b_password" name="password" type="password" placeholder="••••••••" required minLength={8} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50 mt-1" />
                </div>
                <SubmitButton label="Create Buyer Account →" />
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-300 text-sm font-medium group">
              <span>Get started</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative flex items-center justify-center w-12 shrink-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="text-white/40 text-[10px] font-bold tracking-widest rotate-0">OR</span>
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* ── RIGHT: SELLER ── */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ease-in-out overflow-hidden"
        style={{
          flex: activeHover === "buyer" ? "0 0 35%" : activeHover === "seller" ? "0 0 65%" : "1",
          opacity: activeHover === "buyer" ? 0.55 : 1,
          background: "linear-gradient(135deg, #1a0a2e 0%, #4a1259 50%, #7c3aed 100%)",
        }}
        onMouseEnter={() => setHovered("seller")}
        onMouseLeave={() => setHovered(null)}
        onClick={() => mode !== "seller" && setMode("seller")}
      >
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-sm w-full">
          <div className="h-20 w-20 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm shadow-xl shadow-purple-500/20">
            <Store className="h-10 w-10 text-purple-400" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">I&apos;m a Seller</h2>
            <p className="mt-2 text-sm text-purple-200/70">Create your store, list products, grow your brand</p>
          </div>

          <ul className="space-y-2 w-full">
            {["Your own branded storefront", "Add agents to manage orders", "Auto Paystack commission split", "Shareable branded store card"].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-purple-100/80">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {mode === "seller" ? (
            <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
              {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">{error}</div>}
              <form action={handleSellerSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="s_full_name" className="text-purple-200 text-xs">Full Name</Label>
                  <Input id="s_full_name" name="full_name" placeholder="Jane Mensah" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-purple-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="s_email" className="text-purple-200 text-xs">Email</Label>
                  <Input id="s_email" name="email" type="email" placeholder="you@example.com" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-purple-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="s_phone" className="text-purple-200 text-xs">Phone (Optional)</Label>
                  <Input id="s_phone" name="phone" type="tel" placeholder="+233XXXXXXXXX" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-purple-500/50 mt-1" />
                </div>
                <div>
                  <Label htmlFor="s_password" className="text-purple-200 text-xs">Password</Label>
                  <Input id="s_password" name="password" type="password" placeholder="••••••••" required minLength={8} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-purple-500/50 mt-1" />
                </div>
                <SubmitButton label="Create Store Account →" />
                <p className="text-center text-xs text-purple-300/50">You&apos;ll set up your store on the next step</p>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-purple-300 text-sm font-medium group">
              <span>Start selling</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>

      {/* bottom link */}
      <div className="absolute bottom-6 w-full flex justify-center z-30">
        <p className="text-white/30 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-white/60 hover:text-white underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

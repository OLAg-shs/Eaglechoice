"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Store, ArrowLeft, Loader2, User, Mail, Phone, Lock, Rocket, ShieldCheck } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Start My Business"}
      {!pending && <Rocket className="h-5 w-5" />}
    </button>
  )
}

function InputField({ label, name, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={name !== "phone"}
          className="w-full h-14 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 dark:text-white"
        />
      </div>
    </div>
  )
}

export default function SellerRegisterPage() {
  const [error, setError] = useState("")

  async function handleSubmit(fd: FormData) {
    setError("")
    fd.set("role", "seller")
    const result = await signUp(fd)
    if (result?.error) setError(result.error)
    else window.location.href = "/sell/setup?new=1"
  }

  return (
    <div className="min-h-screen bg-[#fdfaf8] dark:bg-black font-sans selection:bg-purple-500 selection:text-white">
      
      {/* ── BACKGROUND ACCENT ── */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-purple-400 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-500 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row-reverse items-center justify-center p-6 gap-12 lg:gap-24">
        
        {/* ── LEFT SIDE: VISUAL BRANDING ── */}
        <div className="hidden lg:flex flex-col flex-1 gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className="h-16 w-16 rounded-2xl bg-purple-600 shadow-2xl flex items-center justify-center group mb-4">
              <Store className="h-8 w-8 text-white group-hover:rotate-12 transition-transform" />
            </Link>
            <h1 className="text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
              Scale Your <br /> <span className="text-purple-600">Empire.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md">
              Earn more, manage effortlessly. Reach thousands of customers across Ghana and grow your store into a premium brand.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm max-w-sm">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">Verified Platform</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Built for Ghana Sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE: THE FORM ── */}
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-950/50 backdrop-blur-3xl border border-white dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            
            <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Go back
            </Link>

            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Open Your Store</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium italic">Your store setup wizard begins in the next step.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in zoom-in-95">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <InputField label="Owner Name" name="full_name" placeholder="John Mensah" icon={User} />
              <InputField label="Business Email" name="email" type="email" placeholder="shop@example.com" icon={Mail} />
              <InputField label="Contact Number" name="phone" type="tel" placeholder="+233 XXX XXX XXX" icon={Phone} />
              <InputField label="Secure Password" name="password" type="password" placeholder="Min. 8 characters" icon={Lock} />

              <div className="pt-4">
                <SubmitBtn />
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 font-black hover:underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Shield, ArrowLeft, Loader2, User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create My Account"}
      {!pending && <CheckCircle2 className="h-5 w-5" />}
    </button>
  )
}

function InputField({ label, name, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={name !== "phone"}
          className="w-full h-14 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white"
        />
      </div>
    </div>
  )
}

export default function BuyerRegisterPage() {
  const [error, setError] = useState("")

  async function handleSubmit(fd: FormData) {
    setError("")
    fd.set("role", "user")
    const result = await signUp(fd)
    if (result?.error) setError(result.error)
    else window.location.href = "/login?registered=1"
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-black font-sans selection:bg-blue-500 selection:text-white">
      
      {/* ── BACKGROUND ACCENT ── */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-blue-400 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row items-center justify-center p-6 gap-12 lg:gap-24">
        
        {/* ── LEFT SIDE: VISUAL BRANDING ── */}
        <div className="hidden lg:flex flex-col flex-1 gap-10">
          <div className="flex flex-col gap-4">
            <Link href="/" className="h-16 w-16 rounded-2xl bg-blue-600 shadow-2xl flex items-center justify-center group mb-4">
              <Shield className="h-8 w-8 text-white group-hover:rotate-12 transition-transform" />
            </Link>
            <h1 className="text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
              Join the <br /> <span className="text-blue-600">Choice.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md">
              The smartest way to shop in Ghana. Verified stores, secure payments, and premium service.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">100%</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Verified Stores</p>
            </div>
            <div className="p-6 rounded-3xl bg-blue-600 shadow-blue-500/20 shadow-xl">
              <p className="text-2xl font-black text-white mb-1">Fast</p>
              <p className="text-xs text-blue-100 font-bold uppercase tracking-widest">Delivery</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE: THE FORM ── */}
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-950/50 backdrop-blur-3xl border border-white dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
            
            <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Go back
            </Link>

            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium italic">Shop from anywhere, delivered everywhere.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in zoom-in-95">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <InputField label="Full Name" name="full_name" placeholder="Kwame Osei" icon={User} />
              <InputField label="Email Address" name="email" type="email" placeholder="kwame@example.com" icon={Mail} />
              <InputField label="Phone Number" name="phone" type="tel" placeholder="+233 XXX XXX XXX" icon={Phone} />
              <InputField label="Secure Password" name="password" type="password" placeholder="Min. 8 characters" icon={Lock} />

              <div className="pt-4">
                <SubmitBtn />
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-black hover:underline underline-offset-4">
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

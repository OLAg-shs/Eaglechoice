"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Shield, ArrowLeft, Loader2, User, Mail, Phone, Lock, Rocket, ShieldCheck, ArrowRight } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Start My Business"}
      {!pending && <Rocket className="h-5 w-5" />}
    </button>
  )
}

function InputField({ label, name, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-[0.2em]">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={name !== "phone"}
          className="w-full h-14 bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 dark:text-white font-bold"
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
    else window.location.href = "/register/seller/setup?new=1"
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex overflow-hidden font-sans select-none">
      
      {/* ── LEFT PANEL: PREMIUM BACKGROUND VISUAL ── */}
      <div className="relative hidden lg:flex flex-1 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale-[0.2] hover:grayscale-0 transition-all duration-[3000ms] scale-105 hover:scale-100"
          style={{ backgroundImage: "url('/images/auth/seller-choice.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/40 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-12 md:px-20 text-white max-w-2xl">
          <div className="h-16 w-16 rounded-2xl bg-purple-600/20 backdrop-blur-3xl border border-purple-400/30 flex items-center justify-center mb-8 shadow-2xl">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-8xl font-black tracking-tighter leading-none mb-6">
            Launch <br /> <span className="text-purple-400">Choice.</span>
          </h1>
          <p className="text-2xl font-light text-purple-100/80 leading-relaxed italic">
            "Your boutique is more than just a store — it's an empire in the making. Scale instantly with Eagle Choice."
          </p>
          
          <div className="mt-12 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-200">Verified Marketplace</span>
            </div>
            <div className="h-px w-12 bg-purple-400/30" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Since 2024</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: THE REGISTRATION FORM ── */}
      <div className="flex-1 bg-white dark:bg-gray-950 overflow-y-auto px-6 py-20 flex flex-col items-center">
        
        {/* TOP NAVIGATION */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <Link href="/register" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Go back
          </Link>
          <Link href="/login/seller" className="px-6 py-3 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs font-black uppercase tracking-widest text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
            Sign In
          </Link>
        </div>

        <div className="w-full max-w-md my-auto">
          <div className="mb-10 text-center lg:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-purple-600">
              New Boutique Owner
            </span>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Create Your Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">Join thousands of verified stores on Eagle Choice.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <InputField label="Owner Name" name="full_name" placeholder="John Mensah" icon={User} />
            <InputField label="Business Email" name="email" type="email" placeholder="shop@example.com" icon={Mail} />
            <InputField label="Contact Number" name="phone" type="tel" placeholder="+233 XXX XXX XXX" icon={Phone} />
            <InputField label="Secure Password" name="password" type="password" placeholder="Min. 8 characters" icon={Lock} />

            <div className="pt-6">
              <SubmitBtn />
              <p className="mt-4 text-[10px] text-gray-400 font-medium text-center italic">
                By creating an account, you agree to the Eagle Choice <Link href="#" className="underline">Merchant Terms</Link>.
              </p>
            </div>
          </form>
        </div>

        <div className="absolute bottom-10 text-[10px] font-black text-gray-300 tracking-[0.5em] uppercase pointer-events-none">
          Choice Platform
        </div>
      </div>

    </div>
  )
}

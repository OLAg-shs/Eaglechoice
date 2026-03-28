"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Store, ArrowLeft, Loader2, Mail, Lock } from "lucide-react"
import { signIn } from "@/lib/actions/auth"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Access Store Manager"}
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
          required
          className="w-full h-14 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 dark:text-white"
        />
      </div>
    </div>
  )
}

export default function SellerLoginPage() {
  const [error, setError] = useState("")

  async function handleSubmit(fd: FormData) {
    setError("")
    const result = await signIn(fd)
    if (result?.error) setError(result.error)
    else window.location.href = "/store"
  }

  return (
    <div className="min-h-screen bg-[#fdfaf8] dark:bg-black font-sans selection:bg-purple-500 selection:text-white">
      
      {/* ── BACKGROUND ACCENT ── */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-purple-400 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-500 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-950/50 backdrop-blur-3xl border border-white dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
            
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors mb-10 mx-auto">
              <ArrowLeft className="h-4 w-4" /> Go back
            </Link>

            <div className="mb-10 flex flex-col items-center">
              <div className="h-20 w-20 rounded-3xl bg-purple-600 shadow-2xl flex items-center justify-center mb-6">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Seller Login</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Continue managing your boutique empire.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-6 text-left">
              <InputField label="Business Email" name="email" type="email" placeholder="you@example.com" icon={Mail} />
              <InputField label="Password" name="password" type="password" placeholder="••••••••" icon={Lock} />

              <div className="pt-4">
                <SubmitBtn />
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 font-medium">
                Not a seller yet?{" "}
                <Link href="/register/seller" className="text-purple-600 font-black hover:underline underline-offset-4">
                  Open a Store
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

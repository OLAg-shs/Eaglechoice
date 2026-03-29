"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Shield, ArrowRight, Loader2, User, Mail, Phone, Lock, ShieldCheck, ArrowLeft } from "lucide-react"
import { signUp } from "@/lib/actions/auth"

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-16 bg-blue-600 hover:bg-black disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-[0_20px_50px_rgba(37,99,235,0.2)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Create My Account"}
      {!pending && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
    </button>
  )
}

function InputField({ label, name, type = "text", placeholder, icon: Icon }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={name !== "phone"}
          className="w-full h-16 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl pl-14 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 dark:text-white font-bold placeholder:font-medium placeholder:text-gray-400"
        />
      </div>
    </div>
  )
}

export default function BuyerRegisterPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(fd: FormData) {
    setError("")
    setSuccess(false)
    fd.set("role", "user")
    const result = await signUp(fd)
    if (result?.error) setError(result.error)
    else setSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex overflow-hidden font-sans">
      
      {/* ── LEFT PANEL: PREMIUM BACKGROUND VISUAL ── */}
      <div className="relative hidden lg:flex flex-1 overflow-hidden group/bg">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-[8000ms] ease-in-out group-hover/bg:scale-110 grayscale-[0.4] group-hover/bg:grayscale-0 group-hover/bg:brightness-110"
          style={{ backgroundImage: "url('/images/auth/buyer-choice.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/60 to-transparent transition-opacity duration-1000 group-hover/bg:opacity-80" />
        
        <div className="relative h-full flex flex-col justify-center px-12 md:px-20 text-white max-w-2xl">
          <div className="h-16 w-16 rounded-2xl bg-blue-600/20 backdrop-blur-3xl border border-blue-400/30 flex items-center justify-center mb-8 shadow-2xl transition-transform hover:scale-110">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Join the <br /> <span className="text-blue-400">Choice.</span>
          </h1>
          <p className="text-xl font-light text-blue-100/80 mb-10 leading-relaxed italic">
            "Shop from thousands of verified stores, track your orders in real-time, and get precisely what you need, when you need it."
          </p>
          
          <div className="flex gap-8 items-center">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-blue-900 bg-gray-800" />
              ))}
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-300/60">Verified Community Member</p>
          </div>
        </div>

        <div className="absolute bottom-10 left-12 text-[10px] font-black tracking-[0.5em] text-blue-300/30 uppercase pointer-events-none">
          Choice Member Network
        </div>
      </div>

      {/* ── RIGHT PANEL: THE FORM ── */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-black p-8 md:p-12 lg:p-20 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-12 lg:mb-20">
          <Link href="/register" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
          <Link 
            href="/login/buyer" 
            className="px-6 py-3 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>

        <div className="w-full max-w-md my-auto mx-auto lg:mx-0">
          {success ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <ShieldCheck className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Welcome Aboard!</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed italic">
                "Account verified. To start personalized shopping, please <span className="text-blue-600 font-black">Sign In</span> at the top right to build your Discovery profile!"
              </p>
              <ArrowRight className="h-8 w-8 text-blue-600 animate-bounce mx-auto" />
            </div>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-blue-600">
                  New Member Account
                </span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">Join Choice</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">Shop from anywhere, delivered everywhere.</p>
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

                <div className="pt-6">
                  <SubmitBtn />
                  <p className="mt-6 text-[10px] text-gray-400 font-medium text-center italic">
                    By creating an account, you agree to the Eagle Choice <Link href="#" className="underline">Member Terms</Link>.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="absolute bottom-10 text-[10px] font-black text-gray-300 tracking-[0.5em] uppercase pointer-events-none">
          Eagle Choice Standard
        </div>
      </div>

    </div>
  )
}

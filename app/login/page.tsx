"use client"

import Link from "next/link"
import { Shield, ArrowRight } from "lucide-react"

export default function LoginChoicePage() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex overflow-hidden font-sans">
      
      {/* ── LEFT PANEL (BUYER LOGIN) ── */}
      <Link 
        href="/login/buyer"
        className="group relative flex-1 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:flex-[1.5] z-10"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          style={{ backgroundImage: "url('/images/auth/buyer-choice.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent transition-opacity duration-700 group-hover:opacity-40" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700" />

        <div className="relative h-full flex flex-col items-start justify-center px-12 md:px-20 text-white">
          <div className="mb-4 transform transition-transform duration-700 group-hover:-translate-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-blue-300">
              Returning Buyer
            </span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter transition-all duration-700 group-hover:tracking-normal group-hover:text-blue-400 leading-none">
              Sign In
            </h2>
          </div>
          
          <div className="max-w-md opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
            <p className="text-xl md:text-2xl font-light text-blue-100/80 mb-6 leading-relaxed">
              Continue your shopping journey and track your active orders.
            </p>
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-blue-400 pb-2">
              Access My Account <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-12 text-blue-300/30 text-[10px] font-black tracking-[0.5em] uppercase">
          Eagle Choice
        </div>
      </Link>

      {/* ── CENTRAL DIVIDER LINE ── */}
      <div className="relative w-px shrink-0 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <span className="text-white/40 text-[10px] font-black tracking-tighter">OR</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (SELLER LOGIN) ── */}
      <Link 
        href="/login/seller"
        className="group relative flex-1 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:flex-[1.5] z-10"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          style={{ backgroundImage: "url('/images/auth/seller-choice.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-purple-900/80 via-purple-900/40 to-transparent transition-opacity duration-700 group-hover:opacity-40" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700" />

        <div className="relative h-full flex flex-col items-end justify-center px-12 md:px-20 text-white text-right">
          <div className="mb-4 transform transition-transform duration-700 group-hover:-translate-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-purple-300">
              Store Owner
            </span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter transition-all duration-700 group-hover:tracking-normal group-hover:text-purple-400 leading-none">
              Manage
            </h2>
          </div>
          
          <div className="max-w-md opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100 flex flex-col items-end">
            <p className="text-xl md:text-2xl font-light text-purple-100/80 mb-6 leading-relaxed">
              Login to your boutique dashboard to manage products, orders, and your team.
            </p>
            <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-purple-400 pb-2">
              Open My Dashboard <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 right-12 text-purple-300/30 text-[10px] font-black tracking-[0.5em] uppercase">
          Boutique Admin
        </div>
      </Link>

      {/* ── TOP LOGO OVERLAY ── */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
          <span className="text-xs font-bold text-white/50 tracking-[0.3em] uppercase">Choice</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
        </div>
      </div>

      {/* ── TOP RIGHT: REGISTER BUTTON ── */}
      <div className="absolute top-10 right-10 z-30">
        <Link 
          href="/register" 
          className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all shadow-2xl"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}

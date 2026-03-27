import { Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LiveVisitorCounter } from "@/components/live-visitor-counter"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 dark:bg-neutral-950 px-4 py-12 transition-colors duration-500">
      {/* Absolute top-left Live Visitor Counter */}
      <div className="absolute top-6 left-6 z-50">
        <LiveVisitorCounter />
      </div>

      {/* Absolute top-right Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Dynamic Background Mesh (Premium Dark & Gold in dark mode, gentle blue/purple in light mode) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-30 transition-opacity duration-700">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400 dark:bg-amber-600 blur-[120px] animate-pulse opacity-50 transition-colors duration-1000" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-500 dark:bg-orange-600 blur-[110px] animate-pulse delay-700 opacity-40 transition-colors duration-1000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-400 dark:bg-yellow-600 blur-[100px] animate-pulse delay-1000 opacity-30 transition-colors duration-1000" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* True Glass Card with refined dark mode backgrounds */}
        <div className="rounded-[2rem] border border-white/40 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-amber-400 dark:to-orange-600 shadow-xl shadow-blue-500/20 dark:shadow-orange-500/10 ring-4 ring-white/50 dark:ring-white/5 transition-transform hover:scale-105">
              <Shield className="h-8 w-8 text-white dark:text-neutral-950" />
            </div>
            <div className="text-center">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Eagle Choice</span>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

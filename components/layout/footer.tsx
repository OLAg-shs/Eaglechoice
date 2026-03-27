"use client"

import { cn } from "@/lib/utils"

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("py-8 px-4 mt-auto border-t border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-black/20 backdrop-blur-sm", className)}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Eagle Choice. All rights reserved.</p>
        </div>
        
        <div className="flex items-center gap-1.5 group">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 group-hover:text-amber-500 transition-colors duration-500">
            Powered by
          </span>
          <span className="text-xs font-black text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-all duration-500 tracking-tight">
            Maccarthy Quest
          </span>
        </div>
      </div>
    </footer>
  )
}

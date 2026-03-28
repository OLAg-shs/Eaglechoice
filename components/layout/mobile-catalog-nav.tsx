"use client"

import { useState } from "react"
import { Menu, X, ShoppingBag, LayoutDashboard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MobileCatalogNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="sm:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md pt-20 px-6 pb-6 flex flex-col animate-in slide-in-from-right-full duration-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <nav className="flex-1 space-y-4">
            <Link
              href="/catalog"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900"
            >
              <ShoppingBag className="h-6 w-6 text-amber-500" />
              Browse Catalog
            </Link>

            {isLoggedIn ? (
              <Link
                href="/user"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              >
                <LayoutDashboard className="h-6 w-6" />
                My Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-bold text-white bg-amber-500"
              >
                <LogIn className="h-6 w-6" />
                Sign In / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

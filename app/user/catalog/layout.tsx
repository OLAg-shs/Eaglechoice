import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Shield, LayoutDashboard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/user/catalog" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-amber-500 shadow-md group-hover:scale-105 transition-transform">
              <Shield className="h-4 w-4 text-white dark:text-neutral-950" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Eagle Choice</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/user">
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="gradient-primary gap-2">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 bg-white dark:bg-black/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Eagle Choice. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

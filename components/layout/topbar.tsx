"use client"

import { useState } from "react"
import {
  Bell, Menu, X, Shield, LayoutDashboard, ShoppingBag,
  ClipboardList, CreditCard, MessageSquare, Star, Users,
  Settings, Package, Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/layout/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut as signOutAction } from "@/lib/actions/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

function getNavItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/agents", label: "Agents", icon: Users },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/services", label: "Services", icon: Briefcase },
      { href: "/admin/orders", label: "Orders", icon: ClipboardList },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/points", label: "Points", icon: Star },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ]
  }
  if (role === "client") {
    return [
      { href: "/agent", label: "Dashboard", icon: LayoutDashboard },
      { href: "/agent/orders", label: "My Orders", icon: ClipboardList },
      { href: "/agent/products", label: "Products", icon: Package },
      { href: "/agent/messages", label: "Messages", icon: MessageSquare },
      { href: "/agent/points", label: "My Points", icon: Star },
      { href: "/agent/profile", label: "Profile", icon: Settings },
    ]
  }
  return [
    { href: "/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/catalog", label: "Browse Catalog", icon: ShoppingBag },
    { href: "/client/orders", label: "My Orders", icon: ClipboardList },
    { href: "/client/payments", label: "Payments", icon: CreditCard },
    { href: "/client/messages", label: "Messages", icon: MessageSquare },
    { href: "/client/profile", label: "Profile", icon: Settings },
  ]
}

export function Topbar({ profile }: { profile: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const rolePath = profile.role === "admin" ? "/admin/settings" : profile.role === "client" ? "/client/profile" : "/user/profile"
  const navItems = getNavItems(profile.role)

  async function handleSignOut() {
    await signOutAction()
    router.refresh()
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-6 z-40 relative">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <span className="text-sm text-gray-500 capitalize hidden sm:inline-block">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{profile.role === "admin" ? "Admin" : profile.role === "client" ? "Agent" : "Customer"}</span>
            {" "}Portal
          </span>
          {/* Mobile Logo Fallback */}
          <div className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg bg-blue-600 dark:bg-amber-500 shadow-md ml-1">
            <Shield className="h-4 w-4 text-white dark:text-neutral-950" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationBell userId={profile.id} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-blue-100 dark:bg-amber-500/20 text-blue-700 dark:text-amber-500 text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{profile.full_name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm text-gray-500">{profile.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={rolePath}>My Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="w-full text-left text-red-600 cursor-pointer"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Full Screen Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md pt-20 px-4 pb-4 flex flex-col animate-in slide-in-from-left-full duration-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-3 mb-8 pl-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 dark:bg-amber-500 shadow-md">
              <Shield className="h-5 w-5 text-white dark:text-neutral-950" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">Eagle Choice</span>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" + profile.role && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    active
                      ? "bg-blue-50 dark:bg-amber-500/10 text-blue-700 dark:text-amber-500"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600 dark:text-amber-500" : "text-gray-400")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}

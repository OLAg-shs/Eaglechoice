"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, ShoppingBag, ClipboardList, CreditCard,
  MessageSquare, Bell, Star, Users, Settings, Package,
  Briefcase, ChevronLeft, ChevronRight, LogOut, Shield, Store
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut as signOutAction } from "@/lib/actions/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

function getNavItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/stores", label: "Stores", icon: Store },
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
  // user
  return [
    { href: "/client", label: "Dashboard", icon: LayoutDashboard },
    { href: "/catalog", label: "Browse Catalog", icon: ShoppingBag },
    { href: "/client/orders", label: "My Orders", icon: ClipboardList },
    { href: "/client/payments", label: "Payments", icon: CreditCard },
    { href: "/client/messages", label: "Messages", icon: MessageSquare },
    { href: "/client/profile", label: "Profile", icon: Settings },
  ]
}

export function Sidebar({ role, profile }: { role: string; profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = getNavItems(role)

  async function handleSignOut() {
    await signOutAction()
    // The action itself redirects, but we want to ensure client-side state is clear
    router.refresh()
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        "hidden md:flex relative flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 dark:bg-amber-500 shadow-md">
          <Shield className="h-4 w-4 text-white dark:text-neutral-950" />
        </div>
        {!collapsed && (
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Eagle Choice</span>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-500" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-500" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" + role && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 dark:bg-amber-500/10 text-blue-700 dark:text-amber-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600 dark:text-amber-500" : "text-gray-400")} />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profile + Sign out */}
      <div className="border-t border-gray-100 p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-blue-100 dark:bg-amber-500/20 text-blue-700 dark:text-amber-500 text-xs">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900">{profile.full_name}</p>
              <p className="truncate text-xs text-gray-500 capitalize">{role === 'client' ? 'agent' : role}</p>
            </div>
          )}
          {!collapsed && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 shrink-0"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

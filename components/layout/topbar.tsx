"use client"

import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useRouter } from "next/navigation"
import { signOut as signOutAction } from "@/lib/actions/auth"
import { ThemeToggle } from "@/components/theme-toggle"

export function Topbar({ profile }: { profile: any }) {
  const router = useRouter()
  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const rolePath = profile.role === "admin" ? "/admin/settings" : profile.role === "client" ? "/client/profile" : "/user/profile"

  async function handleSignOut() {
    await signOutAction()
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 capitalize">
          <span className="font-semibold text-gray-900">{profile.role === "admin" ? "Admin" : profile.role === "client" ? "Agent" : "Customer"}</span>
          {" "}Portal
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell userId={profile.id} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-50 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-blue-100 dark:bg-amber-500/20 text-blue-700 dark:text-amber-500 text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-gray-700">{profile.full_name}</span>
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
  )
}

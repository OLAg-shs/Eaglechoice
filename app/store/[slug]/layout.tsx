import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Package, ClipboardList, Users, Settings,
  Palette, LogOut, Store, ChevronRight, MessageSquare
} from "lucide-react"
import { signOut } from "@/lib/actions/auth"

export default async function SellerDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile?.role !== "seller") redirect("/login")

  const { data: store } = await supabase.from("stores").select("*").eq("slug", slug).single()
  if (!store || store.owner_id !== user.id) redirect("/store")

  const storeFeatures = (store.features as any) || { ai_agents: true, branded_cards: true, analytics: true }

  const navItems = [
    { href: `/store/${slug}`, label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: `/store/${slug}/products`, label: "Products", icon: Package, show: true },
    { href: `/store/${slug}/orders`, label: "Orders", icon: ClipboardList, show: true },
    { href: `/store/${slug}/agents`, label: "Agents", icon: Users, show: storeFeatures.ai_agents },
    { href: `/store/${slug}/messages`, label: "Messages", icon: MessageSquare, show: true },
    { href: `/store/${slug}/branded-card`, label: "Identity Card", icon: Palette, show: storeFeatures.branded_cards },
    { href: `/store/${slug}/settings`, label: "Settings", icon: Settings, show: true },
  ].filter(item => item.show)

  const brandColor = store.brand_color || "#2563eb"
  const dashboardConfig = (store.dashboard_config as any) || { theme: "system", sidebar_style: "glass", primary_color: brandColor }

  // Theme Logic
  const forceDark = dashboardConfig.theme === "dark"
  const forceLight = dashboardConfig.theme === "light"
  const themeClass = forceDark ? "dark bg-black text-white" : forceLight ? "bg-gray-50 text-gray-900" : "bg-gray-50 dark:bg-black text-gray-900 dark:text-white"
  
  // Sidebar Logic
  const sidebarGlass = dashboardConfig.sidebar_style === "glass"
  const sidebarClass = sidebarGlass 
    ? "bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-r border-gray-200/50 dark:border-gray-800/50" 
    : "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800"

  return (
    <div className={`flex min-h-screen ${themeClass}`} style={{ '--dashboard-accent': dashboardConfig.primary_color || brandColor } as React.CSSProperties}>
      {/* Sidebar */}
      <aside className={`hidden md:flex w-64 flex-col sticky top-0 h-screen transition-all ${sidebarClass}`}>
        {/* Store branding header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Link href={`/stores/${slug}`} target="_blank" className="flex items-center gap-3 group">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-9 w-9 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow"
                style={{ background: brandColor }}>
                {store.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{store.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span>View Store</span>
                <ChevronRight className="h-2.5 w-2.5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors group">
              <Icon className="h-4 w-4 shrink-0 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Brand color accent bar at bottom */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="h-1 rounded-full w-full" style={{ background: brandColor }} />
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full px-2 py-1">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all">
        {/* Topbar */}
        <header className={`sticky top-0 z-30 px-6 py-4 flex items-center justify-between transition-all ${sidebarGlass ? 'bg-white/60 dark:bg-black/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'}`}>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4" style={{ color: dashboardConfig.primary_color || brandColor }} />
            <span className="text-sm font-black tracking-tight uppercase">{store.name}</span>
            <span className="text-xs text-gray-400 font-medium italic">— Seller Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/stores/${slug}`} target="_blank"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              View Public Store ↗
            </Link>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xl"
              style={{ background: dashboardConfig.primary_color || brandColor }}>
              {profile?.full_name?.[0] ?? "S"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't need auth
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isCatalogRoute = pathname.startsWith("/catalog")
  const isStoresRoute = pathname.startsWith("/stores")
  const isSellRoute = pathname.startsWith("/sell")
  const isOldCatalogRoute = pathname.startsWith("/user/catalog")
  const isOgRoute = pathname.startsWith("/api/og")
  const isApiWebhook = pathname.startsWith("/api/webhooks")

  if (isOldCatalogRoute) {
    return NextResponse.redirect(new URL("/catalog", request.url))
  }

  // Allow webhooks, catalog viewing, OG images, store directory, and sell pages through
  if (isApiWebhook || isCatalogRoute || isOgRoute || isStoresRoute || isSellRoute) {
    return supabaseResponse
  }

  // If not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/register"
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const role = profile.role
    let redirectPath = "/client"
    if (role === "admin") redirectPath = "/admin"
    else if (role === "client") redirectPath = "/agent"
    else if (role === "seller") redirectPath = "/store"
    else redirectPath = "/client"
    
    const url = request.nextUrl.clone()
    url.pathname = redirectPath
    return NextResponse.redirect(url)
  }

  // Role-based route protection for dashboards
  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/agent") || pathname.startsWith("/client") || pathname.startsWith("/store") || pathname === "/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const role = profile.role
    let urlPrefix = "client"
    if (role === "admin") urlPrefix = "admin"
    else if (role === "client") urlPrefix = "agent"
    else if (role === "seller") urlPrefix = "store"
    else urlPrefix = "client"

    // Sellers must have a store. If they don't, push to setup wizard.
    if (role === "seller") {
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("owner_id", user.id)
        .single()
      
      if (!store && !pathname.startsWith("/register/seller/setup")) {
        const url = request.nextUrl.clone()
        url.pathname = "/register/seller/setup"
        return NextResponse.redirect(url)
      }
    }

    if (pathname !== "/") {
      const requestedRole = pathname.split("/")[1]
      if (requestedRole !== urlPrefix && !(role === "seller" && requestedRole === "store")) {
        const url = request.nextUrl.clone()
        url.pathname = role === "seller" ? "/store" : `/${urlPrefix}`
        return NextResponse.redirect(url)
      }
    } else {
      const url = request.nextUrl.clone()
      url.pathname = role === "seller" ? "/store" : `/${urlPrefix}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

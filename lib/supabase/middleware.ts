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
  const isOldCatalogRoute = pathname.startsWith("/user/catalog")
  const isOgRoute = pathname.startsWith("/api/og")
  const isApiWebhook = pathname.startsWith("/api/webhooks")

  if (isOldCatalogRoute) {
    return NextResponse.redirect(new URL("/catalog", request.url))
  }

  // Allow webhooks, catalog viewing, and OG images through without auth
  if (isApiWebhook || isCatalogRoute || isOgRoute) {
    return supabaseResponse
  }

  // If not logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
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
    const url = request.nextUrl.clone()
    url.pathname = `/${role}`
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/client") || pathname.startsWith("/user") || pathname === "/")) {
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

    // Check if user is accessing the correct role path (ignore exact root "/")
    if (pathname !== "/") {
      const requestedRole = pathname.split("/")[1]
      if (requestedRole !== role) {
        const url = request.nextUrl.clone()
        url.pathname = `/${role}`
        return NextResponse.redirect(url)
      }
    } else {
      const url = request.nextUrl.clone()
      url.pathname = `/${role}`
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

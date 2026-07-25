import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Prevent unauthenticated users from accessing protected routes
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/dispatch'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Route handling for authenticated users
  if (user) {
    // Fetch profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'

    // Prevent regular users from accessing authority dispatch
    if (pathname.startsWith('/dispatch') && role !== 'authority') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Prevent authorities from getting stuck on user dashboard
    if (pathname.startsWith('/dashboard') && role === 'authority') {
      return NextResponse.redirect(new URL('/dispatch', request.url))
    }

    // Prevent logged-in users from unnecessarily viewing the login screen
    if (pathname.startsWith('/login')) {
      if (role === 'authority') {
        return NextResponse.redirect(new URL('/dispatch', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/dispatch/:path*',
    '/login'
  ],
}

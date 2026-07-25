import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/dispatch'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

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
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/dispatch/:path*'],
}
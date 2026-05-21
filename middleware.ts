import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('__session')?.value

  // Protected routes — redirect to login if no session
  if (pathname.startsWith('/app')) {
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Auth routes — redirect to app if already signed in
  if (pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/app/mood', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
}

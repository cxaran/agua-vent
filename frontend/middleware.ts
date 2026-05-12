import { NextResponse, type NextRequest } from "next/server"

const PROTECTED_PREFIXES = ["/panel", "/admin"]
const SESSION_COOKIE = "session_token"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (!needsAuth) return NextResponse.next()

  const hasSession = request.cookies.has(SESSION_COOKIE)
  if (hasSession) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
}

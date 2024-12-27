import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {

  const token = request.headers.get('auth-token');
  if (!token) {
    console.log("middleware token missing", request.url)
    return NextResponse.redirect(new URL('/home', request.url))
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/stockData/:path*',
}

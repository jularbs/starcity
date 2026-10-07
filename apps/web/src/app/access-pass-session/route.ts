import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const webOrigin =
    process.env.NEXT_PUBLIC_WEB_DOMAIN || request.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/my-tickets', webOrigin));

  if (!token) {
    return response;
  }

  response.cookies.set('accessPassToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}

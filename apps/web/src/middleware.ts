import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_req: NextRequest) {
	const res = NextResponse.next();
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob:",
		"connect-src 'self' http://127.0.0.1:3077 https://*.supabase.co",
		"frame-ancestors 'self'",
	].join('; ');
	res.headers.set('Content-Security-Policy', csp);
	return res;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};



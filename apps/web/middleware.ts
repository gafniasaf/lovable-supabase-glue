import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const url = req.nextUrl;
	if (url.pathname === '/favicon.ico') {
		return NextResponse.rewrite(new URL('/icon.svg', req.url));
	}

	const res = NextResponse.next();
	const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
	const allowVercelLive = env !== 'production';
	const scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
	if (allowVercelLive) {
		scriptSrc.push('https://vercel.live');
	}
	const connectSrc = ["'self'", 'http://127.0.0.1:3077', 'https://*.supabase.co'];
	if (allowVercelLive) {
		connectSrc.push('https://vercel.live');
	}
	const csp = [
		"default-src 'self'",
		`script-src ${scriptSrc.join(' ')}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob:",
		`connect-src ${connectSrc.join(' ')}`,
		"frame-ancestors 'self'",
	].join('; ');
	res.headers.set('Content-Security-Policy', csp);
	return res;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image).*)'],
};



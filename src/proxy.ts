import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = process.env.COOKIE_NAME || 'quarryms_auth';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'quarryms-jwt-secret-key-2024-super-secure-random');

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/seed'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static/api routes that don't need protection
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/') {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    // No token → redirect to login
    if (!token) {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Verify JWT using jose (Edge-compatible)
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;

        // Role-based access control
        if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname.startsWith('/dashboard/operator') && role !== 'operator') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (pathname.startsWith('/dashboard/transport') && role !== 'transport') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        return NextResponse.next();
    } catch {
        // Invalid token → clear and redirect
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete(COOKIE_NAME);
        return response;
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- Protect /admin routes: require ADMIN role ---
    if (pathname.startsWith("/admin")) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }

        if (token.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // --- Security headers on all responses ---
    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
    );

    return response;
}

export const config = {
    matcher: [
        // Match all routes except static files and API
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};

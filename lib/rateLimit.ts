import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
// NOTE: In production with multiple serverless instances, use Redis (@upstash/ratelimit)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

/**
 * Check if a request should be rate-limited.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { windowMs: 60_000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    // Cleanup old entries periodically (every 100 checks)
    if (Math.random() < 0.01) {
        Array.from(rateLimitMap.entries()).forEach(([key, val]) => {
            if (now > val.resetTime) rateLimitMap.delete(key);
        });
    }

    if (!entry || now > entry.resetTime) {
        // New window
        rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
    }

    entry.count++;
    return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

/**
 * Helper to extract a client identifier from a request for rate limiting.
 */
export function getClientIdentifier(req: Request | NextRequest, prefix: string = ""): string {
    const forwarded = (req.headers as any).get?.("x-forwarded-for") || "unknown";
    const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "unknown";
    return `${prefix}:${ip}`;
}

/**
 * Return a 429 Too Many Requests response.
 */
export function rateLimitResponse(resetIn: number) {
    return NextResponse.json(
        { message: "Trop de requêtes. Veuillez réessayer dans quelques instants." },
        {
            status: 429,
            headers: {
                "Retry-After": Math.ceil(resetIn / 1000).toString(),
            },
        }
    );
}

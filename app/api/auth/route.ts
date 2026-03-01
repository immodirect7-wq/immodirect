import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
    // Rate limit: max 5 auth attempts per minute per IP
    const clientId = getClientIdentifier(request, "phone-auth");
    const limit = checkRateLimit(clientId, { windowMs: 60_000, maxRequests: 5 });
    if (!limit.allowed) return rateLimitResponse(limit.resetIn);

    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Normalize & validate phone number
        const normalizedPhone = phone.replace(/\s/g, "").replace(/[^0-9+]/g, "");
        if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
            return NextResponse.json(
                { error: "Numéro de téléphone invalide" },
                { status: 400 }
            );
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone: normalizedPhone,
                    role: "SEEKER",
                },
            });
        }

        // Check if banned
        if (user.isBanned) {
            return NextResponse.json(
                { error: "Ce compte a été suspendu." },
                { status: 403 }
            );
        }

        // In production, send OTP via SMS here.
        // For now, return only safe fields (no password, no internal data)
        return NextResponse.json({
            user: {
                id: user.id,
                phone: user.phone,
                role: user.role,
            },
            token: user.id, // TODO: Replace with real JWT
        });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request) {
    // Rate limit: max 5 registrations per minute per IP
    const clientId = getClientIdentifier(req, "register");
    const limit = checkRateLimit(clientId, { windowMs: 60_000, maxRequests: 5 });
    if (!limit.allowed) return rateLimitResponse(limit.resetIn);

    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email et mot de passe requis." },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Format d'email invalide." },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { message: "Le mot de passe doit contenir au minimum 8 caractères." },
                { status: 400 }
            );
        }

        // Check if user exists by email
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Cet email est déjà utilisé." },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "SEEKER",
            },
        });

        return NextResponse.json(
            { message: "Utilisateur créé avec succès.", user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Une erreur est survenue." },
            { status: 500 }
        );
    }
}

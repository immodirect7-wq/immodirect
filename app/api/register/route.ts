import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, phone } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email et mot de passe requis." },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Cet email est déjà utilisé." },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        // Note: Assuming 'name' is processed or added to User model if needed, 
        // but schema currently doesn't have name. We'll stick to email/phone/password.
        // If phone is provided, check uniqueness too or handle it. 
        // For now, we'll generate a random phone if not provided or handle valid phone input.

        // Simplification: We'll require phone as per schema, or make it optional in schema?
        // The current schema has `phone String @unique`. We should ask user for phone in signup or generate one.
        // Let's assume the Signup form sends a phone number.

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                phone: phone || `temp_${Date.now()}`, // Fallback if phone not meant to be primary for email users
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

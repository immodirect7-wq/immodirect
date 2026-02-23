import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email et mot de passe requis." },
                { status: 400 }
            );
        }


        // Check if user exists by email
        const existingUser = await prisma.user.findFirst({
            where: {
                email
            },
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

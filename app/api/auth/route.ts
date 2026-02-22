import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Normalized phone number (remove spaces, etc.) - Simplified for now
        const normalizedPhone = phone.replace(/\s/g, "");

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { phone: normalizedPhone },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone: normalizedPhone,
                    role: "SEEKER", // Default role, can be updated later
                },
            });
        }

        // In a real app, we would send an OTP here.
        // For this simulation, we just return the user and a "token" (userId).

        return NextResponse.json({
            user,
            token: user.id, // Simple simulation of a token
        });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

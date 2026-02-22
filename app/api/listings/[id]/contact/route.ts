import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId"); // Simulated auth

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check pass validity
        // Logic: hasActivePass is true AND passExpiry > now
        // For simplicity, we just check hasActivePass in this MVP as per requirements "Si user.hasActivePass est vrai"
        // But let's add the expiry check for robustness if plausible

        const hasValidPass = user.hasActivePass && user.passExpiry && new Date(user.passExpiry) > new Date();

        if (!hasValidPass) {
            return NextResponse.json(
                { error: "Pass required" },
                { status: 403 }
            );
        }

        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
            include: {
                owner: {
                    select: {
                        phone: true,
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ phone: listing.owner.phone });
    } catch (error) {
        console.error("Content reveal error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

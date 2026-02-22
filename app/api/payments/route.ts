import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, amount, type, listingId, provider } = body;
        // type: 'PASS' | 'LISTING_FEE'

        if (!userId || !amount || !type || !provider) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Simulate payment processing time
        // In real world, call CinetPay/Stripe etc.

        // Create transaction record
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                provider: provider, // 'MTN' | 'ORANGE'
                status: "SUCCESS", // Simulated success
                reference: `REF-${Date.now()}`,
                userId,
                listingId: listingId || null,
            },
        });

        // Update User or Listing based on type
        if (type === "PASS") {
            // 30 days validity
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            await prisma.user.update({
                where: { id: userId },
                data: {
                    hasActivePass: true,
                    passExpiry: expiryDate,
                },
            });
        } else if (type === "LISTING_FEE" && listingId) {
            await prisma.listing.update({
                where: { id: listingId },
                data: {
                    status: "PAID",
                },
            });
        }

        return NextResponse.json({ success: true, transaction });

    } catch (error) {
        console.error("Payment error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

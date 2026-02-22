import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Campay Webhook Structure
interface CampayWebhookData {
    status: "SUCCESSFUL" | "FAILED";
    reference: string;
    amount: number;
    currency: string;
    external_reference: string;
    // ... other fields
}

export async function POST(req: Request) {
    try {
        const body: CampayWebhookData = await req.json();
        console.log("Campay Webhook Received:", body);

        const { status, external_reference } = body;

        // Verify transaction exists
        const transaction = await prisma.transaction.findUnique({
            where: { reference: external_reference },
            include: { listing: true, user: true }
        });

        if (!transaction) {
            console.warn(`Transaction not found for ref: ${external_reference}`);
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }

        // Update Transaction Status
        if (status === "SUCCESSFUL") {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "SUCCESS" }
            });

            // Business Logic based on what was paid for
            // 1. If listingId exists, it might be a "Boost" or "Publication Fee"
            if (transaction.listingId) {
                // If the listing was PENDING, mark as PAID
                if (transaction.listing?.status !== "PAID") {
                    await prisma.listing.update({
                        where: { id: transaction.listingId! },
                        data: { status: "PAID" }
                    });
                }
            }
            // 2. If no listingId, it might be a "Visit Pass" or "Unlock Contact"
            else {
                // Check transaction amount/desc to determine provided service
                // Logic for unlocking contact: 
                // Maybe we create a 'Verification' or 'Access' record?
                // For now, simpler: user.hasActivePass = true (for 2000 FCFA)
                if (transaction.amount >= 2000) {
                    await prisma.user.update({
                        where: { id: transaction.userId },
                        data: {
                            hasActivePass: true,
                            passExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                        }
                    });
                }
                // For 500 FCFA unlock, we generally need to store WHICH listing was unlocked.
                // Schema doesn't have `UnlockedListings`. 
                // MVP Solution: If 500 FCFA, just log it for now or assume immediate client-side unlock access?
                // Real Solution: New model `UnlockedContact` { userId, listingId }
            }
        } else {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            });
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Webhook Handler Error" }, { status: 500 });
    }
}

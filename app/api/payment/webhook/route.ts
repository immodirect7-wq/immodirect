import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkTransactionStatus } from "@/lib/campay";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rateLimit";

const prisma = new PrismaClient();

// Campay Webhook Structure
interface CampayWebhookData {
    status: "SUCCESSFUL" | "FAILED";
    reference: string;
    amount: number;
    currency: string;
    external_reference: string;
}

export async function POST(req: Request) {
    // Rate limit webhooks: max 30 per minute per IP
    const clientId = getClientIdentifier(req, "webhook");
    const limit = checkRateLimit(clientId, { windowMs: 60_000, maxRequests: 30 });
    if (!limit.allowed) return rateLimitResponse(limit.resetIn);

    try {
        const body: CampayWebhookData = await req.json();
        console.log("Campay Webhook Received:", body);

        const { status, external_reference } = body;

        if (!external_reference) {
            return NextResponse.json({ message: "Missing reference" }, { status: 400 });
        }

        // Verify transaction exists in our DB
        const transaction = await prisma.transaction.findUnique({
            where: { reference: external_reference },
            include: { listing: true, user: true }
        });

        if (!transaction) {
            console.warn(`Transaction not found for ref: ${external_reference}`);
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }

        // Skip already-processed transactions (idempotency)
        if (transaction.status !== "PENDING") {
            return NextResponse.json({ received: true, message: "Already processed" });
        }

        // 🔒 SECURITY: Verify the transaction status directly with CamPay API
        // Do NOT trust the webhook payload alone
        let verifiedStatus = status;
        try {
            const campayVerification = await checkTransactionStatus(external_reference);
            if (campayVerification && campayVerification.status) {
                verifiedStatus = campayVerification.status === "SUCCESSFUL" ? "SUCCESSFUL" : "FAILED";
            }
        } catch (verifyErr) {
            console.error("CamPay verification failed, falling back to webhook data:", verifyErr);
            // If CamPay API is down, reject the webhook for safety
            return NextResponse.json({ message: "Unable to verify transaction" }, { status: 503 });
        }

        // Update Transaction Status
        if (verifiedStatus === "SUCCESSFUL") {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "SUCCESS" }
            });

            // Business Logic based on what was paid for
            if (transaction.listingId) {
                if (transaction.listing?.status !== "PAID") {
                    await prisma.listing.update({
                        where: { id: transaction.listingId! },
                        data: { status: "PAID" }
                    });
                }
            } else {
                if (transaction.amount >= 2000) {
                    await prisma.user.update({
                        where: { id: transaction.userId },
                        data: {
                            hasActivePass: true,
                            passExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                        }
                    });
                }
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

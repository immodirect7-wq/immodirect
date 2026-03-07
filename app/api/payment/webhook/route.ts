import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPayment, verifyWebhookSignature } from "@/lib/notchpay";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rateLimit";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    // Rate limit webhooks: max 30 per minute per IP
    const clientId = getClientIdentifier(req, "webhook");
    const limit = checkRateLimit(clientId, { windowMs: 60_000, maxRequests: 30 });
    if (!limit.allowed) return rateLimitResponse(limit.resetIn);

    try {
        // Read raw body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get("x-notch-signature") || "";

        // Verify webhook signature (HMAC SHA-256)
        if (process.env.NOTCHPAY_HASH) {
            const isValid = verifyWebhookSignature(rawBody, signature);
            if (!isValid) {
                console.warn("Invalid NotchPay webhook signature");
                return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
            }
        }

        const body = JSON.parse(rawBody);
        console.log("NotchPay Webhook Received:", body);

        // NotchPay sends event type and data
        const event = body.event;
        const paymentData = body.data;

        if (!paymentData?.merchant_reference && !paymentData?.reference) {
            return NextResponse.json({ message: "Missing reference" }, { status: 400 });
        }

        const reference = paymentData.merchant_reference || paymentData.reference;

        // Verify transaction exists in our DB
        const transaction = await prisma.transaction.findUnique({
            where: { reference },
            include: { listing: true, user: true }
        });

        if (!transaction) {
            console.warn(`Transaction not found for ref: ${reference}`);
            return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
        }

        // Skip already-processed transactions (idempotency)
        if (transaction.status !== "PENDING") {
            return NextResponse.json({ received: true, message: "Already processed" });
        }

        // 🔒 SECURITY: Verify the transaction status directly with NotchPay API
        let verifiedStatus = paymentData.status;
        try {
            const verification = await verifyPayment(reference);
            if (verification?.transaction?.status) {
                verifiedStatus = verification.transaction.status;
            }
        } catch (verifyErr) {
            console.error("NotchPay verification failed, falling back to webhook data:", verifyErr);
            return NextResponse.json({ message: "Unable to verify transaction" }, { status: 503 });
        }

        // Update Transaction Status
        // NotchPay statuses: "complete", "failed", "canceled", "expired", "pending"
        if (verifiedStatus === "complete") {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "SUCCESS" }
            });

            // Business Logic based on what was paid for
            if (transaction.listingId) {
                if (transaction.listing?.status !== "PAID") {
                    const settings = await prisma.platformSetting.findUnique({
                        where: { id: "listing_duration_days" }
                    });
                    const durationDays = settings?.value || 30;

                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + durationDays);

                    await prisma.listing.update({
                        where: { id: transaction.listingId! },
                        data: {
                            status: "PAID",
                            expiresAt
                        } as any
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
        } else if (verifiedStatus === "failed" || verifiedStatus === "canceled" || verifiedStatus === "expired") {
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

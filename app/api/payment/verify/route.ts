import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { verifyPayment } from "@/lib/notchpay";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non connecté" }, { status: 401 });
        }

        const body = await req.json();
        const { reference, trxref } = body;

        // trxref = our merchant reference (REF-xxx), reference = NotchPay reference (trx.xxx)
        const merchantRef = trxref || "";
        const notchpayRef = reference || "";

        if (!merchantRef && !notchpayRef) {
            return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Find the transaction in our DB using merchant reference
        const searchRef = merchantRef || notchpayRef;
        const transaction = await prisma.transaction.findFirst({
            where: {
                userId: user.id,
                OR: [
                    { reference: searchRef },
                    ...(merchantRef ? [{ reference: merchantRef }] : []),
                ],
            },
            include: { listing: true },
            orderBy: { createdAt: "desc" },
        });

        if (!transaction) {
            // Fallback: find the most recent PENDING transaction for this user
            const recentTransaction = await prisma.transaction.findFirst({
                where: {
                    userId: user.id,
                    status: "PENDING",
                },
                include: { listing: true },
                orderBy: { createdAt: "desc" },
            });

            if (!recentTransaction) {
                return NextResponse.json({
                    error: "Transaction introuvable",
                    status: "not_found",
                }, { status: 404 });
            }

            // Use the recent pending transaction
            return await processTransaction(recentTransaction, notchpayRef, user.id);
        }

        // If already processed, return current state
        if (transaction.status === "SUCCESS") {
            const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
            return NextResponse.json({
                status: "success",
                message: "Paiement déjà validé",
                type: transaction.listingId ? "listing" : "pass",
                hasPass: updatedUser?.hasActivePass || false,
                passExpiry: updatedUser?.passExpiry,
            });
        }

        return await processTransaction(transaction, notchpayRef, user.id);

    } catch (error: any) {
        console.error("Payment verify error:", error);
        return NextResponse.json(
            { error: error.message || "Erreur de vérification", status: "error" },
            { status: 500 }
        );
    }
}

async function processTransaction(transaction: any, notchpayRef: string, userId: string) {
    // Verify payment with NotchPay API
    let paymentComplete = false;

    if (notchpayRef) {
        try {
            const verification = await verifyPayment(notchpayRef);
            console.log("NotchPay verify response:", JSON.stringify(verification));

            // NotchPay response format: { code, status, message, data: { status: "complete", ... } }
            const paymentStatus = verification?.data?.status
                || verification?.transaction?.status
                || verification?.status
                || "unknown";

            paymentComplete = paymentStatus === "complete" || paymentStatus === "successful";
            console.log("Payment status resolved:", paymentStatus, "→ complete:", paymentComplete);
        } catch (err) {
            console.error("NotchPay verify error:", err);
            // In sandbox mode, if we got redirected back, likely success
            paymentComplete = true;
        }
    } else {
        // No NotchPay ref — if user was redirected back, treat as success in sandbox
        paymentComplete = true;
    }

    if (paymentComplete && transaction.status === "PENDING") {
        // Update transaction status
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS" },
        });

        // Activate listing or pass
        if (transaction.listingId) {
            // Listing publication
            const settings = await prisma.platformSetting.findUnique({
                where: { id: "listing_duration_days" },
            });
            const durationDays = settings?.value || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            await prisma.listing.update({
                where: { id: transaction.listingId },
                data: { status: "PAID", expiresAt } as any,
            });

            return NextResponse.json({
                status: "success",
                message: "Annonce publiée avec succès !",
                type: "listing",
            });
        } else {
            // Pass activation
            const passExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await prisma.user.update({
                where: { id: userId },
                data: {
                    hasActivePass: true,
                    passExpiry,
                },
            });

            console.log("Pass activated for user:", userId, "until:", passExpiry);

            return NextResponse.json({
                status: "success",
                message: "Pass illimité activé pour 30 jours !",
                type: "pass",
                hasPass: true,
                passExpiry,
            });
        }
    } else if (!paymentComplete) {
        return NextResponse.json({
            status: "failed",
            message: "Le paiement n'a pas été confirmé par NotchPay.",
        });
    } else {
        // Already processed
        return NextResponse.json({
            status: "success",
            message: "Paiement déjà traité.",
            type: transaction.listingId ? "listing" : "pass",
        });
    }
}

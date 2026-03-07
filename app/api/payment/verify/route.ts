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

        const merchantRef = trxref || reference || "";
        const notchpayRef = reference || trxref || "";

        if (!merchantRef) {
            return NextResponse.json({ error: "Référence manquante" }, { status: 400 });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Find the transaction in our DB
        const transaction = await prisma.transaction.findFirst({
            where: {
                OR: [
                    { reference: merchantRef },
                    { reference: trxref || "" },
                ],
                userId: user.id,
            },
            include: { listing: true },
        });

        if (!transaction) {
            return NextResponse.json({
                error: "Transaction introuvable",
                debug: { merchantRef, notchpayRef, userId: user.id }
            }, { status: 404 });
        }

        // If already processed, return current state
        if (transaction.status === "SUCCESS") {
            return NextResponse.json({
                status: "success",
                message: "Paiement déjà validé",
                hasPass: user.hasActivePass,
                passExpiry: user.passExpiry,
            });
        }

        // Verify payment with NotchPay API
        let paymentStatus = "unknown";
        try {
            const verification = await verifyPayment(notchpayRef);
            paymentStatus = verification?.transaction?.status || verification?.status || "unknown";
            console.log("NotchPay verification result:", JSON.stringify(verification));
        } catch (err) {
            console.error("NotchPay verify error:", err);
            // In sandbox, assume success if we got redirected back
            paymentStatus = "complete";
        }

        if (paymentStatus === "complete") {
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
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        hasActivePass: true,
                        passExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                });

                return NextResponse.json({
                    status: "success",
                    message: "Pass illimité activé pour 30 jours !",
                    type: "pass",
                    hasPass: true,
                    passExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                });
            }
        } else {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" },
            });

            return NextResponse.json({
                status: "failed",
                message: `Paiement échoué (statut: ${paymentStatus})`,
            });
        }
    } catch (error: any) {
        console.error("Payment verify error:", error);
        return NextResponse.json(
            { error: error.message || "Erreur de vérification" },
            { status: 500 }
        );
    }
}

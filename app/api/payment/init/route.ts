import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { initializePayment } from "@/lib/notchpay";
import { checkRateLimit, getClientIdentifier, rateLimitResponse } from "@/lib/rateLimit";
import crypto from "crypto";

export async function POST(req: Request) {
    // Rate limit: max 10 payment requests per minute per IP
    const clientId = getClientIdentifier(req, "payment");
    const limit = checkRateLimit(clientId, { windowMs: 60_000, maxRequests: 10 });
    if (!limit.allowed) return rateLimitResponse(limit.resetIn);

    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "Vous devez être connecté pour effectuer ce paiement." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { amount, description, listingId, reason } = body;

        if (!amount) {
            return NextResponse.json(
                { message: "Montant requis." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        // Verify Amount against Platform Settings
        let expectedAmount = parseFloat(amount);
        const settings = await prisma.platformSetting.findMany();
        const config: Record<string, number> = { listing_price: 5000, pass_price: 2000, unlock_price: 500 };
        settings.forEach((s: any) => config[s.id] = s.value);

        if (reason === "LISTING_FEE" || (listingId && reason !== "SINGLE_UNLOCK")) {
            expectedAmount = config.listing_price;
        } else if (reason === "PASS") {
            expectedAmount = config.pass_price;
        } else if (reason === "SINGLE_UNLOCK") {
            expectedAmount = config.unlock_price;
        }

        if (parseFloat(amount) !== expectedAmount) {
            return NextResponse.json(
                { message: `Montant invalide. Le montant attendu est de ${expectedAmount} FCFA.` },
                { status: 400 }
            );
        }

        // Create Transaction (PENDING)
        const reference = `REF-${crypto.randomUUID()}`;
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                provider: "NOTCHPAY",
                status: "PENDING",
                reference: reference,
                userId: user.id,
                listingId: listingId || undefined,
            },
        });

        // Build callback URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://immodirect.cm";
        const callbackUrl = `${baseUrl}/payment/result`;

        // Initiate Payment with NotchPay
        try {
            const notchpayRes = await initializePayment({
                amount: expectedAmount,
                email: session.user.email,
                description: description || "Paiement ImmoDirect",
                reference: transaction.reference,
                callbackUrl,
            });

            console.log("NotchPay Init Response:", notchpayRes);

            // NotchPay returns an authorization_url to redirect the user to
            const authorizationUrl = notchpayRes?.authorization_url || notchpayRes?.transaction?.authorization_url;

            if (!authorizationUrl) {
                throw new Error("No authorization URL returned from NotchPay");
            }

            return NextResponse.json({
                message: "Redirection vers la page de paiement...",
                reference: transaction.reference,
                authorization_url: authorizationUrl,
            });

        } catch (notchpayError: any) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            });
            throw notchpayError;
        }

    } catch (error: any) {
        console.error("Payment Init Error:", error);
        return NextResponse.json(
            { message: error.message || "Erreur lors de l'initialisation du paiement." },
            { status: 500 }
        );
    }
}

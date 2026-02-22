import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { requestPayment } from "@/lib/campay";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "Vous devez être connecté pour effectuer ce paiement." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { amount, phone, description, listingId, reason } = body;

        if (!amount || !phone) {
            return NextResponse.json(
                { message: "Montant et numéro de téléphone requis." },
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

        // Create Transaction (PENDING)
        const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                provider: "CAMPAY",
                status: "PENDING",
                reference: reference,
                userId: user.id,
                listingId: listingId || undefined,
            },
        });

        // Initiate Payment with Campay
        try {
            const campayRes = await requestPayment({
                amount: amount.toString(),
                from: phone, // Format: 237...
                description: description || "Paiement ImmoDirect",
                externalReference: transaction.reference,
            });

            console.log("Campay Init Response:", campayRes);

            return NextResponse.json({
                message: "Demande de paiement envoyée. Veuillez valider sur votre téléphone.",
                reference: transaction.reference,
                campay_token: campayRes.token // Or relevant identifying info
            });

        } catch (campayError: any) {
            // If Campay fails, mark transaction as FAILED? Or delete?
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: "FAILED" }
            });
            throw campayError;
        }

    } catch (error: any) {
        console.error("Payment Init Error:", error);
        return NextResponse.json(
            { message: error.message || "Erreur lors de l'initialisation du paiement." },
            { status: 500 }
        );
    }
}

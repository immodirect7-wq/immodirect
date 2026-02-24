import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { listingId } = body;

        if (!listingId) {
            return NextResponse.json({ message: "ID de l'annonce manquant" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

        // Check if favorite already exists
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_listingId: { userId: user.id, listingId }
            }
        });

        if (existing) {
            // If it exists, remove it (toggle behavior)
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ message: "Retiré des favoris", isFavorited: false }, { status: 200 });
        }

        // Add to favorites
        await prisma.favorite.create({
            data: {
                userId: user.id,
                listingId
            }
        });

        return NextResponse.json({ message: "Ajouté aux favoris", isFavorited: true }, { status: 201 });
    } catch (error: any) {
        console.error("Erreur favoris:", error);
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

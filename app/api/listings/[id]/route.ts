import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || user.role !== "OWNER") return NextResponse.json({ message: "Propriétaire introuvable" }, { status: 403 });

        const listing = await prisma.listing.findUnique({ where: { id: params.id } });
        if (!listing || listing.ownerId !== user.id) return NextResponse.json({ message: "Annonce introuvable ou accès refusé" }, { status: 404 });

        const body = await req.json();
        const { title, description, price, city, neighborhood, advanceMonths } = body;

        const updatedListing = await prisma.listing.update({
            where: { id: params.id },
            data: {
                title,
                description,
                price: parseFloat(price),
                city,
                neighborhood,
                advanceMonths: parseInt(advanceMonths),
            }
        });

        return NextResponse.json({ message: "Annonce modifiée", listing: updatedListing }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || user.role !== "OWNER") return NextResponse.json({ message: "Accès refusé" }, { status: 403 });

        const listing = await prisma.listing.findUnique({ where: { id: params.id } });
        if (!listing || listing.ownerId !== user.id) return NextResponse.json({ message: "Annonce introuvable ou accès refusé" }, { status: 404 });

        const body = await req.json();
        const { status } = body; // e.g. "PAUSED", "PENDING"

        const updatedListing = await prisma.listing.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json({ message: "Statut mis à jour", listing: updatedListing }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || user.role !== "OWNER") return NextResponse.json({ message: "Accès refusé" }, { status: 403 });

        const listing = await prisma.listing.findUnique({ where: { id: params.id } });
        if (!listing || listing.ownerId !== user.id) return NextResponse.json({ message: "Annonce introuvable ou accès refusé" }, { status: 404 });

        await prisma.listing.delete({ where: { id: params.id } });

        return NextResponse.json({ message: "Annonce supprimée" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

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

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

        const body = await req.json();
        const { city, neighborhood, minPrice, maxPrice, bedrooms } = body;

        const alert = await prisma.alert.create({
            data: {
                userId: user.id,
                city,
                neighborhood,
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                bedrooms: bedrooms ? parseInt(bedrooms) : null,
            }
        });

        return NextResponse.json({ message: "Alerte créée", alert }, { status: 201 });
    } catch (error: any) {
        console.error("Erreur création alerte:", error);
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

        const alerts = await prisma.alert.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ alerts }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

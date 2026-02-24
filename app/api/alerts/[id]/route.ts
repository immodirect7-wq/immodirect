import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

        const alert = await prisma.alert.findUnique({ where: { id: params.id } });
        if (!alert) return NextResponse.json({ message: "Alerte introuvable" }, { status: 404 });

        if (alert.userId !== user.id) {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        await prisma.alert.delete({ where: { id: params.id } });

        return NextResponse.json({ message: "Alerte supprimée" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Une erreur est survenue" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== "ADMIN") {
            return NextResponse.json({ message: "Accès strictement refusé." }, { status: 403 });
        }

        // 1. Delete the listing from the database
        await prisma.listing.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "L'annonce a été supprimée par l'administrateur." }, { status: 200 });
    } catch (error: any) {
        console.error("Erreur suppression admin:", error);
        return NextResponse.json({ message: "Erreur serveur de suppression." }, { status: 500 });
    }
}

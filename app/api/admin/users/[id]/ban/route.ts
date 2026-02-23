import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!currentUser || currentUser.role !== "ADMIN") {
            return NextResponse.json({ message: "Accès refusé. Rôle ADMIN requis." }, { status: 403 });
        }

        const targetUserId = params.id;

        if (currentUser.id === targetUserId) {
            return NextResponse.json({ message: "Vous ne pouvez pas vous bannir vous-même." }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId }
        });

        if (!targetUser) {
            return NextResponse.json({ message: "Utilisateur cible introuvable." }, { status: 404 });
        }

        // Toggle the ban status
        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { isBanned: !targetUser.isBanned }
        });

        return NextResponse.json({
            message: `L'utilisateur a été ${updatedUser.isBanned ? 'banni' : 'débanni'} avec succès.`,
            isBanned: updatedUser.isBanned
        }, { status: 200 });

    } catch (error: any) {
        console.error("Ban API Error:", error);
        return NextResponse.json({ message: "Erreur serveur : " + error.message }, { status: 500 });
    }
}

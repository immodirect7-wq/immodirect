import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Default prices
const DEFAULT_PRICES: Record<string, number> = {
    listing_price: 5000,
    pass_price: 2000,
    free_contact: 0,
    listing_duration_days: 30
};

export async function GET() {
    try {
        const settings = await prisma.platformSetting.findMany();

        // Convert to a dictionary for easier usage
        const config: Record<string, number> = { ...DEFAULT_PRICES };
        settings.forEach((setting: { id: string, value: number }) => {
            if (setting.id in config) {
                config[setting.id] = setting.value;
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ message: "Erreur lors de la récupération des paramètres." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        const body = await req.json();
        const { listing_price, pass_price, free_contact, listing_duration_days } = body;

        // Update or Create settings
        if (listing_price !== undefined) {
            await prisma.platformSetting.upsert({
                where: { id: "listing_price" },
                update: { value: parseFloat(listing_price) },
                create: { id: "listing_price", value: parseFloat(listing_price) }
            });
        }

        if (pass_price !== undefined) {
            await prisma.platformSetting.upsert({
                where: { id: "pass_price" },
                update: { value: parseFloat(pass_price) },
                create: { id: "pass_price", value: parseFloat(pass_price) }
            });
        }

        if (free_contact !== undefined) {
            await prisma.platformSetting.upsert({
                where: { id: "free_contact" },
                update: { value: parseFloat(free_contact) },
                create: { id: "free_contact", value: parseFloat(free_contact) }
            });
        }

        if (listing_duration_days !== undefined) {
            await prisma.platformSetting.upsert({
                where: { id: "listing_duration_days" },
                update: { value: parseFloat(listing_duration_days) },
                create: { id: "listing_duration_days", value: parseFloat(listing_duration_days) }
            });
        }

        return NextResponse.json({ message: "Paramètres mis à jour." }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Erreur serveur." }, { status: 500 });
    }
}

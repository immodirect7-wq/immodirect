import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Vous devez être connecté pour publier une annonce." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const {
            title,
            description,
            price,
            neighborhood,
            city,
            type,
            advanceMonths,
            images,
            latitude,
            longitude,
            status: bodyStatus,
            contactPhone,
            propertyType,
            surface,
        } = body;

        if (!title || !description || !price || !neighborhood || !city || !propertyType) {
            return NextResponse.json(
                { message: "Tous les champs obligatoires doivent être remplis." },
                { status: 400 }
            );
        }

        // Get user from DB to ensure valid ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! }, // Assuming email is unique identifier
        });

        if (!user) {
            return NextResponse.json(
                { message: "Utilisateur introuvable." },
                { status: 404 }
            );
        }

        // Validate images JSON string
        let imagesStr = "[]";
        if (images) {
            try {
                let parsed = images;
                // Deal with double stringified JSON (e.g. '"[\"url\"]"')
                while (typeof parsed === "string") {
                    parsed = JSON.parse(parsed);
                }
                imagesStr = JSON.stringify(Array.isArray(parsed) ? parsed : []);
            } catch {
                imagesStr = "[]";
            }
        }

        // Fetch listing duration setting
        const settings = await prisma.platformSetting.findUnique({
            where: { id: "listing_duration_days" }
        });
        const durationDays = settings?.value || 30; // Default to 30 days if not set

        let expiresAt: Date | null = null;
        if (bodyStatus === "PAID") {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);
        }

        // Create Listing
        const listing = await prisma.listing.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                advanceMonths: parseInt(advanceMonths) || 0,
                neighborhood,
                city,
                // Using `propertyType` as the official field now instead of appending to description
                propertyType: propertyType || "LIVING", // Default fallback if needed
                surface: propertyType === 'Boutique' ? parseInt(surface) : (surface ? parseInt(surface) : null), // Ensure it's an int and prioritized for Boutiques
                ownerId: user.id,
                status: bodyStatus || "PENDING",
                expiresAt,
                images: imagesStr,
                contactPhone: contactPhone || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
            } as any,
        });

        return NextResponse.json(
            { message: "Annonce créée avec succès !", listing },
            { status: 201 }
        );
    } catch (error) {
        console.error("Listing creation error:", error);
        return NextResponse.json(
            { message: "Erreur lors de la création de l'annonce." },
            { status: 500 }
        );
    }
}

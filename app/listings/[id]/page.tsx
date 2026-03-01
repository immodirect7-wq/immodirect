import prisma from "@/lib/prisma";
import ContactAction from "@/components/ContactAction";
import TrustBadge from "@/components/TrustBadge";
import ReportButton from "@/components/ReportButton";
import { notFound } from "next/navigation";
import ImageCarousel from "@/components/ImageCarousel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ListingPageProps {
    params: {
        id: string;
    };
}

export default async function ListingPage({ params }: ListingPageProps) {
    const session = await getServerSession(authOptions);
    let isUnlocked = false;
    let userPhone = "";

    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
        include: {
            owner: true,
        },
    });

    if (!listing) {
        notFound();
    }

    // Record page view (fire-and-forget)
    await prisma.pageView.create({ data: { path: `/listings/${params.id}` } }).catch(() => { });

    // Check free_contact platform setting
    const freeContactSetting = await prisma.platformSetting.findUnique({ where: { id: "free_contact" } });
    const isFreeContact = freeContactSetting ? freeContactSetting.value === 1 : false;

    // Get pass_price for ContactAction
    const passPriceSetting = await prisma.platformSetting.findUnique({ where: { id: "pass_price" } });
    const passPrice = passPriceSetting ? passPriceSetting.value : 2000;

    if (session && session.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user) {
            userPhone = user.phone || "";
            // If free contact mode is on, everyone is unlocked
            if (isFreeContact) {
                isUnlocked = true;
            } else if (user.hasActivePass && user.passExpiry && user.passExpiry > new Date()) {
                isUnlocked = true;
            } else {
                // Check: Single Unlock Transaction
                const unlockTransaction = await prisma.transaction.findFirst({
                    where: {
                        userId: user.id,
                        listingId: listing.id,
                        status: "SUCCESS",
                    },
                });
                if (unlockTransaction) {
                    isUnlocked = true;
                }
            }
        }
    }

    // Parse images
    let images: string[] = [];
    try {
        images = JSON.parse(listing.images);
    } catch (e) {
        images = []; // Fallback
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="relative h-64 w-full bg-gray-200 rounded-lg overflow-hidden mb-4">
                {/* Display Images */}
                {images.length > 0 ? (
                    <ImageCarousel images={images} title={listing.title} />
                ) : (
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                            <span>Aucune image disponible</span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-sm font-bold z-10">
                    {listing.status === "PAID" ? "En ligne" : "En attente"}
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold">{listing.title}</h1>
                    <TrustBadge trustScore={listing.owner.trustScore} />
                </div>

                <p className="text-primary font-bold text-xl">{listing.price.toLocaleString()} FCFA / mois</p>
                <p className="text-gray-600">{listing.neighborhood}, {listing.city}</p>
                <p className="text-sm text-gray-500">Avance: {listing.advanceMonths} mois</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            <div className="border-t pt-6">
                <h2 className="font-semibold mb-4">Contact</h2>
                <ContactAction
                    isUnlocked={isUnlocked}
                    ownerPhone={listing.owner.phone || ""}
                    listingId={listing.id}
                    listingTitle={listing.title}
                    userPhone={userPhone}
                    passPrice={passPrice}
                />
                <ReportButton listingId={listing.id} />
            </div>
        </div>
    );
}

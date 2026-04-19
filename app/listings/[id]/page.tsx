import prisma from "@/lib/prisma";
import ContactAction from "@/components/ContactAction";
import TrustBadge from "@/components/TrustBadge";
import ReportButton from "@/components/ReportButton";
import NavigateButton from "@/components/NavigateButton";
import { notFound } from "next/navigation";
import ImageCarousel from "@/components/ImageCarousel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";

// ISR: revalidate every 60 seconds for fresh content + good SEO performance
export const revalidate = 60;

interface ListingPageProps {
    params: {
        id: string;
    };
}

// Dynamic metadata for SEO + social sharing
export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://immodirect.vercel.app";

    try {
        const listing: any = await prisma.listing.findUnique({
            where: { id: params.id },
        });

        if (!listing) {
            return { title: "Annonce introuvable" };
        }

        let firstImage = "/logo.png";
        try {
            const imgs = JSON.parse(listing.images);
            if (imgs.length > 0) firstImage = imgs[0];
        } catch { }

        const pType = listing.propertyType || "Bien";
        const title = `${listing.title} - ${pType} à ${listing.neighborhood}, ${listing.city}`;
        const description = `${pType} à ${listing.neighborhood}, ${listing.city}. ${listing.price?.toLocaleString()} ${pType === 'Appartement meublé' ? 'FCFA/jour' : 'FCFA/mois'}. ${(listing.description || "").substring(0, 150)}...`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: "article",
                locale: "fr_CM",
                siteName: "ImmoDirect",
                url: `${baseUrl}/listings/${params.id}`,
                images: [
                    {
                        url: firstImage,
                        width: 800,
                        height: 600,
                        alt: listing.title,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [firstImage],
            },
        };
    } catch {
        return { title: "ImmoDirect - Annonce" };
    }
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

    // Build JSON-LD structured data for SEO
    let firstImage = "/logo.png";
    try {
        const imgs = JSON.parse(listing.images);
        if (imgs.length > 0) firstImage = imgs[0];
    } catch { }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: listing.title,
        description: listing.description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://immodirect.vercel.app"}/listings/${params.id}`,
        image: firstImage,
        offers: {
            "@type": "Offer",
            price: listing.price,
            priceCurrency: "XAF",
            availability: "https://schema.org/InStock",
        },
        address: {
            "@type": "PostalAddress",
            addressLocality: listing.city,
            addressRegion: listing.neighborhood,
            addressCountry: "CM",
        },
    };

    return (
        <>
            {/* JSON-LD Structured Data for Google Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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

                    <p className="text-primary font-bold text-xl">{listing.price.toLocaleString()} {listing.propertyType === 'Appartement meublé' ? 'FCFA / jour' : 'FCFA / mois'}</p>
                    <p className="text-gray-600">{listing.neighborhood}, {listing.city}</p>
                    {listing.propertyType !== 'Appartement meublé' && <p className="text-sm text-gray-500">Avance: {listing.advanceMonths} mois</p>}
                    <div className="mt-3">
                        <NavigateButton
                            latitude={listing.latitude}
                            longitude={listing.longitude}
                            neighborhood={listing.neighborhood}
                            city={listing.city}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold mb-2">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                </div>

                <div className="border-t pt-6">
                    <h2 className="font-semibold mb-4">Contact</h2>
                    <ContactAction
                        isUnlocked={isUnlocked}
                        ownerPhone={(listing as any).contactPhone || listing.owner.phone || ""}
                        listingId={listing.id}
                        listingTitle={listing.title}
                        userPhone={userPhone}
                        passPrice={passPrice}
                    />
                    <ReportButton listingId={listing.id} />
                </div>
            </div>
        </>
    );
}

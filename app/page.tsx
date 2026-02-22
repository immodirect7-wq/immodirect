import prisma from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import Sidebar from "@/components/Sidebar";
import { Filter } from "lucide-react";
import ClientSidebarWrapper from "@/components/ClientSidebarWrapper"; // To handle client-side state
import Hero from "@/components/Hero";

// Ensure dynamic rendering for listings
export const dynamic = 'force-dynamic';

export default async function Home() {
    let listings: any[] = [];

    try {
        listings = await prisma.listing.findMany({
            where: {
                status: "PAID",
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (error) {
        console.error("Erreur de connexion à la base de données (page d'accueil):", error);
        // On continue avec un tableau vide pour ne pas faire planter tout le site
    }

    return (
        <>
            <Hero />
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 relative">

                {/* Sidebar (Filters) */}
                {/* We need a client component to handle the mobile drawer state, 
               but for now, we'll implement a simple server-side structure 
               and rely on the ClientSidebarWrapper for interactivity. */}
                <ClientSidebarWrapper />

                {/* Main Content */}
                <div className="flex-1">
                    {/* Mobile Filter Button (Visible only on mobile) */}
                    <div className="md:hidden mb-6 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900">Annonces récentes</h1>
                        <ClientSidebarWrapper mobileTrigger />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.length > 0 ? (
                            listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    id={listing.id}
                                    title={listing.title}
                                    description={listing.description}
                                    price={listing.price}
                                    neighborhood={listing.neighborhood}
                                    city={listing.city}
                                    images={listing.images}
                                    trustScore={0} // Default for now, fetch owner if needed
                                    status={listing.status}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                Aucune annonce disponible pour le moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

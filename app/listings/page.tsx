import prisma from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import nextDynamic from "next/dynamic";

const Map = nextDynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
            Chargement de la carte...
        </div>
    )
});

export const dynamic = "force-dynamic";

interface ListingsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
    const query = typeof searchParams.q === "string" ? searchParams.q : "";
    const type = typeof searchParams.type === "string" ? searchParams.type : "louer";

    // Build the query
    const whereClause: any = {
        status: "PAID",
    };

    if (query) {
        whereClause.OR = [
            { city: { contains: query, mode: "insensitive" } },
            { neighborhood: { contains: query, mode: "insensitive" } },
        ];
    }

    // Note: We are currently ignoring the "type" parameter in the DB query since your schema 
    // doesn't seem to explicitly separate "Rent" or "Buy" fields, but it's captured from the UI 
    // for future extensions.

    let listings: any[] = [];
    try {
        listings = await prisma.listing.findMany({
            where: whereClause,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                owner: true,
            },
        });
    } catch (error) {
        console.error("Erreur de connexion à la base de données (page de recherche):", error);
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
            {/* Left Column: Listings */}
            <div className="w-full md:w-[55%] lg:w-[50%] p-4 md:p-6 overflow-y-auto flex-shrink-0 relative">

                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {query ? `Résultats pour "${query}"` : "Toutes les annonces"}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {listings.length} {listings.length > 1 ? "biens trouvés" : "bien trouvé"} {query ? `à ${query}` : ""}
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-primary font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Retour
                    </Link>
                </div>

                {/* Listings Grid */}
                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
                        {listings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                description={listing.description}
                                price={listing.price}
                                neighborhood={listing.neighborhood}
                                city={listing.city}
                                images={listing.images}
                                trustScore={listing.owner?.trustScore || 0}
                                status={listing.status}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-300 mt-10">
                        <MapIcon size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun logement trouvé</h3>
                        <p className="text-slate-500 mb-6 max-w-sm text-sm">
                            Nous n'avons pas trouvé de biens correspondant à votre recherche {query && <span>pour <strong>{query}</strong></span>}. Essayez d'élargir votre zone géographique.
                        </p>
                        <Link
                            href="/"
                            className="bg-primary text-white hover:bg-blue-700 transition-colors px-6 py-2.5 rounded-lg font-bold shadow-sm"
                        >
                            Nouvelle recherche
                        </Link>
                    </div>
                )}
            </div>

            {/* Right Column: Interactive Map (Hidden on mobile) */}
            <div className="hidden md:block w-full md:w-[45%] lg:w-[50%] h-full sticky top-16 bg-slate-100 overflow-hidden flex-shrink-0 z-0">
                <Map listings={listings} />
            </div>
        </div>
    );
}

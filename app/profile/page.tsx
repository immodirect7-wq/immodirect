import prisma from "@/lib/prisma";
import VerificationRequest from "@/components/VerificationRequest";
import TrustBadge from "@/components/TrustBadge";
import ProfileTabs from "@/components/ProfileTabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import ListingActions from "@/components/ListingActions";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    // Get actual user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        redirect("/auth/signin");
    }

    // Fetch user with their listings (if OWNER) and eventually favorites (if SEEKER)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            listings: {
                orderBy: { createdAt: "desc" }
            },
            favorites: {
                include: { listing: true },
                orderBy: { createdAt: "desc" }
            },
            alerts: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!user) {
        return <div className="p-8 text-center">Utilisateur introuvable.</div>;
    }

    // Fetch dynamic pricing
    const settings = await prisma.platformSetting.findMany();
    const config: Record<string, number> = { listing_price: 5000, pass_price: 2000 };
    settings.forEach((s) => config[s.id] = s.value);

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-[calc(100vh-64px)]">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Tableau de bord</h1>

            <ProfileTabs role={user.role}>

                {/* 1. COMPTE TAB */}
                <div data-tab="account">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-semibold text-xl text-slate-800">{session.user.name || "Utilisateur"}</h2>
                                <p className="text-gray-500 mb-1">{user.email}</p>
                                <p className="text-primary text-sm font-medium px-3 py-1 bg-blue-50 inline-block rounded-full mt-2">
                                    {user.role === "OWNER" ? "Propriétaire" : "Chercheur de bien"}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <TrustBadge trustScore={user.trustScore} />
                                <div className="text-sm">
                                    <span className="text-gray-500 mr-1">Trust Score:</span>
                                    <span className="font-bold text-slate-800">{user.trustScore}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {user.role === "OWNER" && (
                        <div className="mb-6">
                            <h2 className="font-bold text-lg mb-3 text-slate-800">Statut de Vérification</h2>
                            {user.trustScore < 50 ? (
                                <VerificationRequest />
                            ) : (
                                <div className="bg-green-50/50 border border-green-100 text-green-800 p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-green-500 text-white rounded-full p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span className="font-medium">Vous êtes un Profil Vérifié de Confiance</span>
                                </div>
                            )}
                        </div>
                    )}

                    {user.role === "SEEKER" && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-primary">
                            <h2 className="font-bold text-lg mb-3 text-slate-800">Mon Pass Visite</h2>
                            {user.hasActivePass ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg inline-flex">
                                    Actif jusqu'au {user.passExpiry?.toLocaleDateString()}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-slate-500 mb-4 text-sm">
                                        Pour voir en illimité les numéros de téléphone des propriétaires, activez votre Pass Visite.
                                    </p>
                                    <button className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
                                        Activer le Pass ({config.pass_price} FCFA / mois)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. LISTINGS TAB (ALL USERS) */}
                <div data-tab="listings">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-xl text-slate-800">Mes Annonces ({user.listings.length})</h2>
                        <a href="/listings/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm">
                            + Nouvelle Annonce
                        </a>
                    </div>

                    {user.listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.listings.map((listing: any) => (
                                <div key={listing.id} className="relative">
                                    <ListingCard
                                        id={listing.id}
                                        title={listing.title}
                                        description={listing.description}
                                        price={listing.price}
                                        neighborhood={listing.neighborhood}
                                        city={listing.city}
                                        images={listing.images}
                                        trustScore={user.trustScore}
                                        status={listing.status}
                                    />
                                    <ListingActions listingId={listing.id} currentStatus={listing.status} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
                            Vous n'avez pas encore publié d'annonce.
                        </div>
                    )}
                </div>

                {/* 3. FAVORITES TAB (SEEKER ONLY) */}
                {user.role === "SEEKER" && (
                    <div data-tab="favorites">
                        <h2 className="font-bold text-xl text-slate-800 mb-6">Mes Biens Favoris ({user.favorites.length})</h2>
                        {user.favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.favorites.map((fav: any) => (
                                    <div key={fav.id} className="relative">
                                        <ListingCard
                                            id={fav.listing.id}
                                            title={fav.listing.title}
                                            description={fav.listing.description}
                                            price={fav.listing.price}
                                            neighborhood={fav.listing.neighborhood}
                                            city={fav.listing.city}
                                            images={fav.listing.images}
                                            trustScore={user.trustScore}
                                            status={fav.listing.status}
                                            isFavorited={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
                                Vous n'avez pas encore de favoris.<br />
                                <span className="text-sm mt-2 block">Cliquez sur l'icône cœur d'une annonce pour la sauvegarder ici.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. ALERTS TAB (SEEKER ONLY) */}
                {user.role === "SEEKER" && (
                    <div data-tab="alerts">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl text-slate-800">Mes Alertes ({user.alerts.length})</h2>
                        </div>

                        {user.alerts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.alerts.map((alert: any) => (
                                    <div key={alert.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">Recherche: {alert.city || alert.neighborhood || "Toutes zones"}</h3>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${alert.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {alert.active ? 'Active' : 'Désactivée'}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-sm mb-4 space-y-1">
                                                {alert.minPrice || alert.maxPrice ? (
                                                    <p>Budget: {alert.minPrice || 0} - {alert.maxPrice || 'Max'} FCFA</p>
                                                ) : <p>Budget: Non spécifié</p>}
                                                {alert.bedrooms && <p>Chambres: {alert.bedrooms}</p>}
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-gray-50 flex justify-end">
                                            {/* Note: In a full app, you would have a client component to delete alerts here */}
                                            <button className="text-red-500 text-sm font-medium hover:text-red-700">Supprimer</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
                                Vous n'avez aucune alerte active.<br />
                                <span className="text-sm mt-2 block">Les alertes vous informent dès qu'un nouveau bien correspond à vos critères.</span>
                            </div>
                        )}
                    </div>
                )}

            </ProfileTabs>
        </div>
    );
}

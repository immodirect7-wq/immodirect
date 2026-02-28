import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import AdminListingActions from "./AdminListingActions";
import { CheckCircle, AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        redirect("/auth/signin");
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
        redirect("/");
    }

    const listings = await prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        include: { owner: true }
    });

    const paidCount = listings.filter(l => l.status === "PAID").length;
    const pendingCount = listings.filter(l => l.status === "PENDING").length;
    const expiredCount = listings.filter(l => l.status === "EXPIRED").length;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-full">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Toutes les Annonces ({listings.length})</h2>
                <p className="text-gray-500 text-sm mt-1">Supervisez et modérez les publications de la plateforme.</p>
                <div className="flex gap-4 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="font-black">{paidCount}</span> Payées
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        <span className="font-black">{pendingCount}</span> En attente
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <span className="font-black">{expiredCount}</span> Expirées
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50/50 text-gray-700 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Détails de l'Annonce</th>
                            <th className="px-6 py-4">Auteur</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map((listing) => {
                            let firstImage = "/placeholder.jpg";
                            try {
                                const arr = JSON.parse(listing.images);
                                if (arr && arr.length > 0) firstImage = arr[0];
                            } catch (e) { }

                            return (
                                <tr key={listing.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                                            <Image src={firstImage} alt="Cover" fill className="object-cover" sizes="64px" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 line-clamp-1">{listing.title}</div>
                                        <div className="text-primary font-medium">{listing.price} FCFA</div>
                                        <div className="text-xs text-slate-400 mt-1">{listing.city} - {listing.neighborhood}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-700">{listing.owner?.phone || listing.owner?.email || "N/A"}</div>
                                        <div className="text-xs text-slate-400">ID: {listing.owner?.id.substring(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${listing.status === "PAID" ? "bg-green-100 text-green-700" :
                                            listing.status === "EXPIRED" ? "bg-red-100 text-red-700" :
                                                "bg-orange-100 text-orange-700"
                                            }`}>
                                            {listing.status === "PAID" && <CheckCircle size={14} />}
                                            {listing.status === "EXPIRED" && <AlertTriangle size={14} />}
                                            {listing.status === "PENDING" && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <AdminListingActions listingId={listing.id} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {listings.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Aucune annonce publiée pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}

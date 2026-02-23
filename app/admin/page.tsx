import prisma from "@/lib/prisma";
import { Users, Home, TrendingUp, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // Fetch stats
    const totalUsers = await prisma.user.count();
    const totalListings = await prisma.listing.count();

    // Detailed counts
    const ownersCount = await prisma.user.count({ where: { role: "OWNER" } });
    const seekersCount = await prisma.user.count({ where: { role: "SEEKER" } });
    const bannedCount = await prisma.user.count({ where: { isBanned: true } });
    const paidListings = await prisma.listing.count({ where: { status: "PAID" } });

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Aperçu Global</h1>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* Stat Card 1 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Inscrits</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalUsers}</p>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Home size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Annonces</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalListings}</p>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Annonces Payées</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{paidListings}</p>
                    </div>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldAlert size={100} />
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl relative z-10">
                        <ShieldAlert size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-medium">Comptes Bannis</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{bannedCount}</p>
                    </div>
                </div>
            </div>

            {/* Distribution Charts/Lists (Simulated for sleek dashboard look) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Répartition par Rôle</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Propriétaires (OWNER)</span>
                                <span className="text-slate-500">{ownersCount} utilisateurs</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(ownersCount / (totalUsers || 1)) * 100}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Locataires/Acheteurs (SEEKER)</span>
                                <span className="text-slate-500">{seekersCount} utilisateurs</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(seekersCount / (totalUsers || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BanButton from "./BanButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) redirect("/auth/signin");

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== "ADMIN") redirect("/");

    // Fetch all users except the current admin
    const users = await prisma.user.findMany({
        where: {
            id: { not: currentUser.id }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="p-4 font-semibold">Utilisateur</th>
                                <th className="p-4 font-semibold">Rôle</th>
                                <th className="p-4 font-semibold">Trust Score</th>
                                <th className="p-4 font-semibold">Inscrit le</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{user.email || user.phone || "N/A"}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {user.id}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-slate-100 text-slate-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary h-1.5 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(0, user.trustScore))}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{user.trustScore}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {user.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <BanButton userId={user.id} initialIsBanned={user.isBanned} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        Aucun autre utilisateur trouvé.
                    </div>
                )}
            </div>
        </div>
    );
}

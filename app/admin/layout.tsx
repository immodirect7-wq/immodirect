import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, AlertTriangle, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
        redirect("/"); // Kick non-admins out
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 text-white p-6 shrink-0 md:min-h-screen">
                <div className="flex items-center gap-3 mb-8">
                    <AlertTriangle className="text-yellow-500" size={28} />
                    <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
                </div>

                <nav className="space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <LayoutDashboard size={20} className="text-slate-400" />
                        <span className="font-medium">Statistiques</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <Users size={20} className="text-slate-400" />
                        <span className="font-medium">Utilisateurs</span>
                    </Link>
                </nav>

                <div className="mt-12 pt-6 border-t border-slate-800">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Retour au site principal
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 xl:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

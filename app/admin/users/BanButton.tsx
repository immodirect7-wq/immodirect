"use client";

import { useState } from "react";
import { ShieldBan, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BanButtonProps {
    userId: string;
    initialIsBanned: boolean;
}

export default function BanButton({ userId, initialIsBanned }: BanButtonProps) {
    const [isBanned, setIsBanned] = useState(initialIsBanned);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleBan = async () => {
        const action = isBanned ? "débannir" : "bannir";
        if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "POST",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Erreur lors de la modification du statut.");
            }

            const data = await res.json();
            setIsBanned(data.isBanned);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isBanned) {
        return (
            <button
                onClick={toggleBan}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Débannir
            </button>
        );
    }

    return (
        <button
            onClick={toggleBan}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldBan size={16} />}
            Bannir
        </button>
    );
}

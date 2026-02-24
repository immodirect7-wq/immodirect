"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListingActions({ listingId, currentStatus }: { listingId: string, currentStatus: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce définitivement ?")) return;
        setIsLoading(true);
        try {
            await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        const newStatus = currentStatus === "EXPIRED" ? "PAID" : "EXPIRED";
        try {
            await fetch(`/api/listings/${listingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute top-2 left-2 z-20 flex gap-2">
            <button
                disabled={isLoading}
                onClick={(e) => { e.preventDefault(); router.push(`/listings/${listingId}/edit`); }}
                className="bg-white/90 text-slate-700 px-3 py-1 rounded shadow-sm text-xs font-bold hover:bg-white transition-colors"
            >
                Modifier
            </button>
            <button
                disabled={isLoading}
                onClick={(e) => { e.preventDefault(); handleToggleStatus(); }}
                className="bg-orange-100 text-orange-700 px-3 py-1 rounded shadow-sm text-xs font-bold hover:bg-orange-200 transition-colors"
            >
                {currentStatus === "EXPIRED" ? "Réactiver" : "Suspendre"}
            </button>
            <button
                disabled={isLoading}
                onClick={(e) => { e.preventDefault(); handleDelete(); }}
                className="bg-red-100 text-red-700 px-3 py-1 rounded shadow-sm text-xs font-bold hover:bg-red-200 transition-colors"
            >
                Supprimer
            </button>
        </div>
    );
}

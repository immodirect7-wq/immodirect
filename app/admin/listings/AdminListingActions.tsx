"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, EyeOff } from "lucide-react";

export default function AdminListingActions({ listingId }: { listingId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible pour le site et pour le propriétaire.")) return;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/admin/listings/${listingId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                disabled={isLoading}
                onClick={handleDelete}
                title="Supprimer définitivement"
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
    );
}

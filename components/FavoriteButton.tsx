"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
    listingId: string;
    initialFavorited: boolean;
}

export default function FavoriteButton({ listingId, initialFavorited }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);

    const toggleFavorite = async (e: React.MouseEvent) => {
        // Prevent clicking from triggering the parent Link navigation
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsFavorited(data.isFavorited);
            } else if (res.status === 401) {
                alert("Veuillez vous connecter pour ajouter aux favoris.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm transition-transform hover:scale-110 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            <Heart
                size={20}
                className={`transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
            />
        </button>
    );
}

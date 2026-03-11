"use client";

import { Navigation } from "lucide-react";

interface NavigateButtonProps {
    latitude?: number | null;
    longitude?: number | null;
    neighborhood: string;
    city: string;
}

export default function NavigateButton({ latitude, longitude, neighborhood, city }: NavigateButtonProps) {
    if (!latitude || !longitude) return null;

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.97] text-sm"
        >
            <Navigation size={18} className="shrink-0" />
            S&apos;y rendre
            <span className="text-xs opacity-75 font-normal hidden sm:inline">
                — {neighborhood}, {city}
            </span>
        </a>
    );
}

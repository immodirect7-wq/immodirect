"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, X, Check } from "lucide-react";
import type { ComponentType } from "react";

interface MapPickerInnerProps {
    onSelect: (lat: number, lng: number) => void;
    initialLat: number;
    initialLng: number;
}

// Dynamic import to avoid SSR issues with Leaflet
const MapPicker = dynamic(
    () => import("./MapPickerInner"),
    { ssr: false }
) as ComponentType<MapPickerInnerProps>;

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function LocationPickerModal({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [mapCenter, setMapCenter] = useState({ lat: initialLat || 4.0511, lng: initialLng || 9.7679 });

    const openModal = () => {
        setIsOpen(true);
        // Auto-geolocate user when modal opens
        if (!selectedPos && navigator.geolocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMapCenter({ lat: latitude, lng: longitude });
                    setSelectedPos({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                },
                () => setIsLocating(false), // Silently fail if permission denied
                { timeout: 5000 }
            );
        }
    };

    const handleSelect = useCallback((lat: number, lng: number) => {
        setSelectedPos({ lat, lng });
    }, []);

    const handleConfirm = () => {
        if (selectedPos) {
            onLocationSelect(selectedPos.lat, selectedPos.lng);
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className={`flex items-center gap-2 font-medium text-sm transition-colors ${selectedPos ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700"}`}
            >
                <MapPin size={18} />
                {isLocating ? "Localisation en cours..." : selectedPos
                    ? `GPS: ${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)} ✓`
                    : "Ajouter la localisation GPS du logement"}
            </button>
            <p className="text-xs text-orange-600 italic">
                {selectedPos
                    ? "Localisation ajoutée ! Les locataires pourront trouver votre bien sur la carte."
                    : "Note : Il est vivement recommandé d'ajouter cette localisation pour aider les visiteurs à vous trouver."}
            </p>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Sélectionner la localisation</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Cliquez sur la carte pour placer le marqueur</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="h-[400px] relative">
                            <MapPicker
                                onSelect={handleSelect}
                                initialLat={mapCenter.lat}
                                initialLng={mapCenter.lng}
                            />
                        </div>

                        {selectedPos && (
                            <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-between">
                                <span className="text-green-700 text-sm font-medium">
                                    Lat: {selectedPos.lat.toFixed(6)} / Lng: {selectedPos.lng.toFixed(6)}
                                </span>
                                <button
                                    onClick={handleConfirm}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Check size={16} /> Confirmer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

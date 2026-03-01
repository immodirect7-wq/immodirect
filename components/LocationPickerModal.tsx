"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, X, Check, Search, Loader2, Navigation } from "lucide-react";
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

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function LocationPickerModal({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [mapCenter, setMapCenter] = useState({ lat: initialLat || 4.0511, lng: initialLng || 9.7679 });
    const [address, setAddress] = useState<string>("");

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const debouncedQuery = useDebounce(searchQuery, 400);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch search results from Nominatim
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        const controller = new AbortController();
        const search = async () => {
            setIsSearching(true);
            try {
                // Bias toward Cameroon (countrycodes=cm) but allow broader results
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&countrycodes=cm&limit=6&addressdetails=1`;
                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: { "Accept-Language": "fr" }
                });
                if (!res.ok) return;
                const data: NominatimResult[] = await res.json();
                setSearchResults(data);
                setShowResults(true);
            } catch (e) {
                // Ignore abort errors
            } finally {
                setIsSearching(false);
            }
        };
        search();
        return () => controller.abort();
    }, [debouncedQuery]);

    // Reverse geocode coordinates → readable address
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
            const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
            if (!res.ok) return;
            const data = await res.json();
            if (data?.display_name) {
                // Shorten the address: keep first 2 comma-separated parts
                const parts = data.display_name.split(",").slice(0, 3).join(",").trim();
                setAddress(parts);
            }
        } catch (e) {
            // Silent fail
        }
    };

    // Select a search result
    const handleResultSelect = (result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setSelectedPos({ lat, lng });
        setMapCenter({ lat, lng });
        setSearchQuery(result.display_name.split(",").slice(0, 2).join(",").trim());
        setShowResults(false);
        setAddress(result.display_name.split(",").slice(0, 3).join(",").trim());
    };

    // GPS high accuracy
    const locateMe = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setMapCenter({ lat: latitude, lng: longitude });
                setSelectedPos({ lat: latitude, lng: longitude });
                await reverseGeocode(latitude, longitude);
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const openModal = () => {
        setIsOpen(true);
        if (!selectedPos) locateMe();
    };

    const handleSelect = useCallback(async (lat: number, lng: number) => {
        setSelectedPos({ lat, lng });
        await reverseGeocode(lat, lng);
    }, []);

    const handleConfirm = () => {
        if (selectedPos) {
            onLocationSelect(selectedPos.lat, selectedPos.lng);
            setIsOpen(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            {selectedPos && address && (
                <p className="text-xs text-green-700 mt-0.5 italic">{address}</p>
            )}
            <p className="text-xs text-orange-600 italic">
                {selectedPos
                    ? "Localisation ajoutée ! Les locataires pourront trouver votre bien sur la carte."
                    : "Note : Il est vivement recommandé d'ajouter cette localisation pour aider les visiteurs à vous trouver."}
            </p>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Sélectionner la localisation</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Recherchez une adresse ou cliquez sur la carte</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="p-3 border-b bg-slate-50" ref={searchRef}>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un quartier, une rue, une ville..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                    />
                                    {isSearching && (
                                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                                    )}

                                    {/* Dropdown results */}
                                    {showResults && searchResults.length > 0 && (
                                        <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-xl z-10 overflow-hidden">
                                            {searchResults.map((result) => (
                                                <button
                                                    key={result.place_id}
                                                    type="button"
                                                    onClick={() => handleResultSelect(result)}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b last:border-0 transition-colors"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                                        <span className="text-slate-700 leading-snug">
                                                            {result.display_name.split(",").slice(0, 4).join(", ")}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* GPS button */}
                                <button
                                    type="button"
                                    onClick={locateMe}
                                    disabled={isLocating}
                                    title="Me localiser"
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shrink-0"
                                >
                                    {isLocating
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <Navigation size={16} />
                                    }
                                    <span className="hidden sm:inline">Ma position</span>
                                </button>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-[350px] relative">
                            <MapPicker
                                onSelect={handleSelect}
                                initialLat={mapCenter.lat}
                                initialLng={mapCenter.lng}
                            />
                        </div>

                        {/* Footer with address + confirm */}
                        {selectedPos && (
                            <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-green-700 text-sm font-medium truncate">
                                        {address || `${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}`}
                                    </p>
                                    <p className="text-green-500 text-xs">
                                        {selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
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

"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';

// Fix for default marker icons
const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Listing {
    id: string;
    title: string;
    price: number;
    latitude: number | null;
    longitude: number | null;
    images: string;
    city: string;
    neighborhood: string;
}

interface MapProps {
    listings: Listing[];
}

export default function Map({ listings }: MapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Chargement de la carte...</div>;
    }

    // Determine center based on listings or default to Douala, Cameroon
    const validListings = listings.filter(l => l.latitude && l.longitude);
    const defaultCenter: [number, number] = [4.0511, 9.7085]; // Douala coordinates
    const center: [number, number] = validListings.length > 0
        ? [validListings[0].latitude!, validListings[0].longitude!]
        : defaultCenter;

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={center}
                zoom={validListings.length > 0 ? 12 : 6}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {validListings.map((listing) => {
                    let imageUrl = "/placeholder-house.jpg";
                    try {
                        const images = JSON.parse(listing.images);
                        if (images.length > 0) imageUrl = images[0];
                    } catch (e) { }

                    return (
                        <Marker
                            key={listing.id}
                            position={[listing.latitude!, listing.longitude!]}
                            icon={customIcon}
                        >
                            <Popup className="listing-popup">
                                <div className="w-48">
                                    <div className="relative h-32 w-full mb-2 rounded-lg overflow-hidden">
                                        <Image src={imageUrl} alt={listing.title} fill className="object-cover" />
                                    </div>
                                    <h3 className="font-bold text-sm truncate text-slate-800">{listing.title}</h3>
                                    <p className="text-primary font-bold text-sm">{listing.price.toLocaleString()} FCFA / mois</p>
                                    <p className="text-xs text-slate-500 truncate">{listing.neighborhood}, {listing.city}</p>
                                    <Link href={`/listings/${listing.id}`} className="block w-full text-center mt-3 bg-slate-900 text-white text-xs font-bold py-2 rounded-md hover:bg-slate-800 transition-colors">
                                        Voir l'annonce
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

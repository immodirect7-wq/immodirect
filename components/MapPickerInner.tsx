"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

// Fix default leaflet marker icons (broken by webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 250);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

// Fly to new coordinates when they change (GPS, search, etc.)
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 16, { duration: 1.2 });
    }, [lat, lng, map]);
    return null;
}

interface MapPickerInnerProps {
    onSelect: (lat: number, lng: number) => void;
    initialLat: number;
    initialLng: number;
}

export default function MapPickerInner({ onSelect, initialLat, initialLng }: MapPickerInnerProps) {
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

    // Sync marker with external coordinate changes (GPS / search)
    useEffect(() => {
        setMarkerPos({ lat: initialLat, lng: initialLng });
    }, [initialLat, initialLng]);

    const handleClick = (lat: number, lng: number) => {
        setMarkerPos({ lat, lng });
        onSelect(lat, lng);
    };

    return (
        <MapContainer
            center={[initialLat, initialLng]}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
        >
            <InvalidateSize />
            <RecenterMap lat={initialLat} lng={initialLng} />
            <TileLayer
                attribution="&copy; Google Maps"
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            <ClickHandler onSelect={handleClick} />
            {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
        </MapContainer>
    );
}

"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

interface MapPickerInnerProps {
    onSelect: (lat: number, lng: number) => void;
    initialLat: number;
    initialLng: number;
}

export default function MapPickerInner({ onSelect, initialLat, initialLng }: MapPickerInnerProps) {
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

    const handleClick = (lat: number, lng: number) => {
        setMarkerPos({ lat, lng });
        onSelect(lat, lng);
    };

    return (
        <MapContainer
            center={[initialLat, initialLng]}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onSelect={handleClick} />
            {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
        </MapContainer>
    );
}

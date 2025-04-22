
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Avoid missing marker icon issue in leaflet/react-leaflet
import L from "leaflet";

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MiniMapProps {
  lat: number;
  lon: number;
  label?: string;
  height?: number;
  zoom?: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  lat,
  lon,
  label,
  height = 180,
  zoom = 15,
}) => {
  if (!lat || !lon) return null;
  
  // Define the position for the map and marker
  const position: [number, number] = [lat, lon];

  return (
    <div className="rounded-lg shadow border overflow-hidden" style={{ height }}>
      <MapContainer
        className="h-full w-full"
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
};

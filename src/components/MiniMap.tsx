
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Avoid missing marker icon issue in leaflet/react-leaflet
import L from "leaflet";
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

  return (
    <div className="rounded-lg shadow border overflow-hidden" style={{ height }}>
      <MapContainer
        center={[lat, lon]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        tap={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]} icon={markerIcon}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
};

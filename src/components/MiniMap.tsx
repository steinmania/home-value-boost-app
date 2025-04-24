
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SetViewOnLoad = ({ coords, zoom }: { coords: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom);
  }, [coords, map, zoom]);
  return null;
};

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
  
  const position: [number, number] = [lat, lon];

  return (
    <div className="rounded-lg shadow border overflow-hidden" style={{ height }}>
      <MapContainer
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        whenReady={(map) => {
          map.target.scrollWheelZoom.disable();
        }}
        attributionControl={false}
        zoomControl={false}
      >
        <SetViewOnLoad coords={position} zoom={zoom} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
};

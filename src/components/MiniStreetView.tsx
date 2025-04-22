
import React from "react";
// If you have a Google Street View Static API key, set it here
const GOOGLE_STREET_VIEW_API_KEY = "<YOUR_GOOGLE_API_KEY_HERE>";

interface MiniStreetViewProps {
  address: string;
  height?: number;
  width?: number;
  className?: string;
}

export const MiniStreetView: React.FC<MiniStreetViewProps> = ({
  address,
  height = 80,
  width = 120,
  className = ""
}) => {
  if (!address) return null;

  // Encode URI and build image URL
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    location: address,
    key: GOOGLE_STREET_VIEW_API_KEY,
    pitch: "10",
    fov: "80",
    heading: "235"
  }).toString();
  const url = `https://maps.googleapis.com/maps/api/streetview?${params}`;

  // If no API key is set, show a placeholder/fallback
  const isMissingKey = !GOOGLE_STREET_VIEW_API_KEY || GOOGLE_STREET_VIEW_API_KEY.includes("<YOUR_GOOGLE_API_KEY_HERE>");

  return (
    <div className={`rounded-md border border-gray-200 shadow bg-gray-50 flex items-center justify-center ${className}`} style={{ height, width }}>
      {isMissingKey ? (
        <span className="text-xs text-gray-400 px-2 text-center">
          Street View unavailable<br />Add your Google API key
        </span>
      ) : (
        <img
          src={url}
          alt="Street view"
          className="object-cover w-full h-full rounded"
          loading="lazy"
          onError={e => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      )}
    </div>
  );
};

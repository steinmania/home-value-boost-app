
import React from "react";

// If you have a Google Street View Static API key, set it here
const GOOGLE_STREET_VIEW_API_KEY = "";

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

  // For demonstration purposes, generate a placeholder image based on the address
  // Since most users won't have a Google Street View API key
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/e0e0e0/808080?text=${encodeURIComponent(address.substring(0, 20))}`;

  // Show placeholder image by default
  const isApiKeyAvailable = GOOGLE_STREET_VIEW_API_KEY && GOOGLE_STREET_VIEW_API_KEY.length > 5;
  
  // Only try to use the Google API if a key is actually set
  let streetViewUrl = placeholderUrl;
  if (isApiKeyAvailable) {
    // Encode URI and build image URL
    const params = new URLSearchParams({
      size: `${width}x${height}`,
      location: address,
      key: GOOGLE_STREET_VIEW_API_KEY,
      pitch: "10",
      fov: "80",
      heading: "235"
    }).toString();
    streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?${params}`;
  }

  return (
    <div className={`relative rounded-md border border-gray-200 shadow bg-gray-50 flex items-center justify-center ${className}`} style={{ height, width }}>
      {isApiKeyAvailable ? (
        <img
          src={streetViewUrl}
          alt="Street view"
          className="object-cover w-full h-full rounded"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderUrl;
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-1">
          <div 
            className="text-xs text-gray-500 text-center overflow-hidden"
            style={{ maxHeight: "100%", textOverflow: "ellipsis" }}
          >
            {address ? address.substring(0, 20) + (address.length > 20 ? "..." : "") : "No address"}
          </div>
          <span className="text-[8px] text-gray-400 mt-1">Set API key for Street View</span>
        </div>
      )}
    </div>
  );
};

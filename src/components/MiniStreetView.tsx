
import React from "react";
import { useNavigate } from "react-router-dom";

const GOOGLE_STREET_VIEW_API_KEY = 'AIzaSyCfB3X2c5mdUau4GljTkb2dLk5o3nH6qOw';

interface MiniStreetViewProps {
  address: string;
  height?: number;
  width?: number;
  className?: string;
  clickToAdd?: boolean;
}

export const MiniStreetView: React.FC<MiniStreetViewProps> = ({
  address,
  height = 80,
  width = 120,
  className = "",
  clickToAdd = false
}) => {
  const navigate = useNavigate();
  
  // Generate placeholder image
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/e0e0e0/808080?text=${encodeURIComponent(address ? address.substring(0, 20) : "No Address")}`;

  const hasApiKey = GOOGLE_STREET_VIEW_API_KEY && GOOGLE_STREET_VIEW_API_KEY.length > 0;
  
  let streetViewUrl = placeholderUrl;
  if (hasApiKey && address) {
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

  const handleClick = () => {
    if (clickToAdd) {
      navigate("/setup");
    }
  };

  return (
    <div 
      className={`relative rounded-md border border-gray-200 shadow bg-gray-50 flex items-center justify-center ${className} ${clickToAdd ? "cursor-pointer hover:border-zing-400 transition-colors" : ""}`} 
      style={{ height, width }}
      onClick={handleClick}
    >
      {hasApiKey && address ? (
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
            {address ? address.substring(0, 20) + (address.length > 20 ? "..." : "") : clickToAdd ? "Click to add address" : "No address"}
          </div>
          {!hasApiKey && (
            <span className="text-[8px] text-gray-400 mt-1">
              {clickToAdd ? "Setup your property" : "Set API key for Street View"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};


import { useCallback, useState } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

// Enhanced address autocomplete using OpenStreetMap Nominatim API with better filtering
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * @param query Address or partial address to search for
   * @param countryCode ISO 3166-1 alpha2 country code (e.g. 'us')
   */
  const search = useCallback(async (query: string, countryCode?: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);

    try {
      // Use different search parameters for better results
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5`;
      
      // Apply country filter if provided
      if (countryCode) {
        url += `&countrycodes=${countryCode.toLowerCase()}`;
      }
      
      // Add additional parameters for better search results
      // street_address and city focus on more specific locations
      url += "&featuretype=street&featuretype=house&featuretype=city&namedetails=1";
      
      const res = await fetch(url, {
        headers: { 
          "User-Agent": "zing-home-app",
          "Accept-Language": "en" // Prefer English results
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching address suggestions: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Process and filter results for better quality
      setSuggestions(
        data
          .filter((item: any) => 
            // Filter out results that don't have enough information
            item.display_name && 
            item.lat && 
            item.lon &&
            // Ensure we have proper address components
            item.address &&
            // Prefer results with more address details
            (item.address.road || item.address.house_number || 
             item.address.city || item.address.town || 
             item.address.postcode || item.address.state)
          )
          .map((item: any) => ({
            label: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            raw: item,
          }))
      );
    } catch (e) {
      console.error("Address lookup error:", e);
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, search, clear };
}

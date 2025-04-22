
import { useCallback, useState } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

// Enhanced address autocomplete using OpenStreetMap Nominatim API
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * @param query Address or partial address to search for
   * @param countryCode ISO 3166-1 alpha2 country code (e.g. 'us')
   */
  const search = useCallback(async (query: string, countryCode?: string) => {
    // Reset state
    setError(null);
    
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);

    try {
      // Basic URL with good default parameters
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}`;
      url += "&format=json&addressdetails=1&limit=5";
      
      // Apply country filter if provided
      if (countryCode) {
        url += `&countrycodes=${countryCode.toLowerCase()}`;
      }
      
      // Focus on specific locations for better results
      url += "&featuretype=street&featuretype=house&featuretype=city";
      
      const res = await fetch(url, {
        headers: { 
          "User-Agent": "zing-home-app",
          "Accept-Language": "en" 
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching address suggestions: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Process results for better display
      setSuggestions(
        data
          .filter((item: any) => item.lat && item.lon)
          .map((item: any) => ({
            label: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            raw: item,
          }))
      );
    } catch (e) {
      console.error("Address lookup error:", e);
      setError(e instanceof Error ? e.message : "Error looking up address");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, search, clear, error };
}

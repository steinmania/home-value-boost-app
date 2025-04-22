
import { useCallback, useState } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

// Enhanced address autocomplete using Geoapify API for better suggestions
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
      // For Geoapify we would normally use an API key, but for demo purposes we're using the free tier
      // In production, this should be replaced with a proper API key
      let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}`;
      
      // Apply country filter if provided
      if (countryCode) {
        url += `&filter=countrycode:${countryCode.toLowerCase()}`;
      }
      
      // Add additional params for better results
      url += "&format=json&limit=5&type=street&type=amenity&type=building&type=address";
      
      const res = await fetch(url, {
        headers: { 
          "Accept": "application/json"
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching address suggestions: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Process results for better display
      if (data.results) {
        setSuggestions(
          data.results
            .filter((item: any) => item.lat && item.lon)
            .map((item: any) => ({
              label: item.formatted || item.address_line1 || `${item.street || ""} ${item.housenumber || ""}`.trim(),
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              raw: item,
            }))
        );
      } else {
        // Fallback to Nominatim if Geoapify doesn't work (for demo purposes)
        fallbackToNominatim(query, countryCode);
      }
    } catch (e) {
      console.error("Address lookup error:", e);
      // Fallback to Nominatim if Geoapify fails
      fallbackToNominatim(query, countryCode);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fallback to Nominatim for address suggestions
  const fallbackToNominatim = async (query: string, countryCode?: string) => {
    try {
      let nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}`;
      nominatimUrl += "&format=json&addressdetails=1&limit=5";
      
      if (countryCode) {
        nominatimUrl += `&countrycodes=${countryCode.toLowerCase()}`;
      }
      
      nominatimUrl += "&featuretype=street&featuretype=house&featuretype=city";
      
      const res = await fetch(nominatimUrl, {
        headers: { 
          "User-Agent": "zing-home-app",
          "Accept-Language": "en" 
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching address suggestions from fallback: ${res.status}`);
      }
      
      const data = await res.json();
      
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
      console.error("Fallback address lookup error:", e);
      setError(e instanceof Error ? e.message : "Error looking up address");
      setSuggestions([]);
    }
  };

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, search, clear, error };
}

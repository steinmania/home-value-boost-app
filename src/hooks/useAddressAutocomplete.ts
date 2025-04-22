
import { useCallback, useState } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

// Enhanced address autocomplete using Geoapify API with Nominatim fallback
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
      // Using Nominatim (OpenStreetMap) API for address suggestions
      // This is a reliable free alternative to commercial APIs
      let nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}`;
      nominatimUrl += "&format=json&addressdetails=1&limit=5";
      
      if (countryCode) {
        nominatimUrl += `&countrycodes=${countryCode.toLowerCase()}`;
      }
      
      // Add parameters to improve address results
      nominatimUrl += "&featuretype=street&featuretype=house&featuretype=building&featuretype=residential";
      
      const res = await fetch(nominatimUrl, {
        headers: { 
          "User-Agent": "zing-home-app",
          "Accept-Language": "en" 
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching address suggestions: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Process and normalize the results
      if (data && Array.isArray(data)) {
        setSuggestions(
          data
            .filter((item: any) => item.lat && item.lon)
            .map((item: any) => {
              // Create a nicely formatted address from components
              let formattedAddress = '';
              const addr = item.address || {};
              
              // Street address part
              if (addr.house_number && addr.road) {
                formattedAddress += `${addr.house_number} ${addr.road}`;
              } else if (addr.road) {
                formattedAddress += addr.road;
              } else if (item.display_name) {
                // Fall back to display_name if we don't have structured address
                formattedAddress = item.display_name;
              }
              
              // City/locality part
              if (addr.city || addr.town || addr.village || addr.hamlet) {
                const locality = addr.city || addr.town || addr.village || addr.hamlet;
                if (formattedAddress && !formattedAddress.includes(locality)) {
                  formattedAddress += `, ${locality}`;
                }
              }
              
              // State and postal code
              if (addr.state && addr.postcode) {
                if (!formattedAddress.includes(addr.state)) {
                  formattedAddress += `, ${addr.state} ${addr.postcode}`;
                }
              } else if (addr.state) {
                if (!formattedAddress.includes(addr.state)) {
                  formattedAddress += `, ${addr.state}`;
                }
              }
              
              // Use display_name as fallback
              if (!formattedAddress) {
                formattedAddress = item.display_name;
              }
              
              return {
                label: formattedAddress,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                raw: item,
              };
            })
        );
      }
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

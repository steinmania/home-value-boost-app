
import { useCallback, useState } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

// Calls Nominatim OpenStreetMap API for free address autocomplete
export function useAddressAutocomplete() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * @param query Address or partial address to search for
   * @param countryCode ISO 3166-1 alpha2 country code (e.g. 'us')
   */
  const search = useCallback(async (query: string, countryCode?: string) => {
    if (!query || query.length < 4) {
      setSuggestions([]);
      return;
    }
    setLoading(true);

    try {
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5`;
      if (countryCode) {
        url += `&countrycodes=${countryCode.toLowerCase()}`;
      }
      const res = await fetch(url, {
        headers: { "User-Agent": "zing-home-app" },
      });
      const data = await res.json();
      setSuggestions(
        data.map((item: any) => ({
          label: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          raw: item,
        }))
      );
    } catch (e) {
      setSuggestions([]);
    }
    setLoading(false);
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, search, clear };
}

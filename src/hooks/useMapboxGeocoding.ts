
import { useState, useCallback } from 'react';

export interface MapboxFeature {
  id: string;
  place_name: string;
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
}

const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN'; // This should be replaced with user input if not using Supabase

export function useMapboxGeocoding() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async (query: string, countryCode?: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        autocomplete: 'true',
        types: 'address',
        limit: '5',
      });

      if (countryCode) {
        params.append('country', countryCode.toLowerCase());
      }

      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch address suggestions');
      }

      const data = await response.json();
      const features: MapboxFeature[] = data.features || [];

      setSuggestions(
        features.map((feature) => ({
          label: feature.place_name,
          // Mapbox returns coordinates as [longitude, latitude]
          lon: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
          raw: feature,
        }))
      );
    } catch (e) {
      console.error('Address lookup error:', e);
      setError(e instanceof Error ? e.message : 'Error looking up address');
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

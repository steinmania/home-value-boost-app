
import { useState, useCallback } from 'react';

export interface PlaceSuggestion {
  label: string;
  lat: number;
  lon: number;
  raw?: google.maps.places.AutocompletePrediction;
}

const GOOGLE_API_KEY = 'AIzaSyCfB3X2c5mdUau4GljTkb2dLk5o3nH6qOw';

export function useGooglePlacesAutocomplete() {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the Places service
  const getPlaceDetails = useCallback(async (placeId: string): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            resolve({
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng()
            });
          } else {
            reject(new Error('Failed to get place details'));
          }
        }
      );
    });
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const autocompleteService = new google.maps.places.AutocompleteService();
      const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.getPlacePredictions(
          {
            input: query,
            types: ['address'],
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error('Failed to fetch address suggestions'));
            }
          }
        );
      });

      const suggestionsWithCoords = await Promise.all(
        predictions.map(async (prediction) => {
          try {
            const coords = await getPlaceDetails(prediction.place_id);
            return {
              label: prediction.description,
              ...coords,
              raw: prediction
            };
          } catch (error) {
            console.error('Error getting place details:', error);
            return null;
          }
        })
      );

      setSuggestions(suggestionsWithCoords.filter((s): s is PlaceSuggestion => s !== null));
    } catch (e) {
      console.error('Address lookup error:', e);
      setError(e instanceof Error ? e.message : 'Error looking up address');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [getPlaceDetails]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, search, clear, error };
}

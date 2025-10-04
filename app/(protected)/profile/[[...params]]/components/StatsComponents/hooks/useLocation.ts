// app/(protected)/profile/[[...params]]/components/StatsComponents/hooks/useLocation.ts
import { useState, useCallback } from "react";

interface LocationState {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationError {
  code: number;
  message: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const requestLocation =
    useCallback(async (): Promise<LocationState | null> => {
      setLoading(true);
      setError(null);

      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser");
        }

        // Get current position
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5 * 60 * 1000, // 5 minutes cache
            });
          }
        );

        const { latitude: lat, longitude: lon } = position.coords;

        // Reverse geocoding to get city/state (optional enhancement)
        const locationData: LocationState = { lat, lon };
        setLocation(locationData);
        setLoading(false);

        return locationData;
      } catch (err: any) {
        const locationError: LocationError = {
          code: err.code || 0,
          message: err.message || "Failed to get location",
        };

        setError(locationError);
        setLoading(false);
        return null;
      }
    }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    resetLocation,
  };
};

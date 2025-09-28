import { GeolocationData } from "@/types/profile";

// Geolocation error types
export enum GeolocationErrorType {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  POSITION_UNAVAILABLE = "POSITION_UNAVAILABLE",
  TIMEOUT = "TIMEOUT",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Custom geolocation error class
export class GeolocationError extends Error {
  public type: GeolocationErrorType;
  public code?: number;

  constructor(type: GeolocationErrorType, message: string, code?: number) {
    super(message);
    this.name = "GeolocationError";
    this.type = type;
    this.code = code;
  }
}

// Geolocation options interface
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  fallbackToIP?: boolean;
}

// Default geolocation options
const DEFAULT_OPTIONS: Required<Omit<GeolocationOptions, "fallbackToIP">> = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes
};

// Check if geolocation is supported
export const isGeolocationSupported = (): boolean => {
  return (
    "geolocation" in navigator &&
    typeof navigator.geolocation.getCurrentPosition === "function"
  );
};

// Get current position using browser geolocation API
export const getCurrentPosition = async (
  options: GeolocationOptions = {}
): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!isGeolocationSupported()) {
      reject(
        new GeolocationError(
          GeolocationErrorType.NOT_SUPPORTED,
          "Geolocation is not supported by this browser"
        )
      );
      return;
    }

    // Merge with default options
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    // Success callback
    const onSuccess = (position: GeolocationPosition): void => {
      const locationData: GeolocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      resolve(locationData);
    };

    // Error callback
    const onError = (error: GeolocationPositionError): void => {
      let errorType: GeolocationErrorType;
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorType = GeolocationErrorType.PERMISSION_DENIED;
          errorMessage =
            "Location access denied by user. Please enable location permissions in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorType = GeolocationErrorType.POSITION_UNAVAILABLE;
          errorMessage =
            "Location information is unavailable. Please check your GPS or internet connection.";
          break;
        case error.TIMEOUT:
          errorType = GeolocationErrorType.TIMEOUT;
          errorMessage = "Location request timed out. Please try again.";
          break;
        default:
          errorType = GeolocationErrorType.UNKNOWN_ERROR;
          errorMessage = "An unknown error occurred while retrieving location.";
      }

      reject(new GeolocationError(errorType, errorMessage, error.code));
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(onSuccess, onError, finalOptions);
  });
};

// Watch position changes (for real-time location tracking)
export const watchPosition = (
  onSuccess: (data: GeolocationData) => void,
  onError: (error: GeolocationError) => void,
  options: GeolocationOptions = {}
): number | null => {
  if (!isGeolocationSupported()) {
    onError(
      new GeolocationError(
        GeolocationErrorType.NOT_SUPPORTED,
        "Geolocation is not supported by this browser"
      )
    );
    return null;
  }

  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  const successCallback = (position: GeolocationPosition): void => {
    const locationData: GeolocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    onSuccess(locationData);
  };

  const errorCallback = (error: GeolocationPositionError): void => {
    let errorType: GeolocationErrorType;
    let errorMessage: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorType = GeolocationErrorType.PERMISSION_DENIED;
        errorMessage = "Location access denied by user.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorType = GeolocationErrorType.POSITION_UNAVAILABLE;
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorType = GeolocationErrorType.TIMEOUT;
        errorMessage = "Location request timed out.";
        break;
      default:
        errorType = GeolocationErrorType.UNKNOWN_ERROR;
        errorMessage = "An unknown error occurred while retrieving location.";
    }

    onError(new GeolocationError(errorType, errorMessage, error.code));
  };

  return navigator.geolocation.watchPosition(
    successCallback,
    errorCallback,
    finalOptions
  );
};

// Clear position watch
export const clearWatch = (watchId: number): void => {
  if (isGeolocationSupported() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Get approximate location using IP address (fallback method)
export const getLocationByIP = async (): Promise<Partial<GeolocationData>> => {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch IP location");
    }

    const data = await response.json();

    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      accuracy: 10000, // IP-based location is less accurate
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new GeolocationError(
      GeolocationErrorType.UNKNOWN_ERROR,
      "Failed to get location from IP address"
    );
  }
};

// Get location with fallback to IP
export const getLocationWithFallback = async (
  options: GeolocationOptions = {}
): Promise<GeolocationData> => {
  try {
    // Try GPS first
    return await getCurrentPosition(options);
  } catch (error) {
    // If GPS fails and fallback is enabled, try IP location
    if (options.fallbackToIP) {
      try {
        const ipLocation = await getLocationByIP();
        if (ipLocation.latitude && ipLocation.longitude) {
          return ipLocation as GeolocationData;
        }
      } catch (ipError) {
        console.warn("IP location fallback failed:", ipError);
      }
    }

    // Re-throw original error if fallback fails or is disabled
    throw error;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Format coordinates for display
export const formatCoordinates = (
  latitude: number,
  longitude: number
): string => {
  const latDirection = latitude >= 0 ? "N" : "S";
  const lonDirection = longitude >= 0 ? "E" : "W";

  const latDegrees = Math.abs(latitude).toFixed(6);
  const lonDegrees = Math.abs(longitude).toFixed(6);

  return `${latDegrees}°${latDirection}, ${lonDegrees}°${lonDirection}`;
};

// Get location accuracy description
export const getAccuracyDescription = (accuracy: number): string => {
  if (accuracy <= 10) return "Very High";
  if (accuracy <= 50) return "High";
  if (accuracy <= 100) return "Medium";
  if (accuracy <= 1000) return "Low";
  return "Very Low";
};

// Check if location permissions are granted
export const checkLocationPermission = async (): Promise<PermissionState> => {
  try {
    if ("permissions" in navigator) {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state;
    }
    return "prompt"; // Default to prompt if permissions API is not supported
  } catch (error) {
    console.warn("Could not check location permission:", error);
    return "prompt";
  }
};

// Request location permission (best effort)
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const position = await getCurrentPosition({ timeout: 1000 });
    return true; // If we got a position, permission was granted
  } catch (error) {
    if (
      error instanceof GeolocationError &&
      error.type === GeolocationErrorType.PERMISSION_DENIED
    ) {
      return false;
    }
    // For other errors, we can't determine permission status reliably
    return false;
  }
};

// Validate coordinates
export const isValidCoordinates = (
  latitude: number,
  longitude: number
): boolean => {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

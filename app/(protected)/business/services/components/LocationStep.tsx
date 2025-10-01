import React, { useState,useEffect } from "react";
import { MapPin } from "lucide-react";
import { StepProps } from "../page";
export const LocationStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);

  // Browser Geolocation API - Get current position
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationStatus("Getting your location...");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateFormData({
          lat: latitude,
          lon: longitude,
        });
        setLocationStatus("Location detected successfully!");
        setIsGettingLocation(false);

        // Optionally get address from coordinates (reverse geocoding)
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred";
            break;
        }
        setLocationStatus(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Reverse Geocoding - Get address from coordinates
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        if (address) {
          updateFormData({
            city: address.city || address.town || address.village || "",
            state: address.state || address.province || "",
            country: address.country || "",
          });
        }
      }
    } catch (error) {
      console.log("Reverse geocoding failed:", error);
      // Don't show error to user as this is optional enhancement
    }
  };

  // Forward Geocoding - Get coordinates from city/country
  const geocodeLocation = async () => {
    if (!formData.city && !formData.country) {
      setLocationStatus("Please enter at least a city or country first");
      return;
    }

    setIsGeocodingLocation(true);
    setLocationStatus("Looking up coordinates...");

    try {
      // Build query string for geocoding
      const query = [formData.city, formData.state, formData.country]
        .filter(Boolean)
        .join(", ");

      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          const location = data[0];
          updateFormData({
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
          });
          setLocationStatus("Coordinates found successfully!");
        } else {
          setLocationStatus("Location not found. Please check your input.");
        }
      } else {
        setLocationStatus("Unable to lookup coordinates. Please try again.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationStatus("Error looking up coordinates. Please try again.");
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  // Clear status message after 5 seconds
  useEffect(() => {
    if (locationStatus && !isGettingLocation && !isGeocodingLocation) {
      const timer = setTimeout(() => setLocationStatus(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationStatus, isGettingLocation, isGeocodingLocation]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <MapPin className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          Location Information
        </h2>
      </div>

      {/* Auto-location buttons */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          Automatic Location Detection
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isGettingLocation
              ? "Getting Location..."
              : "Use My Current Location"}
          </button>

          <button
            type="button"
            onClick={geocodeLocation}
            disabled={
              isGeocodingLocation || (!formData.city && !formData.country)
            }
            className="flex items-center justify-center px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {isGeocodingLocation ? "Looking up..." : "Find Coordinates"}
          </button>
        </div>

        {locationStatus && (
          <div
            className={`mt-3 p-2 text-sm rounded ${
              locationStatus.includes("successfully") ||
              locationStatus.includes("detected")
                ? "bg-green-100 text-green-800"
                : locationStatus.includes("denied") ||
                  locationStatus.includes("error") ||
                  locationStatus.includes("failed")
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {locationStatus}
          </div>
        )}

        <p className="text-xs text-blue-700 mt-2">
          • "Use My Current Location" will request permission to access your
          device's GPS
          <br />• "Find Coordinates" will lookup coordinates based on the
          city/country you enter below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => updateFormData({ country: e.target.value })}
            placeholder="Enter your country"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.country ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province (Optional)
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value })}
            placeholder="Enter your state or province"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City (Optional)
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            placeholder="Enter your city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coordinates
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.000001"
              value={formData.lat || ""}
              onChange={(e) =>
                updateFormData({
                  lat: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="Latitude"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              step="0.000001"
              value={formData.lon || ""}
              onChange={(e) =>
                updateFormData({
                  lon: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="Longitude"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Privacy Note:</strong> Location data is only used to match you
          with nearby events and athletes. You can manually enter coordinates if
          you prefer not to use automatic detection.
        </p>
      </div>
    </div>
  );
};
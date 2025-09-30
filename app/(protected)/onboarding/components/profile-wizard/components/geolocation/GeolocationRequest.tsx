// onboarding/components/profile-wizard/components/geolocation/GeolocationRequest.tsx
"use client";

import React from "react";
import {
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { formatCoordinates, getAccuracyDescription } from "@/lib/geolocation";

type LocationStatus = "idle" | "requesting" | "success" | "error" | "denied";

interface GeolocationRequestProps {
  readonly status: LocationStatus;
  readonly error: string | null;
  coordinates: {
    latitude?: any;
    longitude?: any;
    locationAccuracy?: any;
  };
  readonly onRequestLocation: (useIPFallback?: boolean) => Promise<void>;
  readonly onToggleManualEntry: () => void;
  readonly onSkipGeolocation: () => void;
}

export const GeolocationRequest: React.FC<GeolocationRequestProps> = ({
  status,
  error,
  coordinates,
  onRequestLocation,
  onToggleManualEntry,
  onSkipGeolocation,
}) => {
  const renderStatusContent = () => {
    switch (status) {
      case "requesting":
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Getting your location...
            </h3>
            <p className="text-gray-600 text-sm">
              This may take a few seconds. Please allow location access when
              prompted.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Location detected successfully!
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">
                    Coordinates:
                  </span>
                  <p className="text-green-700">
                    {formatCoordinates(
                      coordinates.latitude,
                      coordinates.longitude
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Accuracy:</span>
                  <p className="text-green-700">
                    {getAccuracyDescription(coordinates.locationAccuracy)}(
                    {Math.round(coordinates.locationAccuracy)}m)
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRequestLocation(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 mx-auto"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Update location</span>
            </button>
          </div>
        );

      case "denied":
        return (
          <div className="text-center py-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Location access denied
            </h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onRequestLocation(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Try with IP location
              </button>
              <button
                type="button"
                onClick={onToggleManualEntry}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm ml-2"
              >
                Enter manually
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Location unavailable
            </h3>
            <p className="text-orange-700 text-sm mb-4">{error}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onRequestLocation(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => onRequestLocation(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm ml-2"
              >
                Use IP location
              </button>
            </div>
          </div>
        );

      default: // idle
        return (
          <div className="text-center py-8">
            <GlobeAltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Allow location access
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Click the button below to automatically detect your precise
              location
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onRequestLocation(false)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center space-x-2 mx-auto"
              >
                <MapPinIcon className="w-5 h-5" />
                <span>Get my location</span>
              </button>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <button
                  type="button"
                  onClick={onToggleManualEntry}
                  className="text-gray-600 hover:text-gray-700 underline"
                >
                  Enter manually
                </button>
                <button
                  type="button"
                  onClick={onSkipGeolocation}
                  className="text-gray-600 hover:text-gray-700 underline"
                >
                  Skip this step
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return <>{renderStatusContent()}</>;
};

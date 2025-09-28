"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFormData,
  useErrors,
  useSetFormData,
  useSetStepValid,
  useSetStepCompleted,
  useClearErrors,
  useAddError,
} from "@/store/profileWizardStore";
import { geolocationSchema } from "@/lib/validations";
import { getFieldError } from "@/lib/validations";
import {
  getCurrentPosition,
  getLocationWithFallback,
  checkLocationPermission,
  GeolocationError,
  GeolocationErrorType,
  formatCoordinates,
  getAccuracyDescription,
  isValidCoordinates,
} from "@/lib/geolocation";
import {
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface GeolocationFormData {
  latitude: number;
  longitude: number;
  locationAccuracy: number;
}

type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "error"
  | "denied"
  | "manual";

export const StepFour: React.FC = () => {
  const formData = useFormData();
  const storeErrors = useErrors();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();
  const addError = useAddError();

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("prompt");
  const [isValidating, setIsValidating] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    setValue,
    trigger,
    reset,
  } = useForm<GeolocationFormData>({
    resolver: zodResolver(geolocationSchema),
    defaultValues: {
      latitude: formData.latitude || 0,
      longitude: formData.longitude || 0,
      locationAccuracy: formData.locationAccuracy || 0,
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Check if we have valid coordinates
  const hasValidLocation = isValidCoordinates(
    watchedValues.latitude,
    watchedValues.longitude
  );

  // Check permission status on component mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await checkLocationPermission();
        setPermissionState(permission);

        // If we already have location data, mark as success
        if (formData.latitude && formData.longitude) {
          setLocationStatus("success");
          setValue("latitude", formData.latitude);
          setValue("longitude", formData.longitude);
          setValue("locationAccuracy", formData.locationAccuracy || 0);
        }
      } catch (error) {
        console.warn("Failed to check permission:", error);
      }
    };

    checkPermission();
  }, [formData, setValue]);

  // Debounced validation
  const validateStep = useCallback(async () => {
    if (isValidating) return;

    setIsValidating(true);
    try {
      const isFormValid = await trigger();
      const stepValid = isFormValid && hasValidLocation;

      setStepValid(4, stepValid);
      setStepCompleted(4, stepValid);

      if (stepValid) {
        clearErrors("latitude");
        clearErrors("longitude");
        clearErrors("locationAccuracy");
      }
    } finally {
      setIsValidating(false);
    }
  }, [
    trigger,
    hasValidLocation,
    setStepValid,
    setStepCompleted,
    clearErrors,
    isValidating,
  ]);

  // Watch for form changes and validate
  useEffect(() => {
    if (hasValidLocation) {
      validateStep();
      setFormData({
        latitude: watchedValues.latitude,
        longitude: watchedValues.longitude,
        locationAccuracy: watchedValues.locationAccuracy,
      });
    }
  }, [
    watchedValues.latitude,
    watchedValues.longitude,
    watchedValues.locationAccuracy,
    hasValidLocation,
    validateStep,
    setFormData,
  ]);

  // Request geolocation
  const requestLocation = useCallback(
    async (useIPFallback: boolean = false) => {
      setLocationStatus("requesting");
      setLocationError(null);
      clearErrors("latitude");
      clearErrors("longitude");

      try {
        const locationData = await getLocationWithFallback({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
          fallbackToIP: useIPFallback,
        });

        // Update form values
        setValue("latitude", locationData.latitude, { shouldValidate: true });
        setValue("longitude", locationData.longitude, { shouldValidate: true });
        setValue("locationAccuracy", locationData.accuracy, {
          shouldValidate: true,
        });

        setLocationStatus("success");

        // Update permission state
        const newPermission = await checkLocationPermission();
        setPermissionState(newPermission);
      } catch (error) {
        console.error("Geolocation error:", error);

        if (error instanceof GeolocationError) {
          switch (error.type) {
            case GeolocationErrorType.PERMISSION_DENIED:
              setLocationStatus("denied");
              setLocationError(
                "Location access was denied. You can enter coordinates manually or enable location permissions."
              );
              break;
            case GeolocationErrorType.POSITION_UNAVAILABLE:
              setLocationStatus("error");
              setLocationError(
                "Unable to determine your location. Please check your GPS or internet connection."
              );
              break;
            case GeolocationErrorType.TIMEOUT:
              setLocationStatus("error");
              setLocationError(
                "Location request timed out. Please try again or enter coordinates manually."
              );
              break;
            case GeolocationErrorType.NOT_SUPPORTED:
              setLocationStatus("error");
              setLocationError(
                "Geolocation is not supported by your browser. Please enter coordinates manually."
              );
              setShowManualEntry(true);
              break;
            default:
              setLocationStatus("error");
              setLocationError(
                "An error occurred while getting your location. Please try again."
              );
          }
        } else {
          setLocationStatus("error");
          setLocationError(
            "Failed to get location. Please try again or enter coordinates manually."
          );
        }

        addError({
          field: "geolocation",
          message: locationError || "Geolocation failed",
        });
      }
    },
    [setValue, clearErrors, addError, locationError]
  );

  // Skip geolocation (optional step)
  const skipGeolocation = useCallback(() => {
    setLocationStatus("manual");
    setShowManualEntry(false);

    // Set default values to indicate skipped
    setValue("latitude", 0, { shouldValidate: true });
    setValue("longitude", 0, { shouldValidate: true });
    setValue("locationAccuracy", 0, { shouldValidate: true });

    setStepValid(4, true);
    setStepCompleted(4, true);
  }, [setValue, setStepValid, setStepCompleted]);

  // Toggle manual entry
  const toggleManualEntry = useCallback(() => {
    setShowManualEntry(!showManualEntry);
    if (!showManualEntry) {
      setLocationStatus("manual");
    }
  }, [showManualEntry]);

  const getInputClasses = useCallback((hasError: boolean) => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500";

    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
    }

    return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white`;
  }, []);

  const getLocationStatusDisplay = useCallback(() => {
    switch (locationStatus) {
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
                      watchedValues.latitude,
                      watchedValues.longitude
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Accuracy:</span>
                  <p className="text-green-700">
                    {getAccuracyDescription(watchedValues.locationAccuracy)}(
                    {Math.round(watchedValues.locationAccuracy)}m)
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => requestLocation(false)}
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
            <p className="text-red-700 text-sm mb-4">{locationError}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => requestLocation(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Try with IP location
              </button>
              <button
                type="button"
                onClick={toggleManualEntry}
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
            <p className="text-orange-700 text-sm mb-4">{locationError}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => requestLocation(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => requestLocation(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm ml-2"
              >
                Use IP location
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [
    locationStatus,
    locationError,
    watchedValues,
    requestLocation,
    toggleManualEntry,
  ]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Precise location detection
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            We'll automatically detect your precise coordinates for better local
            recommendations
          </p>
        </div>

        <form noValidate>
          {/* Location Status Display */}
          {locationStatus !== "idle" &&
            locationStatus !== "manual" &&
            getLocationStatusDisplay()}

          {/* Initial Request Buttons */}
          {locationStatus === "idle" && (
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
                  onClick={() => requestLocation(false)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center space-x-2 mx-auto"
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span>Get my location</span>
                </button>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <button
                    type="button"
                    onClick={toggleManualEntry}
                    className="text-gray-600 hover:text-gray-700 underline"
                  >
                    Enter manually
                  </button>
                  <button
                    type="button"
                    onClick={skipGeolocation}
                    className="text-gray-600 hover:text-gray-700 underline"
                  >
                    Skip this step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          {(showManualEntry || locationStatus === "manual") && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter coordinates manually
                </h3>
                <p className="text-gray-600 text-sm">
                  You can find your coordinates using Google Maps or other
                  mapping services
                </p>
              </div>

              {/* Latitude */}
              <div className="space-y-2">
                <label
                  htmlFor="latitude"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Latitude *
                </label>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="latitude"
                      step="any"
                      min={-90}
                      max={90}
                      placeholder="e.g., 37.7749"
                      className={getInputClasses(!!errors.latitude)}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.latitude && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{errors.latitude.message}</span>
                  </div>
                )}
              </div>

              {/* Longitude */}
              <div className="space-y-2">
                <label
                  htmlFor="longitude"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Longitude *
                </label>
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="longitude"
                      step="any"
                      min={-180}
                      max={180}
                      placeholder="e.g., -122.4194"
                      className={getInputClasses(!!errors.longitude)}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.longitude && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{errors.longitude.message}</span>
                  </div>
                )}
              </div>

              {/* Location Accuracy (Optional) */}
              <div className="space-y-2">
                <label
                  htmlFor="locationAccuracy"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Accuracy (meters, optional)
                </label>
                <Controller
                  name="locationAccuracy"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="locationAccuracy"
                      min={0}
                      placeholder="e.g., 10"
                      className={getInputClasses(!!errors.locationAccuracy)}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.locationAccuracy && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{errors.locationAccuracy.message}</span>
                  </div>
                )}
              </div>

              {/* Coordinate Preview */}
              {hasValidLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    Coordinate Preview
                  </h4>
                  <p className="text-green-700 text-sm">
                    {formatCoordinates(
                      watchedValues.latitude,
                      watchedValues.longitude
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {getFieldError(storeErrors, "geolocation") && (
            <div className="flex items-center space-x-2 text-red-600 text-sm mb-4">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{getFieldError(storeErrors, "geolocation")}</span>
            </div>
          )}

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">
                Validating coordinates...
              </span>
            </div>
          )}

          {/* Success Message */}
          {isValid && hasValidLocation && !isValidating && (
            <div className="flex items-center justify-center py-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Location coordinates are valid!
              </span>
            </div>
          )}
        </form>

        {/* Privacy Information */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-purple-800 mb-2">
                Privacy & Location Data
              </h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>
                  • Your precise location is encrypted and stored securely
                </li>
                <li>• Location data is used only for local recommendations</li>
                <li>• You can update or remove location data anytime</li>
                <li>• Location sharing with other users is always optional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFour;

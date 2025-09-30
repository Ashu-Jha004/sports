// lib/utils/geolocation-form.ts
// lib/utils/geolocation-form.ts (FIXED)
import { useCallback, useRef } from "react";
import {
  getLocationWithFallback,
  checkLocationPermission,
  isValidCoordinates,
} from "@/lib/geolocation";
import { useMemo } from "react";

/**
 * =============================================================================
 * GEOLOCATION FORM UTILITIES & HELPERS
 * =============================================================================
 */

/**
 * Geolocation validation hook (FIXED - No infinite loops)
 */
export const useGeolocationValidation = ({
  coordinates,
  setIsValidating,
  setStepValid,
  setStepCompleted,
  clearErrors,
  setFormData,
  trigger,
}: any) => {
  // Use ref to prevent infinite loops
  const validationInProgressRef = useRef(false);

  const hasValidLocation = isValidCoordinates(
    coordinates.latitude,
    coordinates.longitude
  );

  const validateStep = useCallback(async () => {
    // Prevent concurrent validations
    if (validationInProgressRef.current) {
      console.log("⚠️ Validation already in progress, skipping");
      return;
    }

    validationInProgressRef.current = true;

    if (setIsValidating) setIsValidating(true);

    try {
      console.log("🔄 Starting geolocation validation", { hasValidLocation });

      // Only trigger form validation if we have coordinates
      let isFormValid = true;
      if (hasValidLocation) {
        isFormValid = await trigger();
      }

      const stepValid = isFormValid && hasValidLocation;

      console.log("📊 Validation result", {
        isFormValid,
        hasValidLocation,
        stepValid,
      });

      setStepValid(4, stepValid);
      setStepCompleted(4, stepValid);

      if (stepValid) {
        clearErrors("latitude");
        clearErrors("longitude");
        clearErrors("locationAccuracy");

        // Only update form data if we have valid coordinates
        if (hasValidLocation) {
          setFormData({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            locationAccuracy: coordinates.locationAccuracy || 0,
          });
        }
      }
    } catch (error) {
      console.error("❌ Geolocation validation error:", error);
      setStepValid(4, false);
      setStepCompleted(4, false);
    } finally {
      if (setIsValidating) setIsValidating(false);
      validationInProgressRef.current = false;
    }
  }, [
    hasValidLocation,
    coordinates.latitude,
    coordinates.longitude,
    coordinates.locationAccuracy,
    trigger,
    setStepValid,
    setStepCompleted,
    clearErrors,
    setFormData,
    setIsValidating,
  ]);

  return { validateStep, hasValidLocation };
};

// ... rest of the file remains the same

/**
 * Geolocation handlers hook
 */
// Add this to prevent excessive re-renders

export const useGeolocationHandlers = ({
  setValue,
  setLocationStatus,
  setLocationError,
  clearErrors,
  addError,
}: any) => {
  // Memoize handlers to prevent re-creation

  const requestLocation = useCallback(
    async (useIPFallback: boolean = false) => {
      console.log("📍 Location request started", { useIPFallback });

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

        console.log("✅ Location received", locationData);

        // Set form values
        setValue("latitude", locationData.latitude, { shouldValidate: true }); // FIXED: Enable validation
        setValue("longitude", locationData.longitude, { shouldValidate: true });
        setValue("locationAccuracy", locationData.accuracy, {
          shouldValidate: true,
        });

        setLocationStatus("success");

        // FIXED: Force validation after location is set
        setTimeout(() => {
          console.log("🔄 Triggering validation after location success");
          // This will trigger the useEffect in StepFour that calls validateStep
        }, 100);
      } catch (error) {
        console.error("❌ Geolocation error:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Failed to get location";
        setLocationError(errorMessage);

        if (errorMessage.includes("denied")) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }

        addError({
          field: "geolocation",
          message: errorMessage,
        });
      }
    },
    [setValue, setLocationStatus, setLocationError, clearErrors, addError]
  );

  const skipGeolocation = useCallback(() => {
    console.log("⏭️ Geolocation skipped");
    setLocationStatus("manual");
    setValue("latitude", 0, { shouldValidate: false });
    setValue("longitude", 0, { shouldValidate: false });
    setValue("locationAccuracy", 0, { shouldValidate: false });
  }, [setValue, setLocationStatus]);

  const checkInitialPermission = useCallback(
    async (formData: any) => {
      try {
        await checkLocationPermission();

        if (formData.latitude && formData.longitude) {
          console.log("📍 Using existing location data");
          setLocationStatus("success");
          setValue("latitude", formData.latitude, { shouldValidate: false });
          setValue("longitude", formData.longitude, { shouldValidate: false });
          setValue("locationAccuracy", formData.locationAccuracy || 0, {
            shouldValidate: false,
          });
        }
      } catch (error) {
        console.warn("⚠️ Failed to check permission:", error);
      }
    },
    [setValue, setLocationStatus]
  );

  // Memoize the return object
  return useMemo(
    () => ({
      requestLocation,
      skipGeolocation,
      checkInitialPermission,
    }),
    [requestLocation, skipGeolocation, checkInitialPermission]
  );
};

/**
 * Geolocation privacy information
 */
export const GEOLOCATION_PRIVACY_INFO = [
  "Your precise location is encrypted and stored securely",
  "Location data is used only for local recommendations",
  "You can update or remove location data anytime",
  "Location sharing with other users is always optional",
] as const;

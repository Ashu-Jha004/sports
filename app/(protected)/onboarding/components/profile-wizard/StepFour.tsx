// onboarding/components/profile-wizard/StepFour.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { MapPinIcon } from "@heroicons/react/24/outline";

import { StepContainer } from "./components/forms/StepContainer";
import { ValidationStatus } from "./components/forms/ValidationStatus";
import { GeolocationRequest } from "./components/geolocation/GeolocationRequest";
import { ManualCoordinateEntry } from "./components/geolocation/ManualCoordinateEntry";
import { GeolocationPrivacy } from "./components/geolocation/GeolocationPrivacy";

import {
  useGeolocationValidation,
  useGeolocationHandlers,
  GEOLOCATION_PRIVACY_INFO,
} from "@/lib/utils/geolocation-form";
import { useSteps } from "@/store/profileWizardStore";
import type { GeolocationFormData } from "@/types/profile";

/**
 * =============================================================================
 * STEP FOUR - GEOLOCATION DETECTION
 * =============================================================================
 */

type LocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "error"
  | "denied"
  | "manual";

export const StepFour: React.FC = () => {
  const formData: any = useFormData();
  const storeErrors: any = useErrors();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();
  const addError = useAddError();
  const steps = useSteps();
  const currentStepInfo = steps.find((step) => step.id === 4);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Form setup
  const {
    control,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
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

  // Custom validation hook
  const { validateStep, hasValidLocation } = useGeolocationValidation({
    coordinates: {
      latitude: watchedValues.latitude,
      longitude: watchedValues.longitude,
      locationAccuracy: watchedValues.locationAccuracy,
    },
    setIsValidating,
    setStepValid,
    setStepCompleted,
    clearErrors,
    setFormData,
    trigger,
  });

  // Geolocation handlers hook
  const { requestLocation, skipGeolocation, checkInitialPermission } =
    useGeolocationHandlers({
      setValue,
      setLocationStatus,
      setLocationError,
      clearErrors,
      addError,
    });

  useEffect(() => {
    console.log("📊 Step 4 Status Debug:", {
      stepInfo: currentStepInfo,
      hasValidLocation,
      isValid: isValid,
      watchedValues,
      canGoNext: currentStepInfo?.isValid && hasValidLocation,
    });
  }, [currentStepInfo, hasValidLocation, isValid, watchedValues]);

  // Initial setup and validation
  useEffect(() => {
    checkInitialPermission(formData);
  }, [checkInitialPermission, formData]);

  // Form validation on changes
  useEffect(() => {
    console.log("🔄 StepFour validation check", {
      hasValidLocation,
      latitude: watchedValues.latitude,
      longitude: watchedValues.longitude,
      accuracy: watchedValues.locationAccuracy,
    });

    if (hasValidLocation) {
      console.log("✅ Valid location detected, running validation");
      validateStep();
    } else {
      console.log("⚠️ No valid location, marking step as incomplete");
      setStepValid(4, false);
      setStepCompleted(4, false);
    }
  }, [
    hasValidLocation,
    watchedValues.latitude,
    watchedValues.longitude,
    watchedValues.locationAccuracy,
    validateStep, // It's okay to include this now that we fixed the infinite loop
  ]);

  // Toggle manual entry
  const toggleManualEntry = useCallback(() => {
    setShowManualEntry(!showManualEntry);
    if (!showManualEntry) {
      setLocationStatus("manual");
    }
  }, [showManualEntry]);

  return (
    <StepContainer
      icon={<MapPinIcon className="w-8 h-8 text-purple-600" />}
      title="Precise location detection"
      description="We'll automatically detect your precise coordinates for better local recommendations"
    >
      <form noValidate>
        {/* Geolocation Request */}
        {(locationStatus === "idle" ||
          locationStatus === "requesting" ||
          locationStatus === "success" ||
          locationStatus === "error" ||
          locationStatus === "denied") &&
          !showManualEntry && (
            <GeolocationRequest
              status={locationStatus}
              error={locationError}
              coordinates={watchedValues}
              onRequestLocation={requestLocation}
              onToggleManualEntry={toggleManualEntry}
              onSkipGeolocation={skipGeolocation}
            />
          )}

        {/* Manual Entry Form */}
        {(showManualEntry || locationStatus === "manual") && (
          <ManualCoordinateEntry
            control={control}
            errors={errors}
            storeErrors={storeErrors}
            watchedValues={watchedValues}
            hasValidLocation={hasValidLocation}
          />
        )}

        {/* Validation Status */}
        <ValidationStatus
          isValidating={isValidating}
          isValid={isValid && hasValidLocation}
          isDirty={hasValidLocation}
          successMessage="Location coordinates are valid!"
        />
      </form>

      {/* Privacy Information */}
      <GeolocationPrivacy privacyInfo={GEOLOCATION_PRIVACY_INFO} />
    </StepContainer>
  );
};

export default StepFour;

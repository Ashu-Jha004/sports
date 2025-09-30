// onboarding/components/profile-wizard/StepOne.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFormData,
  useSetFormData,
  useSetStepValid,
  useSetStepCompleted,
  useClearErrors,
  useErrors,
} from "@/store/profileWizardStore";
import { locationSchema } from "@/lib/validations";
import { MapPinIcon } from "@heroicons/react/24/outline";

import { LocationFormField } from "./components/forms/LocationFormField";
import { CountryAutocomplete } from "./components/forms/CountryAutocomplete";
import { StepContainer } from "./components/forms/StepContainer";
import { ValidationStatus } from "./components/forms/ValidationStatus";

import {
  useFormValidation,
  sanitizeLocationInput,
  LOCATION_HELP_INFO,
} from "@/lib/utils/location-form";

import type { LocationFormData } from "@/types/profile";

/**
 * =============================================================================
 * STEP ONE - LOCATION INFORMATION
 * =============================================================================
 */

export const StepOne: React.FC = () => {
  const formData:any = useFormData();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();
  const storeErrors:any = useErrors();

  const [isValidating, setIsValidating] = useState(false);

  // Memoized default values to prevent re-renders
  const defaultValues = useMemo<LocationFormData>(
    () => ({
      city: formData.city || "",
      country: formData.country || "",
      state: formData.state || "",
    }),
    [formData.city, formData.country, formData.state]
  );

  // Form setup with validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    setValue,
    trigger,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedValues = watch();

  // Custom validation hook
  const { validateStep, updateFormData } = useFormValidation({
    stepNumber: 1,
    setIsValidating,
    setStepValid,
    setStepCompleted,
    clearErrors,
    setFormData,
    sanitizeInput: sanitizeLocationInput,
  });

  // Form change handler with debounced validation
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      validateStep(isValid, trigger);
      updateFormData(watchedValues);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    watchedValues.city,
    watchedValues.country,
    watchedValues.state,
    isDirty,
    isValid,
    validateStep,
    updateFormData,
    trigger,
  ]);

  return (
    <StepContainer
      icon={<MapPinIcon className="w-8 h-8 text-blue-600" />}
      title="Where are you located?"
      description="Help us customize your athletic experience by sharing your location"
    >
      <form className="space-y-6" noValidate>
        {/* City Field */}
        <LocationFormField
          label="City *"
          name="city"
          control={control}
          placeholder="Enter your city"
          error={errors.city}
          storeErrors={storeErrors}
          watchedValue={watchedValues.city}
          autoComplete="address-level2"
          maxLength={50}
        />

        {/* Country Field with Autocomplete */}
        <CountryAutocomplete
          label="Country *"
          name="country"
          control={control}
          setValue={setValue}
          error={errors.country}
          storeErrors={storeErrors}
          watchedValue={watchedValues.country}
        />

        {/* State Field */}
        <LocationFormField
          label="State/Province *"
          name="state"
          control={control}
          placeholder="Enter your state or province"
          error={errors.state}
          storeErrors={storeErrors}
          watchedValue={watchedValues.state}
          autoComplete="address-level1"
          maxLength={50}
        />

        {/* Validation Status */}
        <ValidationStatus
          isValidating={isValidating}
          isValid={isValid}
          isDirty={isDirty}
          successMessage="Location information is valid!"
        />
      </form>

      {/* Help Information */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Why do we need your location?
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {LOCATION_HELP_INFO.map((info, index) => (
            <li key={index}>• {info}</li>
          ))}
        </ul>
      </div>
    </StepContainer>
  );
};

export default StepOne;

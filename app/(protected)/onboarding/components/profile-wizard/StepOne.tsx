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
import { sanitizeInput, getFieldError } from "@/lib/validations";
import {
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface LocationFormData {
  city: string;
  country: string;
  state: string;
}

interface CountryOption {
  name: string;
  code: string;
}

// Popular countries list for autocomplete
const POPULAR_COUNTRIES: CountryOption[] = [
  { name: "United States", code: "US" },
  { name: "Canada", code: "CA" },
  { name: "United Kingdom", code: "GB" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "India", code: "IN" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Netherlands", code: "NL" },
];

export const StepOne: React.FC = () => {
  const formData = useFormData();
  const setFormData = useSetFormData();
  const setStepValid = useSetStepValid();
  const setStepCompleted = useSetStepCompleted();
  const clearErrors = useClearErrors();
  const storeErrors = useErrors();

  const [isValidating, setIsValidating] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // FIXED: Memoize default values to prevent infinite re-renders
  const defaultValues = useMemo(
    () => ({
      city: formData.city || "",
      country: formData.country || "",
      state: formData.state || "",
    }),
    [formData.city, formData.country, formData.state]
  );

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

  // FIXED: Memoize validation function to prevent infinite re-renders
  const validateStep = useCallback(async () => {
    if (isValidating) return;

    setIsValidating(true);
    try {
      const isFormValid = await trigger();
      setStepValid(1, isFormValid && isValid);
      setStepCompleted(1, isFormValid && isDirty);

      if (isFormValid) {
        clearErrors("city");
        clearErrors("country");
        clearErrors("state");
      }
    } finally {
      setIsValidating(false);
    }
  }, [
    trigger,
    isValid,
    isDirty,
    setStepValid,
    setStepCompleted,
    clearErrors,
    isValidating,
  ]);

  // FIXED: Memoize form data update to prevent infinite re-renders
  const updateFormData = useCallback(
    (values: LocationFormData) => {
      setFormData({
        city: sanitizeInput(values.city),
        country: sanitizeInput(values.country),
        state: sanitizeInput(values.state),
      });
    },
    [setFormData]
  );

  // FIXED: Use useEffect with proper dependencies to prevent infinite loops
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      validateStep();
      updateFormData(watchedValues);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    watchedValues.city,
    watchedValues.country,
    watchedValues.state,
    isDirty,
    validateStep,
    updateFormData,
  ]);

  // Filter countries based on search term
  const filteredCountries = useMemo(
    () =>
      POPULAR_COUNTRIES.filter((country) =>
        country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
      ),
    [countrySearchTerm]
  );

  const handleCountrySelect = useCallback(
    (country: CountryOption) => {
      setValue("country", country.name, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCountrySearchTerm(country.name);
      setShowCountryDropdown(false);
    },
    [setValue]
  );

  const handleCountryInputChange = useCallback(
    (value: string) => {
      setCountrySearchTerm(value);
      setValue("country", value, { shouldValidate: true, shouldDirty: true });
      setShowCountryDropdown(value.length > 0);
    },
    [setValue]
  );

  const getInputClasses = useCallback(
    (fieldName: keyof LocationFormData, hasError: boolean) => {
      const baseClasses =
        "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500";

      if (hasError) {
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
      }

      if (watchedValues[fieldName] && !hasError) {
        return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50`;
      }

      return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white`;
    },
    [watchedValues]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Where are you located?
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Help us customize your athletic experience by sharing your location
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" noValidate>
          {/* City Field */}
          <div className="space-y-2">
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700"
            >
              City *
            </label>
            <div className="relative">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="city"
                    placeholder="Enter your city"
                    className={getInputClasses("city", !!errors.city)}
                    autoComplete="address-level2"
                    maxLength={50}
                  />
                )}
              />
              {watchedValues.city && !errors.city && (
                <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.city && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.city.message}</span>
              </div>
            )}
            {getFieldError(storeErrors, "city") && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{getFieldError(storeErrors, "city")}</span>
              </div>
            )}
          </div>

          {/* Country Field */}
          <div className="space-y-2">
            <label
              htmlFor="country"
              className="block text-sm font-semibold text-gray-700"
            >
              Country *
            </label>
            <div className="relative">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="country"
                    placeholder="Enter or select your country"
                    className={getInputClasses("country", !!errors.country)}
                    autoComplete="country-name"
                    maxLength={50}
                    value={countrySearchTerm}
                    onChange={(e) => handleCountryInputChange(e.target.value)}
                    onFocus={() =>
                      setShowCountryDropdown(countrySearchTerm.length > 0)
                    }
                  />
                )}
              />
              {watchedValues.country && !errors.country && (
                <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}

              {/* Country Dropdown */}
              {showCountryDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="text-gray-900">{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.country && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.country.message}</span>
              </div>
            )}
            {getFieldError(storeErrors, "country") && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{getFieldError(storeErrors, "country")}</span>
              </div>
            )}
          </div>

          {/* State Field */}
          <div className="space-y-2">
            <label
              htmlFor="state"
              className="block text-sm font-semibold text-gray-700"
            >
              State/Province *
            </label>
            <div className="relative">
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="state"
                    placeholder="Enter your state or province"
                    className={getInputClasses("state", !!errors.state)}
                    autoComplete="address-level1"
                    maxLength={50}
                  />
                )}
              />
              {watchedValues.state && !errors.state && (
                <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.state && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{errors.state.message}</span>
              </div>
            )}
            {getFieldError(storeErrors, "state") && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{getFieldError(storeErrors, "state")}</span>
              </div>
            )}
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Validating...</span>
            </div>
          )}

          {/* Success Message */}
          {isValid && isDirty && !isValidating && (
            <div className="flex items-center justify-center py-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">
                Location information is valid!
              </span>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            Why do we need your location?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Find athletes and events near you</li>
            <li>• Customize content based on your region</li>
            <li>• Connect you with local sports communities</li>
            <li>• Show relevant weather and venue information</li>
          </ul>
        </div>
      </div>

      {/* Click outside handler */}
      {showCountryDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  );
};

export default StepOne;

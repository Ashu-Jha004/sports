// onboarding/components/profile-wizard/components/forms/CountryAutocomplete.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  FieldError,
} from "react-hook-form";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { POPULAR_COUNTRIES } from "@/lib/constants/index";
import { getFieldError } from "@/lib/validations";
import { getInputClasses } from "@/lib/utils/form-styles";
import type { LocationFormData } from "@/types/profile";
import type { ValidationError } from "@/types/profile";

interface CountryAutocompleteProps {
  readonly label: string;
  readonly name: keyof LocationFormData;
  readonly control: Control<LocationFormData>;
  readonly setValue: UseFormSetValue<LocationFormData>;
  readonly error?: FieldError;
  readonly storeErrors: ValidationError[];
  readonly watchedValue: string;
}

export const CountryAutocomplete: React.FC<CountryAutocompleteProps> = ({
  label,
  name,
  control,
  setValue,
  error,
  storeErrors,
  watchedValue,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const storeError = getFieldError(storeErrors, name);
  const hasError = !!error || !!storeError;
  const inputClasses = getInputClasses(hasError, watchedValue);

  // Filter countries based on search
  const filteredCountries = POPULAR_COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = useCallback(
    (country: any) => {
      setValue(name, country.name, { shouldValidate: true, shouldDirty: true });
      setSearchTerm(country.name);
      setShowDropdown(false);
    },
    [setValue, name]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setValue(name, value, { shouldValidate: true, shouldDirty: true });
      setShowDropdown(value.length > 0);
    },
    [setValue, name]
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id={name}
              placeholder="Enter or select your country"
              className={inputClasses}
              autoComplete="country-name"
              maxLength={50}
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowDropdown(searchTerm.length > 0)}
            />
          )}
        />

        {watchedValue && !hasError && (
          <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}

        {/* Dropdown */}
        {showDropdown && filteredCountries.length > 0 && (
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

      {/* Error Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}

      {storeError && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>{storeError}</span>
        </div>
      )}

      {/* Click outside handler */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

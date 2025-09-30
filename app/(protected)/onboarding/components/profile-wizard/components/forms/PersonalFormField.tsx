// onboarding/components/profile-wizard/components/forms/PersonalFormField.tsx
"use client";

import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getFieldError } from "@/lib/validations";
import { getInputClasses } from "@/lib/utils/form-styles";
import type { PersonalDetailsFormData, ValidationError } from "@/types/profile";

interface PersonalFormFieldProps {
  readonly label: string;
  readonly name: keyof PersonalDetailsFormData;
  readonly control: Control<PersonalDetailsFormData>;
  readonly placeholder: string;
  readonly error?: FieldError;
  readonly storeErrors: ValidationError[];
  readonly watchedValue: string;
  readonly autoComplete?: string;
  readonly maxLength?: number;
  readonly type?: "text" | "email" | "tel";
}

export const PersonalFormField: React.FC<PersonalFormFieldProps> = ({
  label,
  name,
  control,
  placeholder,
  error,
  storeErrors,
  watchedValue,
  autoComplete,
  maxLength = 150,
  type = "text",
}) => {
  const storeError = getFieldError(storeErrors, name);
  const hasError = !!error || !!storeError;
  const inputClasses = getInputClasses(hasError, watchedValue);

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
              type={type}
              id={name}
              placeholder={placeholder}
              className={inputClasses}
              autoComplete={autoComplete}
              maxLength={maxLength}
            />
          )}
        />

        {watchedValue && !hasError && (
          <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
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
    </div>
  );
};

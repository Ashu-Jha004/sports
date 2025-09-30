// onboarding/components/profile-wizard/components/forms/DateOfBirthField.tsx
"use client";

import React, { useMemo } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { calculateAge } from "@/lib/validations";
import { getInputClasses } from "@/lib/utils/form-styles";
import type { PersonalDetailsFormData } from "@/types/profile";

interface DateOfBirthFieldProps {
  readonly control: Control<PersonalDetailsFormData>;
  readonly error?: FieldError;
  readonly watchedValue: string;
}

export const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({
  control,
  error,
  watchedValue,
}) => {
  const inputClasses = getInputClasses(!!error, watchedValue);

  // Calculate user age
  const userAge = useMemo(() => {
    return watchedValue ? calculateAge(watchedValue) : null;
  }, [watchedValue]);

  // Get date limits
  const getMaxDate = () => {
    const today = new Date();
    const thirteenYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate()
    );
    return thirteenYearsAgo.toISOString().split("T")[0];
  };

  const getMinDate = () => {
    const today = new Date();
    const hundredYearsAgo = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );
    return hundredYearsAgo.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="dateOfBirth"
        className="block text-sm font-semibold text-gray-700"
      >
        Date of Birth *
      </label>

      <div className="relative">
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="date"
              id="dateOfBirth"
              min={getMinDate()}
              max={getMaxDate()}
              className={inputClasses}
              autoComplete="bday"
            />
          )}
        />

        {watchedValue && !error && (
          <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>

      {userAge !== null && (
        <p className="text-sm text-gray-600">Age: {userAge} years old</p>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

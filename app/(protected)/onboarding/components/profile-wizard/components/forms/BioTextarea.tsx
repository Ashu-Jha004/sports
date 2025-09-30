// onboarding/components/profile-wizard/components/forms/BioTextarea.tsx
"use client";

import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getInputClasses } from "@/lib/utils/form-styles";
import type { PersonalDetailsFormData } from "@/types/profile";

interface BioTextareaProps {
  readonly control: Control<PersonalDetailsFormData>;
  readonly error?: FieldError;
  readonly watchedValue: string;
  readonly maxLength?: number;
}

export const BioTextarea: React.FC<BioTextareaProps> = ({
  control,
  error,
  watchedValue,
  maxLength = 500,
}) => {
  const inputClasses = getInputClasses(!!error, watchedValue);

  return (
    <div className="space-y-2">
      <label
        htmlFor="bio"
        className="block text-sm font-semibold text-gray-700"
      >
        Bio *
      </label>

      <div className="relative">
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="bio"
              rows={4}
              placeholder="Tell us about yourself, your athletic interests, goals, and what motivates you..."
              className={inputClasses}
              maxLength={maxLength}
            />
          )}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {watchedValue?.length || 0}/{maxLength}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

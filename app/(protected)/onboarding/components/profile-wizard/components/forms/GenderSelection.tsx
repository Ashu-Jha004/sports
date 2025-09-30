// onboarding/components/profile-wizard/components/forms/GenderSelection.tsx
"use client";

import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { GENDER_OPTIONS } from "@/lib/constants";
import type { PersonalDetailsFormData } from "@/types/profile";

interface GenderSelectionProps {
  readonly control: Control<PersonalDetailsFormData>;
  readonly error?: FieldError;
  readonly watchedValue: "MALE" | "FEMALE";
}

export const GenderSelection: React.FC<GenderSelectionProps> = ({
  control,
  error,
  watchedValue,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      Gender *
    </label>

    <Controller
      name="gender"
      control={control}
      render={({ field }) => (
        <div className="grid grid-cols-2 gap-3">
          {GENDER_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                field.value === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                {...field}
                value={option.value}
                checked={field.value === option.value}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
              {field.value === option.value && (
                <CheckCircleIcon className="absolute right-2 w-4 h-4 text-blue-600" />
              )}
            </label>
          ))}
        </div>
      )}
    />

    {error && (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>{error.message}</span>
      </div>
    )}
  </div>
);

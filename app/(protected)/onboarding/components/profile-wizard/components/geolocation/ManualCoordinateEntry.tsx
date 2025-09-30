// onboarding/components/profile-wizard/components/geolocation/ManualCoordinateEntry.tsx
"use client";

import React, { useEffect } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { formatCoordinates } from "@/lib/geolocation";
import { getInputClasses } from "@/lib/utils/form-styles";
import type { GeolocationFormData, ValidationError } from "@/types/profile";

interface ManualCoordinateEntryProps {
  readonly control: Control<GeolocationFormData>;
  readonly errors: FieldErrors<GeolocationFormData>;
  readonly storeErrors: ValidationError[];
  readonly watchedValues: GeolocationFormData;
  readonly hasValidLocation: boolean;
}

export const ManualCoordinateEntry: React.FC<ManualCoordinateEntryProps> = ({
  control,
  errors,
  storeErrors,
  watchedValues,
  hasValidLocation,
}) => {
  const getFieldError = (field: string) => {
    return storeErrors.find((err) => err.field === field)?.message;
  };

  useEffect(() => {
    console.log("📝 Manual entry values:", {
      latitude: watchedValues.latitude,
      longitude: watchedValues.longitude,
      hasValidLocation,
    });
  }, [watchedValues, hasValidLocation]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enter coordinates manually
        </h3>
        <p className="text-gray-600 text-sm">
          You can find your coordinates using Google Maps or other mapping
          services
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
              step="any"
              min={-90}
              max={90}
              placeholder="e.g., 37.7749"
              className={getInputClasses(
                !!errors.latitude,
                field.value?.toString()
              )}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                console.log("📍 Latitude changed:", value);
                field.onChange(value);
              }}
            />
          )}
        />
        {errors.latitude && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>{errors.latitude.message}</span>
          </div>
        )}
        {getFieldError("latitude") && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>{getFieldError("latitude")}</span>
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
              step="any"
              min={-180}
              max={180}
              placeholder="e.g., -122.4194"
              className={getInputClasses(
                !!errors.longitude,
                field.value?.toString()
              )}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                console.log("📍 Longitude changed:", value);
                field.onChange(value);
              }}
            />
          )}
        />
        {errors.longitude && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>{errors.longitude.message}</span>
          </div>
        )}
        {getFieldError("longitude") && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>{getFieldError("longitude")}</span>
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
              className={getInputClasses(
                !!errors.locationAccuracy,
                field.value?.toString()
              )}
              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
              watchedValues.latitude!,
              watchedValues.longitude!
            )}
          </p>
        </div>
      )}
    </div>
  );
};

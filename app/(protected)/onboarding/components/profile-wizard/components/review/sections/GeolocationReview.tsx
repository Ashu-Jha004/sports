// onboarding/components/profile-wizard/components/review/sections/GeolocationReview.tsx
"use client";

import React from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { ReviewSection } from "../ReviewSection";
import { formatProfileDisplay } from "@/lib/utils/profile-review";
import type { ProfileFormData } from "@/types/profile";

interface GeolocationReviewProps {
  readonly formData: ProfileFormData;
  readonly isValid: boolean;
  readonly onEdit: () => void;
}

export const GeolocationReview: React.FC<GeolocationReviewProps> = ({
  formData,
  isValid,
  onEdit,
}) => (
  <ReviewSection
    title="Location Coordinates"
    icon={<GlobeAltIcon className="w-5 h-5 text-purple-600" />}
    stepNumber={4}
    isValid={isValid}
    onEdit={onEdit}
  >
    <div className="text-sm">
      {formData.latitude && formData.longitude ? (
        <div className="space-y-2">
          <div>
            <span className="font-medium">Coordinates:</span>
            <p>
              {formatProfileDisplay.coordinates(
                formData.latitude,
                formData.longitude
              )}
            </p>
          </div>
          {formData.locationAccuracy && formData.locationAccuracy > 0 && (
            <div>
              <span className="font-medium">Accuracy:</span>
              <p>±{Math.round(formData.locationAccuracy)}m</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">
          Location coordinates not provided (optional)
        </p>
      )}
    </div>
  </ReviewSection>
);

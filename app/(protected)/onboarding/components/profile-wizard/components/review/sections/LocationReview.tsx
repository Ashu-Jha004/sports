// onboarding/components/profile-wizard/components/review/sections/LocationReview.tsx
"use client";

import React from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { ReviewSection } from "../ReviewSection";
import type { ProfileFormData } from "@/types/profile";

interface LocationReviewProps {
  readonly formData: ProfileFormData;
  readonly isValid: boolean;
  readonly onEdit: () => void;
}

export const LocationReview: React.FC<LocationReviewProps> = ({
  formData,
  isValid,
  onEdit,
}) => (
  <ReviewSection
    title="Location Information"
    icon={<MapPinIcon className="w-5 h-5 text-blue-600" />}
    stepNumber={1}
    isValid={isValid}
    onEdit={onEdit}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <span className="font-medium">City:</span>
        <p>{formData.city || "Not provided"}</p>
      </div>
      <div>
        <span className="font-medium">Country:</span>
        <p>{formData.country || "Not provided"}</p>
      </div>
      <div>
        <span className="font-medium">State:</span>
        <p>{formData.state || "Not provided"}</p>
      </div>
    </div>
  </ReviewSection>
);

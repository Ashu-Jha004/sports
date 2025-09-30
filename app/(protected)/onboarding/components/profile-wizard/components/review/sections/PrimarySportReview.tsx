// onboarding/components/profile-wizard/components/review/sections/PrimarySportReview.tsx
"use client";

import React from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { ReviewSection } from "../ReviewSection";
import { getSportIcon } from "@/lib/utils/profile-review";
import type { ProfileFormData } from "@/types/profile";

interface PrimarySportReviewProps {
  readonly formData: ProfileFormData;
  readonly isValid: boolean;
  readonly onEdit: () => void;
}

export const PrimarySportReview: React.FC<PrimarySportReviewProps> = ({
  formData,
  isValid,
  onEdit,
}) => (
  <ReviewSection
    title="Primary Sport"
    icon={<TrophyIcon className="w-5 h-5 text-yellow-600" />}
    stepNumber={3}
    isValid={isValid}
    onEdit={onEdit}
  >
    <div className="flex items-center space-x-3">
      <span className="text-2xl">
        {formData.primarySport ? getSportIcon(formData.primarySport) : "🏆"}
      </span>
      <div>
        <p className="font-medium">{formData.primarySport || "Not selected"}</p>
        {formData.primarySport && (
          <p className="text-sm opacity-75">Your primary athletic focus</p>
        )}
      </div>
    </div>
  </ReviewSection>
);

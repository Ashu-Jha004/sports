// onboarding/components/profile-wizard/components/review/ProfileReviewSections.tsx
"use client";

import React from "react";
import { LocationReview } from "./sections/LocationReview";
import { PersonalDetailsReview } from "./sections/PersonalDetailsReview";
import { PrimarySportReview } from "./sections/PrimarySportReview";
import { GeolocationReview } from "./sections/GeolocationReview";
import type { ProfileFormData, WizardStep } from "@/types/profile";

interface ProfileReviewSectionsProps {
  readonly formData: ProfileFormData;
  readonly steps: readonly WizardStep[];
  readonly userAge: number | null;
  readonly onEditStep: (step: number) => void;
}

export const ProfileReviewSections: React.FC<ProfileReviewSectionsProps> = ({
  formData,
  steps,
  userAge,
  onEditStep,
}) => (
  <div className="space-y-6">
    {/* Location Information */}
    <LocationReview
      formData={formData}
      isValid={steps[0]?.isValid || false}
      onEdit={() => onEditStep(1)}
    />

    {/* Personal Details */}
    <PersonalDetailsReview
      formData={formData}
      userAge={userAge}
      isValid={steps[1]?.isValid || false}
      onEdit={() => onEditStep(2)}
    />

    {/* Primary Sport */}
    <PrimarySportReview
      formData={formData}
      isValid={steps[2]?.isValid || false}
      onEdit={() => onEditStep(3)}
    />

    {/* Geolocation */}
    <GeolocationReview
      formData={formData}
      isValid={steps[3]?.isValid || false}
      onEdit={() => onEditStep(4)}
    />
  </div>
);

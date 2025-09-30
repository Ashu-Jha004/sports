// onboarding/components/profile-wizard/components/review/sections/PersonalDetailsReview.tsx
"use client";

import React from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ReviewSection } from "../ReviewSection";
import { formatProfileDisplay } from "@/lib/utils/profile-review";
import type { ProfileFormData } from "@/types/profile";

interface PersonalDetailsReviewProps {
  readonly formData: ProfileFormData;
  readonly userAge: number | null;
  readonly isValid: boolean;
  readonly onEdit: () => void;
}

export const PersonalDetailsReview: React.FC<PersonalDetailsReviewProps> = ({
  formData,
  userAge,
  isValid,
  onEdit,
}) => (
  <ReviewSection
    title="Personal Details"
    icon={<UserCircleIcon className="w-5 h-5 text-green-600" />}
    stepNumber={2}
    isValid={isValid}
    onEdit={onEdit}
  >
    <div className="space-y-4">
      {/* Profile Image */}
      {(formData.imageUrl || formData.imageFile) && (
        <div className="flex items-center space-x-3">
          <img
            src={
              formData.imageUrl ||
              (formData.imageFile
                ? URL.createObjectURL(formData.imageFile)
                : "")
            }
            alt="Profile"
            className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div>
            <span className="text-sm font-medium">Profile image uploaded</span>
            {formData.imageUploadState === "success" && (
              <p className="text-xs text-green-600">✓ Stored in cloud</p>
            )}
          </div>
        </div>
      )}

      {/* Names and Username */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium">Username:</span>
          <p>{formData.username || "Not provided"}</p>
        </div>
        <div>
          <span className="font-medium">First Name:</span>
          <p>{formData.firstName || "Not provided"}</p>
        </div>
        <div>
          <span className="font-medium">Last Name:</span>
          <p>{formData.lastName || "Not provided"}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Date of Birth:</span>
          <p>
            {formData.dateOfBirth
              ? formatProfileDisplay.dateOfBirth(formData.dateOfBirth, userAge)
              : "Not provided"}
          </p>
        </div>
        <div>
          <span className="font-medium">Gender:</span>
          <p>
            {formData.gender
              ? formatProfileDisplay.gender(formData.gender)
              : "Not specified"}
          </p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <span className="font-medium">Bio:</span>
        <div className="mt-1 text-sm bg-white p-3 rounded border max-h-24 overflow-y-auto">
          {formData.bio || "No bio provided"}
        </div>
      </div>
    </div>
  </ReviewSection>
);

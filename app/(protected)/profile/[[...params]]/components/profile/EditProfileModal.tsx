"use client";

import React, { useEffect, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ProfileWizard from "../../../../../(protected)/onboarding/components/profile-wizard/ProfileWizard";
import { useProfileWizardStore } from "@/store/profileWizardStore";

interface ProfileData {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  primarySport: string | null;
  rank: string | null;
  class: string | null;
  role: string;
  city: string | null;
  state: string | null;
  country: string | null;
  location: {
    lat: number |0;
    lon: number | 0;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  isOwnProfile: boolean;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData: any) => void;
  currentData: ProfileData;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentData,
}) => {
  const { setFormData, resetWizard } = useProfileWizardStore();

  // Pre-populate wizard with current data when modal opens
  useEffect(() => {
    if (isOpen && currentData) {
      console.log("🔄 Pre-populating ProfileWizard with current data");

      // Reset wizard first to ensure clean state
      resetWizard();

      // Set form data with current profile information
      setFormData({
        // Location data
        city: currentData.city || "",
        country: currentData.country || "",
        state: currentData.state || "",

        // Personal details
        dateOfBirth: currentData.dateOfBirth
          ? new Date(currentData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: (currentData.gender?.toLowerCase() as "MALE" | "FEMALE") || "",
        bio: currentData.bio || "",

        // Image data - prioritize profileImageUrl over avatarUrl
        imageUrl: currentData.avatarUrl || "no image",
        imageUploadState: currentData.avatarUrl ? "success" : "idle",

        // Sport information
        primarySport: currentData.primarySport || "",

        // Geolocation data
        latitude: currentData.location?.lat || 0,
        longitude: currentData.location?.lon || 0,
        locationAccuracy: 0, // We don't store this in the profile

        // Submission state
        isSubmitting: false,
      });

      console.log("✅ ProfileWizard pre-populated with current data");
    }
  }, [isOpen, currentData, setFormData, resetWizard]);

  // Handle wizard completion
  const handleWizardComplete = useCallback(
    (profileData: any) => {
      console.log("🎉 Profile update completed:", profileData);

      // Reset the wizard
      resetWizard();

      // Call success callback with updated data
      onSuccess(profileData);
    },
    [onSuccess, resetWizard]
  );

  // Handle modal close
  const handleClose = useCallback(() => {
    console.log("❌ Closing edit profile modal");

    // Reset the wizard to clean up state
    resetWizard();

    // Close the modal
    onClose();
  }, [onClose, resetWizard]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl transform transition-all">
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Edit Your Profile
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Update your athletic profile information
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - ProfileWizard */}
            <div className="max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">ℹ️</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800 mb-1">
                        Editing Your Profile
                      </h3>
                      <p className="text-sm text-blue-700">
                        Your current information has been pre-filled. Navigate
                        through the steps to update any section. Changes will be
                        saved when you complete the wizard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ProfileWizard Component */}
                <ProfileWizard
                  onComplete={handleWizardComplete}
                  onCancel={handleClose}
                  className=""
                  showHeader={false} // Hide header since we have our own modal header
                  allowStepSkipping={true} // Allow jumping between steps when editing
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

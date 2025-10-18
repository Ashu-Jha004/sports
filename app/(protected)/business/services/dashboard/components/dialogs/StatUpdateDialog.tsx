import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useOTPVerificationStore } from "../../../../stores/otpVerificationStore";
import { OTPVerificationForm } from "./OTPVerificationForm";
import { UserDetailsDisplay } from "./UserDetailsDisplay";
import { NavigationButton } from "./NavigationButton";
import {
  StatUpdateDialogProps,
  VerifiedUser,
} from "../../../../types/otpVerification";

export const StatUpdateDialog: React.FC<StatUpdateDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentVerifiedUser,
    isLoading,
    error,
    clearError,
    clearCurrentUser,
  } = useOTPVerificationStore();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      console.log("🔒 Closing dialog and clearing state");
      clearCurrentUser();
      clearError();
      onClose();
    }
  };

  const handleVerificationSuccess = (user: VerifiedUser) => {
    console.log("✅ Verification successful, user details loaded:", user);
    // User is already set in store by verifyOTP action
    // No additional action needed here
  };

  const handleNavigate = () => {
    console.log("🚀 Navigating to stats page, closing dialog");
    handleOpenChange(false); // Auto-close on navigation
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Stats Update Verification
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Enter the 6-digit OTP from your accepted evaluation request to
            verify and update athlete stats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: OTP Verification Form */}
          <OTPVerificationForm
            onVerificationSuccess={handleVerificationSuccess}
            isLoading={isLoading}
            error={error}
            onClearError={clearError}
          />

          {/* Step 2: User Details Display (shown after verification) */}
          {currentVerifiedUser && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Verified Athlete Details
                </h3>
                <UserDetailsDisplay
                  user={currentVerifiedUser}
                  className="mb-6"
                />
              </div>

              {/* Step 3: Navigation Button */}
              <div className="border-t pt-6">
                <NavigationButton
                  userId={currentVerifiedUser.id}
                  onNavigate={handleNavigate}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

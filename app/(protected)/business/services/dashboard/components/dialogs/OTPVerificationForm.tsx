// File: `components/dialogs/components/OTPVerificationForm.tsx`
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { useOTPVerificationStore } from "../../../../stores/otpVerificationStore";
import { OTPVerificationFormProps } from "../../../../types/otpVerification";

export const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  onVerificationSuccess,
  isLoading,
  error,
  onClearError,
}) => {
  const [otpInput, setOtpInput] = useState("");
  const { verifyOTP } = useOTPVerificationStore();

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only digits, max 6
    setOtpInput(value);
    if (error.type) {
      onClearError(); // Clear error when user starts typing
    }
  };

  // Replace the handleVerify function (around line 45-55):

  const handleVerify = async () => {
    if (otpInput.length !== 6) {
      return;
    }

    const otp = parseInt(otpInput);
    console.log("🔍 Starting OTP verification for:", otp);

    const success = await verifyOTP(otp);
    console.log("🎯 OTP verification result:", success);

    if (success) {
      // ✅ FIX: Check store state immediately after verification
      const storeState = useOTPVerificationStore.getState();
      console.log("🔍 Store state after verification:", {
        hasCurrentUser: !!storeState.currentVerifiedUser,
        userName: storeState.currentVerifiedUser?.firstName,
        cacheKeys: Object.keys(storeState.verifiedUsersCache),
      });

      if (storeState.currentVerifiedUser) {
        console.log(
          "✅ Calling onVerificationSuccess with user:",
          storeState.currentVerifiedUser.firstName
        );
        onVerificationSuccess(storeState.currentVerifiedUser);
      } else {
        console.error(
          "❌ Store has no currentVerifiedUser after successful verification"
        );
      }
    }
  };

  const isValidOTP = otpInput.length === 6;
  const showError = error.type !== null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
          Enter 6-digit OTP
        </Label>
        <div className="relative">
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otpInput}
            onChange={handleOTPChange}
            className={`text-center text-lg font-mono tracking-widest ${
              showError
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            disabled={isLoading}
            maxLength={6}
          />
          <Shield className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Error Display */}
      {showError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Verification Failed</p>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={!isValidOTP || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>
    </div>
  );
};

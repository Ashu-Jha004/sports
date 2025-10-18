import React from "react";
import { useOTPVerificationStore } from "@/app/(protected)/business/stores/otpVerificationStore";

export const OTPStoreDebug: React.FC = () => {
  const { currentVerifiedUser, verifiedUsersCache, isLoading } =
    useOTPVerificationStore();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <h4 className="font-bold text-yellow-400">OTP Store Debug:</h4>
      <p>Loading: {isLoading ? "Yes" : "No"}</p>
      <p>Current User: {currentVerifiedUser?.firstName || "None"}</p>
      <p>Cache Keys: {Object.keys(verifiedUsersCache).join(", ") || "Empty"}</p>
      <p>
        Verified At:{" "}
        {currentVerifiedUser?.verifiedAt
          ? new Date(currentVerifiedUser.verifiedAt).toLocaleTimeString()
          : "N/A"}
      </p>
    </div>
  );
};

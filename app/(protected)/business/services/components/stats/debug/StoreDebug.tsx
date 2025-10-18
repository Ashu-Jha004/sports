import React from "react";
import { useOTPVerificationStore } from "@/app/(protected)/business/stores/otpVerificationStore";
import { useStatsWizardStore } from "@/store/statsWizardStore";

export const StoreDebug: React.FC = () => {
  const { currentVerifiedUser } = useOTPVerificationStore();
  const { athlete } = useStatsWizardStore();

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded text-xs max-w-sm">
      <h4 className="font-bold">Store Debug:</h4>
      <p>OTP User: {currentVerifiedUser?.firstName || "None"}</p>
      <p>Wizard User: {athlete?.firstName || "None"}</p>
      <p>URL: {window.location.pathname}</p>
    </div>
  );
};

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOTPVerificationStore } from "@/app/(protected)/business/stores/otpVerificationStore";
import { NavigationButtonProps } from "@/app/(protected)/business/types/otpVerification";

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  userId,
  onNavigate,
  disabled = false,
  className = "",
}) => {
  const router = useRouter();
  const { currentVerifiedUser } = useOTPVerificationStore();

  const handleClick = () => {
    console.log(
      "🎯 Navigating to stats update for verified user:",
      currentVerifiedUser?.firstName
    );

    if (!currentVerifiedUser) {
      console.error("❌ No verified user found when navigating");
      return;
    }

    // ✅ FIX: Ensure user data is definitely in store before navigating
    console.log("✅ Verified user data confirmed:", {
      id: currentVerifiedUser.id,
      firstName: currentVerifiedUser.firstName,
      verifiedAt: currentVerifiedUser.verifiedAt,
    });

    onNavigate();

    // Small delay to ensure store is updated
    setTimeout(() => {
      router.push("/business/services/stats");
    }, 100);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !currentVerifiedUser}
      className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
    >
      <TrendingUp className="w-4 h-4 mr-2" />
      Update Athlete Stats
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
};

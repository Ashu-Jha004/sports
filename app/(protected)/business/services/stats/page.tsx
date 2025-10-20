"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatsWizardContainer } from "../components/stats/StatsWizardContainer";
import { AthleteHeader } from "../components/stats/AthleteHeader";
import { CircularProgress } from "../components/stats/CircularProgress";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { useOTPVerificationStore } from "../../stores/otpVerificationStore";
// ✅ ADD: Import new type definitions
import type { StatsResponse, AthleteInfo } from "@/types/stats";

import {
  AlertCircle,
  Loader2,
  BarChart3,
  ArrowLeft,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { VerifiedUser } from "../../stores/otpVerificationStore";

export default function StatsUpdatePage() {
  const router = useRouter();
  const {
    currentVerifiedUser,
    verifiedUsersCache,
    isLoading: otpLoading,
  } = useOTPVerificationStore();
  const { initializeWizard, athlete, existingStats } = useStatsWizardStore();

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const {
    currentStep,
    totalSteps,
    completedSteps,
    progressPercentage,
    goToStep,
  } = useWizardNavigation();

  // ✅ Wait for store hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setStoreHydrated(true);
    }, 200); // Give store time to hydrate

    return () => clearTimeout(timer);
  }, []);

  // ✅ Main initialization logic
  useEffect(() => {
    const initializeFromOTP = async () => {
      if (!storeHydrated) return;

      try {
        // Debug information
        const debug = {
          currentVerifiedUser: currentVerifiedUser?.firstName || null,
          cacheKeys: Object.keys(verifiedUsersCache),
          cacheCount: Object.keys(verifiedUsersCache).length,
          localStorage: null,
          wizardAthlete: athlete?.firstName || null,
          timestamp: new Date().toLocaleTimeString(),
        };

        // Check localStorage directly
        try {
          const stored = localStorage.getItem("otp-verification-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
          }
        } catch (e) {
          console.log(e);
        }

        setDebugInfo(debug);
        console.log("🔍 Stats Page Debug Info:", debug);

        // ✅ Try multiple sources for verified user
        let verifiedUser: VerifiedUser | null = null;

        // Source 1: Current verified user from store
        if (currentVerifiedUser) {
          verifiedUser = currentVerifiedUser;
          console.log(
            "✅ Source 1: Using current verified user:",
            verifiedUser.firstName
          );
        }

        // Source 2: Try from wizard store (if already initialized)
        if (!verifiedUser && athlete) {
          verifiedUser = athlete;
          console.log(
            "✅ Source 2: Using wizard athlete:",
            verifiedUser.firstName
          );
        }

        // Source 3: Try from cache (most recent verification)
        if (!verifiedUser && Object.keys(verifiedUsersCache).length > 0) {
          const latestOtp: any = Object.keys(verifiedUsersCache).sort().pop();
          if (latestOtp && verifiedUsersCache[latestOtp]) {
            verifiedUser = verifiedUsersCache[latestOtp];
            console.log("✅ Source 3: Using cached user:", verifiedUser);
          }
        }

        // Source 4: Try from localStorage directly
        if (!verifiedUser) {
          try {
            const stored = localStorage.getItem("otp-verification-storage");
            if (stored) {
              const parsed = JSON.parse(stored);
              const storedUser = parsed.state?.currentVerifiedUser;
              if (storedUser) {
                verifiedUser = storedUser;
                console.log(
                  "✅ Source 4: Using localStorage user:",
                  verifiedUser
                );
              }

              // Try cache from localStorage
              if (!verifiedUser && parsed.state?.verifiedUsersCache) {
                const cacheKeys = Object.keys(parsed.state.verifiedUsersCache);
                if (cacheKeys.length > 0) {
                  const latestKey = cacheKeys.sort().pop();
                  if (latestKey) {
                    verifiedUser = parsed.state.verifiedUsersCache[latestKey];
                    console.log(
                      "✅ Source 4b: Using localStorage cache:",
                      verifiedUser?.firstName
                    );
                  }
                }
              }
            }
          } catch (e) {
            console.log("❌ Error parsing localStorage:", e);
          }
        }

        if (!verifiedUser) {
          console.log("❌ Stats Page: No verified user found from any source");
          setError(
            "OTP verification not found. Please complete OTP verification first."
          );
          setIsInitializing(false);
          return;
        }

        console.log(
          "✅ Stats Page: Initializing with verified user:",
          verifiedUser.firstName
        );

        // Initialize wizard with verified user
        await initializeWizard(verifiedUser);

        setIsInitializing(false);
        setError(null);
      } catch (err) {
        console.error("❌ Stats Page Error:", err);
        setError(
          "Failed to initialize stats wizard: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
        setIsInitializing(false);
      }
    };

    initializeFromOTP();
  }, [
    storeHydrated,
    currentVerifiedUser,
    verifiedUsersCache,
    athlete,
    initializeWizard,
  ]);

  // ✅ Auto-redirect logic with countdown
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (
      !isInitializing &&
      !currentVerifiedUser &&
      !athlete &&
      storeHydrated &&
      error
    ) {
      console.log("🔒 Stats Page: Starting redirect countdown");
      setRedirectCountdown(5);

      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            router.push("/business/services/dashboard");
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isInitializing,
    currentVerifiedUser,
    athlete,
    error,
    router,
    storeHydrated,
  ]);

  // ✅ Manual retry function
  const handleRetry = () => {
    setIsInitializing(true);
    setError(null);
    setRedirectCountdown(null);

    // Force re-check after small delay
    setTimeout(() => {
      setStoreHydrated(false);
      setTimeout(() => setStoreHydrated(true), 100);
    }, 100);
  };

  // Loading State
  if (isInitializing || !storeHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Initializing Stats Wizard
          </h2>
          <p className="text-gray-600 mb-4">
            {!storeHydrated
              ? "Loading verification data..."
              : "Checking verification status..."}
          </p>

          {/* Debug Information */}
          <Card className="mt-4 bg-gray-100">
            <CardContent className="pt-4">
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Store Status:</strong>{" "}
                  {storeHydrated ? "Hydrated" : "Loading"}
                </p>
                <p>
                  <strong>Current User:</strong>{" "}
                  {debugInfo.currentVerifiedUser || "None"}
                </p>
                <p>
                  <strong>Cache Count:</strong> {debugInfo.cacheCount || 0}
                </p>
                <p>
                  <strong>Wizard Athlete:</strong>{" "}
                  {debugInfo.wizardAthlete || "None"}
                </p>
                <p>
                  <strong>Last Check:</strong> {debugInfo.timestamp || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Error/No Verification State
  if (error || (!currentVerifiedUser && !athlete)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Verification Required</span>
              <br />
              {error ||
                "OTP verification not found. Please complete OTP verification first."}
            </AlertDescription>
          </Alert>

          {/* Debug Information */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Debug Information
              </h4>
              <div className="text-xs text-gray-600 space-y-1 text-left">
                <p>
                  <strong>Current User:</strong>{" "}
                  {debugInfo.currentVerifiedUser || "None"}
                </p>
                <p>
                  <strong>Cache Keys:</strong>{" "}
                  {debugInfo.cacheKeys?.join(", ") || "None"}
                </p>
                <p>
                  <strong>Wizard Athlete:</strong>{" "}
                  {debugInfo.wizardAthlete || "None"}
                </p>
                <p>
                  <strong>LocalStorage:</strong>{" "}
                  {JSON.stringify(debugInfo.localStorage)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {redirectCountdown && (
              <p className="text-sm text-gray-600">
                Redirecting to dashboard in {redirectCountdown} second
                {redirectCountdown !== 1 ? "s" : ""}...
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>

              <Button asChild variant="default" className="flex-1">
                <Link href="/business/services/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Success: Show stats wizard
  const activeUser = currentVerifiedUser || athlete!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/business/services/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-500">
              Verified Session • Stats Update for {activeUser.firstName}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Athlete Header */}
          <AthleteHeader
            athlete={activeUser}
            className="mb-6"
            showStatsInfo={!!existingStats} // ✅ ADD: Show stats info if exists
            lastUpdatedBy={existingStats?.lastUpdatedBy} // ✅ ADD: Pass stats metadata
            lastUpdatedAt={existingStats?.lastUpdatedAt} // ✅ ADD: Pass stats metadata
            lastUpdatedByName={existingStats?.lastUpdatedByName}
          />
          {existingStats && !isInitializing && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Current Stats Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Basic Metrics */}
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-700 mb-2">Physical</h4>
                  <div className="text-sm space-y-1">
                    {existingStats.height && (
                      <p>Height: {existingStats.height} cm</p>
                    )}
                    {existingStats.weight && (
                      <p>Weight: {existingStats.weight} kg</p>
                    )}
                    {existingStats.age && <p>Age: {existingStats.age} years</p>}
                  </div>
                </div>

                {/* Strength */}
                {existingStats.currentStrength && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-700 mb-2">Strength</h4>
                    <div className="text-sm space-y-1">
                      <p>Overall: {existingStats.currentStrength.strength}</p>
                      <p>
                        Power: {existingStats.currentStrength.explosivePower}
                      </p>
                    </div>
                  </div>
                )}

                {/* Speed */}
                {existingStats.currentSpeed && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-gray-700 mb-2">Speed</h4>
                    <div className="text-sm space-y-1">
                      <p>Sprint: {existingStats.currentSpeed.sprintSpeed}</p>
                      <p>Agility: {existingStats.currentSpeed.agility}</p>
                    </div>
                  </div>
                )}

                {/* History Count */}
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-gray-700 mb-2">Records</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      Assessments: {existingStats.strengthHistory?.length || 0}
                    </p>
                    <p>
                      Active Injuries:{" "}
                      {existingStats.activeInjuries?.length || 0}
                    </p>
                    {existingStats.lastUpdatedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Updated:{" "}
                        {new Date(
                          existingStats.lastUpdatedAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <CircularProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  completedSteps={completedSteps}
                  onStepClick={goToStep}
                  className="bg-white rounded-lg shadow-sm border p-6"
                />

                {/* Verification Status */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Verified Session
                      </span>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>User: {activeUser.firstName}</p>
                      <p>
                        Verified:{" "}
                        {new Date(activeUser.verifiedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Wizard Content */}
            <div className="lg:col-span-3">
              <StatsWizardContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

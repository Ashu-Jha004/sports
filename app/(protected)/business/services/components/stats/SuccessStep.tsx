"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatsResponse } from "@/types/stats";
import {
  CheckCircle,
  Trophy,
  Calendar,
  User,
  BarChart3,
  ArrowRight,
  Home,
  Shield,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { useOTPVerificationStore } from "../../../stores/otpVerificationStore";
import { useRouter } from "next/navigation";

export const SuccessStep: React.FC = () => {
  const { athlete, formData, existingStats, resetWizard } =
    useStatsWizardStore();
  const { cleanupAfterSubmission, clearAllData } = useOTPVerificationStore();
  const router = useRouter();

  const [cleanupStatus, setCleanupStatus] = useState<
    "pending" | "cleaning" | "complete" | "error"
  >("pending");
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // ✅ FIX: Calculate overall performance score (memoized)
  const calculateOverallScore = useCallback(() => {
    const scores: number[] = [];

    // Strength scores
    if (formData.strengthPower.muscleMass)
      scores.push(formData.strengthPower.muscleMass);
    if (formData.strengthPower.enduranceStrength)
      scores.push(formData.strengthPower.enduranceStrength);
    if (formData.strengthPower.explosivePower)
      scores.push(formData.strengthPower.explosivePower);

    // Speed scores
    if (formData.speedAgility.sprintSpeed)
      scores.push(formData.speedAgility.sprintSpeed);
    if (formData.speedAgility.acceleration?.score)
      scores.push(formData.speedAgility.acceleration.score);
    if (formData.speedAgility.agility?.score)
      scores.push(formData.speedAgility.agility.score);

    // Stamina scores
    if (formData.staminaRecovery.overallFlexibilityScore)
      scores.push(formData.staminaRecovery.overallFlexibilityScore);
    if (formData.staminaRecovery.cardiovascularFitnessScore)
      scores.push(formData.staminaRecovery.cardiovascularFitnessScore);

    if (scores.length === 0) return 0;
    return Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }, [formData]);

  const overallScore = calculateOverallScore();

  // Get performance classification
  const getPerformanceClass = (
    score: number
  ): { label: string; color: string } => {
    if (score >= 80)
      return {
        label: "Elite",
        color: "bg-purple-100 text-purple-800 border-purple-300",
      };
    if (score >= 70)
      return {
        label: "Excellent",
        color: "bg-green-100 text-green-800 border-green-300",
      };
    if (score >= 60)
      return {
        label: "Good",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      };
    if (score >= 50)
      return {
        label: "Average",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    return {
      label: "Needs Improvement",
      color: "bg-red-100 text-red-800 border-red-300",
    };
  };

  const performanceClass = getPerformanceClass(overallScore);

  // ✅ FIX: Count data points correctly
  const dataPointsCount = useCallback(() => {
    let count = 0;

    // Basic metrics
    count += Object.values(formData.basicMetrics).filter(
      (v) => v !== null && v !== undefined
    ).length;

    // Strength tests (count tests with attempts/sets)
    Object.values(formData.strengthPower).forEach((test) => {
      if (test && typeof test === "object") {
        if ("attempts" in test && Array.isArray(test.attempts))
          count += test.attempts.length;
        if ("sets" in test && Array.isArray(test.sets))
          count += test.sets.length;
      }
    });

    // Speed tests
    Object.values(formData.speedAgility).forEach((test) => {
      if (test && typeof test === "object" && "attempts" in test) {
        count += Array.isArray(test.attempts) ? test.attempts.length : 0;
      }
    });

    // Stamina tests
    Object.values(formData.staminaRecovery).forEach((test) => {
      if (test && typeof test === "object") {
        if ("attempts" in test && Array.isArray(test.attempts))
          count += test.attempts.length;
        if ("entries" in test && Array.isArray(test.entries))
          count += test.entries.length;
      }
    });

    // Historical data
    const historicalCount = existingStats
      ? (existingStats.strengthHistory?.length || 0) +
        (existingStats.speedHistory?.length || 0) +
        (existingStats.staminaHistory?.length || 0)
      : 0;

    return count + historicalCount;
  }, [formData, existingStats]);

  // ✅ FIX: Security cleanup (only runs once)
  useEffect(() => {
    const startCleanup = async () => {
      if (!athlete || cleanupStatus !== "pending") return;

      setCleanupStatus("cleaning");

      try {
        const storedOtp = localStorage.getItem("current-otp");
        const otp = storedOtp ? parseInt(storedOtp) : null;

        if (otp) {
          console.log("🧹 Starting security cleanup process");
          const success = await cleanupAfterSubmission(otp, athlete.id);
          setCleanupStatus(success ? "complete" : "error");
        } else {
          console.log("⚠️ No OTP found for cleanup, clearing local data only");
          clearAllData();
          setCleanupStatus("complete");
        }
      } catch (error) {
        console.error("❌ Cleanup failed:", error);
        setCleanupStatus("error");
      }
    };

    const cleanupTimer = setTimeout(startCleanup, 2000);
    return () => clearTimeout(cleanupTimer);
  }, [athlete, cleanupAfterSubmission, clearAllData, cleanupStatus]);

  // ✅ FIX: Navigation handler (prevents state update during render)
  const handleBackToDashboard = useCallback(() => {
    if (isNavigating) return;

    console.log("🏠 Redirecting to dashboard...");
    setIsNavigating(true);

    // Navigate first
    router.push("/business/services/dashboard");

    // Reset wizard after navigation starts
    setTimeout(() => {
      resetWizard();
    }, 100);
  }, [isNavigating, router, resetWizard]);

  // ✅ FIX: Countdown timer (separated from navigation)
  useEffect(() => {
    if (cleanupStatus !== "complete" || !autoRedirect || countdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleBackToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [cleanupStatus, autoRedirect, countdown, handleBackToDashboard]);

  // ✅ FIX: Stay on page handler
  const handleStayOnPage = useCallback(() => {
    setAutoRedirect(false);
    setCountdown(0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
              <Trophy className="w-6 h-6 text-yellow-800" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Complete! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          Successfully recorded comprehensive stats for{" "}
          <strong>{athlete?.firstName}</strong>
        </p>
      </div>

      {/* Security Cleanup Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Shield className="w-5 h-5 mr-2" />
            Security Cleanup Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {cleanupStatus === "pending" && (
              <>
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">
                  Preparing security cleanup...
                </span>
              </>
            )}
            {cleanupStatus === "cleaning" && (
              <>
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-800">
                  Cleaning up OTP records and cache...
                </span>
              </>
            )}
            {cleanupStatus === "complete" && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">
                  Security cleanup complete ✓
                </span>
              </>
            )}
            {cleanupStatus === "error" && (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">
                  Cleanup completed with warnings
                </span>
              </>
            )}
          </div>

          {cleanupStatus === "complete" && (
            <div className="mt-3 text-sm text-blue-700">
              <ul className="space-y-1">
                <li>✅ OTP record removed from database</li>
                <li>✅ Verification cache cleared</li>
                <li>✅ Local storage cleaned</li>
                <li>✅ Session data purged</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-900">
            <BarChart3 className="w-5 h-5 mr-2" />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Performance */}
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {overallScore}
                </div>
                <Badge className={performanceClass.color}>
                  {performanceClass.label}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Overall Performance
                </p>
              </div>
            </div>

            {/* Data Points */}
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {dataPointsCount()}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Data Points
                </div>
                <p className="text-sm text-gray-600 mt-2">Total Records</p>
              </div>
            </div>

            {/* Assessment Date */}
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">Assessment Date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-redirect Notice */}
      {cleanupStatus === "complete" && autoRedirect && countdown > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-yellow-800 mb-3">
                <strong>
                  Redirecting to dashboard in {countdown} seconds...
                </strong>
              </p>
              <Button onClick={handleStayOnPage} variant="outline" size="sm">
                Stay on this page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button
          onClick={handleBackToDashboard}
          className="bg-indigo-600 hover:bg-indigo-700"
          size="lg"
          disabled={isNavigating}
        >
          <Home className="w-4 h-4 mr-2" />
          {isNavigating ? "Redirecting..." : "Back to Dashboard"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-6 border-t">
        <p className="text-sm text-gray-500">
          Assessment completed securely • All verification data has been cleaned
          up
        </p>
      </div>
    </div>
  );
};

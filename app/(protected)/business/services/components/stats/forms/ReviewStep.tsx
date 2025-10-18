"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  ArrowLeft,
  Send,
  Edit3,
  User,
  Dumbbell,
  Zap,
  Heart,
  Shield,
  AlertCircle,
  Loader2,
  Trophy,
  Calendar,
  Activity,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";

export const ReviewStep: React.FC = () => {
  const {
    athlete,
    formData,
    existingStats,
    submitStats,
    isSubmitting,
    submitError,
    clearError,
  } = useStatsWizardStore();

  const { goToStep } = useWizardNavigation();
  const [showFullReview, setShowFullReview] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  const handleSubmit = async () => {
    clearError();
    console.log("🚀 ReviewStep: Starting submission process");

    const success = await submitStats();
    console.log("🎯 ReviewStep: Submission result:", success);

    if (success) {
      console.log("✅ ReviewStep: Submission successful, marking as complete");
      setIsSubmissionComplete(true);

      // Force navigation to success step after small delay
      setTimeout(() => {
        console.log("🎯 ReviewStep: Triggering success navigation");
        // Trigger success state in the wizard container
        window.dispatchEvent(new CustomEvent("statsSubmissionComplete"));
      }, 500);
    } else {
      console.log("❌ ReviewStep: Submission failed");
    }
  };

  const handleEditSection = (section: string) => {
    const sectionSteps: Record<string, number> = {
      basicMetrics: 2,
      strengthPower: 4,
      speedAgility: 6,
      staminaRecovery: 8,
      injuries: 10,
    };

    if (sectionSteps[section]) {
      goToStep(sectionSteps[section]);
    }
  };

  // Calculate completion percentage
  const calculateCompleteness = () => {
    let totalFields = 0;
    let completedFields = 0;

    // Basic metrics
    const basicFields = Object.values(formData.basicMetrics);
    totalFields += basicFields.length;
    completedFields += basicFields.filter(
      (val) => val !== null && val !== undefined
    ).length;

    // Strength power
    const strengthFields = Object.values(formData.strengthPower);
    totalFields += strengthFields.length;
    completedFields += strengthFields.filter(
      (val) => val !== null && val !== undefined
    ).length;

    // Speed agility
    const speedFields = Object.values(formData.speedAgility);
    totalFields += speedFields.length;
    completedFields += speedFields.filter(
      (val) => val !== null && val !== undefined
    ).length;

    // Stamina recovery
    const staminaFields = Object.values(formData.staminaRecovery);
    totalFields += staminaFields.length;
    completedFields += staminaFields.filter(
      (val) => val !== null && val !== undefined
    ).length;

    return Math.round((completedFields / totalFields) * 100);
  };

  const completeness = calculateCompleteness();
  const isReadyToSubmit = completeness >= 90;

  // ✅ NEW: Show success message if submission complete
  if (isSubmissionComplete) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 rounded-full p-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Stats Submitted Successfully! 🎉
        </h2>
        <p className="text-gray-600 mb-6">Redirecting to success page...</p>
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Submit Assessment
        </h1>
        <p className="text-gray-600">
          Review all collected data before final submission
        </p>
      </div>

      {/* Completeness Status */}
      <Card
        className={`${
          completeness >= 90
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-medium ${
                  completeness >= 90 ? "text-green-900" : "text-amber-900"
                }`}
              >
                Assessment Completeness
              </h3>
              <p
                className={`text-sm ${
                  completeness >= 90 ? "text-green-700" : "text-amber-700"
                }`}
              >
                {completeness}% of required fields completed
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${
                  completeness >= 90 ? "text-green-900" : "text-amber-900"
                }`}
              >
                {completeness}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    completeness >= 90 ? "bg-green-600" : "bg-amber-600"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary - simplified for space */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Basic Metrics</p>
              <p className="text-xs text-gray-500">
                Height, Weight, Age, Body Fat
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Dumbbell className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Strength & Power</p>
              <p className="text-xs text-gray-500">4 Assessment Areas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Speed & Agility</p>
              <p className="text-xs text-gray-500">6 Assessment Areas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Stamina & Recovery</p>
              <p className="text-xs text-gray-500">
                VO2 Max, Flexibility, Recovery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Error */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Submission Failed</div>
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* Readiness Check */}
      {!isReadyToSubmit && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="font-medium mb-1">Assessment Incomplete</div>
            Please complete at least 90% of the required fields before
            submitting. Currently at {completeness}% completion.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button onClick={() => goToStep(10)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Injuries
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isReadyToSubmit
              ? "✅ Ready to submit complete assessment"
              : "⚠️ Complete remaining fields to submit"}
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isReadyToSubmit || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

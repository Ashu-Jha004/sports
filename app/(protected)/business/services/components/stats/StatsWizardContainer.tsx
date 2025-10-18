"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { InstructionStep } from "./steps/InstructionStep";
import { FormStep } from "./steps/FormStep";
import { ReviewStep } from "./forms/ReviewStep";
import { SuccessStep } from "./SuccessStep";

export const StatsWizardContainer: React.FC = () => {
  const {
    submitError,
    clearError,
    isAutoSaving,
    isDraftSaved,
    lastSavedAt,
    saveDraft,
    isSubmitting,
  } = useStatsWizardStore();

  const {
    currentStep,
    currentStepConfig,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    progressPercentage,
    completedSteps,
  } = useWizardNavigation();

  // ✅ NEW: Track submission completion
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // ✅ NEW: Listen for submission completion event
  useEffect(() => {
    const handleSubmissionComplete = () => {
      console.log(
        "🎉 StatsWizardContainer: Received submission complete event"
      );
      setIsSubmissionComplete(true);
    };

    window.addEventListener(
      "statsSubmissionComplete",
      handleSubmissionComplete
    );

    return () => {
      window.removeEventListener(
        "statsSubmissionComplete",
        handleSubmissionComplete
      );
    };
  }, []);

  // ✅ NEW: Alternative check - if we're on review step and not submitting and no error, assume success
  useEffect(() => {
    if (currentStep >= 11 && !isSubmitting && !submitError && isDraftSaved) {
      // Check if all required data is submitted (this is a fallback check)
      const timer = setTimeout(() => {
        console.log(
          "🔍 StatsWizardContainer: Checking for auto-success detection"
        );
        // If we're not submitting and have saved data, might be successful
        // This is a backup in case the event doesn't fire
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isSubmitting, submitError, isDraftSaved]);

  const handleNext = () => {
    clearError();
    nextStep();
  };

  const handlePrevious = () => {
    clearError();
    previousStep();
  };

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  // ✅ NEW: Show success step if submission is complete
  if (isSubmissionComplete) {
    console.log("🎉 StatsWizardContainer: Rendering success step");
    return <SuccessStep />;
  }

  // Render current step content
  const renderStepContent = () => {
    // Review step (steps 11-12)
    if (currentStep >= 11) {
      return <ReviewStep />;
    }

    // Regular instruction/form steps
    if (currentStepConfig.type === "instruction") {
      return (
        <InstructionStep
          section={currentStepConfig.section as any}
          onNext={handleNext}
        />
      );
    } else {
      return (
        <FormStep
          section={currentStepConfig.section as any}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-save Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span className="text-green-600">Submitting assessment...</span>
            </>
          ) : isAutoSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-gray-600">Saving...</span>
            </>
          ) : isDraftSaved ? (
            <>
              <Save className="w-4 h-4 text-green-600" />
              <span className="text-green-600">
                Saved{" "}
                {lastSavedAt
                  ? `at ${new Date(lastSavedAt).toLocaleTimeString()}`
                  : "recently"}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-600">Unsaved changes</span>
            </>
          )}
        </div>

        <Button
          onClick={handleSaveDraft}
          variant="outline"
          size="sm"
          disabled={isAutoSaving || isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="min-h-[600px]">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStepConfig.type === "instruction" ? (
                <BookOpen className="w-5 h-5 text-indigo-600" />
              ) : currentStep >= 11 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <ClipboardList className="w-5 h-5 text-indigo-600" />
              )}

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isSubmitting
                    ? "Submitting Assessment..."
                    : currentStepConfig.title}
                </h2>
                <p className="text-sm text-gray-600">
                  Step {currentStep} of 12
                  {currentStepConfig.type === "instruction"
                    ? " - Instructions"
                    : currentStep >= 11
                    ? " - Review & Submit"
                    : " - Data Entry"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {Math.round(progressPercentage)}% Complete
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">{renderStepContent()}</CardContent>

        {/* Navigation Footer - Only show for non-review steps */}
        {currentStep < 11 && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-gray-600">
                {currentStepConfig.type === "instruction"
                  ? "Read the instructions, then proceed to the form"
                  : "Complete all required fields to continue"}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                variant="default"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

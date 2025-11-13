import React, { useEffect, useMemo, useCallback } from "react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Heart,
  Activity,
  Zap,
} from "lucide-react";
import { StaminaRecoveryData } from "@/lib/stats/types/staminaRecoveryTests";
import { recalculateAllStaminaScores } from "@/lib/stats/helpers/staminaRecoveryCalculations";

// Import test components
import { BeepTestInput } from "./components/staminaRecoveryTests/BeepTestInput";
import { CooperTestInput } from "./components/staminaRecoveryTests/CooperTestInput";
import { SitAndReachTestInput } from "./components/staminaRecoveryTests/SitAndReachTestInput";
import { ActiveLegRaiseTestInput } from "./components/staminaRecoveryTests/ActiveLegRaiseTestInput";
import { ShoulderRotationTestInput } from "./components/staminaRecoveryTests/ShoulderRotationTestInput";
import { KneeToWallTestInput } from "./components/staminaRecoveryTests/KneeToWallTestInput";
import { RestingHeartRateTestInput } from "./components/staminaRecoveryTests/RestingHeartRateTestInput";
import { HeartRateRecoveryTestInput } from "./components/staminaRecoveryTests/HeartRateRecoveryTestInput";
import { PeakHeartRateTestInput } from "./components/staminaRecoveryTests/PeakHeartRateTestInput";

interface StaminaRecoveryFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const StaminaRecoveryForm: React.FC<StaminaRecoveryFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection } = useStatsWizardStore();
  const staminaData =
    formData.staminaRecovery as unknown as StaminaRecoveryData;
  const athleteAge = formData.basicMetrics.age || undefined;

  const updateFormSectionStable = useCallback(
    (section: string, data: any) => {
      updateFormSection(section as any, data);
    },
    [updateFormSection]
  );

  // Recalculate scores when test data changes
  useEffect(() => {
    const recalculated = recalculateAllStaminaScores(staminaData, athleteAge);

    // ✅ FIX: Deep comparison for ALL scores to prevent infinite loops
    const scoresChanged =
      recalculated.vo2Max !== staminaData.vo2Max ||
      recalculated.overallFlexibilityScore !==
        staminaData.overallFlexibilityScore ||
      recalculated.cardiovascularFitnessScore !==
        staminaData.cardiovascularFitnessScore ||
      recalculated.recoveryEfficiencyScore !==
        staminaData.recoveryEfficiencyScore;

    if (scoresChanged) {
      updateFormSectionStable("staminaRecovery", recalculated);
    }
  }, [
    staminaData.Beep_Test,
    staminaData.Cooper_Test,
    staminaData.Sit_and_Reach_Test,
    staminaData.Active_Straight_Leg_Raise,
    staminaData.Shoulder_External_Internal_Rotation,
    staminaData.Knee_to_Wall_Test,
    staminaData.Resting_Heart_Rate,
    staminaData.Post_Exercise_Heart_Rate_Recovery,
    staminaData.Peak_Heart_Rate,
    athleteAge,
    updateFormSectionStable, // ✅ ADD: Include stable callback in deps
  ]);

  const handleTestChange = (
    testName: keyof StaminaRecoveryData,
    testData: any
  ) => {
    updateFormSection("staminaRecovery", {
      ...staminaData,
      [testName]: testData,
    });
  };

  const getCompletedTestCount = (): number => {
    let count = 0;
    if (staminaData.Beep_Test?.attempts?.length) count++;
    if (staminaData.Cooper_Test?.attempts?.length) count++;
    if (staminaData.Sit_and_Reach_Test?.attempts?.length) count++;
    if (staminaData.Active_Straight_Leg_Raise?.attempts?.length) count++;
    if (staminaData.Shoulder_External_Internal_Rotation?.attempts?.length)
      count++;
    if (staminaData.Knee_to_Wall_Test?.attempts?.length) count++;
    if (staminaData.Resting_Heart_Rate?.attempts?.length) count++;
    if (staminaData.Post_Exercise_Heart_Rate_Recovery?.attempts?.length)
      count++;
    if (staminaData.Peak_Heart_Rate?.entries?.length) count++;
    return count;
  };

  const hasAtLeastOneTest = useMemo(() => {
    return !!(
      staminaData.Beep_Test?.attempts?.length ||
      staminaData.Cooper_Test?.attempts?.length ||
      staminaData.Sit_and_Reach_Test?.attempts?.length ||
      staminaData.Active_Straight_Leg_Raise?.attempts?.length ||
      staminaData.Shoulder_External_Internal_Rotation?.attempts?.length ||
      staminaData.Knee_to_Wall_Test?.attempts?.length ||
      staminaData.Resting_Heart_Rate?.attempts?.length ||
      staminaData.Post_Exercise_Heart_Rate_Recovery?.attempts?.length ||
      staminaData.Peak_Heart_Rate?.entries?.length
    );
  }, [staminaData]);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (hasAtLeastOneTest) {
          onNext();
        }
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Stamina & Recovery Assessment
        </h2>
        <p className="text-gray-600">
          Complete tests relevant to your athlete's training goals.
          <span className="text-sm text-amber-600">
            At least one test is required to continue.
          </span>
        </p>
      </div>
      {/* Overall Scores Summary */}
      {/* Overall Scores Summary */}
      {hasAtLeastOneTest && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Overall Stamina & Recovery Scores
                </p>
                <p className="text-xs text-green-700">
                  Calculated from completed tests
                </p>
              </div>
              <Activity className="w-6 h-6 text-green-600" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {staminaData.vo2Max > 0 && (
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-gray-600">VO2 Max</p>
                  <p className="text-2xl font-bold text-green-900">
                    {staminaData.vo2Max.toFixed(1)}
                    <span className="text-sm text-gray-600"> ml/kg/min</span>
                  </p>
                </div>
              )}

              {staminaData.cardiovascularFitnessScore !== undefined &&
                staminaData.cardiovascularFitnessScore > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600">Cardio Fitness</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {staminaData.cardiovascularFitnessScore}
                      <span className="text-sm text-gray-600">/100</span>
                    </p>
                  </div>
                )}

              {staminaData.overallFlexibilityScore !== undefined &&
                staminaData.overallFlexibilityScore > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-gray-600">Flexibility</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {staminaData.overallFlexibilityScore}
                      <span className="text-sm text-gray-600">/100</span>
                    </p>
                  </div>
                )}

              {staminaData.recoveryEfficiencyScore !== undefined &&
                staminaData.recoveryEfficiencyScore > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-teal-200">
                    <p className="text-xs text-gray-600">Recovery</p>
                    <p className="text-2xl font-bold text-teal-900">
                      {staminaData.recoveryEfficiencyScore}
                      <span className="text-sm text-gray-600">/100</span>
                    </p>
                  </div>
                )}

              {staminaData.Resting_Heart_Rate?.lowestRHR !== undefined &&
                staminaData.Resting_Heart_Rate.lowestRHR > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-xs text-gray-600">Resting HR</p>
                    <p className="text-2xl font-bold text-red-900">
                      {staminaData.Resting_Heart_Rate.lowestRHR}
                      <span className="text-sm text-gray-600"> BPM</span>
                    </p>
                  </div>
                )}

              {staminaData.Peak_Heart_Rate?.maxRecordedHR !== undefined &&
                staminaData.Peak_Heart_Rate.maxRecordedHR > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-gray-600">Max HR</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {staminaData.Peak_Heart_Rate.maxRecordedHR}
                      <span className="text-sm text-gray-600"> BPM</span>
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories - Accordion Layout */}
      <Accordion
        type="multiple"
        className="space-y-4"
        defaultValue={["cardio"]}
      >
        {/* Cardiovascular Endurance Tests */}
        <AccordionItem value="cardio" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Cardiovascular Endurance</span>
              <span className="text-xs text-gray-500 ml-2">
                (2 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <BeepTestInput
              value={staminaData.Beep_Test}
              onChange={(data) => handleTestChange("Beep_Test", data)}
            />

            <CooperTestInput
              value={staminaData.Cooper_Test}
              onChange={(data) => handleTestChange("Cooper_Test", data)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Flexibility Tests */}
        <AccordionItem value="flexibility" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Flexibility Assessment</span>
              <span className="text-xs text-gray-500 ml-2">
                (4 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <SitAndReachTestInput
              value={staminaData.Sit_and_Reach_Test}
              onChange={(data) => handleTestChange("Sit_and_Reach_Test", data)}
            />

            <ActiveLegRaiseTestInput
              value={staminaData.Active_Straight_Leg_Raise}
              onChange={(data) =>
                handleTestChange("Active_Straight_Leg_Raise", data)
              }
            />

            <ShoulderRotationTestInput
              value={staminaData.Shoulder_External_Internal_Rotation}
              onChange={(data) =>
                handleTestChange("Shoulder_External_Internal_Rotation", data)
              }
            />

            <KneeToWallTestInput
              value={staminaData.Knee_to_Wall_Test}
              onChange={(data) => handleTestChange("Knee_to_Wall_Test", data)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Heart Rate & Recovery Tests */}
        <AccordionItem value="heartrate" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" />
              <span className="font-semibold">Heart Rate & Recovery</span>
              <span className="text-xs text-gray-500 ml-2">
                (3 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <RestingHeartRateTestInput
              value={staminaData.Resting_Heart_Rate}
              onChange={(data) => handleTestChange("Resting_Heart_Rate", data)}
            />

            <HeartRateRecoveryTestInput
              value={staminaData.Post_Exercise_Heart_Rate_Recovery}
              onChange={(data) =>
                handleTestChange("Post_Exercise_Heart_Rate_Recovery", data)
              }
            />

            <PeakHeartRateTestInput
              value={staminaData.Peak_Heart_Rate}
              onChange={(data) => handleTestChange("Peak_Heart_Rate", data)}
              athleteAge={athleteAge}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Validation Message */}
      {!hasAtLeastOneTest && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete at least one stamina or recovery test to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button type="button" onClick={onPrevious} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {hasAtLeastOneTest
              ? `✅ ${getCompletedTestCount()} test(s) completed`
              : "Complete at least one test to continue"}
          </p>
        </div>

        <Button type="submit" disabled={!hasAtLeastOneTest}>
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

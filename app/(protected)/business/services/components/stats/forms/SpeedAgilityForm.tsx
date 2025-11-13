import React, { useEffect, useMemo } from "react";
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
  Zap,
  Activity,
} from "lucide-react";
import { SpeedAndAgilityData } from "@/lib/stats/types/speedAgilityTests";
import { recalculateAllScores } from "@/lib/stats/helpers/speedAgilityCalculations";

// Import all test components
import { TenMeterSprintInput } from "./components/speedAgilityTest/TenMeterSprintInput";
import { FourtyMeterDashInput } from "./components/speedAgilityTest/FourtyMeterDashInput";
import { RepeatedSprintAbilityInput } from "./components/speedAgilityTest/RepeatedSprintAbilityInput";
import { TTestInput } from "./components/speedAgilityTest/TTestInput";
import { IllinoisAgilityTestInput } from "./components/speedAgilityTest/IllinoisAgilityTestInput";
import { Five05AgilityTestInput } from "./components/speedAgilityTest/Five05AgilityTestInput";
import { VisualReactionSpeedDrillInput } from "./components/speedAgilityTest/VisualReactionSpeedDrillInput";
import { StandingLongJumpInput } from "./components/speedAgilityTest/StandingLongJumpInput";
import { LongJumpInput } from "./components/speedAgilityTest/LongJumpInput";
import { ReactiveAgilityTTestInput } from "./components/speedAgilityTest/ReactiveAgilityTTestInput";

interface SpeedAgilityFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const SpeedAgilityForm: React.FC<SpeedAgilityFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection } = useStatsWizardStore();
  const speedAgilityData =
    formData.speedAgility as unknown as SpeedAndAgilityData;

  // Recalculate scores whenever test data changes
  useEffect(() => {
    const recalculated = recalculateAllScores(speedAgilityData);

    // Only update if scores actually changed
    if (
      recalculated.sprintSpeed !== speedAgilityData.sprintSpeed ||
      recalculated.acceleration?.score !== speedAgilityData.acceleration?.score
    ) {
      updateFormSection("speedAgility", recalculated);
    }
  }, [
    speedAgilityData.Ten_Meter_Sprint,
    speedAgilityData.Fourty_Meter_Dash,
    speedAgilityData.Repeated_Sprint_Ability,
    speedAgilityData.T_Test,
    speedAgilityData.Illinois_Agility_Test,
    speedAgilityData.Five_0_Five_Agility_Test,
    speedAgilityData.Visual_Reaction_Speed_Drill,
    speedAgilityData.Standing_Long_Jump,
    speedAgilityData.Long_Jump,
    speedAgilityData.Reactive_Agility_T_Test,
  ]);

  const handleTestChange = (
    testName: keyof SpeedAndAgilityData,
    testData: any
  ) => {
    updateFormSection("speedAgility", {
      ...speedAgilityData,
      [testName]: testData,
    });
  };

  const handleAnthropometricChange = (data: any) => {
    updateFormSection("speedAgility", {
      ...speedAgilityData,
      anthropometricData: data,
    });
  };

  // ADD THIS FUNCTION HERE:
  const getCompletedTestCount = (): number => {
    let count = 0;

    // Tests with attempts array
    if (speedAgilityData.Ten_Meter_Sprint?.attempts?.length) count++;
    if (speedAgilityData.Fourty_Meter_Dash?.attempts?.length) count++;
    if (speedAgilityData.T_Test?.attempts?.length) count++;
    if (speedAgilityData.Illinois_Agility_Test?.attempts?.length) count++;
    if (speedAgilityData.Five_0_Five_Agility_Test?.attempts?.length) count++;
    if (speedAgilityData.Visual_Reaction_Speed_Drill?.attempts?.length) count++;
    if (speedAgilityData.Standing_Long_Jump?.attempts?.length) count++;
    if (speedAgilityData.Long_Jump?.attempts?.length) count++;
    if (speedAgilityData.Reactive_Agility_T_Test?.attempts?.length) count++;

    // RSA test with sprintTimes array
    if (speedAgilityData.Repeated_Sprint_Ability?.sprintTimes?.length === 6)
      count++;

    return count;
  };

  // Check if at least one test is completed
  const hasAtLeastOneTest = useMemo(() => {
    return !!(
      speedAgilityData.Ten_Meter_Sprint?.attempts?.length ||
      speedAgilityData.Fourty_Meter_Dash?.attempts?.length ||
      speedAgilityData.Repeated_Sprint_Ability?.sprintTimes?.length ||
      speedAgilityData.T_Test?.attempts?.length ||
      speedAgilityData.Illinois_Agility_Test?.attempts?.length ||
      speedAgilityData.Five_0_Five_Agility_Test?.attempts?.length ||
      speedAgilityData.Visual_Reaction_Speed_Drill?.attempts?.length ||
      speedAgilityData.Standing_Long_Jump?.attempts?.length ||
      speedAgilityData.Long_Jump?.attempts?.length ||
      speedAgilityData.Reactive_Agility_T_Test?.attempts?.length
    );
  }, [speedAgilityData]);

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
          Speed & Agility Assessment
        </h2>
        <p className="text-gray-600">
          Complete the tests relevant to your athlete's sport and training
          goals.
          <br />
          <span className="text-sm text-amber-600">
            At least one test is required to continue.
          </span>
        </p>
      </div>

      {/* Overall Scores Summary */}
      {hasAtLeastOneTest && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Overall Speed & Agility Scores
                </p>
                <p className="text-xs text-blue-700">
                  Calculated from completed tests
                </p>
              </div>
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Sprint Speed</p>
                <p className="text-2xl font-bold text-blue-900">
                  {speedAgilityData.sprintSpeed?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Acceleration</p>
                <p className="text-2xl font-bold text-blue-900">
                  {speedAgilityData.acceleration?.score?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Agility</p>
                <p className="text-2xl font-bold text-green-900">
                  {speedAgilityData.agility?.score?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Reaction Time</p>
                <p className="text-2xl font-bold text-amber-900">
                  {speedAgilityData.reactionTime?.score?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Coordination</p>
                <p className="text-2xl font-bold text-teal-900">
                  {speedAgilityData.coordination?.score?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-purple-900">
                  {speedAgilityData.balance?.score?.toFixed(1) || 0}
                  <span className="text-sm text-gray-600">/100</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories - Accordion Layout */}
      <Accordion
        type="multiple"
        className="space-y-4"
        defaultValue={["sprint"]}
      >
        {/* Sprint & Acceleration Tests */}
        <AccordionItem value="sprint" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Sprint & Acceleration Tests</span>
              <span className="text-xs text-gray-500 ml-2">
                (3 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <TenMeterSprintInput
              value={speedAgilityData.Ten_Meter_Sprint}
              onChange={(data) => handleTestChange("Ten_Meter_Sprint", data)}
              anthropometricData={speedAgilityData.anthropometricData}
              onAnthropometricChange={handleAnthropometricChange}
            />

            <FourtyMeterDashInput
              value={speedAgilityData.Fourty_Meter_Dash}
              onChange={(data) => handleTestChange("Fourty_Meter_Dash", data)}
            />

            <RepeatedSprintAbilityInput
              value={speedAgilityData.Repeated_Sprint_Ability}
              onChange={(data) =>
                handleTestChange("Repeated_Sprint_Ability", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Agility & Change of Direction Tests */}
        <AccordionItem value="agility" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-semibold">
                Agility & Change of Direction
              </span>
              <span className="text-xs text-gray-500 ml-2">
                (3 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <TTestInput
              value={speedAgilityData.T_Test}
              onChange={(data) => handleTestChange("T_Test", data)}
            />

            <IllinoisAgilityTestInput
              value={speedAgilityData.Illinois_Agility_Test}
              onChange={(data) =>
                handleTestChange("Illinois_Agility_Test", data)
              }
            />

            <Five05AgilityTestInput
              value={speedAgilityData.Five_0_Five_Agility_Test}
              onChange={(data) =>
                handleTestChange("Five_0_Five_Agility_Test", data)
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* Power Tests */}
        <AccordionItem value="power" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="font-semibold">Explosive Power Tests</span>
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <StandingLongJumpInput
              value={speedAgilityData.Standing_Long_Jump}
              onChange={(data) => handleTestChange("Standing_Long_Jump", data)}
            />

            <LongJumpInput
              value={speedAgilityData.Long_Jump}
              onChange={(data) => handleTestChange("Long_Jump", data)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Advanced/Optional Tests */}
        <AccordionItem value="advanced" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              <span className="font-semibold">Advanced & Optional Tests</span>
              <span className="text-xs text-gray-500 ml-2">
                (2 tests available)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <VisualReactionSpeedDrillInput
              value={speedAgilityData.Visual_Reaction_Speed_Drill}
              onChange={(data) =>
                handleTestChange("Visual_Reaction_Speed_Drill", data)
              }
            />

            <ReactiveAgilityTTestInput
              value={speedAgilityData.Reactive_Agility_T_Test}
              onChange={(data) =>
                handleTestChange("Reactive_Agility_T_Test", data)
              }
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Validation Message */}
      {!hasAtLeastOneTest && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete at least one speed or agility test to continue.
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

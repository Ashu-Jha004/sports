import React, { useMemo } from "react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { CountermovementJumpInput } from "./components/strength-tests/CountermovementJumpInput";
import { LoadedSquatJumpInput } from "./components/strength-tests/LoadedSquatJumpInput";
import { DepthJumpInput } from "./components/strength-tests/DepthJumpInput";
import { BallisticBenchPressInput } from "./components/strength-tests/BallisticBenchPressInput";
import { PushUpInput } from "./components/strength-tests/PushUpInput";
import { BallisticPushUpInput } from "./components/strength-tests/BallisticPushUpInput";
import { DeadliftVelocityInput } from "./components/strength-tests/DeadliftVelocityInput";
import { BarbellHipThrustInput } from "./components/strength-tests/BarbellHipThrustInput";
import { WeightedPullUpInput } from "./components/strength-tests/WeightedPullUpInput";
import { BarbellRowInput } from "./components/strength-tests/BarbellRowInput";
import { PlankHoldInput } from "./components/strength-tests/PlankHoldInput";
import { PullUpsInput } from "./components/strength-tests/PullUpsInput";

export const StrengthPowerForm = ({ onNext, onPrevious }: any) => {
  const { formData, updateFormSection } = useStatsWizardStore();

  // Use latest body weight (from metrics or form itself)
  const bodyWeight = useMemo(
    () =>
      formData.basicMetrics.weight ||
      formData.strengthPower.athleteBodyWeight ||
      0,
    [formData.basicMetrics.weight, formData.strengthPower.athleteBodyWeight]
  );

  const handleTestChange = (testName: any, testData: any) => {
    updateFormSection("strengthPower", {
      ...formData.strengthPower,
      [testName]: testData,
      athleteBodyWeight: bodyWeight,
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Strength & Power Assessment
        </h2>
        <p className="text-gray-600">
          Enter results for each test you performed. You may skip tests not
          attempted.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <CountermovementJumpInput
          value={formData.strengthPower.countermovementJump}
          onChange={(data) => handleTestChange("countermovementJump", data)}
        />
        <LoadedSquatJumpInput
          value={formData.strengthPower.loadedSquatJump}
          bodyWeight={bodyWeight}
          onChange={(data) => handleTestChange("loadedSquatJump", data)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <DepthJumpInput
          value={formData.strengthPower.depthJump}
          onChange={(data) => handleTestChange("depthJump", data)}
        />
        <BallisticBenchPressInput
          value={formData.strengthPower.ballisticBenchPress}
          onChange={(data) => handleTestChange("ballisticBenchPress", data)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <PushUpInput
          value={formData.strengthPower.pushUp}
          onChange={(data) => handleTestChange("pushUp", data)}
        />
        <BallisticPushUpInput
          value={formData.strengthPower.ballisticPushUp}
          onChange={(data) => handleTestChange("ballisticPushUp", data)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <DeadliftVelocityInput
          value={formData.strengthPower.deadliftVelocity}
          onChange={(data) => handleTestChange("deadliftVelocity", data)}
        />
        <BarbellHipThrustInput
          value={formData.strengthPower.barbellHipThrust}
          onChange={(data) => handleTestChange("barbellHipThrust", data)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <WeightedPullUpInput
          value={formData.strengthPower.weightedPullUp}
          bodyWeight={bodyWeight}
          onChange={(data) => handleTestChange("weightedPullUp", data)}
        />
        <BarbellRowInput
          value={formData.strengthPower.barbellRow}
          onChange={(data) => handleTestChange("barbellRow", data)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <PlankHoldInput
          value={formData.strengthPower.plankHold}
          onChange={(data) => handleTestChange("plankHold", data)}
        />
        <PullUpsInput
          value={formData.strengthPower.pullUps}
          onChange={(data) => handleTestChange("pullUps", data)}
        />
      </div>

      {/* Main summary fields for average scores */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-green-900">
                Overall Strength & Power Score
              </p>
              <p className="text-xs text-green-700">
                Average of calculated strength, endurance, and power scores
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-green-900">Explosive Power</p>
                  <p className="text-lg font-semibold">
                    {formData.strengthPower.explosivePower ?? 0}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-900">Muscle Mass/Strength</p>
                  <p className="text-lg font-semibold">
                    {formData.strengthPower.muscleMass ?? 0}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-900">Endurance Strength</p>
                  <p className="text-lg font-semibold">
                    {formData.strengthPower.enduranceStrength ?? 0}/100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(Error).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(Error).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error?.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {/* Insert any Alert or validation display logic here, as per your existing app */}

      <div className="flex items-center justify-between pt-6 border-t">
        <Button type="button" onClick={onPrevious} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Fill out at least one test to continue
          </p>
        </div>
        <Button type="submit">
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

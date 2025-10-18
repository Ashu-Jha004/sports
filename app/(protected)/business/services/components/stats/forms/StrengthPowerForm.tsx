import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Dumbbell,
  Timer,
  TrendingUp,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
// Validation Schema
const strengthPowerSchema = z.object({
  strength: z
    .number()
    .min(0, "Strength score cannot be negative")
    .max(100, "Strength score cannot exceed 100"),
  muscleMass: z
    .number()
    .min(0, "Muscle mass score cannot be negative")
    .max(100, "Muscle mass score cannot exceed 100"),
  enduranceStrength: z
    .number()
    .min(0, "Endurance strength cannot be negative")
    .max(100, "Endurance strength cannot exceed 100"),
  explosivePower: z
    .number()
    .min(0, "Explosive power cannot be negative")
    .max(100, "Explosive power cannot exceed 100"),
});

type StrengthPowerFormData = z.infer<typeof strengthPowerSchema>;

interface StrengthPowerFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const StrengthPowerForm: React.FC<StrengthPowerFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection } = useStatsWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationHelpers, setCalculationHelpers] = useState({
    pushUps: "",
    pullUps: "",
    wallSit: "",
    armCircumference: "",
    thighCircumference: "",
    plankHold: "",
    squats: "",
    verticalJump: "",
    broadJump: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<StrengthPowerFormData>({
    resolver: zodResolver(strengthPowerSchema),
    mode: "onChange",
    defaultValues: {
      strength: formData.strengthPower.strength || undefined,
      muscleMass: formData.strengthPower.muscleMass || undefined,
      enduranceStrength: formData.strengthPower.enduranceStrength || undefined,
      explosivePower: formData.strengthPower.explosivePower || undefined,
    },
  });

  const watchedValues = watch();

  // Auto-save on form changes
  useEffect(() => {
    const subscription = watch((value) => {
      const cleanData = Object.entries(value).reduce((acc, [key, val]) => {
        if (val !== undefined && val !== null) {
          acc[key] = typeof val === "string" ? parseFloat(val) : val;
        }
        return acc;
      }, {} as any);

      if (Object.keys(cleanData).length > 0) {
        updateFormSection("strengthPower", cleanData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFormSection]);

  // Calculation helpers
  const calculateOverallStrength = () => {
    const pushUps = parseFloat(calculationHelpers.pushUps) || 0;
    const pullUps = parseFloat(calculationHelpers.pullUps) || 0;
    const wallSit = parseFloat(calculationHelpers.wallSit) || 0;

    const score = Math.min(
      100,
      Math.max(0, pushUps * 0.4 + pullUps * 2 + wallSit * 0.1)
    );
    setValue("strength", Math.round(score * 10) / 10);
  };

  const calculateMuscleMass = () => {
    const arm = parseFloat(calculationHelpers.armCircumference) || 0;
    const thigh = parseFloat(calculationHelpers.thighCircumference) || 0;

    // Simple scoring based on circumference measurements
    const score = Math.min(100, (arm - 20) * 2.5 + (thigh - 40) * 1.25);
    setValue("muscleMass", Math.max(0, Math.round(score * 10) / 10));
  };

  const calculateEnduranceStrength = () => {
    const plank = parseFloat(calculationHelpers.plankHold) || 0;
    const squats = parseFloat(calculationHelpers.squats) || 0;

    const score = Math.min(100, plank * 0.5 + squats * 0.3);
    setValue("enduranceStrength", Math.round(score * 10) / 10);
  };

  const calculateExplosivePower = () => {
    const vertical = parseFloat(calculationHelpers.verticalJump) || 0;
    const broad = parseFloat(calculationHelpers.broadJump) || 0;

    // Scale jumps to 0-100 score
    const verticalScore = (vertical / 80) * 50; // 80cm = 50 points
    const broadScore = (broad / 300) * 50; // 300cm = 50 points
    const totalScore = Math.min(100, verticalScore + broadScore);

    setValue("explosivePower", Math.round(totalScore * 10) / 10);
  };

  const onSubmit = async (data: StrengthPowerFormData) => {
    setIsSubmitting(true);

    try {
      updateFormSection("strengthPower", data);
      onNext();
    } catch (error) {
      console.error("Error submitting strength power data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Strength & Power Assessment
        </h2>
        <p className="text-gray-600">
          Record strength measurements and calculate performance scores
        </p>
      </div>

      {/* Calculation Helpers */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center text-blue-900">
            <Calculator className="w-4 h-4 mr-2" />
            Measurement Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overall Strength Inputs */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">Overall Strength</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Push-ups (1 min)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calculationHelpers.pushUps}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        pushUps: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Pull-ups (max)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calculationHelpers.pullUps}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        pullUps: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Wall-sit (seconds)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calculationHelpers.wallSit}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        wallSit: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateOverallStrength}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {/* Muscle Mass Inputs */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">Muscle Mass</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Arm circumference (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={calculationHelpers.armCircumference}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        armCircumference: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Thigh circumference (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={calculationHelpers.thighCircumference}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        thighCircumference: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateMuscleMass}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>

            {/* Endurance Strength Inputs */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">Endurance Strength</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Plank hold (seconds)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calculationHelpers.plankHold}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        plankHold: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Squats (2 min)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={calculationHelpers.squats}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        squats: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateEnduranceStrength}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>
          </div>

          {/* Explosive Power Section */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-blue-900">Explosive Power</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Vertical jump (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={calculationHelpers.verticalJump}
                      onChange={(e) =>
                        setCalculationHelpers((prev) => ({
                          ...prev,
                          verticalJump: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Broad jump (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={calculationHelpers.broadJump}
                      onChange={(e) =>
                        setCalculationHelpers((prev) => ({
                          ...prev,
                          broadJump: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateExplosivePower}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Strength */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Dumbbell className="w-4 h-4 mr-2 text-indigo-600" />
              Overall Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="strength">Strength Score (0-100)</Label>
              <Input
                id="strength"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("strength", { valueAsNumber: true })}
                className={errors.strength ? "border-red-300" : ""}
              />
              {errors.strength && (
                <p className="text-sm text-red-600">
                  {errors.strength.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Combined push-up, pull-up, and wall-sit score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Muscle Mass */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
              Muscle Mass
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="muscleMass">Muscle Mass Score (0-100)</Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("muscleMass", { valueAsNumber: true })}
                className={errors.muscleMass ? "border-red-300" : ""}
              />
              {errors.muscleMass && (
                <p className="text-sm text-red-600">
                  {errors.muscleMass.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Based on circumference measurements
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endurance Strength */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Timer className="w-4 h-4 mr-2 text-indigo-600" />
              Endurance Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="enduranceStrength">Endurance Score (0-100)</Label>
              <Input
                id="enduranceStrength"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("enduranceStrength", { valueAsNumber: true })}
                className={errors.enduranceStrength ? "border-red-300" : ""}
              />
              {errors.enduranceStrength && (
                <p className="text-sm text-red-600">
                  {errors.enduranceStrength.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Combined plank and squat endurance score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Explosive Power */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-600" />
              Explosive Power
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="explosivePower">Power Score (0-100)</Label>
              <Input
                id="explosivePower"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("explosivePower", { valueAsNumber: true })}
                className={errors.explosivePower ? "border-red-300" : ""}
              />
              {errors.explosivePower && (
                <p className="text-sm text-red-600">
                  {errors.explosivePower.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Combined vertical and broad jump score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Score Display */}
      {watchedValues.strength &&
        watchedValues.muscleMass &&
        watchedValues.enduranceStrength &&
        watchedValues.explosivePower && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Overall Strength & Power Score
                  </p>
                  <p className="text-xs text-green-700">
                    Average of all strength components
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">
                    {(
                      (watchedValues.strength +
                        watchedValues.muscleMass +
                        watchedValues.enduranceStrength +
                        watchedValues.explosivePower) /
                      4
                    ).toFixed(1)}
                  </p>
                  <p className="text-xs text-green-700">out of 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the following errors:
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {error?.message}
                </li>
              ))}
            </ul>
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
            {isValid
              ? "✅ All strength assessments completed"
              : "Complete all assessments to continue"}
          </p>
        </div>

        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Saving..." : "Next Step"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

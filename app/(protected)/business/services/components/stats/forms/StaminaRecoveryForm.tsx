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
  Heart,
  Activity,
  Timer,
  Gauge,
  AlertCircle,
  Calculator,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";

// Validation Schema
const staminaRecoverySchema = z.object({
  vo2Max: z
    .number()
    .min(20, "VO2 Max must be at least 20 ml/kg/min")
    .max(80, "VO2 Max cannot exceed 80 ml/kg/min"),
  flexibility: z
    .number()
    .min(-20, "Flexibility score cannot be less than -20cm")
    .max(50, "Flexibility score cannot exceed 50cm"),
  recoveryTime: z
    .number()
    .min(30, "Recovery time must be at least 30 seconds")
    .max(600, "Recovery time cannot exceed 600 seconds"),
});

type StaminaRecoveryFormData = z.infer<typeof staminaRecoverySchema>;

interface StaminaRecoveryFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const StaminaRecoveryForm: React.FC<StaminaRecoveryFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection } = useStatsWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationHelpers, setCalculationHelpers] = useState({
    cooperRunDistance: "",
    sitReachDistance: "",
    restingHeartRate: "",
    recoveryHeartRate: "",
    stepTestDuration: "180", // 3 minutes default
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<StaminaRecoveryFormData>({
    resolver: zodResolver(staminaRecoverySchema),
    mode: "onChange",
    defaultValues: {
      vo2Max: formData.staminaRecovery.vo2Max || undefined,
      flexibility: formData.staminaRecovery.flexibility || undefined,
      recoveryTime: formData.staminaRecovery.recoveryTime || undefined,
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
        updateFormSection("staminaRecovery", cleanData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFormSection]);

  // Calculation helpers
  const calculateVO2Max = () => {
    const distance = parseFloat(calculationHelpers.cooperRunDistance);
    if (distance && distance > 0) {
      // Cooper 12-minute run formula: VO2 Max = (distance in meters - 504.9) / 44.73
      const vo2Max = Math.max(20, Math.min(80, (distance - 504.9) / 44.73));
      setValue("vo2Max", Math.round(vo2Max * 10) / 10);
    }
  };

  const setFlexibilityScore = () => {
    const reachDistance = parseFloat(calculationHelpers.sitReachDistance);
    if (reachDistance !== null && !isNaN(reachDistance)) {
      setValue("flexibility", Math.round(reachDistance * 10) / 10);
    }
  };

  const calculateRecoveryTime = () => {
    const restingHR = parseFloat(calculationHelpers.restingHeartRate);
    const recoveryHR = parseFloat(calculationHelpers.recoveryHeartRate);
    const stepDuration = parseFloat(calculationHelpers.stepTestDuration);

    if (restingHR && recoveryHR && stepDuration) {
      // Simple recovery calculation - time for HR to return to resting + 20bpm
      const targetHR = restingHR + 20;
      if (recoveryHR <= targetHR) {
        // Good recovery - use step test duration as baseline
        const recoverySeconds = Math.max(30, stepDuration * 0.3);
        setValue("recoveryTime", Math.round(recoverySeconds));
      } else {
        // Poor recovery - estimate longer time
        const recoverySeconds = Math.min(600, stepDuration * 0.8);
        setValue("recoveryTime", Math.round(recoverySeconds));
      }
    }
  };

  const onSubmit = async (data: StaminaRecoveryFormData) => {
    setIsSubmitting(true);

    try {
      updateFormSection("staminaRecovery", data);
      onNext();
    } catch (error) {
      console.error("Error submitting stamina recovery data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get VO2 Max classification
  const getVO2MaxClass = (vo2Max: number): string => {
    if (vo2Max >= 60) return "Excellent";
    if (vo2Max >= 50) return "Very Good";
    if (vo2Max >= 40) return "Good";
    if (vo2Max >= 30) return "Fair";
    return "Poor";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Stamina & Recovery Assessment
        </h2>
        <p className="text-gray-600">
          Record cardiovascular fitness and recovery measurements
        </p>
      </div>

      {/* Calculation Helpers */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center text-blue-900">
            <Calculator className="w-4 h-4 mr-2" />
            Test Result Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* VO2 Max Calculation */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">
                VO2 Max (Cooper Test)
              </h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">
                    12-min run distance (meters)
                  </Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={calculationHelpers.cooperRunDistance}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        cooperRunDistance: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateVO2Max}
                  className="w-full"
                >
                  Calculate VO2 Max
                </Button>
              </div>
            </div>

            {/* Flexibility Measurement */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">
                Flexibility (Sit & Reach)
              </h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Reach distance (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={calculationHelpers.sitReachDistance}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        sitReachDistance: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={setFlexibilityScore}
                  className="w-full"
                >
                  Set Flexibility
                </Button>
              </div>
            </div>

            {/* Recovery Time Calculation */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">Recovery Assessment</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Resting heart rate (bpm)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={calculationHelpers.restingHeartRate}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        restingHeartRate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Post-exercise HR (bpm)</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={calculationHelpers.recoveryHeartRate}
                    onChange={(e) =>
                      setCalculationHelpers((prev) => ({
                        ...prev,
                        recoveryHeartRate: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={calculateRecoveryTime}
                  className="w-full"
                >
                  Calculate Recovery
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* VO2 Max */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Heart className="w-4 h-4 mr-2 text-indigo-600" />
              VO2 Max
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="vo2Max">VO2 Max (ml/kg/min)</Label>
              <Input
                id="vo2Max"
                type="number"
                step="0.1"
                placeholder="45.0"
                {...register("vo2Max", { valueAsNumber: true })}
                className={errors.vo2Max ? "border-red-300" : ""}
              />
              {errors.vo2Max && (
                <p className="text-sm text-red-600">{errors.vo2Max.message}</p>
              )}
              {watchedValues.vo2Max && (
                <p className="text-xs text-green-600 font-medium">
                  Classification: {getVO2MaxClass(watchedValues.vo2Max)}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Cardiovascular fitness measure
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flexibility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-600" />
              Flexibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="flexibility">Flexibility (cm)</Label>
              <Input
                id="flexibility"
                type="number"
                step="0.1"
                placeholder="5.0"
                {...register("flexibility", { valueAsNumber: true })}
                className={errors.flexibility ? "border-red-300" : ""}
              />
              {errors.flexibility && (
                <p className="text-sm text-red-600">
                  {errors.flexibility.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Sit-and-reach test result (+/- from toes)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Timer className="w-4 h-4 mr-2 text-indigo-600" />
              Recovery Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="recoveryTime">Recovery Time (seconds)</Label>
              <Input
                id="recoveryTime"
                type="number"
                placeholder="120"
                {...register("recoveryTime", { valueAsNumber: true })}
                className={errors.recoveryTime ? "border-red-300" : ""}
              />
              {errors.recoveryTime && (
                <p className="text-sm text-red-600">
                  {errors.recoveryTime.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Time to return to resting + 20 bpm
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      {watchedValues.vo2Max &&
        watchedValues.flexibility !== undefined &&
        watchedValues.recoveryTime && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Cardiovascular
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {getVO2MaxClass(watchedValues.vo2Max)}
                  </p>
                  <p className="text-xs text-green-700">
                    VO2 Max: {watchedValues.vo2Max}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Flexibility
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {watchedValues.flexibility >= 10
                      ? "Excellent"
                      : watchedValues.flexibility >= 5
                      ? "Good"
                      : watchedValues.flexibility >= 0
                      ? "Average"
                      : watchedValues.flexibility >= -5
                      ? "Below Average"
                      : "Poor"}
                  </p>
                  <p className="text-xs text-green-700">
                    {watchedValues.flexibility} cm
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Recovery
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {watchedValues.recoveryTime <= 60
                      ? "Excellent"
                      : watchedValues.recoveryTime <= 120
                      ? "Good"
                      : watchedValues.recoveryTime <= 180
                      ? "Average"
                      : "Needs Improvement"}
                  </p>
                  <p className="text-xs text-green-700">
                    {watchedValues.recoveryTime}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Reference Guide */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm text-gray-800">
            📋 Reference Ranges
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium mb-1">VO2 Max (ml/kg/min)</p>
              <p>Excellent: 60+</p>
              <p>Very Good: 50-59</p>
              <p>Good: 40-49</p>
              <p>Fair: 30-39</p>
              <p>Poor: &lt;30</p>
            </div>
            <div>
              <p className="font-medium mb-1">Flexibility (cm)</p>
              <p>Excellent: 10+</p>
              <p>Good: 5-9</p>
              <p>Average: 0-4</p>
              <p>Below Avg: -5 to -1</p>
              <p>Poor: &lt;-5</p>
            </div>
            <div>
              <p className="font-medium mb-1">Recovery Time (sec)</p>
              <p>Excellent: &lt;60</p>
              <p>Good: 60-120</p>
              <p>Average: 120-180</p>
              <p>Poor: &gt;180</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              ? "✅ All stamina assessments completed"
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

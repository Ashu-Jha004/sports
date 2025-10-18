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
  Target,
  Timer,
  Activity,
  AlertCircle,
  Gauge,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";
// Validation Schema
const speedAgilitySchema = z.object({
  sprintSpeed: z
    .number()
    .min(0, "Sprint speed cannot be negative")
    .max(100, "Sprint speed cannot exceed 100"),
  acceleration: z
    .number()
    .min(0, "Acceleration cannot be negative")
    .max(100, "Acceleration cannot exceed 100"),
  agility: z
    .number()
    .min(0, "Agility score cannot be negative")
    .max(100, "Agility score cannot exceed 100"),
  reactionTime: z
    .number()
    .min(0, "Reaction time cannot be negative")
    .max(100, "Reaction time cannot exceed 100"),
  balance: z
    .number()
    .min(0, "Balance score cannot be negative")
    .max(100, "Balance score cannot exceed 100"),
  coordination: z
    .number()
    .min(0, "Coordination score cannot be negative")
    .max(100, "Coordination score cannot exceed 100"),
});

type SpeedAgilityFormData = z.infer<typeof speedAgilitySchema>;

interface SpeedAgilityFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const SpeedAgilityForm: React.FC<SpeedAgilityFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection } = useStatsWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<SpeedAgilityFormData>({
    resolver: zodResolver(speedAgilitySchema),
    mode: "onChange",
    defaultValues: {
      sprintSpeed: formData.speedAgility.sprintSpeed || undefined,
      acceleration: formData.speedAgility.acceleration || undefined,
      agility: formData.speedAgility.agility || undefined,
      reactionTime: formData.speedAgility.reactionTime || undefined,
      balance: formData.speedAgility.balance || undefined,
      coordination: formData.speedAgility.coordination || undefined,
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
        updateFormSection("speedAgility", cleanData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFormSection]);

  const onSubmit = async (data: SpeedAgilityFormData) => {
    setIsSubmitting(true);

    try {
      updateFormSection("speedAgility", data);
      onNext();
    } catch (error) {
      console.error("Error submitting speed agility data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Speed & Agility Assessment
        </h2>
        <p className="text-gray-600">
          Record speed, agility, and coordination test results
        </p>
      </div>

      {/* Scoring Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base text-amber-900">
            📊 Scoring Guidelines (0-100 scale)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Sprint Speed:</strong> 40m time (lower = higher score)
              </p>
              <p>
                <strong>Acceleration:</strong> 10m time (lower = higher score)
              </p>
              <p>
                <strong>Agility:</strong> T-drill time (lower = higher score)
              </p>
            </div>
            <div>
              <p>
                <strong>Reaction Time:</strong> Response speed (lower = higher
                score)
              </p>
              <p>
                <strong>Balance:</strong> Single-leg stand duration
              </p>
              <p>
                <strong>Coordination:</strong> Ball catch success rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sprint Speed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-600" />
              Sprint Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sprintSpeed">Speed Score (0-100)</Label>
              <Input
                id="sprintSpeed"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("sprintSpeed", { valueAsNumber: true })}
                className={errors.sprintSpeed ? "border-red-300" : ""}
              />
              {errors.sprintSpeed && (
                <p className="text-sm text-red-600">
                  {errors.sprintSpeed.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Based on 40-meter sprint time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceleration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Gauge className="w-4 h-4 mr-2 text-indigo-600" />
              Acceleration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="acceleration">Acceleration Score (0-100)</Label>
              <Input
                id="acceleration"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("acceleration", { valueAsNumber: true })}
                className={errors.acceleration ? "border-red-300" : ""}
              />
              {errors.acceleration && (
                <p className="text-sm text-red-600">
                  {errors.acceleration.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Based on 10-meter sprint time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Target className="w-4 h-4 mr-2 text-indigo-600" />
              Agility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="agility">Agility Score (0-100)</Label>
              <Input
                id="agility"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("agility", { valueAsNumber: true })}
                className={errors.agility ? "border-red-300" : ""}
              />
              {errors.agility && (
                <p className="text-sm text-red-600">{errors.agility.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Based on T-drill performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reaction Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Timer className="w-4 h-4 mr-2 text-indigo-600" />
              Reaction Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="reactionTime">Reaction Score (0-100)</Label>
              <Input
                id="reactionTime"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("reactionTime", { valueAsNumber: true })}
                className={errors.reactionTime ? "border-red-300" : ""}
              />
              {errors.reactionTime && (
                <p className="text-sm text-red-600">
                  {errors.reactionTime.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Based on visual/audio response test
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-600" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance Score (0-100)</Label>
              <Input
                id="balance"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("balance", { valueAsNumber: true })}
                className={errors.balance ? "border-red-300" : ""}
              />
              {errors.balance && (
                <p className="text-sm text-red-600">{errors.balance.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Based on single-leg stand duration
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coordination */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Target className="w-4 h-4 mr-2 text-indigo-600" />
              Coordination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="coordination">Coordination Score (0-100)</Label>
              <Input
                id="coordination"
                type="number"
                step="0.1"
                placeholder="0.0"
                {...register("coordination", { valueAsNumber: true })}
                className={errors.coordination ? "border-red-300" : ""}
              />
              {errors.coordination && (
                <p className="text-sm text-red-600">
                  {errors.coordination.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Based on ball catch success rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Score Display */}
      {Object.values(watchedValues).every(
        (val) => val !== undefined && val !== null
      ) && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Overall Speed & Agility Score
                </p>
                <p className="text-xs text-green-700">
                  Average of all speed and agility components
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">
                  {(
                    Object.values(watchedValues).reduce(
                      (sum, val) => sum + (val || 0),
                      0
                    ) / 6
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
              ? "✅ All speed assessments completed"
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

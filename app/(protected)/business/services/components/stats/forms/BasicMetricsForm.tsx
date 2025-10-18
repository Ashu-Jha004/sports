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
  Ruler,
  Scale,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";

// Validation Schema
const basicMetricsSchema = z.object({
  height: z
    .number()
    .min(100, "Height must be at least 100cm")
    .max(250, "Height cannot exceed 250cm"),
  weight: z
    .number()
    .min(30, "Weight must be at least 30kg")
    .max(200, "Weight cannot exceed 200kg"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(10, "Age must be at least 10 years")
    .max(50, "Age cannot exceed 50 years"),
  bodyFat: z
    .number()
    .min(3, "Body fat must be at least 3%")
    .max(40, "Body fat cannot exceed 40%"),
});

type BasicMetricsFormData = z.infer<typeof basicMetricsSchema>;

interface BasicMetricsFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const BasicMetricsForm: React.FC<BasicMetricsFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateFormSection, athlete } = useStatsWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BasicMetricsFormData>({
    resolver: zodResolver(basicMetricsSchema),
    mode: "onChange",
    defaultValues: {
      height: formData.basicMetrics.height || undefined,
      weight: formData.basicMetrics.weight || undefined,
      age: formData.basicMetrics.age || undefined,
      bodyFat: formData.basicMetrics.bodyFat || undefined,
    },
  });

  // Watch all form values for auto-save
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
        updateFormSection("basicMetrics", cleanData);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateFormSection]);

  const onSubmit = async (data: BasicMetricsFormData) => {
    setIsSubmitting(true);

    try {
      // Update store with validated data
      updateFormSection("basicMetrics", data);

      // Proceed to next step
      onNext();
    } catch (error) {
      console.error("Error submitting basic metrics:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate BMI for additional info
  const height = watchedValues.height;
  const weight = watchedValues.weight;
  const bmi =
    height && weight ? (weight / (height / 100) ** 2).toFixed(1) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Basic Physical Measurements
        </h2>
        <p className="text-gray-600">
          Enter the athlete's basic physical measurements
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Height */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Ruler className="w-4 h-4 mr-2 text-indigo-600" />
              Height
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="175.0"
                {...register("height", { valueAsNumber: true })}
                className={errors.height ? "border-red-300" : ""}
              />
              {errors.height && (
                <p className="text-sm text-red-600">{errors.height.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Measure without shoes against a wall
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weight */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Scale className="w-4 h-4 mr-2 text-indigo-600" />
              Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.0"
                {...register("weight", { valueAsNumber: true })}
                className={errors.weight ? "border-red-300" : ""}
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Weigh in minimal clothing on flat surface
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Age */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
              Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                {...register("age", { valueAsNumber: true })}
                className={errors.age ? "border-red-300" : ""}
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Complete years as of today
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Body Fat */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-600" />
              Body Fat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                placeholder="15.0"
                {...register("bodyFat", { valueAsNumber: true })}
                className={errors.bodyFat ? "border-red-300" : ""}
              />
              {errors.bodyFat && (
                <p className="text-sm text-red-600">{errors.bodyFat.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Use calipers or bioelectrical impedance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BMI Display */}
      {bmi && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Calculated BMI
                </p>
                <p className="text-xs text-blue-700">
                  Body Mass Index (for reference only)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">{bmi}</p>
                <p className="text-xs text-blue-700">
                  {parseFloat(bmi) < 18.5
                    ? "Underweight"
                    : parseFloat(bmi) < 25
                    ? "Normal"
                    : parseFloat(bmi) < 30
                    ? "Overweight"
                    : "Obese"}
                </p>
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
            Please correct the following errors before proceeding:
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

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button type="button" onClick={onPrevious} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {Object.keys(errors).length === 0 && isValid
              ? "✅ All measurements validated"
              : "Complete all required fields to continue"}
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

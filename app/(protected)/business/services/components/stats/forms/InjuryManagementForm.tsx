import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  Calendar,
  MapPin,
  AlertCircle,
  Info,
} from "lucide-react";
import { useStatsWizardStore } from "@/store/statsWizardStore";

interface InjuryFormData {
  id?: string;
  type: string;
  bodyPart: string;
  severity: "mild" | "moderate" | "severe";
  occurredAt: string;
  recoveryTime: number | null;
  recoveredAt: string | null;
  status: "active" | "recovering" | "recovered";
  notes: string;
}

interface InjuryManagementFormProps {
  onNext: () => void;
  onPrevious: () => void;
}

const INJURY_TYPES = [
  "Sprain",
  "Strain",
  "Fracture",
  "Dislocation",
  "Concussion",
  "Contusion",
  "Laceration",
  "Tendinitis",
  "Bursitis",
  "Other",
];

const BODY_PARTS = [
  "Head",
  "Neck",
  "Shoulder",
  "Arm",
  "Elbow",
  "Wrist",
  "Hand",
  "Chest",
  "Back",
  "Abdomen",
  "Hip",
  "Thigh",
  "Knee",
  "Shin",
  "Calf",
  "Ankle",
  "Foot",
  "Other",
];

export const InjuryManagementForm: React.FC<InjuryManagementFormProps> = ({
  onNext,
  onPrevious,
}) => {
  const { formData, updateInjuries, addInjury, removeInjury, updateInjury } =
    useStatsWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const injuries = formData.injuries || [];

  // Validation function
  const validateInjuries = (): boolean => {
    const newErrors: Record<string, string> = {};

    injuries.forEach((injury, index) => {
      if (!injury.type.trim()) {
        newErrors[`type-${index}`] = "Injury type is required";
      }
      if (!injury.bodyPart.trim()) {
        newErrors[`bodyPart-${index}`] = "Body part is required";
      }
      if (!injury.occurredAt) {
        newErrors[`occurredAt-${index}`] = "Occurrence date is required";
      }
      if (injury.status === "recovered" && !injury.recoveredAt) {
        newErrors[`recoveredAt-${index}`] =
          "Recovery date is required for recovered injuries";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInjury = () => {
    addInjury();
  };

  const handleRemoveInjury = (index: number) => {
    removeInjury(index);
    // Clear errors for removed injury
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.includes(`-${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleInjuryUpdate = (
    index: number,
    field: keyof InjuryFormData,
    value: any
  ) => {
    updateInjury(index, { [field]: value });

    // Clear error for this field
    const errorKey = `${field}-${index}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    if (!validateInjuries()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Data is already in store via updateInjury calls
      onNext();
    } catch (error) {
      console.error("Error submitting injury data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800 border-green-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "severe":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-300";
      case "recovering":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "recovered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Injury Assessment & Documentation
        </h2>
        <p className="text-gray-600">
          Record current and past injuries affecting performance
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="font-medium mb-1">Important Guidelines:</div>
          <ul className="text-sm space-y-1">
            <li>
              • Document all injuries from the past 12 months that may affect
              performance
            </li>
            <li>
              • Include both current active injuries and recently recovered ones
            </li>
            <li>
              • Be thorough - even minor issues can impact training
              effectiveness
            </li>
            <li>
              • If no injuries, you can leave this section empty and proceed
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Add Injury Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Injury Records {injuries.length > 0 && `(${injuries.length})`}
        </h3>
        <Button
          type="button"
          onClick={handleAddInjury}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Injury
        </Button>
      </div>

      {/* Injury Forms */}
      {injuries.length === 0 ? (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Injuries Recorded
            </h3>
            <p className="text-gray-600 mb-4">
              Great! No current or recent injuries to document. You can proceed
              to the next step, or add any relevant injury history using the
              button above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {injuries.map((injury, index) => (
            <Card key={index} className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Injury #{index + 1}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityBadgeColor(injury.severity)}>
                      {injury.severity}
                    </Badge>
                    <Badge className={getStatusBadgeColor(injury.status)}>
                      {injury.status}
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => handleRemoveInjury(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Injury Type */}
                  <div className="space-y-2">
                    <Label>Injury Type *</Label>
                    <Select
                      value={injury.type}
                      onValueChange={(value) =>
                        handleInjuryUpdate(index, "type", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors[`type-${index}`] ? "border-red-300" : ""
                        }
                      >
                        <SelectValue placeholder="Select injury type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INJURY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`type-${index}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`type-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Body Part */}
                  <div className="space-y-2">
                    <Label>Body Part *</Label>
                    <Select
                      value={injury.bodyPart}
                      onValueChange={(value) =>
                        handleInjuryUpdate(index, "bodyPart", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors[`bodyPart-${index}`] ? "border-red-300" : ""
                        }
                      >
                        <SelectValue placeholder="Select body part" />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_PARTS.map((part) => (
                          <SelectItem key={part} value={part}>
                            {part}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[`bodyPart-${index}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`bodyPart-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Severity */}
                  <div className="space-y-2">
                    <Label>Severity *</Label>
                    <Select
                      value={injury.severity}
                      onValueChange={(value) =>
                        handleInjuryUpdate(
                          index,
                          "severity",
                          value as "mild" | "moderate" | "severe"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Occurred Date */}
                  <div className="space-y-2">
                    <Label>Date Occurred *</Label>
                    <Input
                      type="date"
                      value={injury.occurredAt}
                      onChange={(e) =>
                        handleInjuryUpdate(index, "occurredAt", e.target.value)
                      }
                      className={
                        errors[`occurredAt-${index}`] ? "border-red-300" : ""
                      }
                    />
                    {errors[`occurredAt-${index}`] && (
                      <p className="text-sm text-red-600">
                        {errors[`occurredAt-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Current Status *</Label>
                    <Select
                      value={injury.status}
                      onValueChange={(value) =>
                        handleInjuryUpdate(
                          index,
                          "status",
                          value as "active" | "recovering" | "recovered"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="recovering">Recovering</SelectItem>
                        <SelectItem value="recovered">Recovered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recovery Time */}
                  <div className="space-y-2">
                    <Label>Expected Recovery (days)</Label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={injury.recoveryTime || ""}
                      onChange={(e) =>
                        handleInjuryUpdate(
                          index,
                          "recoveryTime",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </div>

                  {/* Recovery Date - only show if status is recovered */}
                  {injury.status === "recovered" && (
                    <div className="space-y-2">
                      <Label>Recovery Date *</Label>
                      <Input
                        type="date"
                        value={injury.recoveredAt || ""}
                        onChange={(e) =>
                          handleInjuryUpdate(
                            index,
                            "recoveredAt",
                            e.target.value
                          )
                        }
                        className={
                          errors[`recoveredAt-${index}`] ? "border-red-300" : ""
                        }
                      />
                      {errors[`recoveredAt-${index}`] && (
                        <p className="text-sm text-red-600">
                          {errors[`recoveredAt-${index}`]}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="mt-4 space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Additional details about the injury, treatment, or impact on performance..."
                    value={injury.notes}
                    onChange={(e) =>
                      handleInjuryUpdate(index, "notes", e.target.value)
                    }
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {injuries.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-900">
                  {injuries.filter((i) => i.status === "active").length}
                </p>
                <p className="text-sm text-amber-700">Active Injuries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">
                  {injuries.filter((i) => i.status === "recovering").length}
                </p>
                <p className="text-sm text-amber-700">Recovering</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">
                  {injuries.filter((i) => i.status === "recovered").length}
                </p>
                <p className="text-sm text-amber-700">Recovered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the following errors before continuing:
            <ul className="mt-2 list-disc list-inside">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
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
            {Object.keys(errors).length === 0
              ? "✅ Injury documentation complete"
              : "Please fix errors above to continue"}
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Next Step"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

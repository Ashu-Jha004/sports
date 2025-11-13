import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Zap, Info } from "lucide-react";
import {
  TenMeterSprintTest,
  AnthropometricData,
} from "@/lib/stats/types/speedAgilityTests";
import { calculateTenMeterSprintMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface TenMeterSprintInputProps {
  value: TenMeterSprintTest | undefined;
  onChange: (data: TenMeterSprintTest) => void;
  anthropometricData?: AnthropometricData;
  onAnthropometricChange?: (data: AnthropometricData) => void;
}

export const TenMeterSprintInput: React.FC<TenMeterSprintInputProps> = ({
  value,
  onChange,
  anthropometricData,
  onAnthropometricChange,
}) => {
  const attempts = value?.attempts || [];
  const sharedAnthro = value?.anthropometricData || anthropometricData || {};

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      sprintTime: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateTenMeterSprintMetrics(updatedTest));
  };

  const removeAttempt = (index: number) => {
    const updatedAttempts = attempts.filter((_, i) => i !== index);
    const renumbered = updatedAttempts.map((att, idx) => ({
      ...att,
      attemptNumber: idx + 1,
    }));

    const updatedTest = {
      ...value,
      attempts: renumbered,
    };

    onChange(calculateTenMeterSprintMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
      anthropometricData: sharedAnthro,
    };

    onChange(calculateTenMeterSprintMetrics(updatedTest));
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      ...value,
      attempts: updatedAttempts,
    });
  };

  const updateAnthropometric = (
    field: keyof AnthropometricData,
    val: number
  ) => {
    const updated = { ...sharedAnthro, [field]: val };

    // Update globally if handler provided
    if (onAnthropometricChange) {
      onAnthropometricChange(updated);
    }

    // Also store with test
    onChange({
      ...value,
      attempts: value?.attempts || [],
      anthropometricData: updated,
    });
  };

  const bestTime = value?.bestTime;
  const meanTime = value?.meanTime;

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-600" />
            10-Meter Sprint Test
          </span>
          <Button
            type="button"
            size="sm"
            onClick={addAttempt}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Attempt
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment & Instructions */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Stopwatch, Measuring tape, 2 cones/markers</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Set up 10-meter course with markers</li>
              <li>Start from standing position</li>
              <li>Sprint maximally for 10 meters</li>
              <li>Record time from start signal to crossing finish line</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Anthropometric Measurements (Optional) */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Anthropometric Measurements (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Thigh Girth (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={sharedAnthro.thighGirth || ""}
                onChange={(e) =>
                  updateAnthropometric(
                    "thighGirth",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 55"
              />
            </div>
            <div>
              <Label className="text-xs">Calf Girth (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={sharedAnthro.calfGirth || ""}
                onChange={(e) =>
                  updateAnthropometric(
                    "calfGirth",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 38"
              />
            </div>
            <div>
              <Label className="text-xs">Arm Span (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={sharedAnthro.armSpan || ""}
                onChange={(e) =>
                  updateAnthropometric(
                    "armSpan",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 180"
              />
            </div>
            <div>
              <Label className="text-xs">Foot Length (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={sharedAnthro.footLength || ""}
                onChange={(e) =>
                  updateAnthropometric(
                    "footLength",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="e.g., 27"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attempts */}
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No attempts recorded. Click "Add Attempt" to begin.
          </p>
        ) : (
          <>
            {attempts.map((attempt, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    Attempt {attempt.attemptNumber}
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttempt(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Sprint Time (seconds) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.sprintTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "sprintTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 1.85"
                    />
                    {attempt.sprintTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.sprintTime < 1.8
                          ? "⚡ Elite level"
                          : attempt.sprintTime < 2.2
                          ? "✅ Good"
                          : attempt.sprintTime < 2.8
                          ? "📊 Average"
                          : "⏱️ Needs improvement"}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">
                      Standing Long Jump (cm) - Optional
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      value={attempt.standingLongJump || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "standingLongJump",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 240"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For correlation with sprint performance
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., wind assisted, tired legs, personal best"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {(bestTime || meanTime) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestTime && (
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        Best Time
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {bestTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        Average Time
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {meanTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Guidelines */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Times (10m):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 1.6-1.8 seconds</li>
            <li>Good athletes: 1.9-2.2 seconds</li>
            <li>Average athletes: 2.3-3.0 seconds</li>
          </ul>
          <p className="text-amber-700 font-medium mt-2">
            💡 Tip: Measure acceleration ability. Best performed when fresh.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

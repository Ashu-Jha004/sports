import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Zap } from "lucide-react";
import { LoadedSquatJumpTest } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";

interface LoadedSquatJumpInputProps {
  value: LoadedSquatJumpTest | undefined;
  bodyWeight: number;
  onChange: (data: LoadedSquatJumpTest) => void;
}

export const LoadedSquatJumpInput: React.FC<LoadedSquatJumpInputProps> = ({
  value,
  bodyWeight,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        load: 0,
        standingReach: 0,
        jumpReach: 0,
        jumpHeight: 0,
        flightTime: undefined,
      },
      notes: "",
    };

    onChange({
      bodyWeight: bodyWeight,
      attempts: [...attempts, newAttempt],
      bestAttempt: undefined,
    });
  };

  const removeAttempt = (index: number) => {
    const updatedAttempts = attempts.filter((_, i) => i !== index);
    const renumbered = updatedAttempts.map((att, idx) => ({
      ...att,
      attemptNumber: idx + 1,
    }));

    onChange({
      bodyWeight: bodyWeight,
      attempts: renumbered,
      bestAttempt: undefined,
    });
  };

  const updateAttempt = (index: number, field: string, value: number) => {
    const updatedAttempts = attempts.map((att, idx) => {
      if (idx !== index) return att;

      const updatedData = { ...att.data, [field]: value };

      // Auto-calculate jump height from reach difference
      if (field === "standingReach" || field === "jumpReach") {
        updatedData.jumpHeight = StrengthCalculations.calculateJumpHeight(
          updatedData.standingReach,
          updatedData.jumpReach
        );
      }

      // If flight time is provided, recalculate jump height from it
      if (field === "flightTime" && value > 0) {
        updatedData.jumpHeight =
          StrengthCalculations.calculateJumpHeightFromFlightTime(value);
      }

      return { ...att, data: updatedData };
    });

    onChange({
      bodyWeight: bodyWeight,
      attempts: updatedAttempts,
      bestAttempt: value?.bestAttempt,
    });
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      bodyWeight: bodyWeight,
      attempts: updatedAttempts,
      bestAttempt: value?.bestAttempt,
    });
  };

  const bestJumpHeight =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.data.jumpHeight || 0))
      : 0;

  const bestAttemptData = attempts.find(
    (a) => a.data.jumpHeight === bestJumpHeight
  );
  const peakPower = bestAttemptData
    ? StrengthCalculations.estimatePeakPower(
        bestJumpHeight,
        bodyWeight + bestAttemptData.data.load
      )
    : 0;
  const relativePower = bodyWeight > 0 ? peakPower / bodyWeight : 0;

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-orange-600" />
            Loaded Squat Jump
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
                  <div>
                    <Label className="text-xs">Load (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={attempt.data.load || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "load",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 20"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Total: {(bodyWeight + attempt.data.load).toFixed(1)}kg
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">
                      Flight Time (s) - Optional
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.data.flightTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "flightTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 0.65"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Standing Reach (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={attempt.data.standingReach || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "standingReach",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 240"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Jump Reach (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={attempt.data.jumpReach || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "jumpReach",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 285"
                    />
                  </div>
                </div>

                {attempt.data.jumpHeight !== undefined &&
                  attempt.data.jumpHeight > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2 space-y-1">
                      <p className="text-sm font-medium text-orange-900">
                        Jump Height: {attempt.data.jumpHeight.toFixed(1)} cm
                      </p>
                      <p className="text-xs text-orange-700">
                        Est. Peak Power:{" "}
                        {StrengthCalculations.estimatePeakPower(
                          attempt.data.jumpHeight,
                          bodyWeight + attempt.data.load
                        ).toFixed(0)}{" "}
                        W
                      </p>
                      <p className="text-xs text-orange-700">
                        Relative:{" "}
                        {StrengthCalculations.calculateRelativePower(
                          StrengthCalculations.estimatePeakPower(
                            attempt.data.jumpHeight,
                            bodyWeight + attempt.data.load
                          ),
                          bodyWeight
                        ).toFixed(1)}{" "}
                        W/kg
                      </p>
                    </div>
                  )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., good depth, explosive"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestJumpHeight > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-orange-900">
                      Best Jump
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {bestJumpHeight.toFixed(1)}{" "}
                      <span className="text-sm">cm</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-orange-700">
                    <div>Peak Power: {peakPower.toFixed(0)} W</div>
                    <div>Relative: {relativePower.toFixed(1)} W/kg</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🏋️ How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Hold weight (barbell, dumbbells, or weighted vest)</li>
            <li>Start from squat position (no countermovement)</li>
            <li>Jump explosively, marking wall at peak height</li>
            <li>Optional: Use phone app to measure flight time</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

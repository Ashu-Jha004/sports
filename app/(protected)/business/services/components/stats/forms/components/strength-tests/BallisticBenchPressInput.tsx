import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Zap } from "lucide-react";
import { BallisticBenchPressTest } from "@/lib/stats/types/strengthTests";

interface BallisticBenchPressInputProps {
  value: BallisticBenchPressTest | undefined;
  onChange: (data: BallisticBenchPressTest) => void;
}

export const BallisticBenchPressInput: React.FC<
  BallisticBenchPressInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        load: 0,
        reps: 0,
        timeLimit: 120, // Default 2 minutes
        completedInTime: true,
      },
      notes: "",
    };

    onChange({
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
      attempts: renumbered,
      bestAttempt: undefined,
    });
  };

  const updateAttempt = (
    index: number,
    field: string,
    value: number | boolean
  ) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, data: { ...att.data, [field]: value } } : att
    );

    onChange({
      attempts: updatedAttempts,
    });
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      attempts: updatedAttempts,
      bestAttempt: value?.bestAttempt,
    });
  };

  const bestReps =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.data.reps || 0))
      : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-red-600" />
            Ballistic Bench Press
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
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reps Completed</Label>
                    <Input
                      type="number"
                      value={attempt.data.reps || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "reps",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Time Limit (seconds)</Label>
                  <Input
                    type="number"
                    value={attempt.data.timeLimit || ""}
                    onChange={(e) =>
                      updateAttempt(
                        index,
                        "timeLimit",
                        parseInt(e.target.value) || 120
                      )
                    }
                    placeholder="120"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    = {formatTime(attempt.data.timeLimit)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`completed-${index}`}
                    checked={attempt.data.completedInTime}
                    onCheckedChange={(checked) =>
                      updateAttempt(index, "completedInTime", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`completed-${index}`}
                    className="text-sm cursor-pointer"
                  >
                    All reps completed within time limit
                  </Label>
                </div>

                {attempt.data.reps > 0 && attempt.data.timeLimit > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs font-medium text-red-900">
                      Average:{" "}
                      {(attempt.data.timeLimit / attempt.data.reps).toFixed(1)}s
                      per rep
                    </p>
                    <p className="text-xs text-red-700">
                      Rep rate:{" "}
                      {(
                        attempt.data.reps /
                        (attempt.data.timeLimit / 60)
                      ).toFixed(1)}{" "}
                      reps/min
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., strong start, fatigued at end"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestReps > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Best Attempt
                    </p>
                    <p className="text-xs text-red-700">Most reps completed</p>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {bestReps} <span className="text-sm">reps</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">💥 How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Use moderate load (40-60% of 1RM for power focus)</li>
            <li>Perform reps as explosively as possible</li>
            <li>Full range of motion - chest to lockout</li>
            <li>Count total reps completed in time limit (typically 2 min)</li>
            <li>Maintain explosive speed - stop if slowing significantly</li>
          </ol>
          <p className="mt-2 text-blue-700 font-medium">
            💡 Focus on speed and power, not max reps
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

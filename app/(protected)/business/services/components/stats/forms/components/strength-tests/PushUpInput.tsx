import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Activity } from "lucide-react";
import { PushUpTest } from "@/lib/stats/types/strengthTests";

interface PushUpInputProps {
  value: PushUpTest | undefined;
  onChange: (data: PushUpTest) => void;
}

export const PushUpInput: React.FC<PushUpInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        reps: 0,
        timeLimit: 60, // Default 1 minute
        formQuality: "standard" as const,
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
    value: number | string
  ) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, data: { ...att.data, [field]: value } } : att
    );

    onChange({
      attempts: updatedAttempts,
      bestAttempt: value?.bestAttempt,
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
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-4 h-4 mr-2 text-green-600" />
            Push-Ups
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
                      placeholder="e.g., 45"
                    />
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
                          parseInt(e.target.value) || 60
                        )
                      }
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      = {formatTime(attempt.data.timeLimit)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Form Quality</Label>
                  <RadioGroup
                    value={attempt.data.formQuality || "standard"}
                    onValueChange={(value) =>
                      updateAttempt(index, "formQuality", value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="strict" id={`strict-${index}`} />
                      <Label
                        htmlFor={`strict-${index}`}
                        className="text-sm cursor-pointer"
                      >
                        Strict (chest to ground, full extension)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="standard"
                        id={`standard-${index}`}
                      />
                      <Label
                        htmlFor={`standard-${index}`}
                        className="text-sm cursor-pointer"
                      >
                        Standard (90° elbow, controlled)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {attempt.data.reps > 0 && attempt.data.timeLimit > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-xs font-medium text-green-900">
                      Average:{" "}
                      {(attempt.data.timeLimit / attempt.data.reps).toFixed(1)}s
                      per rep
                    </p>
                    <p className="text-xs text-green-700">
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
                    placeholder="e.g., maintained form throughout"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestReps > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Best Attempt
                    </p>
                    <p className="text-xs text-green-700">
                      Most reps completed
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {bestReps} <span className="text-sm">reps</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">✋ How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Start in high plank position, hands shoulder-width</li>
            <li>
              Lower body until chest nearly touches ground (or 90° elbows)
            </li>
            <li>Push back up to full arm extension</li>
            <li>Maintain straight body line throughout</li>
            <li>Count total reps in time limit (typically 60 seconds)</li>
          </ol>
          <p className="mt-2 text-gray-700">
            <strong>Strict:</strong> Chest to ground + full lockout
            <br />
            <strong>Standard:</strong> 90° elbow bend minimum
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

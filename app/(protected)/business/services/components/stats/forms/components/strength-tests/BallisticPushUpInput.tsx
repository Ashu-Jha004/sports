import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Rocket } from "lucide-react";
import { BallisticPushUpTest } from "@/lib/stats/types/strengthTests";

interface BallisticPushUpInputProps {
  value: BallisticPushUpTest | undefined;
  onChange: (data: BallisticPushUpTest) => void;
}

export const BallisticPushUpInput: React.FC<BallisticPushUpInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        reps: 0,
        load: 0,
        timeUsed: 0,
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

  const updateAttempt = (index: number, field: string, value: number) => {
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
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Rocket className="w-4 h-4 mr-2 text-amber-600" />
            Ballistic Push-Ups
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
                      placeholder="e.g., 30"
                    />
                  </div>
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
                      placeholder="0 for bodyweight"
                    />
                    {attempt.data.load > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Using weighted vest/plate
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Time Used (seconds)</Label>
                  <Input
                    type="number"
                    value={attempt.data.timeUsed || ""}
                    onChange={(e) =>
                      updateAttempt(
                        index,
                        "timeUsed",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 115"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Max time: 120s (2 minutes) - Used:{" "}
                    {formatTime(attempt.data.timeUsed)}
                  </p>
                </div>

                {attempt.data.reps > 0 && attempt.data.timeUsed > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                    <p className="text-xs font-medium text-amber-900">
                      Average:{" "}
                      {(attempt.data.timeUsed / attempt.data.reps).toFixed(2)}s
                      per rep
                    </p>
                    <p className="text-xs text-amber-700">
                      Rep rate:{" "}
                      {(
                        attempt.data.reps /
                        (attempt.data.timeUsed / 60)
                      ).toFixed(1)}{" "}
                      reps/min
                    </p>
                    {attempt.data.load > 0 && (
                      <p className="text-xs text-amber-700">
                        Power index:{" "}
                        {(attempt.data.reps * attempt.data.load).toFixed(0)}{" "}
                        (reps × load)
                      </p>
                    )}
                  </div>
                )}

                {attempt.data.timeUsed > 120 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded p-2">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Exceeded 2-minute time limit
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., explosive throughout, hands left ground"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestReps > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Best Attempt
                    </p>
                    <p className="text-xs text-amber-700">
                      Most explosive reps
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {bestReps} <span className="text-sm">reps</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🚀 How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Start in standard push-up position</li>
            <li>Optional: Use weighted vest or place plate on back</li>
            <li>Perform explosive push-ups (aim for hands leaving ground)</li>
            <li>Complete as many reps as possible in 2 minutes</li>
            <li>Focus on maximum explosiveness, not just speed</li>
          </ol>
          <p className="mt-2 text-amber-800 font-medium">
            💡 Can be clap push-ups or plyometric variations
          </p>
          <p className="text-gray-700">
            <strong>Scoring:</strong> Higher reps with load = better power
            output
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

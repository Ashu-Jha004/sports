import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { PullUpsTest } from "@/lib/stats/types/strengthTests";

interface PullUpsInputProps {
  value: PullUpsTest | undefined;
  onChange: (data: PullUpsTest) => void;
}

export const PullUpsInput: React.FC<PullUpsInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        reps: 0,
        timeLimit: 300,
        timeUsed: 0,
        formQuality: "strict" as const,
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
    });
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      attempts: updatedAttempts,
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
      ? `${mins}m ${secs.toString().padStart(2, "0")}s`
      : `${secs}s`;
  };

  return (
    <Card className="border-blue-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-blue-800" />
            Pull-Ups (Bodyweight)
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
                    <Label className="text-xs">Total Reps</Label>
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
                      placeholder="e.g., 20"
                    />
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
                      placeholder="e.g., 180"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Limit: {formatTime(attempt.data.timeLimit || 300)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Form Quality</Label>
                  <RadioGroup
                    value={attempt.data.formQuality || "strict"}
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
                        Strict (full lockout, chin over bar)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kipping" id={`kipping-${index}`} />
                      <Label
                        htmlFor={`kipping-${index}`}
                        className="text-sm cursor-pointer"
                      >
                        Kipping (use of momentum)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., strict form, last reps slow"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestReps > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Best Attempt
                    </p>
                    <p className="text-xs text-blue-700">Most total reps</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {bestReps} <span className="text-sm">reps</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🏆 How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Start hanging with arms fully extended</li>
            <li>Pull chin clearly over the bar (“strict”)</li>
            <li>Legs may move for “kipping” if chosen</li>
            <li>Perform as many reps as possible, strict form preferred</li>
            <li>Record time used, up to 5 minutes maximum</li>
          </ol>
          <p className="mt-2 text-blue-800">
            <strong>Strict</strong>: Full lockout at bottom, control every rep.
            <br />
            <strong>Kipping</strong>: Controlled swing/momentum allowed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

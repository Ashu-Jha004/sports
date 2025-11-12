import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Timer } from "lucide-react";
import { PlankHoldTest } from "@/lib/stats/types/strengthTests";

interface PlankHoldInputProps {
  value: PlankHoldTest | undefined;
  onChange: (data: PlankHoldTest) => void;
}

export const PlankHoldInput: React.FC<PlankHoldInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        duration: 0,
        load: 0,
        formBreakdown: false,
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

  const bestDuration =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.data.duration || 0))
      : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Timer className="w-4 h-4 mr-2 text-purple-600" />
            Plank Hold
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
                    <Label className="text-xs">Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={attempt.data.duration || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "duration",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 120"
                    />
                    {attempt.data.duration > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        = {formatTime(attempt.data.duration)}
                      </p>
                    )}
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
                    {attempt.data.load === 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Bodyweight only
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`form-breakdown-${index}`}
                    checked={attempt.data.formBreakdown || false}
                    onCheckedChange={(checked) =>
                      updateAttempt(index, "formBreakdown", checked === true)
                    }
                  />
                  <Label
                    htmlFor={`form-breakdown-${index}`}
                    className="text-sm cursor-pointer"
                  >
                    Form broke down before time
                  </Label>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., hips dropped at 90s"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestDuration > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Best Hold
                    </p>
                    <p className="text-xs text-purple-700">Longest duration</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatTime(bestDuration)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🏋️ How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Forearm plank position, body straight from head to heels</li>
            <li>Optional: Place weight plate on back for loaded version</li>
            <li>Hold until form breaks (hips drop or rise)</li>
            <li>Record time when proper form can no longer be maintained</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { CountermovementJumpTest } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";

interface CountermovementJumpInputProps {
  value: CountermovementJumpTest | undefined;
  onChange: (data: CountermovementJumpTest) => void;
}

export const CountermovementJumpInput: React.FC<
  CountermovementJumpInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        standingReach: 0,
        jumpReach: 0,
        jumpHeight: 0,
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
    const updatedAttempts = attempts.map((att, idx) => {
      if (idx !== index) return att;

      const updatedData = { ...att.data, [field]: value };

      // Auto-calculate jump height
      if (field === "standingReach" || field === "jumpReach") {
        updatedData.jumpHeight = StrengthCalculations.calculateJumpHeight(
          updatedData.standingReach,
          updatedData.jumpReach
        );
      }

      return { ...att, data: updatedData };
    });

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

  const bestJumpHeight =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.data.jumpHeight || 0))
      : 0;

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            Countermovement Jump
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
                      placeholder="e.g., 300"
                    />
                  </div>
                </div>

                {attempt.data.jumpHeight !== undefined &&
                  attempt.data.jumpHeight > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-sm font-medium text-green-900">
                        Jump Height: {attempt.data.jumpHeight.toFixed(1)} cm
                      </p>
                      <p className="text-xs text-green-700">
                        Flight Time: ~
                        {StrengthCalculations.estimateFlightTime(
                          attempt.data.jumpHeight
                        ).toFixed(2)}
                        s
                      </p>
                    </div>
                  )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., felt strong, good form"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestJumpHeight > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Best Jump
                    </p>
                    <p className="text-xs text-blue-700">
                      Highest recorded height
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {bestJumpHeight.toFixed(1)}{" "}
                    <span className="text-sm">cm</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📏 How to measure:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>
              Stand flat-footed, reach up with chalk - mark wall (standing
              reach)
            </li>
            <li>Jump as high as possible, mark wall at peak (jump reach)</li>
            <li>Jump height = jump reach - standing reach</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

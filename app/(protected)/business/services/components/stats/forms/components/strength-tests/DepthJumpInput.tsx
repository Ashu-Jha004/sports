import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, TrendingDown } from "lucide-react";
import { DepthJumpTest } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";

interface DepthJumpInputProps {
  value: DepthJumpTest | undefined;
  onChange: (data: DepthJumpTest) => void;
}

export const DepthJumpInput: React.FC<DepthJumpInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        dropHeight: 0,
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

  const bestJumpHeight = attempts.length > 0
    ? Math.max(...attempts.map((a) => a.data.jumpHeight || 0))
    : 0;

  // Estimate contact time from drop height (rough approximation)
  const estimateContactTime = (dropHeight: number): number => {
    // Typical contact times: 30cm drop = ~0.2s, 60cm drop = ~0.25s
    return 0.15 + (dropHeight / 100) * 0.15;
  };

  return (
    <Card className="border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <TrendingDown className="w-4 h-4 mr-2 text-teal-600" />
            Depth Jump
          </span>
          <Button type="button" size="sm" onClick={addAttempt} variant="outline">
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
                  <h4 className="font-medium text-sm">Attempt {attempt.attemptNumber}</h4>
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

                <div>
                  <Label className="text-xs">Drop Height (cm)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={attempt.data.dropHeight || ""}
                    onChange={(e) =>
                      updateAttempt(index, "dropHeight", parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 40"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Height of box/platform to drop from
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Standing Reach (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={attempt.data.standingReach || ""}
                      onChange={(e) =>
                        updateAttempt(index, "standingReach", parseFloat(e.target.value) || 0)
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
                        updateAttempt(index, "jumpReach", parseFloat(e.target.value) || 0)
                      }
                      placeholder="e.g., 295"
                    />
                  </div>
                </div>

                {attempt.data.jumpHeight !== undefined && attempt.data.jumpHeight > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded p-2 space-y-1">
                    <p className="text-sm font-medium text-teal-900">
                      Jump Height: {attempt.data.jumpHeight.toFixed(1)} cm
                    </p>
                    <p className="text-xs text-teal-700">
                      From: {attempt.data.dropHeight}cm drop
                    </p>
                    <p className="text-xs text-teal-700">
                      Est. RSI: {(attempt.data.jumpHeight / estimateContactTime(attempt.data.dropHeight)).toFixed(1)}
                      <span className="ml-1 text-gray-600">(jump height / contact time)</span>
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., quick ground contact, minimal knee bend"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {bestJumpHeight > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-900">Best Jump</p>
                    <p className="text-xs text-teal-700">Highest rebound height</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-900">
                    {bestJumpHeight.toFixed(1)} <span className="text-sm">cm</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📦 How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Start standing on a box/platform (30-60cm height)</li>
            <li>Step off (don't jump down) and land on both feet</li>
            <li>Immediately jump as high as possible upon landing</li>
            <li>Minimize ground contact time - be explosive!</li>
            <li>Mark wall at peak height with chalk</li>
          </ol>
          <p className="mt-2 text-yellow-700 font-medium">
            ⚠️ Advanced test - requires good landing mechanics
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

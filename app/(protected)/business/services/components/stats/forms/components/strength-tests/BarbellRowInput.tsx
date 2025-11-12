import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { BarbellRowTest } from "@/lib/stats/types/strengthTests";

interface BarbellRowInputProps {
  value: BarbellRowTest | undefined;
  onChange: (data: BarbellRowTest) => void;
}

export const BarbellRowInput: React.FC<BarbellRowInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];
  const maxLoad =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.data.load)) : 0;

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        load: 0,
        reps: 0,
        formQuality: "strict" as const,
      },
      notes: "",
    };

    onChange({
      maxLoad: Math.max(maxLoad, newAttempt.data.load),
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
    const newMaxLoad =
      renumbered.length > 0
        ? Math.max(...renumbered.map((a) => a.data.load))
        : 0;

    onChange({
      maxLoad: newMaxLoad,
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
    const newMaxLoad =
      updatedAttempts.length > 0
        ? Math.max(...updatedAttempts.map((a) => a.data.load))
        : 0;

    onChange({
      maxLoad: newMaxLoad,
      attempts: updatedAttempts,
      bestAttempt: undefined,
    });
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      maxLoad: maxLoad,
      attempts: updatedAttempts,
      bestAttempt: undefined,
    });
  };

  const bestReps =
    attempts.length > 0
      ? Math.max(...attempts.map((a) => a.data.reps || 0))
      : 0;

  return (
    <Card className="border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <ArrowRight className="w-4 h-4 mr-2 text-yellow-600" />
            Barbell Row
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
                    <Label className="text-xs">Reps</Label>
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
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Form Quality</Label>
                  <select
                    title="select"
                    className="text-xs border px-2 py-1 rounded"
                    value={attempt.data.formQuality}
                    onChange={(e) =>
                      updateAttempt(index, "formQuality", e.target.value)
                    }
                  >
                    <option value="strict">Strict (no momentum)</option>
                    <option value="momentum">Some momentum</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., back parallel, clean form"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {maxLoad > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Max Load
                    </p>
                    <p className="text-xs text-yellow-700">Heaviest rowed</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {maxLoad} <span className="text-sm">kg</span>
                  </p>
                </div>
              </div>
            )}

            {bestReps > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Best Reps
                    </p>
                    <p className="text-xs text-yellow-700">
                      Most reps in a set
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {bestReps} <span className="text-sm">reps</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">💪 How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>
              Grip barbell just outside knees, hinge at hips, back parallel
            </li>
            <li>Row bar to abdomen, full lockout at bottom</li>
            <li>Strict: No hip or torso movement</li>
            <li>Momentum: Some hip drive allowed to complete reps</li>
            <li>Record load and maximum reps for each attempt</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

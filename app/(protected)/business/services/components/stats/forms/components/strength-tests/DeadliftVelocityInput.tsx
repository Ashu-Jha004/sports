import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Activity } from "lucide-react";
import { DeadliftVelocityTest } from "@/lib/stats/types/strengthTests";

interface DeadliftVelocityInputProps {
  value: DeadliftVelocityTest | undefined;
  onChange: (data: DeadliftVelocityTest) => void;
}

export const DeadliftVelocityInput: React.FC<DeadliftVelocityInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];
  const maxLoad = value?.maxLoad || 0;

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      data: {
        load: 0,
        reps: 1,
        repDuration: undefined,
      },
      notes: "",
    };

    onChange({
      maxLoad,
      attempts: [...attempts, newAttempt],
      maxLoadAttempt: undefined,
    });
  };

  const removeAttempt = (index: number) => {
    const updatedAttempts = attempts.filter((_, i) => i !== index);
    const renumbered = updatedAttempts.map((att, idx) => ({ ...att, attemptNumber: idx + 1 }));

    const newMaxLoad = updatedAttempts.length > 0 ? Math.max(...updatedAttempts.map(a => a.data.load)) : 0;

    onChange({
      maxLoad: newMaxLoad,
      attempts: renumbered,
      maxLoadAttempt: undefined,
    });
  };

  const updateAttempt = (index: number, field: string, value: number) => {
    const updatedAttempts = attempts.map((att, idx) => {
      if (idx !== index) return att;
      return { ...att, data: { ...att.data, [field]: value } };
    });

    const loads = updatedAttempts.map(a => a.data.load);
    const newMaxLoad = Math.max(...loads);

    onChange({
      maxLoad: newMaxLoad,
      attempts: updatedAttempts,
      maxLoadAttempt: loads.indexOf(newMaxLoad),
    });
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      maxLoad,
      attempts: updatedAttempts,
      maxLoadAttempt: undefined,
    });
  };

  return (
    <Card className="border-cyan-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-4 h-4 mr-2 text-cyan-600" />
            Deadlift Velocity
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
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Load (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={attempt.data.load || ""}
                      onChange={(e) =>
                        updateAttempt(index, "load", parseFloat(e.target.value) || 0)
                      }
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      value={attempt.data.reps || ""}
                      onChange={(e) =>
                        updateAttempt(index, "reps", parseInt(e.target.value) || 1)
                      }
                      placeholder="e.g., 1"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rep Duration (s) - optional</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.data.repDuration || ""}
                      onChange={(e) =>
                        updateAttempt(index, "repDuration", parseFloat(e.target.value) || 0)
                      }
                      placeholder="e.g., 2.3"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., smooth reps, steady tempo"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {maxLoad > 0 && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-900">Max Load</p>
                    <p className="text-xs text-cyan-700">Highest load lifted</p>
                  </div>
                  <p className="text-2xl font-bold text-cyan-900">
                    {maxLoad} <span className="text-sm">kg</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🏋️‍♂️ How to perform:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Use maximal or near-maximal loads</li>
            <li>Perform 1-3 reps with maximal velocity on concentric phase</li>
            <li>Record load and rep duration if possible</li>
            <li>Velocity can be estimated using rep duration & bar path</li>
          </ol>
          <p className="mt-2 text-gray-700">
            ⚠️ Use caution with maximal loads and proper technique
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

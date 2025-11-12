import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import {
  WeightedPullUpTest,
  WeightedPullUpSet,
} from "@/lib/stats/types/strengthTests";

interface WeightedPullUpInputProps {
  value: WeightedPullUpTest | undefined;
  bodyWeight: number;
  onChange: (data: WeightedPullUpTest) => void;
}

export const WeightedPullUpInput: React.FC<WeightedPullUpInputProps> = ({
  value,
  bodyWeight,
  onChange,
}) => {
  const sets = value?.sets || [];
  const totalTimeUsed = sets.reduce((sum, set) => sum + set.restAfter, 0);
  const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
  const maxLoad = sets.length > 0 ? Math.max(...sets.map((s) => s.load)) : 0;

  const addSet = () => {
    const newSet: WeightedPullUpSet = {
      load: 0,
      reps: 0,
      restAfter: 0,
    };

    onChange({
      bodyWeight: bodyWeight,
      sets: [...sets, newSet],
      totalTimeUsed: totalTimeUsed,
      totalReps: totalReps,
      maxLoad: maxLoad,
    });
  };

  const removeSet = (index: number) => {
    const updatedSets = sets.filter((_, i) => i !== index);
    const newTotalTime = updatedSets.reduce(
      (sum, set) => sum + set.restAfter,
      0
    );
    const newTotalReps = updatedSets.reduce((sum, set) => sum + set.reps, 0);
    const newMaxLoad =
      updatedSets.length > 0 ? Math.max(...updatedSets.map((s) => s.load)) : 0;

    onChange({
      bodyWeight: bodyWeight,
      sets: updatedSets,
      totalTimeUsed: newTotalTime,
      totalReps: newTotalReps,
      maxLoad: newMaxLoad,
    });
  };

  const updateSet = (
    index: number,
    field: keyof WeightedPullUpSet,
    value: number
  ) => {
    const updatedSets = sets.map((set, idx) =>
      idx === index ? { ...set, [field]: value } : set
    );

    const newTotalTime = updatedSets.reduce(
      (sum, set) => sum + set.restAfter,
      0
    );
    const newTotalReps = updatedSets.reduce((sum, set) => sum + set.reps, 0);
    const newMaxLoad = Math.max(...updatedSets.map((s) => s.load));

    onChange({
      bodyWeight: bodyWeight,
      sets: updatedSets,
      totalTimeUsed: newTotalTime,
      totalReps: newTotalReps,
      maxLoad: newMaxLoad,
    });
  };

  const timeRemaining = 300 - totalTimeUsed;
  const canAddMore = timeRemaining > 0;

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Dumbbell className="w-4 h-4 mr-2 text-indigo-600" />
            Weighted Pull-Ups
          </span>
          <Button
            type="button"
            size="sm"
            onClick={addSet}
            variant="outline"
            disabled={!canAddMore}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Set
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time & Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Time Used</p>
            <p className="text-sm font-semibold">{totalTimeUsed}s</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Total Reps</p>
            <p className="text-sm font-semibold">{totalReps}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600">Max Load</p>
            <p className="text-sm font-semibold">{maxLoad}kg</p>
          </div>
        </div>

        {sets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No sets recorded. Click "Add Set" to begin.
          </p>
        ) : (
          <div className="space-y-3">
            {sets.map((set, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Set {index + 1}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSet(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Load (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={set.load || ""}
                      onChange={(e) =>
                        updateSet(
                          index,
                          "load",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) =>
                        updateSet(index, "reps", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rest (s)</Label>
                    <Input
                      type="number"
                      value={set.restAfter || ""}
                      onChange={(e) =>
                        updateSet(
                          index,
                          "restAfter",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="60"
                    />
                  </div>
                </div>

                {set.load > 0 && (
                  <p className="text-xs text-gray-600">
                    Total load: {(bodyWeight + set.load).toFixed(1)}kg (body +
                    added weight)
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!canAddMore && sets.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="text-xs text-yellow-800">
              ⏱️ 5-minute time limit reached
            </p>
          </div>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">🏋️ Test protocol:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Perform as many sets as possible in 5 minutes</li>
            <li>Use belt/vest/dumbbell for additional load</li>
            <li>Record load (additional weight), reps, and rest time</li>
            <li>Strict form - full extension to chin over bar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

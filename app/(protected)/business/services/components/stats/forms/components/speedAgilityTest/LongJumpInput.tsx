import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowBigRight, Info } from "lucide-react";
import { LongJumpTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateLongJumpMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface LongJumpInputProps {
  value: LongJumpTest | undefined;
  onChange: (data: LongJumpTest) => void;
}

export const LongJumpInput: React.FC<LongJumpInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      distance: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateLongJumpMetrics(updatedTest));
  };

  const removeAttempt = (index: number) => {
    const updatedAttempts = attempts.filter((_, i) => i !== index);
    const renumbered = updatedAttempts.map((att, idx) => ({
      ...att,
      attemptNumber: idx + 1,
    }));

    const updatedTest = {
      ...value,
      attempts: renumbered,
    };

    onChange(calculateLongJumpMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateLongJumpMetrics(updatedTest));
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    onChange({
      ...value,
      attempts: updatedAttempts,
    });
  };

  const bestDistance = value?.bestDistance;
  const meanDistance = value?.meanDistance;

  return (
    <Card className="border-rose-200 bg-rose-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowBigRight className="w-4 h-4 text-rose-600" />
            Long Jump (Running Start)
            <Badge variant="secondary" className="text-xs">
              Optional - Advanced
            </Badge>
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
        <Alert className="bg-rose-50 border-rose-200">
          <Info className="h-4 w-4 text-rose-600" />
          <AlertDescription className="text-sm text-rose-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Measuring tape, Runway space, Sand pit or safe landing area
            </p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Mark a takeoff line with adequate runway (15-20m)</li>
              <li>Sprint down runway building speed</li>
              <li>Plant takeoff foot on/before line and jump forward</li>
              <li>Land in sand pit or marked landing area</li>
              <li>Measure from takeoff line to closest landing mark</li>
              <li>Perform 2-3 attempts, record best distance</li>
            </ol>
            <p className="text-rose-800 font-medium mt-2">
              ⚠️ Requires safe landing area. Skip if not available.
            </p>
          </AlertDescription>
        </Alert>

        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No attempts recorded. Click "Add Attempt" to begin.
          </p>
        ) : (
          <>
            {attempts.map((attempt, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-white"
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
                    <Label className="text-xs">Distance (centimeters) *</Label>
                    <Input
                      type="number"
                      step="1"
                      value={attempt.distance || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "distance",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 520"
                    />
                    {attempt.distance > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {(attempt.distance / 100).toFixed(2)}m |{" "}
                        {attempt.distance < 350
                          ? "⏱️ Below average"
                          : attempt.distance < 450
                          ? "📈 Average"
                          : attempt.distance < 550
                          ? "📊 Good"
                          : attempt.distance < 650
                          ? "✅ Excellent"
                          : "⚡ Elite level"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Run-up Steps (optional)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={attempt.runupSteps || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "runupSteps",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 12"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Typical: 10-16 steps
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., fouled (crossed line), good takeoff angle, stumbled on landing"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {(bestDistance || meanDistance) && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestDistance && (
                    <div>
                      <p className="text-xs font-medium text-rose-900">
                        Best Distance
                      </p>
                      <p className="text-xl font-bold text-rose-900">
                        {bestDistance}cm
                      </p>
                      <p className="text-xs text-rose-700">
                        {(bestDistance / 100).toFixed(2)} meters
                      </p>
                    </div>
                  )}
                  {meanDistance && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-rose-900">
                        Average Distance
                      </p>
                      <p className="text-xl font-bold text-rose-900">
                        {meanDistance.toFixed(0)}cm
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Distances (Running Start):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 650-900cm (6.5-9.0m)</li>
            <li>Good athletes: 500-650cm (5.0-6.5m)</li>
            <li>Average athletes: 350-500cm (3.5-5.0m)</li>
          </ul>
          <p className="font-medium mt-2">🔗 Comparison to Standing:</p>
          <p className="pl-2">
            Typically 1.5-2.5× standing long jump distance due to momentum
          </p>
          <p className="text-rose-700 font-medium mt-2">
            💡 Tip: Combines speed, power, and technique. Requires proper
            facility for safety.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

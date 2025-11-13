import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Maximize2, Info } from "lucide-react";
import { StandingLongJumpTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateStandingLongJumpMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface StandingLongJumpInputProps {
  value: StandingLongJumpTest | undefined;
  onChange: (data: StandingLongJumpTest) => void;
}

export const StandingLongJumpInput: React.FC<StandingLongJumpInputProps> = ({
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

    onChange(calculateStandingLongJumpMetrics(updatedTest));
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

    onChange(calculateStandingLongJumpMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateStandingLongJumpMetrics(updatedTest));
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
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-orange-600" />
            Standing Long Jump
            <Badge variant="secondary" className="text-xs">
              Optional
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
        <Alert className="bg-orange-50 border-orange-200">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Measuring tape, 2 markers/cones</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Stand with toes behind starting line, feet shoulder-width</li>
              <li>Swing arms back and bend knees to prepare</li>
              <li>Jump forward explosively, swinging arms forward</li>
              <li>Land on both feet simultaneously</li>
              <li>Measure from starting line to closest heel mark</li>
              <li>Perform 2-3 attempts, record best distance</li>
            </ol>
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
                    placeholder="e.g., 240"
                  />
                  {attempt.distance > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {(attempt.distance / 100).toFixed(2)}m |{" "}
                      {attempt.distance < 200
                        ? "⏱️ Below average"
                        : attempt.distance < 240
                        ? "📈 Average"
                        : attempt.distance < 270
                        ? "📊 Good"
                        : attempt.distance < 300
                        ? "✅ Excellent"
                        : "⚡ Elite level"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., good arm swing, landed off-balance, personal record"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {(bestDistance || meanDistance) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestDistance && (
                    <div>
                      <p className="text-xs font-medium text-orange-900">
                        Best Distance
                      </p>
                      <p className="text-xl font-bold text-orange-900">
                        {bestDistance}cm
                      </p>
                      <p className="text-xs text-orange-700">
                        {(bestDistance / 100).toFixed(2)} meters
                      </p>
                    </div>
                  )}
                  {meanDistance && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-orange-900">
                        Average Distance
                      </p>
                      <p className="text-xl font-bold text-orange-900">
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
          <p className="font-medium">📊 Reference Distances (Standing):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 280-320cm</li>
            <li>Good athletes: 240-280cm</li>
            <li>Average athletes: 200-240cm</li>
          </ul>
          <p className="text-orange-700 font-medium mt-2">
            💡 Tip: Measures explosive lower body power. Often correlates with
            sprint acceleration ability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

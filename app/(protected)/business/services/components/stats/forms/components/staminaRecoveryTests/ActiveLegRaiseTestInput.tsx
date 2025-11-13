import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Move, Info, AlertTriangle } from "lucide-react";
import { ActiveLegRaiseTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateActiveLegRaiseMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface ActiveLegRaiseTestInputProps {
  value: ActiveLegRaiseTest | undefined;
  onChange: (data: ActiveLegRaiseTest) => void;
}

export const ActiveLegRaiseTestInput: React.FC<
  ActiveLegRaiseTestInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      leftLegAngle: undefined,
      rightLegAngle: undefined,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateActiveLegRaiseMetrics(updatedTest));
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

    onChange(calculateActiveLegRaiseMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateActiveLegRaiseMetrics(updatedTest));
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

  const getAngleRating = (angle: number): string => {
    if (angle >= 90) return "⚡ Excellent (90°+)";
    if (angle >= 70) return "✅ Good (70-89°)";
    if (angle >= 50) return "📊 Average (50-69°)";
    return "🎯 Needs Work (<50°)";
  };

  const bestLeft = value?.bestLeftAngle;
  const bestRight = value?.bestRightAngle;
  const asymmetry = value?.asymmetryScore;
  const flexScore = value?.flexibilityScore;

  return (
    <Card className="border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Move className="w-4 h-4 mr-2 text-teal-600" />
            Active Straight Leg Raise
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
        {/* Equipment & Instructions */}
        <Alert className="bg-teal-50 border-teal-200">
          <Info className="h-4 w-4 text-teal-600" />
          <AlertDescription className="text-sm text-teal-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Wall, Measuring tape OR Smartphone (angle app)
            </p>
            <p className="font-medium mb-1">🦵 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Lie on back with both legs flat on floor</li>
              <li>Keep lower back pressed to floor, arms at sides</li>
              <li>Raise one leg straight up (knee locked)</li>
              <li>Keep opposite leg flat on floor</li>
              <li>Raise as high as possible without bending knee</li>
              <li>Measure angle from floor OR height reached on wall</li>
              <li>Test both legs, 2 attempts per leg</li>
            </ol>
            <p className="mt-2 text-xs text-teal-700">
              💡 <strong>Tip:</strong> Use phone angle app or mark wall height
              at 70° and 90°
            </p>
          </AlertDescription>
        </Alert>

        {/* Attempts */}
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
                  {/* Left Leg */}
                  <div>
                    <Label className="text-xs font-medium">
                      Left Leg Angle (°) *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      value={attempt.leftLegAngle || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "leftLegAngle",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="e.g., 75"
                      className="font-medium"
                    />
                    {attempt.leftLegAngle && (
                      <p className="text-xs text-teal-700 mt-1">
                        {getAngleRating(attempt.leftLegAngle)}
                      </p>
                    )}
                  </div>

                  {/* Right Leg */}
                  <div>
                    <Label className="text-xs font-medium">
                      Right Leg Angle (°) *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      value={attempt.rightLegAngle || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "rightLegAngle",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="e.g., 78"
                      className="font-medium"
                    />
                    {attempt.rightLegAngle && (
                      <p className="text-xs text-teal-700 mt-1">
                        {getAngleRating(attempt.rightLegAngle)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Asymmetry Warning */}
                {attempt.leftLegAngle &&
                  attempt.rightLegAngle &&
                  Math.abs(attempt.leftLegAngle - attempt.rightLegAngle) >
                    10 && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-900">
                        <strong>Asymmetry detected:</strong>{" "}
                        {Math.abs(
                          attempt.leftLegAngle - attempt.rightLegAngle
                        ).toFixed(0)}
                        ° difference between legs. Consider mobility work on the
                        tighter side.
                      </AlertDescription>
                    </Alert>
                  )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., left leg tighter, felt pulling in hamstring"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary Card */}
            {bestLeft !== undefined && bestRight !== undefined && (
              <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Left Leg</p>
                      <p className="text-2xl font-bold text-teal-900">
                        {bestLeft}°
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Best Right Leg</p>
                      <p className="text-2xl font-bold text-teal-900">
                        {bestRight}°
                      </p>
                    </div>

                    {asymmetry !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Asymmetry</p>
                        <p
                          className={`text-2xl font-bold ${
                            asymmetry > 10 ? "text-amber-900" : "text-green-900"
                          }`}
                        >
                          {asymmetry}°
                        </p>
                        <p className="text-xs text-gray-600">
                          {asymmetry <= 5
                            ? "✅ Balanced"
                            : asymmetry <= 10
                            ? "⚠️ Slight"
                            : "🚨 Significant"}
                        </p>
                      </div>
                    )}

                    {flexScore !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">
                          Flexibility Score
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {flexScore}
                          <span className="text-sm text-gray-600 ml-1">
                            /100
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Reference Guide */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Ranges:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Excellent: 90° or more (leg perpendicular to floor)</li>
            <li>Good: 70-89° (strong hamstring flexibility)</li>
            <li>Average: 50-69° (moderate flexibility)</li>
            <li>Poor: Below 50° (tight hamstrings)</li>
            <li>⚠️ Asymmetry &gt;10° may indicate imbalance/injury risk</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

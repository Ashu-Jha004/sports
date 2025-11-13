import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, RotateCw, Info } from "lucide-react";
import { ShoulderRotationTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateShoulderRotationMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface ShoulderRotationTestInputProps {
  value: ShoulderRotationTest | undefined;
  onChange: (data: ShoulderRotationTest) => void;
}

export const ShoulderRotationTestInput: React.FC<
  ShoulderRotationTestInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];
  const anthropometricData = value?.anthropometricData;

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      gripWidth: 0,
      notes: "",
    };

    const updatedTest = {
      ...value,
      attempts: [...attempts, newAttempt],
    };

    onChange(
      calculateShoulderRotationMetrics({
        ...updatedTest,
        attempts: updatedTest.attempts ?? [],
      })
    );
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

    onChange(
      calculateShoulderRotationMetrics({
        ...updatedTest,
        attempts: updatedTest.attempts ?? [],
      })
    );
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(
      calculateShoulderRotationMetrics({
        ...updatedTest,
        attempts: updatedTest.attempts ?? [],
      })
    );
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, notes } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(
      calculateShoulderRotationMetrics({
        ...updatedTest,
        attempts: updatedTest.attempts ?? [],
      })
    );
  };

  const updateAnthropometric = (field: string, val: number) => {
    const updatedTest = {
      ...value,
      anthropometricData: {
        ...anthropometricData,
        [field]: val,
      },
      attempts: value?.attempts ?? [],
    };

    onChange(calculateShoulderRotationMetrics(updatedTest));
  };

  const getMobilityRating = (width: number, shoulderWidth?: number): string => {
    if (shoulderWidth) {
      const ratio = width / shoulderWidth;
      if (ratio <= 1.5) return "⚡ Excellent (<1.5x shoulder width)";
      if (ratio <= 2.0) return "✅ Good (1.5-2x)";
      if (ratio <= 2.5) return "📊 Average (2-2.5x)";
      return "🎯 Needs Work (>2.5x)";
    } else {
      if (width <= 60) return "⚡ Excellent (<60cm)";
      if (width <= 80) return "✅ Good (60-80cm)";
      if (width <= 100) return "📊 Average (80-100cm)";
      return "🎯 Needs Work (>100cm)";
    }
  };

  const bestGripWidth = value?.bestGripWidth;
  const mobilityScore = value?.shoulderMobilityScore;

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <RotateCw className="w-4 h-4 mr-2 text-orange-600" />
            Shoulder Rotation Test
            <span className="text-xs text-gray-500 ml-2">(Optional)</span>
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
        <Alert className="bg-orange-50 border-orange-200">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Dowel/broomstick/rope, Measuring tape</p>
            <p className="font-medium mb-1">💪 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Stand holding dowel/stick with both hands in front</li>
              <li>Start with wide grip (arms extended)</li>
              <li>
                Rotate stick over head and behind back (keep arms straight)
              </li>
              <li>If successful, bring hands closer together</li>
              <li>Find narrowest grip width that allows full rotation</li>
              <li>
                Measure distance between hands at narrowest successful grip
              </li>
            </ol>
            <p className="mt-2 text-xs text-orange-700">
              💡 <strong>Tip:</strong> Important for overhead athletes
              (volleyball, swimming, etc.)
            </p>
          </AlertDescription>
        </Alert>

        {/* Anthropometric Data */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-medium text-blue-900">
              📏 Anthropometric Data (Optional - improves score accuracy)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Shoulder Width (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={anthropometricData?.shoulderWidth || ""}
                  onChange={(e) =>
                    updateAnthropometric(
                      "shoulderWidth",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="e.g., 42"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Measure across shoulders (bony points)
                </p>
              </div>
              <div>
                <Label className="text-xs">Arm Span (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={anthropometricData?.armSpan || ""}
                  onChange={(e) =>
                    updateAnthropometric(
                      "armSpan",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="e.g., 178"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Fingertip to fingertip with arms extended
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

                <div>
                  <Label className="text-xs font-medium">
                    Grip Width (cm) *
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={attempt.gripWidth || ""}
                    onChange={(e) =>
                      updateAttempt(
                        index,
                        "gripWidth",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 75"
                    className="font-medium"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Narrowest successful grip (hands still rotate fully)
                  </p>

                  {attempt.gripWidth > 0 && (
                    <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2">
                      <p className="text-xs text-orange-900">
                        {getMobilityRating(
                          attempt.gripWidth,
                          anthropometricData?.shoulderWidth
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., felt restriction at top of rotation, easier with warm-up"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {bestGripWidth !== undefined && mobilityScore !== undefined && (
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Grip Width</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {bestGripWidth.toFixed(1)}
                        <span className="text-sm text-gray-600 ml-1">cm</span>
                      </p>
                    </div>

                    {anthropometricData?.shoulderWidth && (
                      <div>
                        <p className="text-xs text-gray-600">
                          Ratio to Shoulder
                        </p>
                        <p className="text-2xl font-bold text-amber-900">
                          {(
                            bestGripWidth / anthropometricData.shoulderWidth
                          ).toFixed(2)}
                          x
                        </p>
                        <p className="text-xs text-gray-600">
                          Target: &lt;1.5x
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-600">Mobility Score</p>
                      <p className="text-2xl font-bold text-green-900">
                        {mobilityScore}
                        <span className="text-sm text-gray-600 ml-1">/100</span>
                      </p>
                    </div>
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
            <li>Excellent: Grip width &lt;1.5x shoulder width (or &lt;60cm)</li>
            <li>Good: 1.5-2x shoulder width (or 60-80cm)</li>
            <li>Average: 2-2.5x shoulder width (or 80-100cm)</li>
            <li>Poor: &gt;2.5x shoulder width (or &gt;100cm)</li>
          </ul>
          <p className="text-orange-700 font-medium mt-2">
            💡 Narrower grip = better shoulder mobility
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

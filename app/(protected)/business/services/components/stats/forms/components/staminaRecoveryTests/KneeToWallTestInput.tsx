import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Footprints, Info, AlertTriangle } from "lucide-react";
import { KneeToWallTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateKneeToWallMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface KneeToWallTestInputProps {
  value: KneeToWallTest | undefined;
  onChange: (data: KneeToWallTest) => void;
}

export const KneeToWallTestInput: React.FC<KneeToWallTestInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      leftFootDistance: undefined,
      rightFootDistance: undefined,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateKneeToWallMetrics(updatedTest));
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

    onChange(calculateKneeToWallMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateKneeToWallMetrics(updatedTest));
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

  const getMobilityRating = (distance: number): string => {
    if (distance >= 12) return "⚡ Excellent (12+ cm)";
    if (distance >= 8) return "✅ Good (8-12cm)";
    if (distance >= 5) return "📊 Average (5-8cm)";
    return "🎯 Limited (<5cm)";
  };

  const bestLeft = value?.bestLeftDistance;
  const bestRight = value?.bestRightDistance;
  const asymmetry = value?.asymmetryScore;
  const mobilityScore = value?.ankleMobilityScore;

  return (
    <Card className="border-cyan-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Footprints className="w-4 h-4 mr-2 text-cyan-600" />
            Knee-to-Wall Test (Ankle Mobility)
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
        <Alert className="bg-cyan-50 border-cyan-200">
          <Info className="h-4 w-4 text-cyan-600" />
          <AlertDescription className="text-sm text-cyan-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Wall, Measuring tape</p>
            <p className="font-medium mb-1">🦶 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Remove shoes, stand facing wall</li>
              <li>Place one foot forward, keep heel flat on ground</li>
              <li>Bend knee forward trying to touch wall</li>
              <li>Don't let heel lift off ground</li>
              <li>Move foot back until knee JUST touches wall</li>
              <li>Measure distance from toes to wall</li>
              <li>Test both ankles, 2-3 attempts per side</li>
            </ol>
            <p className="mt-2 text-xs text-cyan-700">
              💡 <strong>Tip:</strong> Important for runners and jumping
              athletes. Target: 10cm+
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
                  {/* Left Foot */}
                  <div>
                    <Label className="text-xs font-medium">
                      Left Foot Distance (cm) *
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={attempt.leftFootDistance || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "leftFootDistance",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="e.g., 10.5"
                      className="font-medium"
                    />
                    {attempt.leftFootDistance && (
                      <p className="text-xs text-cyan-700 mt-1">
                        {getMobilityRating(attempt.leftFootDistance)}
                      </p>
                    )}
                  </div>

                  {/* Right Foot */}
                  <div>
                    <Label className="text-xs font-medium">
                      Right Foot Distance (cm) *
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={attempt.rightFootDistance || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "rightFootDistance",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="e.g., 9.0"
                      className="font-medium"
                    />
                    {attempt.rightFootDistance && (
                      <p className="text-xs text-cyan-700 mt-1">
                        {getMobilityRating(attempt.rightFootDistance)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Asymmetry Warning */}
                {attempt.leftFootDistance &&
                  attempt.rightFootDistance &&
                  Math.abs(
                    attempt.leftFootDistance - attempt.rightFootDistance
                  ) > 2 && (
                    <Alert className="bg-amber-50 border-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-900">
                        <strong>Asymmetry detected:</strong>{" "}
                        {Math.abs(
                          attempt.leftFootDistance - attempt.rightFootDistance
                        ).toFixed(1)}
                        cm difference. May indicate injury risk or previous
                        ankle injury.
                      </AlertDescription>
                    </Alert>
                  )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., right ankle tighter, felt restriction in calf"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary Card */}
            {bestLeft !== undefined && bestRight !== undefined && (
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Left Ankle</p>
                      <p className="text-2xl font-bold text-cyan-900">
                        {bestLeft.toFixed(1)}
                        <span className="text-sm text-gray-600 ml-1">cm</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Best Right Ankle</p>
                      <p className="text-2xl font-bold text-cyan-900">
                        {bestRight.toFixed(1)}
                        <span className="text-sm text-gray-600 ml-1">cm</span>
                      </p>
                    </div>

                    {asymmetry !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Asymmetry</p>
                        <p
                          className={`text-2xl font-bold ${
                            asymmetry > 2 ? "text-amber-900" : "text-green-900"
                          }`}
                        >
                          {asymmetry.toFixed(1)}
                          <span className="text-sm text-gray-600 ml-1">cm</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          {asymmetry <= 1
                            ? "✅ Balanced"
                            : asymmetry <= 2
                            ? "⚠️ Slight"
                            : "🚨 Significant"}
                        </p>
                      </div>
                    )}

                    {mobilityScore !== undefined && (
                      <div>
                        <p className="text-xs text-gray-600">Mobility Score</p>
                        <p className="text-2xl font-bold text-green-900">
                          {mobilityScore}
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
            <li>Excellent: 12+ cm (very good dorsiflexion)</li>
            <li>Good: 8-12cm (adequate for running/jumping)</li>
            <li>Average: 5-8cm (minimum functional range)</li>
            <li>Limited: &lt;5cm (may affect squat depth, injury risk)</li>
            <li>⚠️ Asymmetry &gt;2cm may indicate previous injury</li>
          </ul>
          <p className="text-cyan-700 font-medium mt-2">
            💡 Important for: Squats, running mechanics, landing from jumps
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

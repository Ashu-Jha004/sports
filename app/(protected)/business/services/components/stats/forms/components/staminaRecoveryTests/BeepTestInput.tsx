import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Activity, Info, TrendingUp } from "lucide-react";
import { BeepTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateBeepTestMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface BeepTestInputProps {
  value: BeepTest | undefined;
  onChange: (data: BeepTest) => void;
}

export const BeepTestInput: React.FC<BeepTestInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      finalLevel: 1,
      finalShuttle: 1,
      testDate: new Date().toISOString().split("T")[0],
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateBeepTestMetrics(updatedTest));
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

    onChange(calculateBeepTestMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateBeepTestMetrics(updatedTest));
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

  const getVO2Classification = (vo2: number): string => {
    if (vo2 >= 60) return "Excellent (Elite Athlete)";
    if (vo2 >= 50) return "Very Good (Competitive)";
    if (vo2 >= 40) return "Good (Active)";
    if (vo2 >= 30) return "Fair (Average)";
    return "Poor (Needs Improvement)";
  };

  const bestAttempt =
    value?.bestAttempt !== undefined ? attempts[value.bestAttempt] : undefined;
  const vo2Max = value?.calculatedVO2Max;
  const estimatedDistance = value?.estimatedDistance;

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-600" />
            Beep Test (Yo-Yo Level 1)
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
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Audio device (beep test app/audio), 20m measuring tape, 2 cones
            </p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Mark 20-meter course with cones</li>
              <li>Start audio track at Level 1</li>
              <li>Run between cones, reaching line before each beep</li>
              <li>Speed increases each level</li>
              <li>
                Test ends when you can't keep pace (miss 2 consecutive beeps)
              </li>
              <li>Record final level and shuttle number reached</li>
            </ol>
            <p className="mt-2 text-xs text-blue-700">
              💡 <strong>Tip:</strong> Download a free Beep Test app for
              accurate timing
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
                className={`border rounded-lg p-4 space-y-3 ${
                  value?.bestAttempt === index
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      Attempt {attempt.attemptNumber}
                    </h4>
                    {value?.bestAttempt === index && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                        Best
                      </span>
                    )}
                  </div>
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Final Level */}
                  <div>
                    <Label className="text-xs font-medium">Final Level *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="23"
                      value={attempt.finalLevel || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "finalLevel",
                          parseInt(e.target.value) || 1
                        )
                      }
                      placeholder="e.g., 8"
                      className="font-medium"
                    />
                  </div>

                  {/* Final Shuttle */}
                  <div>
                    <Label className="text-xs font-medium">
                      Final Shuttle *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="16"
                      value={attempt.finalShuttle || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "finalShuttle",
                          parseInt(e.target.value) || 1
                        )
                      }
                      placeholder="e.g., 6"
                      className="font-medium"
                    />
                  </div>

                  {/* Test Date */}
                  <div>
                    <Label className="text-xs font-medium">Test Date</Label>
                    <Input
                      type="date"
                      value={attempt.testDate || ""}
                      onChange={(e) =>
                        updateAttempt(index, "testDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Performance Indicator */}
                {attempt.finalLevel >= 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-xs text-blue-900">
                      <strong>
                        Level {attempt.finalLevel}.{attempt.finalShuttle}
                      </strong>{" "}
                      ≈{" "}
                      {attempt.finalLevel >= 12
                        ? "⚡ Elite Performance"
                        : attempt.finalLevel >= 9
                        ? "✅ Excellent"
                        : attempt.finalLevel >= 7
                        ? "📊 Good"
                        : attempt.finalLevel >= 5
                        ? "📈 Average"
                        : "🎯 Keep Training"}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., felt strong, tired in final level, weather conditions"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary Card */}
            {vo2Max && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Test Results
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Performance</p>
                      <p className="text-2xl font-bold text-blue-900">
                        Level {bestAttempt?.finalLevel}.
                        {bestAttempt?.finalShuttle}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Estimated VO2 Max</p>
                      <p className="text-2xl font-bold text-green-900">
                        {vo2Max.toFixed(1)}
                        <span className="text-sm text-gray-600 ml-1">
                          ml/kg/min
                        </span>
                      </p>
                      <p className="text-xs text-green-700 font-medium mt-1">
                        {getVO2Classification(vo2Max)}
                      </p>
                    </div>

                    {estimatedDistance && (
                      <div>
                        <p className="text-xs text-gray-600">
                          Distance Covered
                        </p>
                        <p className="text-2xl font-bold text-indigo-900">
                          {estimatedDistance}
                          <span className="text-sm text-gray-600 ml-1">
                            meters
                          </span>
                        </p>
                        <p className="text-xs text-indigo-700">
                          {(estimatedDistance / 1000).toFixed(2)} km total
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
          <p className="font-medium">📊 Reference Levels:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: Level 12+ (VO2 Max 55+)</li>
            <li>Competitive athletes: Level 9-11 (VO2 Max 45-54)</li>
            <li>Active individuals: Level 7-8 (VO2 Max 38-44)</li>
            <li>Average fitness: Level 5-6 (VO2 Max 32-37)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

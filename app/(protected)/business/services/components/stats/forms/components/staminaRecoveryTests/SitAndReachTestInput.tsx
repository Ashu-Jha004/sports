import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Maximize2, Info } from "lucide-react";
import { SitAndReachTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateSitAndReachMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface SitAndReachTestInputProps {
  value: SitAndReachTest | undefined;
  onChange: (data: SitAndReachTest) => void;
}

export const SitAndReachTestInput: React.FC<SitAndReachTestInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      reachDistance: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateSitAndReachMetrics(updatedTest));
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

    onChange(calculateSitAndReachMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateSitAndReachMetrics(updatedTest));
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

  const getFlexibilityRating = (distance: number): string => {
    if (distance >= 15) return "⚡ Excellent (+15cm past toes)";
    if (distance >= 10) return "✅ Very Good (+10-15cm)";
    if (distance >= 5) return "📊 Good (+5-10cm)";
    if (distance >= 0) return "📈 Average (touching toes)";
    if (distance >= -5) return "⚠️ Below Average (-5 to 0cm)";
    return "🎯 Needs Work (<-5cm)";
  };

  const bestReach = value?.bestReach;
  const avgReach = value?.averageReach;
  const flexScore = value?.flexibilityScore;

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Maximize2 className="w-4 h-4 mr-2 text-purple-600" />
            Sit-and-Reach Test
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
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Ruler or measuring tape, Box/step (optional)</p>
            <p className="font-medium mb-1">🧘 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Sit on floor with legs straight, feet against wall/box</li>
              <li>Remove shoes, keep knees locked</li>
              <li>Place ruler between legs (0 at toes)</li>
              <li>Reach forward slowly, exhale as you stretch</li>
              <li>Hold maximum reach for 2 seconds</li>
              <li>
                Record distance: POSITIVE if past toes, NEGATIVE if before toes
              </li>
              <li>Perform 3 attempts with 30-second rest between</li>
            </ol>
            <p className="mt-2 text-xs text-purple-700">
              💡 <strong>Tip:</strong> Warm up with light stretching. Don't
              bounce!
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

                <div>
                  <Label className="text-xs font-medium">
                    Reach Distance (cm) *
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={attempt.reachDistance || ""}
                    onChange={(e) =>
                      updateAttempt(
                        index,
                        "reachDistance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 8.5 (positive) or -3.0 (negative)"
                    className="font-medium"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Use + for past toes, - for before toes. 0 = touching toes
                  </p>

                  {attempt.reachDistance !== 0 && (
                    <div className="mt-2 bg-purple-50 border border-purple-200 rounded p-2">
                      <p className="text-xs text-purple-900">
                        {getFlexibilityRating(attempt.reachDistance)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., felt tight in hamstrings, better after warm-up"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary Card */}
            {bestReach !== undefined && flexScore !== undefined && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Reach</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {bestReach > 0 ? "+" : ""}
                        {bestReach.toFixed(1)}
                        <span className="text-sm text-gray-600 ml-1">cm</span>
                      </p>
                      <p className="text-xs text-purple-700">
                        {bestReach >= 0 ? "Past toes" : "Before toes"}
                      </p>
                    </div>

                    {avgReach !== undefined && attempts.length > 1 && (
                      <div>
                        <p className="text-xs text-gray-600">Average Reach</p>
                        <p className="text-2xl font-bold text-pink-900">
                          {avgReach > 0 ? "+" : ""}
                          {avgReach.toFixed(1)}
                          <span className="text-sm text-gray-600 ml-1">cm</span>
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-600">Flexibility Score</p>
                      <p className="text-2xl font-bold text-green-900">
                        {flexScore}
                        <span className="text-sm text-gray-600 ml-1">/100</span>
                      </p>
                      <p className="text-xs text-green-700 font-medium">
                        {flexScore >= 80
                          ? "Excellent"
                          : flexScore >= 60
                          ? "Good"
                          : flexScore >= 40
                          ? "Average"
                          : "Needs Improvement"}
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
            <li>Excellent: +15cm or more past toes</li>
            <li>Good: +5 to +14cm past toes</li>
            <li>Average: 0 to +4cm (touching to slightly past)</li>
            <li>Below Average: -5 to -1cm before toes</li>
            <li>Poor: Less than -5cm before toes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

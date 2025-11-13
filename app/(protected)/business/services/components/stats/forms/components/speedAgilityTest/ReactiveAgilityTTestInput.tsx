import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Info } from "lucide-react";
import { ReactiveAgilityTTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateReactiveAgilityMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface ReactiveAgilityTTestInputProps {
  value: ReactiveAgilityTTest | undefined;
  onChange: (data: ReactiveAgilityTTest) => void;
}

export const ReactiveAgilityTTestInput: React.FC<
  ReactiveAgilityTTestInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      completionTime: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateReactiveAgilityMetrics(updatedTest));
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

    onChange(calculateReactiveAgilityMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateReactiveAgilityMetrics(updatedTest));
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

  const bestTime = value?.bestTime;
  const meanTime = value?.meanTime;
  const averageAccuracy = value?.averageAccuracy;

  return (
    <Card className="border-violet-200 bg-violet-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Reactive Agility T-Test
            <Badge variant="secondary" className="text-xs">
              Advanced
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
        <Alert className="bg-violet-50 border-violet-200">
          <Info className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-sm text-violet-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Stopwatch, 4 cones, Partner for cues
            </p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Set up standard T-Test course (same as T-Test)</li>
              <li>Partner calls out directions randomly (Left/Right/Center)</li>
              <li>Athlete reacts to verbal cues instead of following set pattern</li>
              <li>
                Sprint to called cone, touch base, return to center (cone B)
              </li>
              <li>Repeat for 3-5 directional changes per attempt</li>
              <li>Record completion time and accuracy of responses</li>
            </ol>
            <p className="text-violet-800 font-medium mt-2">
              ⚠️ Requires partner to give randomized cues. Tests decision-making
              under pressure.
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
                    <Label className="text-xs">
                      Completion Time (seconds) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.completionTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "completionTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 11.25"
                    />
                    {attempt.completionTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.completionTime < 10.0
                          ? "⚡ Elite level"
                          : attempt.completionTime < 11.5
                          ? "✅ Excellent"
                          : attempt.completionTime < 13.0
                          ? "📊 Good"
                          : attempt.completionTime < 15.0
                          ? "📈 Average"
                          : "⏱️ Needs improvement"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">
                      Correct Response Rate (%) - Optional
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      value={attempt.correctResponseRate || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "correctResponseRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 95"
                    />
                    {attempt.correctResponseRate && attempt.correctResponseRate > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.correctResponseRate >= 95
                          ? "✅ Excellent accuracy"
                          : attempt.correctResponseRate >= 85
                          ? "📊 Good accuracy"
                          : "⚠️ Needs focus"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., 1 wrong direction, hesitated on call, excellent reactions"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {(bestTime || meanTime || averageAccuracy) && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4">
                  {bestTime && (
                    <div>
                      <p className="text-xs font-medium text-violet-900">
                        Best Time
                      </p>
                      <p className="text-xl font-bold text-violet-900">
                        {bestTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-violet-900">
                        Average Time
                      </p>
                      <p className="text-xl font-bold text-violet-900">
                        {meanTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {averageAccuracy && (
                    <div>
                      <p className="text-xs font-medium text-violet-900">
                        Avg Accuracy
                      </p>
                      <p className="text-xl font-bold text-violet-900">
                        {averageAccuracy.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Times (Reactive):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 9.5-11.0 seconds (with high accuracy)</li>
            <li>Good athletes: 11.0-13.0 seconds</li>
            <li>Average athletes: 13.0-15.0 seconds</li>
          </ul>
          <p className="font-medium mt-2">🎯 Accuracy Guidelines:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>&gt;95%: Excellent cognitive processing</li>
            <li>85-95%: Good decision-making</li>
            <li>&lt;85%: May need focus training</li>
          </ul>
          <p className="text-violet-700 font-medium mt-2">
            💡 Tip: Combines physical agility with cognitive reaction and
            decision-making. Game-like scenario for sport-specific training.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

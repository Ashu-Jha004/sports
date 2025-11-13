import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Navigation, Info } from "lucide-react";
import { TTestData } from "@/lib/stats/types/speedAgilityTests";
import { calculateTTestMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface TTestInputProps {
  value: TTestData | undefined;
  onChange: (data: TTestData) => void;
}

export const TTestInput: React.FC<TTestInputProps> = ({ value, onChange }) => {
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

    onChange(calculateTTestMetrics(updatedTest));
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

    onChange(calculateTTestMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateTTestMetrics(updatedTest));
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

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Navigation className="w-4 h-4 mr-2 text-green-600" />
            T-Test (Agility)
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
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Stopwatch, 4 cones, Measuring tape</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Set up T-pattern: Place cone A at start, cone B 10m ahead, cones
                C and D 5m left/right of B
              </li>
              <li>Start at cone A, sprint forward to cone B, touch base</li>
              <li>Shuffle left to cone C, touch base</li>
              <li>Shuffle right to cone D, touch base</li>
              <li>Shuffle left back to cone B, touch base</li>
              <li>Backpedal to cone A (finish)</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Course Diagram */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            📐 T-Test Course Layout:
          </p>
          <div className="font-mono text-xs text-center space-y-1">
            <div>C ←─ 5m ─→ B ←─ 5m ─→ D</div>
            <div className="ml-14">↑</div>
            <div className="ml-12">10m</div>
            <div className="ml-14">↓</div>
            <div className="ml-14">A (Start/Finish)</div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Total distance: ~40m with multiple direction changes
          </p>
        </div>

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
                  <Label className="text-xs">Completion Time (seconds) *</Label>
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
                    placeholder="e.g., 10.54"
                  />
                  {attempt.completionTime > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {attempt.completionTime < 9.5
                        ? "⚡ Elite level"
                        : attempt.completionTime < 10.5
                        ? "✅ Excellent"
                        : attempt.completionTime < 11.5
                        ? "📊 Good"
                        : attempt.completionTime < 13.0
                        ? "📈 Average"
                        : "⏱️ Needs improvement"}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., lost balance on shuffle, smooth transitions, personal best"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {(bestTime || meanTime) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestTime && (
                    <div>
                      <p className="text-xs font-medium text-green-900">
                        Best Time
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        {bestTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-green-900">
                        Average Time
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        {meanTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Guidelines */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Times (T-Test):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 9.0-10.0 seconds</li>
            <li>Good athletes: 10.5-11.5 seconds</li>
            <li>Average athletes: 11.5-13.0 seconds</li>
          </ul>
          <p className="font-medium mt-2">⚠️ Common Mistakes:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Not touching base of cones properly</li>
            <li>
              Crossing feet during shuffle (should maintain side-on position)
            </li>
            <li>Not backpedaling properly on return to A</li>
          </ul>
          <p className="text-green-700 font-medium mt-2">
            💡 Tip: Tests multidirectional speed, lateral quickness, and body
            control. Practice shuffling technique for best results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Compass, Info } from "lucide-react";
import { IllinoisAgilityTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateIllinoisAgilityMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface IllinoisAgilityTestInputProps {
  value: IllinoisAgilityTest | undefined;
  onChange: (data: IllinoisAgilityTest) => void;
}

export const IllinoisAgilityTestInput: React.FC<
  IllinoisAgilityTestInputProps
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

    onChange(calculateIllinoisAgilityMetrics(updatedTest));
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

    onChange(calculateIllinoisAgilityMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateIllinoisAgilityMetrics(updatedTest));
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
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Compass className="w-4 h-4 mr-2 text-emerald-600" />
            Illinois Agility Test
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
        <Alert className="bg-emerald-50 border-emerald-200">
          <Info className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-sm text-emerald-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Stopwatch, 8 cones, Measuring tape</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Set up 10m × 5m course with 4 cones in center (3.3m apart)
              </li>
              <li>Lie down prone at start line</li>
              <li>On signal, get up and sprint 10m, turn around cone</li>
              <li>Sprint back, weave through 4 center cones</li>
              <li>Sprint around far cone, weave back through cones</li>
              <li>Sprint to finish line</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Course Diagram */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            📐 Illinois Agility Course Layout (Top View):
          </p>
          <div className="font-mono text-xs space-y-1 bg-white p-3 rounded border">
            <div>Start ──────────── 10m ──────────── Turn</div>
            <div className="ml-6">↓ ........................... ↓</div>
            <div className="ml-6">
              ○ ── 3.3m ── ○ ── 3.3m ── ○ ── 3.3m ── ○ (weave)
            </div>
            <div className="ml-6">↓ ........................... ↓</div>
            <div>Finish ──────────── 10m ──────────── Turn</div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Dimensions:</strong> 10m length × 5m width
            <br />
            <strong>Center cones:</strong> 4 cones placed 3.3m apart
            <br />
            <strong>Starting position:</strong> Lying prone (chest on ground)
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
                    placeholder="e.g., 15.82"
                  />
                  {attempt.completionTime > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {attempt.completionTime < 14.5
                        ? "⚡ Elite level"
                        : attempt.completionTime < 16.0
                        ? "✅ Excellent"
                        : attempt.completionTime < 17.5
                        ? "📊 Good"
                        : attempt.completionTime < 19.0
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
                    placeholder="e.g., smooth weaving, hit cone on turn 2, good transitions"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {(bestTime || meanTime) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestTime && (
                    <div>
                      <p className="text-xs font-medium text-emerald-900">
                        Best Time
                      </p>
                      <p className="text-xl font-bold text-emerald-900">
                        {bestTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-emerald-900">
                        Average Time
                      </p>
                      <p className="text-xl font-bold text-emerald-900">
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
          <p className="font-medium">📊 Reference Times (Illinois Test):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 14.0-15.5 seconds</li>
            <li>Good athletes: 15.5-17.5 seconds</li>
            <li>Average athletes: 17.5-19.0 seconds</li>
          </ul>
          <p className="font-medium mt-2">⚠️ Testing Tips:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              Ensure proper prone start position (chest and hips on ground)
            </li>
            <li>Weave tightly around cones without touching them</li>
            <li>Make sharp turns at end cones</li>
            <li>Maintain maximum speed throughout</li>
          </ul>
          <p className="text-emerald-700 font-medium mt-2">
            💡 Tip: Comprehensive agility test measuring acceleration,
            deceleration, weaving, and turning ability. More demanding than
            T-Test.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

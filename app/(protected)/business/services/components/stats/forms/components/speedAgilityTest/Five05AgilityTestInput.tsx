import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  MoveHorizontal,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Five05AgilityTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateFive05AgilityMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface Five05AgilityTestInputProps {
  value: Five05AgilityTest | undefined;
  onChange: (data: Five05AgilityTest) => void;
}

export const Five05AgilityTestInput: React.FC<Five05AgilityTestInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      leftTurnTime: 0,
      rightTurnTime: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateFive05AgilityMetrics(updatedTest));
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

    onChange(calculateFive05AgilityMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateFive05AgilityMetrics(updatedTest));
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

  const bestLeftTime = value?.bestLeftTime;
  const bestRightTime = value?.bestRightTime;
  const meanLeftTime = value?.meanLeftTime;
  const meanRightTime = value?.meanRightTime;
  const asymmetryIndex = value?.asymmetryIndex;

  return (
    <Card className="border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <MoveHorizontal className="w-4 h-4 mr-2 text-teal-600" />
            505 Agility Test
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
            <p className="mb-2">Stopwatch, 2 cones, Measuring tape</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Set up 15-meter course with start and turn line (5m apart)
              </li>
              <li>Sprint 10m to gain momentum (timing starts at 5m mark)</li>
              <li>Continue 5m more to turn line (total 15m from start)</li>
              <li>Plant and turn 180° (left or right)</li>
              <li>Sprint back 5m through timing gates</li>
              <li>Record time for 5m approach + 5m return (10m total timed)</li>
              <li>Perform attempts for both left and right turns</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Course Diagram */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            📐 505 Agility Course Layout:
          </p>
          <div className="font-mono text-xs space-y-1 bg-white p-3 rounded border">
            <div>Start ───── 10m (momentum) ───── Timing Start (5m mark)</div>
            <div className="ml-32">↓</div>
            <div className="ml-28">5m (timed)</div>
            <div className="ml-32">↓</div>
            <div className="ml-24">Turn Line (180° turn)</div>
            <div className="ml-32">↓</div>
            <div className="ml-28">5m (timed)</div>
            <div className="ml-32">↓</div>
            <div className="ml-24">Finish (timing gate)</div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Total distance:</strong> 15m (10m + 5m)
            <br />
            <strong>Timed section:</strong> Final 10m (5m approach + 5m return)
            <br />
            <strong>Key:</strong> Tests ability to decelerate, turn 180°, and
            re-accelerate
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">
                      Left Turn Time (seconds) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.leftTurnTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "leftTurnTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 2.45"
                      className={
                        attempt.leftTurnTime === bestLeftTime &&
                        attempt.leftTurnTime > 0
                          ? "border-green-400 bg-green-50"
                          : ""
                      }
                    />
                    {attempt.leftTurnTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.leftTurnTime === bestLeftTime &&
                          "🏆 Best left"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">
                      Right Turn Time (seconds) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.rightTurnTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "rightTurnTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 2.52"
                      className={
                        attempt.rightTurnTime === bestRightTime &&
                        attempt.rightTurnTime > 0
                          ? "border-green-400 bg-green-50"
                          : ""
                      }
                    />
                    {attempt.rightTurnTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.rightTurnTime === bestRightTime &&
                          "🏆 Best right"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Individual Attempt Asymmetry */}
                {attempt.leftTurnTime > 0 && attempt.rightTurnTime > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded p-2">
                    <p className="text-xs font-medium text-teal-900">
                      Attempt asymmetry:{" "}
                      {Math.abs(
                        attempt.leftTurnTime - attempt.rightTurnTime
                      ).toFixed(2)}
                      s
                    </p>
                    <p className="text-xs text-teal-700">
                      {Math.abs(attempt.leftTurnTime - attempt.rightTurnTime) <
                      0.1
                        ? "✅ Excellent symmetry"
                        : Math.abs(
                            attempt.leftTurnTime - attempt.rightTurnTime
                          ) < 0.2
                        ? "📊 Good symmetry"
                        : "⚠️ Significant asymmetry"}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., stronger on left turn, slipped on right plant"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {(bestLeftTime || bestRightTime) && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-teal-900">
                  📊 505 Agility Summary
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bestLeftTime && (
                    <div>
                      <p className="text-xs text-teal-700">Best Left</p>
                      <p className="text-lg font-bold text-teal-900">
                        {bestLeftTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {bestRightTime && (
                    <div>
                      <p className="text-xs text-teal-700">Best Right</p>
                      <p className="text-lg font-bold text-teal-900">
                        {bestRightTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanLeftTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs text-teal-700">Avg Left</p>
                      <p className="text-lg font-bold text-teal-900">
                        {meanLeftTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                  {meanRightTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs text-teal-700">Avg Right</p>
                      <p className="text-lg font-bold text-teal-900">
                        {meanRightTime.toFixed(2)}s
                      </p>
                    </div>
                  )}
                </div>

                {/* Asymmetry Index */}
                {asymmetryIndex !== undefined && (
                  <div className="bg-white border border-teal-300 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-teal-900">
                          Asymmetry Index
                        </p>
                        <p className="text-xs text-teal-700">
                          Difference between best left and right times
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-teal-900">
                        {asymmetryIndex.toFixed(2)}s
                      </p>
                    </div>
                    {asymmetryIndex > 0.15 && (
                      <Alert className="mt-2 bg-amber-50 border-amber-300">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800">
                          Significant asymmetry detected (&gt;0.15s). Consider
                          targeted training for weaker side to reduce injury
                          risk.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Guidelines */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Times (505 Test):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 2.2-2.4 seconds</li>
            <li>Good athletes: 2.4-2.7 seconds</li>
            <li>Average athletes: 2.7-3.2 seconds</li>
          </ul>
          <p className="font-medium mt-2">⚖️ Asymmetry Interpretation:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>&lt;0.10s: Excellent symmetry</li>
            <li>0.10-0.15s: Acceptable</li>
            <li>&gt;0.15s: Significant imbalance (address with training)</li>
          </ul>
          <p className="text-teal-700 font-medium mt-2">
            💡 Tip: Tests change of direction ability and lateral strength
            symmetry. Important for identifying injury risk from imbalances.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

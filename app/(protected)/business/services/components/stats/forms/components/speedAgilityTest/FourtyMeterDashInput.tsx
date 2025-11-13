import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Gauge, Info } from "lucide-react";
import { FourtyMeterDashTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateFourtyMeterDashMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface FourtyMeterDashInputProps {
  value: FourtyMeterDashTest | undefined;
  onChange: (data: FourtyMeterDashTest) => void;
}

export const FourtyMeterDashInput: React.FC<FourtyMeterDashInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      totalTime_0_40m: 0,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateFourtyMeterDashMetrics(updatedTest));
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

    onChange(calculateFourtyMeterDashMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: number) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateFourtyMeterDashMetrics(updatedTest));
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
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Gauge className="w-4 h-4 mr-2 text-indigo-600" />
            40-Meter Dash Test
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
        <Alert className="bg-indigo-50 border-indigo-200">
          <Info className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-sm text-indigo-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Stopwatch, Measuring tape, 2 cones/markers</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Mark 40-meter course with cones at start and finish</li>
              <li>Optional: Place markers at 10m, 20m, 30m for split times</li>
              <li>Start from standing position</li>
              <li>Sprint maximally for entire 40 meters</li>
              <li>Record total time and optional split times</li>
            </ol>
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

                <div className="space-y-3">
                  {/* Total Time - Required */}
                  <div>
                    <Label className="text-xs font-medium">
                      Total Time 0-40m (seconds) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={attempt.totalTime_0_40m || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "totalTime_0_40m",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 5.12"
                      className="font-medium"
                    />
                    {attempt.totalTime_0_40m > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.totalTime_0_40m < 5.0
                          ? "⚡ Elite level (sub-5 seconds)"
                          : attempt.totalTime_0_40m < 5.5
                          ? "✅ Excellent"
                          : attempt.totalTime_0_40m < 6.0
                          ? "📊 Good"
                          : attempt.totalTime_0_40m < 6.5
                          ? "📈 Average"
                          : "⏱️ Needs improvement"}
                      </p>
                    )}
                  </div>

                  {/* Split Times - Optional */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-3 space-y-2">
                    <p className="text-xs font-medium text-indigo-900">
                      Split Times (Optional)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">0-10m (s)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={attempt.splitTime_0_10m || ""}
                          onChange={(e) =>
                            updateAttempt(
                              index,
                              "splitTime_0_10m",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="1.80"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">0-20m (s)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={attempt.splitTime_0_20m || ""}
                          onChange={(e) =>
                            updateAttempt(
                              index,
                              "splitTime_0_20m",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="3.20"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">0-30m (s)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={attempt.splitTime_0_30m || ""}
                          onChange={(e) =>
                            updateAttempt(
                              index,
                              "splitTime_0_30m",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="4.30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Split Analysis */}
                  {attempt.splitTime_0_10m &&
                    attempt.splitTime_0_20m &&
                    attempt.splitTime_0_30m &&
                    attempt.totalTime_0_40m > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
                        <p className="text-xs font-medium text-amber-900">
                          📊 Split Analysis:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
                          <div>
                            10-20m:{" "}
                            {(
                              attempt.splitTime_0_20m - attempt.splitTime_0_10m
                            ).toFixed(2)}
                            s
                          </div>
                          <div>
                            20-30m:{" "}
                            {(
                              attempt.splitTime_0_30m - attempt.splitTime_0_20m
                            ).toFixed(2)}
                            s
                          </div>
                          <div>
                            30-40m:{" "}
                            {(
                              attempt.totalTime_0_40m - attempt.splitTime_0_30m
                            ).toFixed(2)}
                            s
                          </div>
                          <div className="font-medium">
                            Avg speed:{" "}
                            {(40 / attempt.totalTime_0_40m).toFixed(2)} m/s
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., good start, maintained speed, personal record"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            {(bestTime || meanTime) && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestTime && (
                    <div>
                      <p className="text-xs font-medium text-indigo-900">
                        Best Time
                      </p>
                      <p className="text-xl font-bold text-indigo-900">
                        {bestTime.toFixed(2)}s
                      </p>
                      <p className="text-xs text-indigo-700">
                        {(40 / bestTime).toFixed(2)} m/s avg speed
                      </p>
                    </div>
                  )}
                  {meanTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-indigo-900">
                        Average Time
                      </p>
                      <p className="text-xl font-bold text-indigo-900">
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
          <p className="font-medium">📊 Reference Times (40m):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 4.5-5.0 seconds</li>
            <li>Good athletes: 5.1-5.8 seconds</li>
            <li>Average athletes: 5.9-6.5 seconds</li>
          </ul>
          <p className="text-indigo-700 font-medium mt-2">
            💡 Tip: Measures maximum sprint speed. Split times help identify
            acceleration vs. top speed strengths.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

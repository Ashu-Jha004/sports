import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Activity, Info, TrendingDown } from "lucide-react";
import { HeartRateRecoveryTest } from "@/lib/stats/types/staminaRecoveryTests";
import {
  calculateHeartRateRecoveryMetrics,
  pulseCountToBPM,
} from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface HeartRateRecoveryTestInputProps {
  value: HeartRateRecoveryTest | undefined;
  onChange: (data: HeartRateRecoveryTest) => void;
}

export const HeartRateRecoveryTestInput: React.FC<
  HeartRateRecoveryTestInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      testDate: new Date().toISOString().split("T")[0],
      restingHR: 0,
      exerciseProtocol: "step-test-3min" as const,
      peakHR: 0,
      inputMethod: "manual" as const,
      recovery1MinPulseCount: undefined,
      recovery2MinPulseCount: undefined,
      recovery3MinPulseCount: undefined,
      recovery1MinHR: undefined,
      recovery2MinHR: undefined,
      recovery3MinHR: undefined,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateHeartRateRecoveryMetrics(updatedTest));
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

    onChange(calculateHeartRateRecoveryMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateHeartRateRecoveryMetrics(updatedTest));
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

  const getRecoveryRating = (dropBPM: number): string => {
    if (dropBPM >= 25) return "⚡ Excellent (25+ BPM drop)";
    if (dropBPM >= 18) return "✅ Good (18-24 BPM)";
    if (dropBPM >= 12) return "📊 Average (12-17 BPM)";
    return "⚠️ Needs Work (<12 BPM)";
  };

  const bestAttempt =
    value?.bestRecoveryAttempt !== undefined
      ? attempts[value.bestRecoveryAttempt]
      : undefined;
  const avgRecoveryRate = value?.averageRecoveryRate;
  const efficiencyScore = value?.recoveryEfficiencyScore;

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="w-4 h-4 mr-2 text-green-600" />
            Heart Rate Recovery Test
          </span>
          <Button
            type="button"
            size="sm"
            onClick={addAttempt}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Test
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment & Instructions */}
        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Step/box (20-30cm high), Stopwatch, HR monitor (optional)
            </p>
            <p className="font-medium mb-1">
              🏃 Standardized Protocol (3-Minute Step Test):
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Measure resting HR (sit for 5 min)</li>
              <li>
                Perform 3 minutes of step-ups (moderate pace: 24 steps/min)
              </li>
              <li>Record HR immediately after exercise (Peak HR)</li>
              <li>
                Sit down and measure HR at 1, 2, and 3 minutes post-exercise
              </li>
              <li>Record using manual pulse count OR device readings</li>
            </ol>
            <p className="mt-2 text-xs text-green-700">
              💡 <strong>Pace:</strong> Step up-up-down-down, complete step
              every 2.5 seconds
            </p>
          </AlertDescription>
        </Alert>

        {/* Attempts */}
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No tests recorded. Click "Add Test" to begin.
          </p>
        ) : (
          <>
            {attempts.map((attempt, index) => {
              const recovery1BPM =
                attempt.inputMethod === "manual" &&
                attempt.recovery1MinPulseCount
                  ? pulseCountToBPM(attempt.recovery1MinPulseCount)
                  : attempt.recovery1MinHR || 0;

              const recovery2BPM =
                attempt.inputMethod === "manual" &&
                attempt.recovery2MinPulseCount
                  ? pulseCountToBPM(attempt.recovery2MinPulseCount)
                  : attempt.recovery2MinHR || 0;

              const recovery3BPM =
                attempt.inputMethod === "manual" &&
                attempt.recovery3MinPulseCount
                  ? pulseCountToBPM(attempt.recovery3MinPulseCount)
                  : attempt.recovery3MinHR || 0;

              const recoveryDrop =
                attempt.peakHR > 0 && recovery1BPM > 0
                  ? attempt.peakHR - recovery1BPM
                  : 0;

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 space-y-3 ${
                    value?.bestRecoveryAttempt === index
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        Test {attempt.attemptNumber}
                      </h4>
                      {value?.bestRecoveryAttempt === index && (
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

                    {/* Input Method */}
                    <div>
                      <Label className="text-xs font-medium">
                        Input Method *
                      </Label>
                      <Select
                        value={attempt.inputMethod}
                        onValueChange={(val) =>
                          updateAttempt(index, "inputMethod", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Count</SelectItem>
                          <SelectItem value="device">Device/Monitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exercise Protocol (Fixed) */}
                    <div>
                      <Label className="text-xs font-medium">Protocol</Label>
                      <Input
                        value="3-Minute Step Test"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Pre-Exercise HR */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
                    <p className="text-xs font-medium text-blue-900">
                      Pre-Exercise Baseline
                    </p>
                    <div>
                      <Label className="text-xs">Resting HR (BPM) *</Label>
                      <Input
                        type="number"
                        min="30"
                        max="120"
                        value={attempt.restingHR || ""}
                        onChange={(e) =>
                          updateAttempt(
                            index,
                            "restingHR",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="e.g., 65"
                      />
                    </div>
                  </div>

                  {/* Post-Exercise Peak HR */}
                  <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                    <p className="text-xs font-medium text-red-900">
                      Immediately After Exercise
                    </p>
                    <div>
                      <Label className="text-xs">Peak HR (BPM) *</Label>
                      <Input
                        type="number"
                        min="100"
                        max="220"
                        value={attempt.peakHR || ""}
                        onChange={(e) =>
                          updateAttempt(
                            index,
                            "peakHR",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="e.g., 145"
                        className="font-medium"
                      />
                    </div>
                  </div>

                  {/* Recovery Measurements */}
                  <div className="bg-green-50 border border-green-200 rounded p-3 space-y-3">
                    <p className="text-xs font-medium text-green-900">
                      Recovery Measurements (Sitting)
                    </p>

                    {attempt.inputMethod === "manual" ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">1 min (15s count)</Label>
                          <Input
                            type="number"
                            min="8"
                            max="55"
                            value={attempt.recovery1MinPulseCount || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery1MinPulseCount",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 28"
                          />
                          {recovery1BPM > 0 && (
                            <p className="text-xs text-green-700 mt-1">
                              = {recovery1BPM} BPM
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">2 min (15s count)</Label>
                          <Input
                            type="number"
                            min="8"
                            max="55"
                            value={attempt.recovery2MinPulseCount || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery2MinPulseCount",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 24"
                          />
                          {recovery2BPM > 0 && (
                            <p className="text-xs text-green-700 mt-1">
                              = {recovery2BPM} BPM
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">3 min (15s count)</Label>
                          <Input
                            type="number"
                            min="8"
                            max="55"
                            value={attempt.recovery3MinPulseCount || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery3MinPulseCount",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 20"
                          />
                          {recovery3BPM > 0 && (
                            <p className="text-xs text-green-700 mt-1">
                              = {recovery3BPM} BPM
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">1 min (BPM)</Label>
                          <Input
                            type="number"
                            value={attempt.recovery1MinHR || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery1MinHR",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 112"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">2 min (BPM)</Label>
                          <Input
                            type="number"
                            value={attempt.recovery2MinHR || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery2MinHR",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 96"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">3 min (BPM)</Label>
                          <Input
                            type="number"
                            value={attempt.recovery3MinHR || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "recovery3MinHR",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 80"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recovery Analysis */}
                  {recoveryDrop > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2">
                      <p className="text-xs font-medium text-amber-900">
                        📊 Recovery Analysis (1 minute):
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-amber-800 mt-1">
                        <div>
                          HR Drop: <strong>{recoveryDrop} BPM</strong>
                        </div>
                        <div>{getRecoveryRating(recoveryDrop)}</div>
                      </div>
                      {recovery3BPM > 0 && (
                        <div className="mt-2 text-xs text-amber-800">
                          3-min recovery: {attempt.peakHR} → {recovery3BPM} BPM
                          (total drop:{" "}
                          <strong>{attempt.peakHR - recovery3BPM}</strong> BPM)
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Notes (optional)</Label>
                    <Textarea
                      value={attempt.notes || ""}
                      onChange={(e) => updateNotes(index, e.target.value)}
                      placeholder="e.g., recovered quickly, felt strong during test"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}

            {/* Summary Card */}
            {avgRecoveryRate !== undefined && efficiencyScore !== undefined && (
              <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Recovery Performance
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Recovery</p>
                      <p className="text-2xl font-bold text-green-900">
                        {bestAttempt
                          ? `${
                              bestAttempt.peakHR -
                              (bestAttempt.inputMethod === "manual" &&
                              bestAttempt.recovery1MinPulseCount
                                ? pulseCountToBPM(
                                    bestAttempt.recovery1MinPulseCount
                                  )
                                : bestAttempt.recovery1MinHR || 0)
                            }`
                          : 0}
                        <span className="text-sm text-gray-600 ml-1">
                          BPM drop
                        </span>
                      </p>
                      <p className="text-xs text-green-700">In 1 minute</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">
                        Average Recovery Rate
                      </p>
                      <p className="text-2xl font-bold text-teal-900">
                        {avgRecoveryRate}
                        <span className="text-sm text-gray-600 ml-1">
                          BPM/min
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Efficiency Score</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {efficiencyScore}
                        <span className="text-sm text-gray-600 ml-1">/100</span>
                      </p>
                      <p className="text-xs text-blue-700 font-medium">
                        {efficiencyScore >= 80
                          ? "Excellent"
                          : efficiencyScore >= 60
                          ? "Good"
                          : "Average"}
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
          <p className="font-medium">
            📊 Recovery Reference (1-minute drop from peak):
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Excellent: 25+ BPM drop (strong recovery)</li>
            <li>Good: 18-24 BPM drop</li>
            <li>Average: 12-17 BPM drop</li>
            <li>Poor: &lt;12 BPM drop (needs cardiovascular work)</li>
          </ul>
          <p className="text-green-700 font-medium mt-2">
            💡 Faster recovery = better cardiovascular fitness
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

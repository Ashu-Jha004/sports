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
import { Plus, Trash2, Heart, Info } from "lucide-react";
import { RestingHeartRateTest } from "@/lib/stats/types/staminaRecoveryTests";
import {
  calculateRestingHeartRateMetrics,
  pulseCountToBPM,
} from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface RestingHeartRateTestInputProps {
  value: RestingHeartRateTest | undefined;
  onChange: (data: RestingHeartRateTest) => void;
}

export const RestingHeartRateTestInput: React.FC<
  RestingHeartRateTestInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      measurementDate: new Date().toISOString().split("T")[0],
      timeOfDay: "morning" as const,
      inputMethod: "manual" as const,
      pulseCount15Sec: undefined,
      heartRateBPM: undefined,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateRestingHeartRateMetrics(updatedTest));
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

    onChange(calculateRestingHeartRateMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateRestingHeartRateMetrics(updatedTest));
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

  const getRHRRating = (bpm: number): string => {
    if (bpm < 60) return "⚡ Excellent (Athletic)";
    if (bpm < 70) return "✅ Good";
    if (bpm < 80) return "📊 Average";
    return "⚠️ Needs Improvement";
  };

  const avgRHR = value?.averageRHR;
  const lowestRHR = value?.lowestRHR;
  const fitnessRating = value?.cardiovascularFitnessRating;

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-600" />
            Resting Heart Rate
          </span>
          <Button
            type="button"
            size="sm"
            onClick={addAttempt}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Measurement
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment & Instructions */}
        <Alert className="bg-red-50 border-red-200">
          <Info className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm text-red-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Stopwatch OR Heart rate monitor/fitness watch
            </p>
            <p className="font-medium mb-1">💓 How to measure:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Measure FIRST THING in the morning (before getting out of bed)
              </li>
              <li>Sit or lie still for 5 minutes</li>
              <li>
                <strong>Manual:</strong> Find pulse on wrist/neck, count for 15
                seconds, multiply by 4
              </li>
              <li>
                <strong>Device:</strong> Use heart rate monitor/fitness watch
                reading
              </li>
              <li>Record 3 measurements on different mornings for accuracy</li>
            </ol>
            <p className="mt-2 text-xs text-red-700">
              💡 <strong>Tip:</strong> Morning RHR is most accurate. Avoid after
              caffeine/exercise.
            </p>
          </AlertDescription>
        </Alert>

        {/* Attempts */}
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No measurements recorded. Click "Add Measurement" to begin.
          </p>
        ) : (
          <>
            {attempts.map((attempt, index) => {
              const calculatedBPM =
                attempt.inputMethod === "manual" && attempt.pulseCount15Sec
                  ? pulseCountToBPM(attempt.pulseCount15Sec)
                  : attempt.heartRateBPM || 0;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Measurement {attempt.attemptNumber}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Date */}
                    <div>
                      <Label className="text-xs font-medium">Date *</Label>
                      <Input
                        type="date"
                        value={attempt.measurementDate || ""}
                        onChange={(e) =>
                          updateAttempt(
                            index,
                            "measurementDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* Time of Day */}
                    <div>
                      <Label className="text-xs font-medium">
                        Time of Day *
                      </Label>
                      <Select
                        value={attempt.timeOfDay}
                        onValueChange={(val) =>
                          updateAttempt(index, "timeOfDay", val)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            Morning (Best)
                          </SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </div>

                  {/* Input Fields - Conditional based on method */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-3">
                    {attempt.inputMethod === "manual" ? (
                      <>
                        <div>
                          <Label className="text-xs font-medium">
                            Pulse Count (15 seconds) *
                          </Label>
                          <Input
                            type="number"
                            min="8"
                            max="55"
                            value={attempt.pulseCount15Sec || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "pulseCount15Sec",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 18"
                            className="font-medium"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Count beats for 15 seconds
                          </p>
                        </div>
                        {attempt.pulseCount15Sec && (
                          <div className="bg-white rounded p-2 border border-blue-300">
                            <p className="text-xs text-blue-900">
                              <strong>Calculated Heart Rate:</strong>{" "}
                              <span className="text-lg font-bold">
                                {pulseCountToBPM(attempt.pulseCount15Sec)}
                              </span>{" "}
                              BPM
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              {getRHRRating(
                                pulseCountToBPM(attempt.pulseCount15Sec)
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs font-medium">
                            Heart Rate (BPM) *
                          </Label>
                          <Input
                            type="number"
                            min="30"
                            max="120"
                            value={attempt.heartRateBPM || ""}
                            onChange={(e) =>
                              updateAttempt(
                                index,
                                "heartRateBPM",
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="e.g., 62"
                            className="font-medium text-lg"
                          />
                        </div>
                        {attempt.heartRateBPM && (
                          <div className="bg-white rounded p-2 border border-blue-300">
                            <p className="text-xs text-blue-700">
                              {getRHRRating(attempt.heartRateBPM)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Notes (optional)</Label>
                    <Textarea
                      value={attempt.notes || ""}
                      onChange={(e) => updateNotes(index, e.target.value)}
                      placeholder="e.g., just woke up, felt well-rested, after good sleep"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}

            {/* Summary Card */}
            {lowestRHR && avgRHR && fitnessRating && (
              <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Lowest RHR</p>
                      <p className="text-3xl font-bold text-red-900">
                        {lowestRHR}
                        <span className="text-sm text-gray-600 ml-1">BPM</span>
                      </p>
                      <p className="text-xs text-red-700">Best measurement</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Average RHR</p>
                      <p className="text-3xl font-bold text-pink-900">
                        {avgRHR}
                        <span className="text-sm text-gray-600 ml-1">BPM</span>
                      </p>
                      <p className="text-xs text-pink-700">
                        Over {attempts.length} measurements
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">Fitness Rating</p>
                      <p className="text-xl font-bold text-green-900">
                        {fitnessRating}
                      </p>
                      <p className="text-xs text-green-700">
                        Based on lowest RHR
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
          <p className="font-medium">📊 Reference Ranges (Resting HR):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Excellent/Athletic: &lt;60 BPM</li>
            <li>Good: 60-69 BPM</li>
            <li>Average: 70-79 BPM</li>
            <li>Needs Improvement: 80+ BPM</li>
          </ul>
          <p className="text-red-700 font-medium mt-2">
            💡 Lower RHR generally indicates better cardiovascular fitness
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

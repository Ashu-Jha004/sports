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
import { Plus, Trash2, Timer, Info, TrendingUp } from "lucide-react";
import { CooperTest } from "@/lib/stats/types/staminaRecoveryTests";
import { calculateCooperTestMetrics } from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface CooperTestInputProps {
  value: CooperTest | undefined;
  onChange: (data: CooperTest) => void;
}

export const CooperTestInput: React.FC<CooperTestInputProps> = ({
  value,
  onChange,
}) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      distanceCovered: 0,
      testDate: new Date().toISOString().split("T")[0],
      surfaceType: "track" as const,
      weatherConditions: "",
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateCooperTestMetrics(updatedTest));
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

    onChange(calculateCooperTestMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateCooperTestMetrics(updatedTest));
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
    if (vo2 >= 60) return "Excellent (Elite)";
    if (vo2 >= 50) return "Very Good";
    if (vo2 >= 40) return "Good";
    if (vo2 >= 30) return "Fair";
    return "Poor";
  };

  const getDistanceRating = (distance: number): string => {
    if (distance >= 3000) return "⚡ Elite (3km+)";
    if (distance >= 2700) return "✅ Excellent (2.7-3km)";
    if (distance >= 2400) return "📊 Good (2.4-2.7km)";
    if (distance >= 2000) return "📈 Average (2-2.4km)";
    return "🎯 Keep Training (<2km)";
  };

  const bestAttempt =
    value?.bestAttempt !== undefined ? attempts[value.bestAttempt] : undefined;
  const vo2Max = value?.calculatedVO2Max;
  const avgDistance = value?.averageDistance;

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Timer className="w-4 h-4 mr-2 text-indigo-600" />
            Cooper 12-Minute Run Test
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
            <p className="mb-2">
              Stopwatch, Measured track or field, Distance markers
            </p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Warm up for 10-15 minutes</li>
              <li>Run as far as possible in exactly 12 minutes</li>
              <li>Maintain steady, sustainable pace (don't sprint)</li>
              <li>Can walk if needed, but keep moving</li>
              <li>At 12 minutes, mark or remember your position</li>
              <li>Measure total distance covered in meters</li>
            </ol>
            <p className="mt-2 text-xs text-indigo-700">
              💡 <strong>Tip:</strong> Use a 400m track for easy distance
              measurement (1 lap = 400m)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Distance Covered */}
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium">
                      Distance Covered (meters) *
                    </Label>
                    <Input
                      type="number"
                      min="500"
                      max="5000"
                      step="10"
                      value={attempt.distanceCovered || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "distanceCovered",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 2650"
                      className="font-medium text-lg"
                    />
                    {attempt.distanceCovered > 0 && (
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {(attempt.distanceCovered / 1000).toFixed(2)} km
                        </span>
                        <span className="text-indigo-700 font-medium">
                          {getDistanceRating(attempt.distanceCovered)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Surface Type */}
                  <div>
                    <Label className="text-xs font-medium">Surface Type</Label>
                    <Select
                      value={attempt.surfaceType || "track"}
                      onValueChange={(val) =>
                        updateAttempt(index, "surfaceType", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="track">Track</SelectItem>
                        <SelectItem value="grass">Grass Field</SelectItem>
                        <SelectItem value="treadmill">Treadmill</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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

                  {/* Weather Conditions */}
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium">
                      Weather Conditions (optional)
                    </Label>
                    <Input
                      type="text"
                      value={attempt.weatherConditions || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "weatherConditions",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Sunny, 22°C, slight wind"
                    />
                  </div>
                </div>

                {/* Pace Calculation */}
                {attempt.distanceCovered > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-2 space-y-1">
                    <p className="text-xs font-medium text-indigo-900">
                      📊 Performance Metrics:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-indigo-800">
                      <div>
                        Average pace:{" "}
                        <strong>
                          {(
                            (12 * 60) /
                            (attempt.distanceCovered / 1000)
                          ).toFixed(0)}
                        </strong>{" "}
                        min/km
                      </div>
                      <div>
                        Average speed:{" "}
                        <strong>
                          {(attempt.distanceCovered / 1000 / (12 / 60)).toFixed(
                            1
                          )}
                        </strong>{" "}
                        km/h
                      </div>
                      <div className="col-span-2">
                        Track laps (400m):{" "}
                        <strong>
                          {(attempt.distanceCovered / 400).toFixed(1)}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., felt strong, struggled in last 3 min, good pacing"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Summary Card */}
            {vo2Max && bestAttempt && (
              <Card className="bg-gradient-to-r from-green-50 to-indigo-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      Test Results
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Best Distance</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {bestAttempt.distanceCovered}
                        <span className="text-sm text-gray-600 ml-1">m</span>
                      </p>
                      <p className="text-xs text-indigo-700">
                        {(bestAttempt.distanceCovered / 1000).toFixed(2)} km
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600">
                        Calculated VO2 Max
                      </p>
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

                    {avgDistance && attempts.length > 1 && (
                      <div>
                        <p className="text-xs text-gray-600">
                          Average Distance
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {avgDistance}
                          <span className="text-sm text-gray-600 ml-1">m</span>
                        </p>
                        <p className="text-xs text-blue-700">
                          Over {attempts.length} attempts
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
          <p className="font-medium">📊 Reference Distances (12 minutes):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 3000+ meters (VO2 Max 56+)</li>
            <li>Excellent: 2700-3000m (VO2 Max 49-56)</li>
            <li>Good: 2400-2700m (VO2 Max 42-49)</li>
            <li>Average: 2000-2400m (VO2 Max 33-42)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

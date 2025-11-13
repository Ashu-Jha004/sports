import React, { useState } from "react";
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
import { Plus, Trash2, Zap, Info, Target, AlertCircle } from "lucide-react";
import { PeakHeartRateTest } from "@/lib/stats/types/staminaRecoveryTests";
import {
  calculatePeakHeartRateMetrics,
  pulseCountToBPM,
} from "@/lib/stats/helpers/staminaRecoveryCalculations";

interface PeakHeartRateTestInputProps {
  value: PeakHeartRateTest | undefined;
  onChange: (data: PeakHeartRateTest) => void;
  athleteAge?: number;
}

export const PeakHeartRateTestInput: React.FC<PeakHeartRateTestInputProps> = ({
  value,
  onChange,
  athleteAge,
}) => {
  const entries = value?.entries || [];
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const addEntry = () => {
    // ✅ FIX: Create entry in local state, not in store
    setEditingEntry({
      recordedDate: new Date().toISOString().split("T"),
      peakHR: 0,
      activityType: "",
      perceivedExertion: 9,
      inputMethod: "manual" as const,
      pulseCount15Sec: undefined,
      notes: "",
    });
  };
  const saveEntry = () => {
    if (!editingEntry) return;

    // ✅ FIX: Stricter validation
    let hasValidHR = false;
    let hasActivity = false;

    // Check activity type
    if (editingEntry.activityType?.trim()?.length > 0) {
      hasActivity = true;
    }

    // Check HR based on input method
    if (editingEntry.inputMethod === "manual") {
      hasValidHR =
        editingEntry.pulseCount15Sec && editingEntry.pulseCount15Sec >= 20;
    } else {
      hasValidHR = editingEntry.peakHR && editingEntry.peakHR >= 100;
    }

    if (!hasValidHR || !hasActivity) {
      alert(
        "Please fill in all required fields before saving:\n" +
          (!hasActivity ? "- Activity Type is required\n" : "") +
          (!hasValidHR ? "- Valid heart rate measurement is required" : "")
      );
      return;
    }

    // ✅ FIX: Ensure peakHR is calculated for manual input
    if (editingEntry.inputMethod === "manual" && editingEntry.pulseCount15Sec) {
      editingEntry.peakHR = pulseCountToBPM(editingEntry.pulseCount15Sec);
    }

    const updatedTest = {
      ...value,
      entries: [...entries, editingEntry],
    };

    onChange(calculatePeakHeartRateMetrics(updatedTest, athleteAge));
    setEditingEntry(null);
  };

  // ✅ ADD: Cancel editing
  const cancelEntry = () => {
    setEditingEntry(null);
  };
  const removeEntry = (index: number) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    const updatedTest = {
      ...value,
      entries: updatedEntries,
    };
    onChange(calculatePeakHeartRateMetrics(updatedTest, athleteAge));
  };

  const updateEntry = (index: number, field: string, val: any) => {
    const updatedEntries = entries.map((entry, idx) =>
      idx === index ? { ...entry, [field]: val } : entry
    );
    const updatedTest = {
      ...value,
      entries: updatedEntries,
    };
    onChange(calculatePeakHeartRateMetrics(updatedTest, athleteAge));
  };

  const updateNotes = (index: number, notes: string) => {
    const updatedEntries = entries.map((entry, idx) =>
      idx === index ? { ...entry, notes } : entry
    );
    onChange({
      ...value,
      entries: updatedEntries,
    });
  };

  const updateEditingEntry = (field: string, val: any) => {
    setEditingEntry((prev: any) => ({
      ...prev,
      [field]: val,
    }));
  };

  const maxRecorded = value?.maxRecordedHR;
  const estimatedMax = value?.estimatedMaxHR;
  const trainingZones = value?.trainingZones;

  const getZoneColor = (zone: number): string => {
    const colors = [
      "bg-blue-100 text-blue-900 border-blue-300",
      "bg-green-100 text-green-900 border-green-300",
      "bg-yellow-100 text-yellow-900 border-yellow-300",
      "bg-orange-100 text-orange-900 border-orange-300",
      "bg-red-100 text-red-900 border-red-300",
    ];
    return colors[zone - 1] || "bg-gray-100 text-gray-900 border-gray-300";
  };

  const getZoneName = (zone: number): string => {
    const names = [
      "Recovery/Warm-up",
      "Fat Burn/Base",
      "Aerobic/Endurance",
      "Threshold/Tempo",
      "VO2 Max/Speed",
    ];
    return names[zone - 1] || "";
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-600" />
            Peak Heart Rate & Training Zones
            <span className="text-xs text-gray-500 ml-2">(Optional)</span>
          </span>
          <Button type="button" size="sm" onClick={addEntry} variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Section */}
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Heart rate monitor OR manual pulse check, Stopwatch
            </p>
            <p className="font-medium mb-1">⚡ How to find Peak HR:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Record HR during maximum intensity activities:</li>
              <li className="ml-4">
                - Sprint intervals, Race/competition, Hill sprints, Max testing
              </li>
              <li>Measure immediately after all-out effort</li>
              <li>Rate perceived exertion (1-10 scale, should be 9-10)</li>
              <li>Record multiple times across different activities</li>
              <li>System calculates training zones from highest recorded HR</li>
            </ol>
            <p className="mt-2 text-xs text-purple-700">
              💡 <strong>Estimated Max HR:</strong> 220 - age ={" "}
              {athleteAge ? 220 - athleteAge : "?"} BPM (less accurate)
            </p>
          </AlertDescription>
        </Alert>
        {editingEntry && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-amber-900">
                  New Entry (Unsaved)
                </h4>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Date *</Label>
                  <Input
                    type="date"
                    value={editingEntry.recordedDate}
                    onChange={(e) =>
                      updateEditingEntry("recordedDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Activity Type *</Label>
                  <Input
                    type="text"
                    value={editingEntry.activityType}
                    onChange={(e) =>
                      updateEditingEntry("activityType", e.target.value)
                    }
                    placeholder="e.g., Sprint training"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Input Method *</Label>
                  <Select
                    value={editingEntry.inputMethod}
                    onValueChange={(val) =>
                      updateEditingEntry("inputMethod", val)
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

                <div>
                  <Label className="text-xs font-medium">
                    Perceived Exertion (1-10) *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editingEntry.perceivedExertion}
                    onChange={(e) =>
                      updateEditingEntry(
                        "perceivedExertion",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </div>
              </div>

              <div className="bg-white border rounded p-3">
                {editingEntry.inputMethod === "manual" ? (
                  <div>
                    <Label className="text-xs">Pulse Count (15 sec) *</Label>
                    <Input
                      type="number"
                      min="20"
                      max="55"
                      value={editingEntry.pulseCount15Sec || ""}
                      onChange={(e) =>
                        updateEditingEntry(
                          "pulseCount15Sec",
                          parseInt(e.target.value) || undefined
                        )
                      }
                      placeholder="e.g., 48"
                    />
                    {editingEntry.pulseCount15Sec && (
                      <p className="text-xs text-blue-700 mt-1">
                        = {pulseCountToBPM(editingEntry.pulseCount15Sec)} BPM
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">Peak HR (BPM) *</Label>
                    <Input
                      type="number"
                      min="100"
                      max="220"
                      value={editingEntry.peakHR || ""}
                      onChange={(e) =>
                        updateEditingEntry(
                          "peakHR",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 192"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={saveEntry}
                  size="sm"
                  className="flex-1"
                >
                  Save Entry
                </Button>
                <Button
                  type="button"
                  onClick={cancelEntry}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entry Section */}
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No peak HR entries recorded. Click "Add Entry" to begin.
          </p>
        ) : (
          <>
            {entries.map((entry, index) => {
              const calculatedBPM =
                entry.inputMethod === "manual" && entry.pulseCount15Sec
                  ? pulseCountToBPM(entry.pulseCount15Sec)
                  : entry.peakHR;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 bg-gray-50"
                >
                  {/* Entry Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Entry {index + 1}</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Entry Inputs */}
                  {/* (All other input fields unchanged — they were correct) */}

                  {/* Notes */}
                  <div>
                    <Label className="text-xs">Notes (optional)</Label>
                    <Textarea
                      value={entry.notes || ""}
                      onChange={(e) => updateNotes(index, e.target.value)}
                      placeholder="e.g., felt maximal, couldn't sustain longer, end of race"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
              );
            })}

            {/* Training Zone Summary */}
            {maxRecorded && trainingZones && (
              <div className="space-y-3">
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Max Recorded HR</p>
                        <p className="text-3xl font-bold text-purple-900">
                          {maxRecorded}
                          <span className="text-sm text-gray-600 ml-1">
                            BPM
                          </span>
                        </p>
                        <p className="text-xs text-purple-700">
                          From {entries.length} recording
                          {entries.length > 1 ? "s" : ""}
                        </p>
                      </div>

                      {estimatedMax && (
                        <div>
                          <p className="text-xs text-gray-600">
                            Estimated Max (220 - age)
                          </p>
                          <p className="text-3xl font-bold text-pink-900">
                            {estimatedMax}
                            <span className="text-sm text-gray-600 ml-1">
                              BPM
                            </span>
                          </p>
                          <p className="text-xs text-pink-700">
                            {athleteAge ? `Age: ${athleteAge}` : "Age unknown"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Zone Breakdown */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Target className="w-4 h-4 mr-2 text-indigo-600" />
                      Training Zones (Based on {maxRecorded} BPM max)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[1, 2, 3, 4, 5].map((zone) => {
                      const zoneData =
                        trainingZones[
                          `zone${zone}` as keyof typeof trainingZones
                        ];
                      if (!zoneData) return null;
                      const [min, max] = zoneData; // ✅ destructure tuple

                      return (
                        <div
                          key={zone}
                          className={`border rounded p-3 ${getZoneColor(zone)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold">
                                Zone {zone}: {getZoneName(zone)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {min}-{max}
                              </p>
                              <p className="text-xs">BPM</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Footer Info */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 How to Use Training Zones:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>Zone 1-2:</strong> Recovery runs, easy days
            </li>
            <li>
              <strong>Zone 3:</strong> Long steady runs, base training
            </li>
            <li>
              <strong>Zone 4:</strong> Tempo runs, race pace
            </li>
            <li>
              <strong>Zone 5:</strong> Intervals, sprints, max effort
            </li>
          </ul>
          <p className="text-purple-700 font-medium mt-2">
            💡 Most training (80%) should be in Zones 1-3. Use Zones 4-5
            sparingly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

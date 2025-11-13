import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, Info } from "lucide-react";
import { VisualReactionSpeedDrill } from "@/lib/stats/types/speedAgilityTests";
import { calculateVisualReactionMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface VisualReactionSpeedDrillInputProps {
  value: VisualReactionSpeedDrill | undefined;
  onChange: (data: VisualReactionSpeedDrill) => void;
}

export const VisualReactionSpeedDrillInput: React.FC<
  VisualReactionSpeedDrillInputProps
> = ({ value, onChange }) => {
  const attempts = value?.attempts || [];

  const addAttempt = () => {
    const newAttempt = {
      attemptNumber: attempts.length + 1,
      reactionTime: 0,
      stimulus: "visual" as const,
      notes: "",
    };

    const updatedTest = {
      attempts: [...attempts, newAttempt],
    };

    onChange(calculateVisualReactionMetrics(updatedTest));
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

    onChange(calculateVisualReactionMetrics(updatedTest));
  };

  const updateAttempt = (index: number, field: string, val: any) => {
    const updatedAttempts = attempts.map((att, idx) =>
      idx === index ? { ...att, [field]: val } : att
    );

    const updatedTest = {
      ...value,
      attempts: updatedAttempts,
    };

    onChange(calculateVisualReactionMetrics(updatedTest));
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

  const bestReactionTime = value?.bestReactionTime;
  const meanReactionTime = value?.meanReactionTime;

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-600" />
            Visual Reaction Speed Drill
            <Badge variant="secondary" className="text-xs">
              Optional
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
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">
              Stopwatch, Light/sound source (phone app), Cones
            </p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Use reaction time app or partner with light/sound signal</li>
              <li>Athlete stands ready in starting position</li>
              <li>
                On stimulus (visual/audio), sprint 5-10m as fast as possible
              </li>
              <li>Record reaction time from stimulus to movement initiation</li>
              <li>Perform 5-10 attempts with rest between each</li>
            </ol>
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
                      Reaction Time (milliseconds) *
                    </Label>
                    <Input
                      type="number"
                      step="1"
                      value={attempt.reactionTime || ""}
                      onChange={(e) =>
                        updateAttempt(
                          index,
                          "reactionTime",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 245"
                    />
                    {attempt.reactionTime > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {attempt.reactionTime < 200
                          ? "⚡ Exceptional"
                          : attempt.reactionTime < 250
                          ? "✅ Excellent"
                          : attempt.reactionTime < 300
                          ? "📊 Good"
                          : attempt.reactionTime < 350
                          ? "📈 Average"
                          : "⏱️ Slow"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Stimulus Type *</Label>
                    <select
                      title="select"
                      value={attempt.stimulus}
                      onChange={(e) =>
                        updateAttempt(index, "stimulus", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="visual">Visual (light/color)</option>
                      <option value="audio">Audio (sound/beep)</option>
                      <option value="mixed">Mixed (random)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={attempt.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    placeholder="e.g., anticipated signal, distracted, perfect focus"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}

            {(bestReactionTime || meanReactionTime) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  {bestReactionTime && (
                    <div>
                      <p className="text-xs font-medium text-amber-900">
                        Best Reaction Time
                      </p>
                      <p className="text-xl font-bold text-amber-900">
                        {bestReactionTime.toFixed(0)}ms
                      </p>
                    </div>
                  )}
                  {meanReactionTime && attempts.length > 1 && (
                    <div>
                      <p className="text-xs font-medium text-amber-900">
                        Average Reaction Time
                      </p>
                      <p className="text-xl font-bold text-amber-900">
                        {meanReactionTime.toFixed(0)}ms
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-1">
          <p className="font-medium">📊 Reference Times (Reaction):</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Elite athletes: 150-200ms</li>
            <li>Good athletes: 200-250ms</li>
            <li>Average: 250-300ms</li>
            <li>Human average: 200-300ms</li>
          </ul>
          <p className="text-amber-700 font-medium mt-2">
            💡 Tip: Use apps like "Reaction Time Test" for accurate measurement.
            Multiple attempts recommended due to variability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

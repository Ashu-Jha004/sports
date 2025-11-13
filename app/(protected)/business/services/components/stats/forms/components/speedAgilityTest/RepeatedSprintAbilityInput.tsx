import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Info, AlertTriangle } from "lucide-react";
import { RepeatedSprintAbilityTest } from "@/lib/stats/types/speedAgilityTests";
import { calculateRSAMetrics } from "@/lib/stats/helpers/speedAgilityCalculations";

interface RepeatedSprintAbilityInputProps {
  value: RepeatedSprintAbilityTest | undefined;
  onChange: (data: RepeatedSprintAbilityTest) => void;
}

export const RepeatedSprintAbilityInput: React.FC<
  RepeatedSprintAbilityInputProps
> = ({ value, onChange }) => {
  const sprintTimes = value?.sprintTimes || [0, 0, 0, 0, 0, 0];
  const restInterval = value?.restInterval || 20;

  const updateSprintTime = (index: number, time: number) => {
    const updated = [...sprintTimes];
    updated[index] = time;

    const updatedTest: RepeatedSprintAbilityTest = {
      sprintTimes: updated,
      restInterval,
    };

    onChange(calculateRSAMetrics(updatedTest));
  };

  const updateRestInterval = (interval: number) => {
    const updatedTest: RepeatedSprintAbilityTest = {
      sprintTimes,
      restInterval: interval,
    };

    onChange(calculateRSAMetrics(updatedTest));
  };

  const bestTime = value?.bestTime;
  const worstTime = value?.worstTime;
  const meanTime = value?.meanTime;
  const totalTime = value?.totalTime;
  const fatigueIndex = value?.fatigueIndex;
  const percentDecrement = value?.percentDecrement;

  const isComplete = sprintTimes.every((t) => t > 0);

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Activity className="w-4 h-4 mr-2 text-purple-600" />
          Repeated Sprint Ability (RSA) Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment & Instructions */}
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            <p className="font-medium mb-1">📦 Equipment Required:</p>
            <p className="mb-2">Stopwatch, Measuring tape, Multiple cones</p>
            <p className="font-medium mb-1">🏃 How to perform:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Set up 30-meter sprint course with cones</li>
              <li>Perform 6 maximal 30m sprints</li>
              <li>Rest for 20 seconds between each sprint</li>
              <li>Record time for each sprint</li>
              <li>Maintain maximum effort throughout all sprints</li>
            </ol>
            <p className="text-purple-800 font-medium mt-2">
              ⚠️ This test measures sprint endurance and fatigue resistance
            </p>
          </AlertDescription>
        </Alert>

        {/* Rest Interval Configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <Label className="text-sm font-medium">Rest Interval (seconds)</Label>
          <Input
            type="number"
            step="1"
            value={restInterval}
            onChange={(e) => updateRestInterval(parseInt(e.target.value) || 20)}
            placeholder="20"
            className="mt-2"
          />
          <p className="text-xs text-gray-600 mt-1">
            Standard: 20 seconds. Can be adjusted to 10-30s based on protocol.
          </p>
        </div>

        {/* Sprint Times Grid */}
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Sprint Times (30m each) - All 6 sprints required *
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((sprintNum) => (
              <div key={sprintNum} className="space-y-1">
                <Label className="text-xs">Sprint {sprintNum} (seconds)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={sprintTimes[sprintNum - 1] || ""}
                  onChange={(e) =>
                    updateSprintTime(
                      sprintNum - 1,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="e.g., 4.32"
                  className={
                    sprintTimes[sprintNum - 1] === 0
                      ? "border-amber-300"
                      : sprintTimes[sprintNum - 1] === bestTime
                      ? "border-green-400 bg-green-50"
                      : sprintTimes[sprintNum - 1] === worstTime
                      ? "border-red-400 bg-red-50"
                      : ""
                  }
                />
                {sprintTimes[sprintNum - 1] > 0 && (
                  <p className="text-xs text-gray-600">
                    {sprintTimes[sprintNum - 1] === bestTime && "🏆 Best"}
                    {sprintTimes[sprintNum - 1] === worstTime && "📉 Worst"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Metrics */}
        {isComplete && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-purple-900">
              📊 RSA Performance Metrics
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-purple-700">Best Time</p>
                <p className="text-lg font-bold text-purple-900">
                  {bestTime?.toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Worst Time</p>
                <p className="text-lg font-bold text-purple-900">
                  {worstTime?.toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Mean Time</p>
                <p className="text-lg font-bold text-purple-900">
                  {meanTime?.toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Total Time</p>
                <p className="text-lg font-bold text-purple-900">
                  {totalTime?.toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">Fatigue Index</p>
                <p className="text-lg font-bold text-purple-900">
                  {fatigueIndex?.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">
                  {fatigueIndex !== undefined && fatigueIndex < 5
                    ? "Excellent"
                    : fatigueIndex !== undefined && fatigueIndex < 8
                    ? "Good"
                    : fatigueIndex !== undefined && fatigueIndex < 12
                    ? "Average"
                    : "High fatigue"}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700">% Decrement</p>
                <p className="text-lg font-bold text-purple-900">
                  {percentDecrement?.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600">
                  {percentDecrement !== undefined && percentDecrement < 3
                    ? "Elite"
                    : percentDecrement !== undefined && percentDecrement < 5
                    ? "Very good"
                    : percentDecrement !== undefined && percentDecrement < 8
                    ? "Good"
                    : "Moderate"}
                </p>
              </div>
            </div>

            {/* Fatigue Warning */}
            {fatigueIndex !== undefined && fatigueIndex > 10 && (
              <Alert className="bg-amber-50 border-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">
                  High fatigue index detected. Consider improving aerobic
                  conditioning and recovery capacity.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Formula Explanation */}
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-3 space-y-2">
          <p className="font-medium">📐 Calculation Formulas:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>Fatigue Index:</strong> ((Worst - Best) / Best) × 100
            </li>
            <li>
              <strong>% Decrement:</strong> 100 - ((Total / (Best × 6)) × 100)
            </li>
          </ul>
          <p className="font-medium mt-2">📊 Reference Values:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              Fatigue Index: &lt;5% = Excellent, 5-8% = Good, &gt;10% = Poor
            </li>
            <li>
              % Decrement: &lt;3% = Elite, 3-5% = Very good, &gt;8% = Moderate
            </li>
          </ul>
          <p className="text-purple-700 font-medium mt-2">
            💡 Tip: Lower fatigue values indicate better anaerobic endurance and
            recovery between sprints.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

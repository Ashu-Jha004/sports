"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ChartBarIcon,
  CloudLightningIcon,
  ClockIcon,
  HeartIcon,
  Flame,
  GraduationCap,
} from "lucide-react";

import {
  enhancedRenderValue,
  filterKeys,
  formatDate,
} from "../../utils/renderHelpers";

import {
  calculateFatigueIndex,
  fatigueIndexDescription,
  estimatePower,
  estimatedPowerDescription,
  calculateMaxStrength,
  maxStrengthDescription,
  calculateRelativeStrengthRatio,
  relativeStrengthRatioDescription,
  estimateJumpPower,
  jumpPowerDescription,
  calculateAverageSprintSpeed,
  averageSprintSpeedDescription,
  estimateVO2Max,
  vo2MaxDescription,
  calculateHeartRateRecovery,
  heartRateRecoveryDescription,
} from "../HexagramChart/derivedMetrics";

interface AthleteStatsFullReportProps {
  open: boolean;
  onClose: () => void;
  rawDetails: any;
  bodyWeight?: number;
  bodyMass?: number;
}

const InfoTooltip = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <span className="cursor-pointer ml-1 text-blue-500">ⓘ</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-2 text-sm">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

function getAttemptsData(key: string, rawDetails: any): any[] {
  for (const cat of Object.values(rawDetails) as Record<string, any>[]) {
    if (cat && typeof cat === "object") {
      const test = cat[key];
      if (test && typeof test === "object" && Array.isArray(test.attempts)) {
        return test.attempts;
      }
    }
  }
  return [];
}

function extractNumbers(attempts: any[], path: string[]): number[] {
  return attempts
    .map((attempt: any) =>
      path.reduce((val: any, p: string) => val?.[p], attempt)
    )
    .filter(
      (num: unknown): num is number => typeof num === "number" && !isNaN(num)
    );
}

function calculateMetricSafely(
  calculationFn: () => number | null
): number | null {
  try {
    const result = calculationFn();
    return result !== null && !isNaN(result) ? result : null;
  } catch {
    return null;
  }
}

const formatFieldName = (key: string): string => {
  if (/^\d+$/.test(key)) {
    return `Value ${key}`;
  }

  const fieldMappings: Record<string, string> = {
    testDate: "Test Date",
    finalLevel: "Final Level",
    finalShuttle: "Final Shuttle",
    load: "Load(Kg)",
    bodyWeight: "Body weight(kg)",
    duration: "Duration(sec)",
    totalTimeUsed: "Total time Used (Sec)",
    Body_Weight: "Body Weight(kg)",
    totalReps: "reps",
    distanceCovered: "Distance Covered(m)",
    surfaceType: "Surface Type",
    weatherConditions: "Weather Conditions",
    jumpReach: "Jump Reach(m)",
    jumpHeight: "Jump Height(m)",
    standingReach: "Standing Reach(m)",
    leftTurnTime: "Left Turn Time(sec)",
    rightTurnTime: "Right Turn Time(sec)",
    completedInTime: "Completed In Time(sec)",
    timeLimit: "Time Limit(sec)",
    formQuality: "Form Quality",
    timeUsed: "Time Used(sec)",
    dropHeight: "Drop Height(m)",
    flightTime: "Flight Time(sec)",
    sprintTime: "Sprint Time(sec)",
    completionTime: "Completion Time(sec)",
    mean: "Mean Time(sec)",
    Distance: "Distance(m)",
    reactionTime: "Reaction Time(sec)",
  };

  if (fieldMappings[key]) {
    return fieldMappings[key];
  }

  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const EXCLUDED_KEYS = [
  "id",
  "statId",
  "athleteId",
  "clerkId",
  "timestamp",
  "strengthHistory",
  "speedHistory",
  "staminaHistory",
];

const PARENT_METADATA_KEYS = [
  "id",
  "statId",
  "athleteId",
  "clerkId",
  "userId",
  "name",
  "email",
  "age",
  "gender",
  "profileImage",
  "bio",
  "location",
  "sport",
  "position",
  "team",
  "coach",
  "strengthHistory",
  "speedHistory",
  "staminaHistory",
];

const EXCLUDED_CATEGORIES = [
  "id",
  "userId",
  "lastUpdatedBy",
  "lastUpdatedAt",
  "lastUpdatedByName",
  "createdAt",
  "updatedAt",
  "athlete",
];

function isObject(v: any): v is Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v);
}
function isNumber(v: any): v is number {
  return typeof v === "number" && !isNaN(v);
}

export const AthleteStatsFullReport: React.FC<AthleteStatsFullReportProps> = ({
  open,
  onClose,
  rawDetails,
}) => {
  if (!open) return null;

  if (!rawDetails) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 p-6 overflow-y-auto z-50">
        <Button onClick={onClose} className="mb-4">
          Back to Profile
        </Button>
        <div>No Data Available</div>
      </div>
    );
  }
  const AI_COACH_PROMPT =
    "Provide AI coaching based on the following raw stats data:";
  const [showAIDialog, setShowAIDialog] = useState(false);
  const handleAICoachClick = async () => {
    try {
      const combinedData = {
        prompt: AI_COACH_PROMPT,
        rawStats: rawDetails,
      };
      await navigator.clipboard.writeText(
        JSON.stringify(combinedData, null, 2)
      );
      setShowAIDialog(true);

      setTimeout(() => {
        window.open(
          "https://gemini.google.com",
          "_blank",
          "noopener,noreferrer"
        ); // Official Google Gemini URL placeholder
      }, 5000);
    } catch (error) {
      alert("Failed to copy data to clipboard. Please try again.");
    }
  };

  const categories = Object.entries(rawDetails).filter(
    ([categoryName, val]) =>
      !EXCLUDED_CATEGORIES.includes(categoryName) &&
      isObject(val) &&
      Object.keys(val).length > 0
  );

  // Extract actual bodyweight/mass from rawDetails if available
  let actualBodyWeight = rawDetails.weight;
  let actualBodyMass = rawDetails.bodeMass;

  for (const cat of Object.values(rawDetails)) {
    if (isObject(cat) && isNumber((cat as any).athleteBodyWeight)) {
      actualBodyWeight = (cat as any).athleteBodyWeight;
      actualBodyMass = (cat as any).athleteBodyWeight;
      break;
    }
  }

  // Metrics extraction
  const ballistic = getAttemptsData("BallisticBenchPress", rawDetails);
  const loads = extractNumbers(ballistic, ["data", "load"]);
  const reps = extractNumbers(ballistic, ["data", "reps"]);

  const fatigueIndex = calculateMetricSafely(() =>
    reps.length > 1 ? calculateFatigueIndex(reps) : null
  );

  const estimatedPowerVal = calculateMetricSafely(() => {
    if (loads.length > 0 && reps.length > 0) {
      const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
      const avgReps = reps.reduce((a, b) => a + b, 0) / reps.length;
      return avgLoad * avgReps * 5; // rough estimation
    }
    return null;
  });

  let maxStrength: number | null = null;
  for (const cat of Object.values(rawDetails)) {
    const test = (cat as any)["WeightedPullup"];
    if (test) {
      if (isNumber(test.maxLoad)) {
        maxStrength = test.maxLoad;
        break;
      }
      if (Array.isArray(test.sets)) {
        const setLoads = test.sets.map((s: any) => s?.load).filter(isNumber);
        if (setLoads.length) {
          maxStrength = Math.max(...setLoads);
          break;
        }
      }
    }
  }

  const relativeStrength = calculateMetricSafely(() =>
    maxStrength && actualBodyWeight
      ? calculateRelativeStrengthRatio(maxStrength, actualBodyWeight)
      : null
  );

  const cmj = getAttemptsData("CountermovementJump", rawDetails);
  const jumpHeights = extractNumbers(cmj, ["data", "jumpHeight"]);
  const avgJump =
    jumpHeights.length > 0
      ? jumpHeights.reduce((a, b) => a + b, 0) / jumpHeights.length
      : null;

  const jumpPower = calculateMetricSafely(() =>
    avgJump !== null && actualBodyMass
      ? estimateJumpPower(avgJump, actualBodyMass)
      : null
  );

  let sprintTime: number | null = null;
  for (const cat of Object.values(rawDetails)) {
    const test = (cat as any)["TenMeterSprint"];
    if (test && test.attempts && Array.isArray(test.attempts)) {
      if (isNumber(test.bestTime)) {
        sprintTime = test.bestTime;
        break;
      }
      const attempt = test.attempts[0];
      if (attempt && isNumber(attempt.sprintTime)) {
        sprintTime = attempt.sprintTime;
        break;
      }
    }
  }

  const avgSprintSpeed = calculateMetricSafely(() =>
    sprintTime !== null ? calculateAverageSprintSpeed(10, sprintTime) : null
  );

  let distance12: number | null = null;
  for (const cat of Object.values(rawDetails)) {
    const test = (cat as any)["CooperTest"];
    if (test && test.attempts && Array.isArray(test.attempts)) {
      if (isNumber(test.averageDistance)) {
        distance12 = test.averageDistance;
        break;
      }
      const attempt = test.attempts[0];
      if (attempt && isNumber(attempt.distanceCovered)) {
        distance12 = attempt.distanceCovered;
        break;
      }
    }
  }

  const vo2max = calculateMetricSafely(() =>
    distance12 !== null ? estimateVO2Max(distance12) : null
  );

  let hrRecovery: number | null = null;
  for (const cat of Object.values(rawDetails)) {
    const test = (cat as any)["PostExerciseHeartRateRecovery"];
    if (test) {
      if (isNumber(test.averageRecoveryRate)) {
        hrRecovery = test.averageRecoveryRate;
        break;
      }
      if (Array.isArray(test.attempts) && test.attempts[0]) {
        const attempt = test.attempts[0];
        if (isNumber(attempt.peakHR) && isNumber(attempt.recovery1MinHR)) {
          hrRecovery = calculateHeartRateRecovery(
            attempt.peakHR,
            attempt.recovery1MinHR
          );
          break;
        }
      }
    }
  }

  const derivedMetrics = [
    {
      name: "Fatigue Index",
      value: fatigueIndex,
      unit: "%",
      description: fatigueIndexDescription,
    },
    {
      name: "Estimated Power (Bench Press)",
      value: estimatedPowerVal,
      unit: "W",
      description: estimatedPowerDescription,
    },
    {
      name: "Max Strength (Weighted Pull-ups)",
      value: maxStrength,
      unit: "kg",
      description: maxStrengthDescription,
    },
    {
      name: "Relative Strength Ratio",
      value: relativeStrength,
      unit: "",
      description: relativeStrengthRatioDescription,
    },
    {
      name: "Jump Power Estimate",
      value: jumpPower,
      unit: "W",
      description: jumpPowerDescription,
    },
    {
      name: "Average 10m Sprint Speed",
      value: avgSprintSpeed,
      unit: "m/s",
      description: averageSprintSpeedDescription,
    },
    {
      name: "Estimated VO2 Max",
      value: vo2max,
      unit: "ml/kg/min",
      description: vo2MaxDescription,
    },
    {
      name: "Heart Rate Recovery",
      value: hrRecovery,
      unit: "bpm",
      description: heartRateRecoveryDescription,
    },
  ];

  return (
    <div className="fixed inset-0 w-full h-full bg-white dark:bg-gray-900 overflow-y-auto z-50">
      <div className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-900 z-50 space-x-4">
        <Button onClick={onClose} variant="outline">
          Back to Profile
        </Button>
        <h1 className="text-xl font-bold flex-grow text-center">
          Full Athlete Stats Report
        </h1>
        <Button
          onClick={handleAICoachClick}
          variant="default"
          color="black"
          className="whitespace-nowrap"
        >
          AI Coach
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {categories.map(([categoryName, tests]) => (
          <Card
            key={categoryName}
            className="mb-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700"
          >
            <CardHeader className="bg-gray-100 dark:bg-gray-800 rounded-t-lg">
              <CardTitle className="capitalize font-semibold text-lg text-gray-900 dark:text-gray-100">
                {categoryName.replace(/([A-Z])/g, " $1").trim()}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {Object.entries(tests as Record<string, any>)
                .filter(([testKey, testData]) => {
                  const isMetadataKey = PARENT_METADATA_KEYS.includes(testKey);
                  return !isMetadataKey && testData !== null;
                })
                .map(([testName, testData]) => {
                  return (
                    <div key={testName} className="mb-6">
                      <h4 className="font-semibold text-lg mb-3">
                        {testName.replace(/_/g, " ")}
                      </h4>

                      {testData?.attempts &&
                      Array.isArray(testData.attempts) ? (
                        <div className="space-y-4">
                          {testData.attempts.map((attempt: any, i: number) => {
                            // Extract data source
                            const dataSource = attempt.data || attempt;

                            // Get all field entries
                            const fields = Object.entries(dataSource).filter(
                              ([key]) =>
                                key !== "attemptNumber" &&
                                key !== "notes" &&
                                filterKeys(key)
                            );

                            return (
                              <div
                                key={i}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                              >
                                <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  Attempt #{attempt.attemptNumber ?? i + 1}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {fields.map(([key, value]) => (
                                    <div key={key} className="flex items-start">
                                      <span className="font-medium text-sm min-w-[140px]">
                                        {formatFieldName(key)}:
                                      </span>
                                      <span className="text-sm ml-2">
                                        {enhancedRenderValue(value, 0, key)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {attempt.notes && (
                                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                    <span className="font-medium text-sm">
                                      Notes:{" "}
                                    </span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {attempt.notes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : isObject(testData) ? (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(testData)
                              .filter(
                                ([key, val]) =>
                                  (filterKeys(key) ||
                                    key === "createdAt" ||
                                    key === "updatedAt") &&
                                  val != null &&
                                  !EXCLUDED_KEYS.includes(key)
                              )
                              .map(([key, value]) => (
                                <div key={key} className="flex items-start">
                                  <span className="font-medium text-sm min-w-[140px]">
                                    {key === "createdAt"
                                      ? "Created At"
                                      : key === "updatedAt"
                                      ? "Updated At"
                                      : formatFieldName(key)}
                                    :
                                  </span>
                                  <span className="text-sm ml-2">
                                    {key === "createdAt" || key === "updatedAt"
                                      ? formatDate(String(value))
                                      : enhancedRenderValue(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          {enhancedRenderValue(testData)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}

        {/* ---------------- Derived Metrics ---------------- */}

        <Card className="mb-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 rounded-t-lg">
            <CardTitle className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Calculated Derived Metrics
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {derivedMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between"
                >
                  <span className="font-medium text-sm">
                    {metric.name} <InfoTooltip text={metric.description} />
                  </span>
                  <span className="text-sm font-semibold">
                    {metric.value !== null
                      ? `${metric.value.toFixed(2)} ${metric.unit}`
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {showAIDialog && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black bg-opacity-70 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full text-center shadow-lg">
            <div className="mb-4">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2 text-green-600">
              ✓ Data Copied Successfully
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Opening Google Gemini in a new tab...
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded text-left text-xs">
              <p className="font-semibold mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Wait for Gemini to load</li>
                <li>Click in the chat input box</li>
                <li>
                  Press{" "}
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+V</kbd>{" "}
                  (or <kbd className="px-2 py-1 bg-gray-200 rounded">Cmd+V</kbd>{" "}
                  on Mac)
                </li>
                <li>Press Enter to get AI coaching insights</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      {showAIDialog && (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black bg-opacity-70 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full text-center shadow-lg relative">
            {/* Close button */}
            <button
              onClick={() => setShowAIDialog(false)}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded focus:outline-none"
              aria-label="Close"
            >
              &#x2715; {/* Cross "×" symbol */}
            </button>

            <div className="mb-4">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2 text-green-600">
              ✓ Data Copied Successfully
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Opening Google Gemini in a new tab...
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded text-left text-xs">
              <p className="font-semibold mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Wait for Gemini to load</li>
                <li>Click in the chat input box</li>
                <li>
                  Press{" "}
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+V</kbd>{" "}
                  (or <kbd className="px-2 py-1 bg-gray-200 rounded">Cmd+V</kbd>{" "}
                  on Mac)
                </li>
                <li>Press Enter to get AI coaching insights</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

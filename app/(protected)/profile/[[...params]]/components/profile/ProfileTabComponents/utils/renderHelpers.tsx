export const metricUnits: Record<string, string> = {
  load: "kg",
  maxLoad: "kg",
  reps: "reps",
  jumpHeight: "m",
  jumpReach: "m",
  athleteBodyWeight: "kg",
  flightTime: "sec",
  sprintTime: "sec",
  timeLimit: "sec",
  timeUsed: "sec",
  distanceCovered: "m",
  bestTime: "sec",
  dropHeight: "m",
  standingReach: "m",
  restAfter: "sec",
  body_weight: "kg",
  restingHR: "bpm",
  peakHR: "bpm",
  bodyFat: "%",
  bodyWeight: "kg",
  totalReps: "reps",
  totalTimeUsed: "sec",
  muscleMass: "kg",
  explosivePower: "Watt",
  enduranceStrength: "reps",
  standingLongJump: "m",
  splitTime_0_10m: "sec",
  splitTime_0_20m: "sec",
  splitTime_0_30m: "sec",
  totalTime_0_40m: "sec",
  vo2Max: "ml/kg/min",
  recoveryRate: "bpm",
  heartRateRecovery: "bpm",
};

export function filterKeys(key: string): boolean {
  const excludeKeys = [
    "id",
    "statId",
    "athleteId",
    "clerkId",
    "timestamp",
    // Keep "createdAt" and "updatedAt" visible
  ];
  const shouldInclude = !excludeKeys.includes(key);

  // Debug logging
  console.log(`[filterKeys] Key: "${key}" | Included: ${shouldInclude}`);

  return shouldInclude;
}

// Format ISO Date string to readable format
export function formatDate(value: string): string {
  try {
    const d = new Date(value);
    const formatted = d.toLocaleString();
    console.log(`[formatDate] Input: "${value}" | Output: "${formatted}"`);
    return formatted;
  } catch (error) {
    console.log(`[formatDate] Error formatting: "${value}"`, error);
    return value;
  }
}

// Recursively render nested structures nicely

export function enhancedRenderValue(
  value: any,
  depth: number = 0,
  key?: any
): React.ReactNode {
  const indent = "  ".repeat(depth);

  if (value === null || value === undefined) {
    return "N/A";
  }

  if (typeof value === "number" && typeof key) {
    const unit = metricUnits[key] || "";
    return (
      <>
        {value} {unit}
      </>
    );
  }

  if (typeof value === "string") {
    const isDate = /^\d{4}-\d{2}-\d{2}T/.test(value);
    if (isDate) return formatDate(value);
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return (
      <ul className="list-disc list-inside ml-4">
        {value.map((item, index) => (
          <li key={index}>{enhancedRenderValue(item, depth + 1)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const allKeys = Object.keys(value);
    const entries = Object.entries(value).filter(([k, v]) => {
      const shouldInclude =
        (filterKeys(k) || k === "createdAt" || k === "updatedAt") && v != null;
      return shouldInclude;
    });

    if (entries.length === 0) return "{}";

    return (
      <table className="mb-2 w-full text-sm border border-gray-300 dark:border-gray-600 table-fixed">
        <tbody>
          {entries.map(([k, v]) => (
            <tr
              key={k}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <td className="font-semibold pr-2 align-top">
                {k === "createdAt"
                  ? "Created At"
                  : k === "updatedAt"
                  ? "Updated At"
                  : k}
              </td>
              <td>
                {k === "createdAt" || k === "updatedAt"
                  ? formatDate(String(v))
                  : enhancedRenderValue(v, depth + 1, k)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return String(value);
}

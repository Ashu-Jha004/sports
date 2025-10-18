// Helper functions for stats calculations and validations

export interface PerformanceMetrics {
  overall: number;
  strength: number;
  speed: number;
  endurance: number;
  flexibility: number;
}

export interface InjurySummary {
  total: number;
  active: number;
  recovering: number;
  recovered: number;
  riskLevel: "low" | "moderate" | "high";
}

// Calculate overall performance score
export const calculateOverallPerformance = (
  formData: any
): PerformanceMetrics => {
  const strengthScores = Object.values(formData.strengthPower || {}).filter(
    Boolean
  ) as number[];
  const speedScores = Object.values(formData.speedAgility || {}).filter(
    Boolean
  ) as number[];

  const strengthAvg =
    strengthScores.length > 0
      ? strengthScores.reduce((sum, score) => sum + score, 0) /
        strengthScores.length
      : 0;

  const speedAvg =
    speedScores.length > 0
      ? speedScores.reduce((sum, score) => sum + score, 0) / speedScores.length
      : 0;

  const enduranceScore = formData.staminaRecovery?.vo2Max
    ? Math.min(100, (formData.staminaRecovery.vo2Max / 60) * 100)
    : 0;

  const flexibilityScore =
    formData.staminaRecovery?.flexibility !== null
      ? Math.max(
          0,
          Math.min(100, (formData.staminaRecovery.flexibility + 20) * 2.5)
        )
      : 0;

  const overall = [strengthAvg, speedAvg, enduranceScore, flexibilityScore]
    .filter((score) => score > 0)
    .reduce((sum, score, _, arr) => sum + score / arr.length, 0);

  return {
    overall: Math.round(overall),
    strength: Math.round(strengthAvg),
    speed: Math.round(speedAvg),
    endurance: Math.round(enduranceScore),
    flexibility: Math.round(flexibilityScore),
  };
};

// Analyze injury risk and impact
export const analyzeInjuries = (injuries: any[]): InjurySummary => {
  const summary = {
    total: injuries.length,
    active: injuries.filter((i) => i.status === "active").length,
    recovering: injuries.filter((i) => i.status === "recovering").length,
    recovered: injuries.filter((i) => i.status === "recovered").length,
    riskLevel: "low" as "low" | "moderate" | "high",
  };

  // Determine risk level
  const activeCount = summary.active;
  const severeCount = injuries.filter(
    (i) => i.severity === "severe" && i.status !== "recovered"
  ).length;

  if (activeCount >= 3 || severeCount >= 2) {
    summary.riskLevel = "high";
  } else if (activeCount >= 2 || severeCount >= 1) {
    summary.riskLevel = "moderate";
  }

  return summary;
};

// Generate performance recommendations
export const generateRecommendations = (formData: any): string[] => {
  const recommendations: string[] = [];
  const metrics = calculateOverallPerformance(formData);
  const injuries = analyzeInjuries(formData.injuries || []);

  // Injury-based recommendations
  if (injuries.active > 0) {
    recommendations.push("Address active injuries before intensive training");
  }

  if (injuries.riskLevel === "high") {
    recommendations.push(
      "Consider injury prevention program and recovery protocols"
    );
  }

  // Performance-based recommendations
  if (metrics.strength < 60) {
    recommendations.push("Focus on strength training to improve overall power");
  }

  if (metrics.speed < 60) {
    recommendations.push(
      "Incorporate speed and agility drills into training routine"
    );
  }

  if (metrics.endurance < 60) {
    recommendations.push(
      "Increase cardiovascular conditioning for better stamina"
    );
  }

  if (metrics.flexibility < 50) {
    recommendations.push(
      "Add flexibility and mobility work to prevent injuries"
    );
  }

  // VO2 Max specific recommendations
  if (
    formData.staminaRecovery?.vo2Max &&
    formData.staminaRecovery.vo2Max < 40
  ) {
    recommendations.push("Implement aerobic base building program");
  }

  // Recovery recommendations
  if (
    formData.staminaRecovery?.recoveryTime &&
    formData.staminaRecovery.recoveryTime > 180
  ) {
    recommendations.push("Work on recovery techniques and conditioning");
  }

  // General recommendations
  if (metrics.overall < 70) {
    recommendations.push(
      "Consider comprehensive training program for balanced development"
    );
  }

  recommendations.push(
    "Schedule follow-up assessment in 3-6 months to track progress"
  );

  return recommendations;
};

// Format numeric values for display
export const formatMetricValue = (
  value: number | null,
  unit: string
): string => {
  if (value === null || value === undefined) return "Not recorded";

  switch (unit) {
    case "cm":
      return `${value} cm`;
    case "kg":
      return `${value} kg`;
    case "%":
      return `${value}%`;
    case "score":
      return `${value}/100`;
    case "seconds":
      return `${value}s`;
    case "ml/kg/min":
      return `${value} ml/kg/min`;
    default:
      return String(value);
  }
};

// Calculate BMI
export const calculateBMI = (
  height: number | null,
  weight: number | null
): number | null => {
  if (!height || !weight) return null;
  return Math.round((weight / (height / 100) ** 2) * 10) / 10;
};

// Get BMI classification
export const getBMIClassification = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

// Performance level classifications
export const getPerformanceLevel = (
  score: number
): { label: string; color: string } => {
  if (score >= 90) return { label: "Elite", color: "purple" };
  if (score >= 80) return { label: "Excellent", color: "green" };
  if (score >= 70) return { label: "Good", color: "blue" };
  if (score >= 60) return { label: "Average", color: "yellow" };
  if (score >= 50) return { label: "Below Average", color: "orange" };
  return { label: "Needs Improvement", color: "red" };
};

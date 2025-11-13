// ============================================
// FILE: config/wizard.config.ts
// Centralized configuration constants
// ============================================

import type { StepSections } from "../wizard.types";
import type {
  WizardFormData,
  BasicMetricsData,
  InjuryInput,
} from "../wizard.types";

export const WIZARD_CONFIG = {
  TOTAL_STEPS: 12,
  AUTO_SAVE_DELAY: 1000, // ms
  RECALCULATE_DELAY: 300, // ms
  UPDATE_RECALCULATE_DELAY: 500, // ms
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
} as const;

export const STEP_CONFIG: StepSections = {
  1: {
    section: "basicMetrics",
    type: "instruction",
    title: "Basic Metrics Guide",
  },
  2: {
    section: "basicMetrics",
    type: "form",
    title: "Basic Measurements",
  },
  3: {
    section: "strengthPower",
    type: "instruction",
    title: "Strength & Power Guide",
  },
  4: {
    section: "strengthPower",
    type: "form",
    title: "Strength Assessment",
  },
  5: {
    section: "speedAgility",
    type: "instruction",
    title: "Speed & Agility Guide",
  },
  6: {
    section: "speedAgility",
    type: "form",
    title: "Speed Tests",
  },
  7: {
    section: "staminaRecovery",
    type: "instruction",
    title: "Stamina & Recovery Guide",
  },
  8: {
    section: "staminaRecovery",
    type: "form",
    title: "Endurance Assessment",
  },
  9: {
    section: "injuries",
    type: "instruction",
    title: "Injury Assessment Guide",
  },
  10: {
    section: "injuries",
    type: "form",
    title: "Injury Records",
  },
  11: {
    section: "review",
    type: "form",
    title: "Review & Submit",
  },
  12: {
    section: "review",
    type: "form",
    title: "Confirmation",
  },
};

export const getDefaultFormData = (): WizardFormData => ({
  basicMetrics: {
    height: null,
    weight: null,
    age: null,
    bodyFat: null,
  },
  strengthPower: {
    athleteBodyWeight: 0,
    muscleMass: 0,
    enduranceStrength: 0,
    explosivePower: 0,
  } as any, // Will be properly typed when StrengthPowerTestData is available
  speedAgility: {
    sprintSpeed: 0,
  } as any,
  staminaRecovery: {
    vo2Max: 0,
    flexibility: 0,
    recoveryTime: 0,
  } as any,
  injuries: [],
});

export const getDefaultInjury = (): InjuryInput => ({
  type: "",
  bodyPart: "",
  severity: "mild",
  occurredAt: new Date().toISOString().split("T")[0],
  recoveryTime: null,
  recoveredAt: null,
  status: "active",
  notes: "",
});

export const STORAGE_KEYS = {
  DRAFT_PREFIX: "stats-draft-",
  STORE_NAME: "stats-wizard-storage",
} as const;

export const API_ENDPOINTS = {
  STATS: (userId: string) => `/api/stats/${userId}`,
  DRAFT: (userId: string) => `/api/stats/${userId}/draft`,
} as const;

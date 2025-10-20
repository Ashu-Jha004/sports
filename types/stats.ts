// ✅ ADD: Complete type definitions for stats system

// ✅ REPLACE: Update form data interfaces to allow null values (matching your existing WizardFormData)

export interface BasicMetrics {
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;
}

export interface StrengthPowerForm {
  strength: number | null;
  muscleMass: number | null;
  enduranceStrength: number | null;
  explosivePower: number | null;
}

export interface SpeedAgilityForm {
  sprintSpeed: number | null;
  acceleration: number | null;
  agility: number | null;
  reactionTime: number | null;
  balance: number | null;
  coordination: number | null;
}

export interface StaminaRecoveryForm {
  vo2Max: number | null;
  flexibility: number | null;
  recoveryTime: number | null;
}

export interface InjuryForm {
  id?: string;
  type: string;
  bodyPart: string;
  severity: "mild" | "moderate" | "severe";
  occurredAt: string;
  recoveryTime: number | null;
  recoveredAt: string | null;
  status: "active" | "recovering" | "recovered";
  notes: string;
}

export interface StatsFormData {
  basicMetrics: BasicMetrics;
  strengthPower: StrengthPowerForm;
  speedAgility: SpeedAgilityForm;
  staminaRecovery: StaminaRecoveryForm;
  injuries: InjuryForm[];
}

export interface StrengthAndPower {
  id: string;
  strength: number;
  muscleMass: number;
  enduranceStrength: number;
  explosivePower: number;
}

export interface SpeedAndAgility {
  id: string;
  sprintSpeed: number;
  acceleration: number;
  agility: number;
  reactionTime: number;
  balance: number;
  coordination: number;
}

export interface StaminaAndRecovery {
  id: string;
  vo2Max: number;
  flexibility: number;
  recoveryTime: number;
}

export interface InjuryStat {
  id: string;
  type: string;
  bodyPart: string;
  severity: "mild" | "moderate" | "severe";
  occurredAt: string;
  recoveryTime: number | null;
  recoveredAt: string | null;
  status: "active" | "recovering" | "recovered";
  notes: string | null;
}

export interface StatsHistory {
  id: string;
  oldValues: any[];
  newValues: any[];
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
}

export interface AthleteInfo {
  id: string;
  firstName: string;
  lastName: string;
}

// ✅ Main stats response interface
export interface StatsResponse {
  id: string;
  userId: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  bodyFat: number | null;

  // Current values (latest)
  currentStrength: StrengthAndPower | null;
  currentSpeed: SpeedAndAgility | null;
  currentStamina: StaminaAndRecovery | null;
  activeInjuries: InjuryStat[];

  // Backward compatibility
  strength: StrengthAndPower | null;
  speed: SpeedAndAgility | null;
  stamina: StaminaAndRecovery | null;
  injuries: InjuryStat[];

  // Historical data
  strengthHistory: StrengthAndPower[];
  speedHistory: SpeedAndAgility[];
  staminaHistory: StaminaAndRecovery[];
  injuryHistory: InjuryStat[];

  // Metadata
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
  lastUpdatedByName: string | null;
  createdAt: string;
  updatedAt: string;

  // Athlete info
  athlete: AthleteInfo;
}

export interface InjuryForm {
  id?: string;
  type: string;
  bodyPart: string;
  severity: "mild" | "moderate" | "severe";
  occurredAt: string;
  recoveryTime: number | null;
  recoveredAt: string | null;
  status: "active" | "recovering" | "recovered";
  notes: string;
}

export interface StatsFormData {
  basicMetrics: BasicMetrics;
  strengthPower: StrengthPowerForm;
  speedAgility: SpeedAgilityForm;
  staminaRecovery: StaminaRecoveryForm;
  injuries: InjuryForm[];
}

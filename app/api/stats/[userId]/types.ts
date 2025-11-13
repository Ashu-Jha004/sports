// ============================================
// FILE: app/api/stats/[userId]/types.ts
// Centralized type definitions for stats API
// ============================================

import type { User, Stats } from "@prisma/client";
import { z } from "zod";
import { strengthPowerTestDataSchema } from "@/lib/stats/validators/strengthTests";
import { speedAndAgilityDataSchema } from "@/lib/stats/validators/speedAgilityValidators";
import { staminaRecoveryDataSchema } from "@/lib/stats/validators/staminaRecoveryValidators";

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface AuthenticatedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface StatsWithRelations {
  id: string;
  userId: string;
  height: number | null | undefined;
  weight: number | null | undefined;
  age: number | null | undefined;
  bodyFat: number | null | undefined;
  currentStrength: any;
  currentSpeed: any;
  currentStamina: any;
  activeInjuries: any[];
  strength: any;
  speed: any;
  stamina: any;
  injuries: any[];
  strengthHistory: any[];
  speedHistory: any[];
  staminaHistory: any[];
  injuryHistory: any[];
  lastUpdatedBy: string | null | undefined;
  lastUpdatedAt: Date | null | undefined;
  lastUpdatedByName: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  athlete: {
    id: string;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
  };
}

export interface StatsCreatePayload {
  userId: string;
  basicMetrics: BasicMetrics;
  strengthPower: any;
  speedAgility: any;
  staminaRecovery: any;
  injuries: InjuryInput[];
  isUpdate?: boolean;
}

export interface StatsUpdateResponse {
  success: boolean;
  statsId: string;
  message: string;
  updatedBy: string;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const basicMetricsSchema = z.object({
  height: z
    .number()
    .min(100, "Height must be at least 100cm")
    .max(250, "Height cannot exceed 250cm"),
  weight: z
    .number()
    .min(30, "Weight must be at least 30kg")
    .max(200, "Weight cannot exceed 200kg"),
  age: z
    .number()
    .int()
    .min(10, "Age must be at least 10")
    .max(100, "Age cannot exceed 100"),
  bodyFat: z
    .number()
    .min(3, "Body fat must be at least 3%")
    .max(50, "Body fat cannot exceed 50%"),
});

export const injurySchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  bodyPart: z.string().min(1),
  severity: z.enum(["mild", "moderate", "severe"]),
  occurredAt: z.string(),
  recoveryTime: z.number().nullable(),
  recoveredAt: z.string().nullable(),
  status: z.enum(["active", "recovering", "recovered"]),
  notes: z.string(),
});

export type BasicMetrics = z.infer<typeof basicMetricsSchema>;
export type InjuryInput = z.infer<typeof injurySchema>;

// ============================================
// ERROR TYPES
// ============================================

export class StatsApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "StatsApiError";
  }
}

export class ValidationError extends StatsApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends StatsApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "AuthorizationError";
  }
}

export class ForbiddenError extends StatsApiError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends StatsApiError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends StatsApiError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class DatabaseError extends StatsApiError {
  constructor(message: string, details?: unknown) {
    super(message, 500, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
  }
}

export const statsSubmissionSchema = z.object({
  userId: z.string(),
  basicMetrics: basicMetricsSchema,
  strengthPower: strengthPowerTestDataSchema,
  speedAgility: speedAndAgilityDataSchema,
  staminaRecovery: staminaRecoveryDataSchema,
  injuries: z.array(injurySchema),
  isUpdate: z.boolean().optional(),
});

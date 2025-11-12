import { z } from "zod";

// ============================================
// BASE VALIDATION SCHEMAS
// ============================================

const testAttemptSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    attemptNumber: z.number().int().min(1).max(10),
    data: dataSchema,
    notes: z.string().max(500).optional(),
  });

// ============================================
// JUMP TEST VALIDATIONS
// ============================================

export const countermovementJumpDataSchema = z
  .object({
    standingReach: z
      .number()
      .min(100)
      .max(350, "Standing reach must be between 100-350cm"),
    jumpReach: z
      .number()
      .min(100)
      .max(400, "Jump reach must be between 100-400cm"),
    jumpHeight: z.number().min(0).max(150).optional(),
  })
  .refine((data) => data.jumpReach >= data.standingReach, {
    message: "Jump reach must be greater than or equal to standing reach",
  });

export const countermovementJumpTestSchema = z.object({
  attempts: z
    .array(testAttemptSchema(countermovementJumpDataSchema))
    .min(1)
    .max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

export const loadedSquatJumpDataSchema = z
  .object({
    load: z.number().min(0).max(200, "Load must be between 0-200kg"),
    standingReach: z.number().min(100).max(350),
    jumpReach: z.number().min(100).max(400),
    jumpHeight: z.number().min(0).max(150).optional(),
    flightTime: z
      .number()
      .min(0)
      .max(2, "Flight time must be between 0-2 seconds")
      .optional(),
  })
  .refine((data) => data.jumpReach >= data.standingReach, {
    message: "Jump reach must be greater than standing reach",
  });

export const loadedSquatJumpTestSchema = z.object({
  bodyWeight: z
    .number()
    .min(30)
    .max(200, "Body weight must be between 30-200kg"),
  attempts: z.array(testAttemptSchema(loadedSquatJumpDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

export const depthJumpDataSchema = z
  .object({
    dropHeight: z
      .number()
      .min(10)
      .max(100, "Drop height must be between 10-100cm"),
    standingReach: z.number().min(100).max(350),
    jumpReach: z.number().min(100).max(400),
    jumpHeight: z.number().min(0).max(150).optional(),
  })
  .refine((data) => data.jumpReach >= data.standingReach, {
    message: "Jump reach must be greater than standing reach",
  });

export const depthJumpTestSchema = z.object({
  attempts: z.array(testAttemptSchema(depthJumpDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

// ============================================
// UPPER BODY POWER VALIDATIONS
// ============================================

export const ballisticBenchPressDataSchema = z.object({
  load: z.number().min(0).max(300, "Load must be between 0-300kg"),
  reps: z.number().int().min(0).max(100, "Reps must be between 0-100"),
  timeLimit: z
    .number()
    .min(30)
    .max(300, "Time limit must be between 30-300 seconds"),
  completedInTime: z.boolean(),
});

export const ballisticBenchPressTestSchema = z.object({
  attempts: z
    .array(testAttemptSchema(ballisticBenchPressDataSchema))
    .min(1)
    .max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

export const pushUpDataSchema = z.object({
  reps: z.number().int().min(0).max(200, "Reps must be between 0-200"),
  timeLimit: z
    .number()
    .min(30)
    .max(300, "Time limit must be between 30-300 seconds"),
  formQuality: z.enum(["strict", "standard"]).optional(),
});

export const pushUpTestSchema = z.object({
  attempts: z.array(testAttemptSchema(pushUpDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

export const ballisticPushUpDataSchema = z.object({
  reps: z.number().int().min(0).max(150, "Reps must be between 0-150"),
  load: z.number().min(0).max(100, "Load must be between 0-100kg"),
  timeUsed: z
    .number()
    .min(0)
    .max(300, "Time used must be between 0-300 seconds"),
});

export const ballisticPushUpTestSchema = z.object({
  attempts: z.array(testAttemptSchema(ballisticPushUpDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

// ============================================
// LOWER BODY STRENGTH VALIDATIONS
// ============================================

export const deadliftVelocityDataSchema = z.object({
  load: z.number().min(0).max(500, "Load must be between 0-500kg"),
  reps: z.number().int().min(0).max(20, "Reps must be between 0-20"),
  repDuration: z
    .number()
    .min(0)
    .max(10, "Rep duration must be between 0-10 seconds")
    .optional(),
});

export const deadliftVelocityTestSchema = z.object({
  maxLoad: z.number().min(0).max(500, "Max load must be between 0-500kg"),
  attempts: z
    .array(testAttemptSchema(deadliftVelocityDataSchema))
    .min(1)
    .max(5),
  maxLoadAttempt: z.number().int().min(0).optional(),
});

export const barbellHipThrustSetSchema = z.object({
  load: z.number().min(0).max(500, "Load must be between 0-500kg"),
  reps: z.number().int().min(0).max(50, "Reps must be between 0-50"),
  restAfter: z.number().min(0).max(300, "Rest must be between 0-300 seconds"),
});

export const barbellHipThrustTestSchema = z.object({
  maxLoad: z.number().min(0).max(500, "Max load must be between 0-500kg"),
  sets: z.array(barbellHipThrustSetSchema).min(1).max(10),
  totalTimeUsed: z
    .number()
    .min(0)
    .max(300, "Total time must not exceed 300 seconds"),
  totalReps: z.number().int().min(0).max(200),
});

// ============================================
// UPPER BODY STRENGTH VALIDATIONS
// ============================================

export const weightedPullUpSetSchema = z.object({
  load: z.number().min(0).max(150, "Load must be between 0-150kg"),
  reps: z.number().int().min(0).max(50, "Reps must be between 0-50"),
  restAfter: z.number().min(0).max(300, "Rest must be between 0-300 seconds"),
});

export const weightedPullUpTestSchema = z.object({
  bodyWeight: z
    .number()
    .min(30)
    .max(200, "Body weight must be between 30-200kg"),
  sets: z.array(weightedPullUpSetSchema).min(1).max(10),
  totalTimeUsed: z
    .number()
    .min(0)
    .max(300, "Total time must not exceed 300 seconds"),
  totalReps: z.number().int().min(0).max(100),
  maxLoad: z.number().min(0).max(150).optional(),
});

export const barbellRowDataSchema = z.object({
  load: z.number().min(0).max(300, "Load must be between 0-300kg"),
  reps: z.number().int().min(0).max(30, "Reps must be between 0-30"),
  formQuality: z.enum(["strict", "momentum"]).optional(),
});

export const barbellRowTestSchema = z.object({
  maxLoad: z.number().min(0).max(300, "Max load must be between 0-300kg"),
  attempts: z.array(testAttemptSchema(barbellRowDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

// ============================================
// ENDURANCE/STABILITY VALIDATIONS
// ============================================

export const plankHoldDataSchema = z.object({
  duration: z
    .number()
    .min(0)
    .max(600, "Duration must be between 0-600 seconds"),
  load: z.number().min(0).max(100, "Load must be between 0-100kg"),
  formBreakdown: z.boolean().optional(),
});

export const plankHoldTestSchema = z.object({
  attempts: z.array(testAttemptSchema(plankHoldDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

export const pullUpsDataSchema = z.object({
  reps: z.number().int().min(0).max(100, "Reps must be between 0-100"),
  timeLimit: z
    .number()
    .min(0)
    .max(600, "Time limit must be between 0-600 seconds"),
  timeUsed: z
    .number()
    .min(0)
    .max(600, "Time used must be between 0-600 seconds"),
  formQuality: z.enum(["strict", "kipping"]).optional(),
});

export const pullUpsTestSchema = z.object({
  attempts: z.array(testAttemptSchema(pullUpsDataSchema)).min(1).max(5),
  bestAttempt: z.number().int().min(0).optional(),
});

// ============================================
// COMPLETE FORM VALIDATION
// ============================================

export const strengthPowerTestDataSchema = z
  .object({
    testDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
    athleteBodyWeight: z
      .number()
      .min(30)
      .max(200, "Body weight must be between 30-200kg"),

    // Jump Tests
    countermovementJump: countermovementJumpTestSchema.optional(),
    loadedSquatJump: loadedSquatJumpTestSchema.optional(),
    depthJump: depthJumpTestSchema.optional(),

    // Upper Body Power
    ballisticBenchPress: ballisticBenchPressTestSchema.optional(),
    pushUp: pushUpTestSchema.optional(),
    ballisticPushUp: ballisticPushUpTestSchema.optional(),

    // Lower Body Strength
    deadliftVelocity: deadliftVelocityTestSchema.optional(),
    barbellHipThrust: barbellHipThrustTestSchema.optional(),

    // Upper Body Strength
    weightedPullUp: weightedPullUpTestSchema.optional(),
    barbellRow: barbellRowTestSchema.optional(),

    // Endurance/Stability
    plankHold: plankHoldTestSchema.optional(),
    pullUps: pullUpsTestSchema.optional(),

    // Legacy field
    pushups: z.number().int().min(0).max(500).optional(),

    // Auto-calculated scores
    muscleMass: z.number().min(0).max(100),
    enduranceStrength: z.number().min(0).max(100),
    explosivePower: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      // At least one test must be completed
      return !!(
        data.countermovementJump ||
        data.loadedSquatJump ||
        data.depthJump ||
        data.ballisticBenchPress ||
        data.pushUp ||
        data.ballisticPushUp ||
        data.deadliftVelocity ||
        data.barbellHipThrust ||
        data.weightedPullUp ||
        data.barbellRow ||
        data.plankHold ||
        data.pullUps ||
        (data.pushups !== undefined && data.pushups > 0)
      );
    },
    { message: "At least one test must be completed" }
  );

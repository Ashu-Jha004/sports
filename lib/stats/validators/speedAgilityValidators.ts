import { z } from "zod";
import { VALIDATION_RANGES } from "../types/speedAgilityTests";

// ============================================
// ANTHROPOMETRIC DATA VALIDATION
// ============================================

export const anthropometricDataSchema = z.object({
  thighGirth: z
    .number()
    .min(VALIDATION_RANGES.thighGirth.min, "Thigh girth must be at least 30cm")
    .max(VALIDATION_RANGES.thighGirth.max, "Thigh girth cannot exceed 80cm")
    .optional(),
  calfGirth: z
    .number()
    .min(VALIDATION_RANGES.calfGirth.min, "Calf girth must be at least 25cm")
    .max(VALIDATION_RANGES.calfGirth.max, "Calf girth cannot exceed 60cm")
    .optional(),
  armSpan: z
    .number()
    .min(VALIDATION_RANGES.armSpan.min, "Arm span must be at least 140cm")
    .max(VALIDATION_RANGES.armSpan.max, "Arm span cannot exceed 230cm")
    .optional(),
  footLength: z
    .number()
    .min(VALIDATION_RANGES.footLength.min, "Foot length must be at least 20cm")
    .max(VALIDATION_RANGES.footLength.max, "Foot length cannot exceed 35cm")
    .optional(),
  standingHeight: z.number().min(140).max(230).optional(),
});

// ============================================
// 1. TEN METER SPRINT VALIDATION
// ============================================

export const tenMeterSprintAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  sprintTime: z
    .number()
    .min(
      VALIDATION_RANGES.tenMeterSprint.min,
      "10m sprint time must be at least 1.5 seconds"
    )
    .max(
      VALIDATION_RANGES.tenMeterSprint.max,
      "10m sprint time cannot exceed 4.0 seconds"
    ),
  anthropometricData: anthropometricDataSchema.optional(),
  standingLongJump: z
    .number()
    .min(
      VALIDATION_RANGES.standingLongJump.min,
      "Standing long jump must be at least 100cm"
    )
    .max(
      VALIDATION_RANGES.standingLongJump.max,
      "Standing long jump cannot exceed 350cm"
    )
    .optional(),
  notes: z.string().max(500).optional(),
});

export const tenMeterSprintTestSchema = z.object({
  attempts: z
    .array(tenMeterSprintAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestTime: z.number().optional(),
  meanTime: z.number().optional(),
  anthropometricData: anthropometricDataSchema.optional(),
});

// ============================================
// 2. FOURTY METER DASH VALIDATION
// ============================================

export const fourtyMeterDashAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  splitTime_0_10m: z
    .number()
    .min(1.5, "10m split time must be at least 1.5 seconds")
    .max(4.0, "10m split time cannot exceed 4.0 seconds")
    .optional(),
  splitTime_0_20m: z
    .number()
    .min(2.5, "20m split time must be at least 2.5 seconds")
    .max(6.0, "20m split time cannot exceed 6.0 seconds")
    .optional(),
  splitTime_0_30m: z
    .number()
    .min(3.5, "30m split time must be at least 3.5 seconds")
    .max(7.0, "30m split time cannot exceed 7.0 seconds")
    .optional(),
  totalTime_0_40m: z
    .number()
    .min(
      VALIDATION_RANGES.fourtyMeterDash.min,
      "40m total time must be at least 4.0 seconds"
    )
    .max(
      VALIDATION_RANGES.fourtyMeterDash.max,
      "40m total time cannot exceed 8.0 seconds"
    ),
  notes: z.string().max(500).optional(),
});

export const fourtyMeterDashTestSchema = z.object({
  attempts: z
    .array(fourtyMeterDashAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestTime: z.number().optional(),
  meanTime: z.number().optional(),
});

// ============================================
// 3. REPEATED SPRINT ABILITY VALIDATION
// ============================================

export const repeatedSprintAbilityTestSchema = z
  .object({
    sprintTimes: z
      .array(
        z
          .number()
          .min(
            VALIDATION_RANGES.repeatedSprintSingle.min,
            "Sprint time must be at least 3.5 seconds"
          )
          .max(
            VALIDATION_RANGES.repeatedSprintSingle.max,
            "Sprint time cannot exceed 8.0 seconds"
          )
      )
      .length(
        6,
        "Repeated Sprint Ability test requires exactly 6 sprint times"
      ),
    restInterval: z
      .number()
      .int()
      .min(10, "Rest interval must be at least 10 seconds")
      .max(60, "Rest interval cannot exceed 60 seconds")
      .default(20),
    bestTime: z.number().optional(),
    worstTime: z.number().optional(),
    meanTime: z.number().optional(),
    totalTime: z.number().optional(),
    fatigueIndex: z.number().optional(),
    percentDecrement: z.number().optional(),
  })
  .refine((data) => data.sprintTimes.every((t) => t > 0), {
    message: "All sprint times must be positive numbers",
    path: ["sprintTimes"],
  });

// ============================================
// 4. T-TEST VALIDATION
// ============================================

export const tTestAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  completionTime: z
    .number()
    .min(
      VALIDATION_RANGES.tTest.min,
      "T-Test time must be at least 8.0 seconds"
    )
    .max(VALIDATION_RANGES.tTest.max, "T-Test time cannot exceed 15.0 seconds"),
  notes: z.string().max(500).optional(),
});

export const tTestDataSchema = z.object({
  attempts: z
    .array(tTestAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestTime: z.number().optional(),
  meanTime: z.number().optional(),
});

// ============================================
// 5. ILLINOIS AGILITY TEST VALIDATION
// ============================================

export const illinoisAgilityAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  completionTime: z
    .number()
    .min(
      VALIDATION_RANGES.illinoisTest.min,
      "Illinois Agility Test time must be at least 12.0 seconds"
    )
    .max(
      VALIDATION_RANGES.illinoisTest.max,
      "Illinois Agility Test time cannot exceed 22.0 seconds"
    ),
  notes: z.string().max(500).optional(),
});

export const illinoisAgilityTestSchema = z.object({
  attempts: z
    .array(illinoisAgilityAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestTime: z.number().optional(),
  meanTime: z.number().optional(),
});

// ============================================
// 6. 505 AGILITY TEST VALIDATION
// ============================================

export const five05AgilityAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  leftTurnTime: z
    .number()
    .min(
      VALIDATION_RANGES.five05Test.min,
      "505 test time must be at least 2.0 seconds"
    )
    .max(
      VALIDATION_RANGES.five05Test.max,
      "505 test time cannot exceed 5.0 seconds"
    ),
  rightTurnTime: z
    .number()
    .min(
      VALIDATION_RANGES.five05Test.min,
      "505 test time must be at least 2.0 seconds"
    )
    .max(
      VALIDATION_RANGES.five05Test.max,
      "505 test time cannot exceed 5.0 seconds"
    ),
  notes: z.string().max(500).optional(),
});

export const five05AgilityTestSchema = z.object({
  attempts: z
    .array(five05AgilityAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestLeftTime: z.number().optional(),
  bestRightTime: z.number().optional(),
  meanLeftTime: z.number().optional(),
  meanRightTime: z.number().optional(),
  asymmetryIndex: z.number().optional(),
});

// ============================================
// 7. VISUAL REACTION SPEED DRILL VALIDATION
// ============================================

export const visualReactionAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  reactionTime: z
    .number()
    .min(
      VALIDATION_RANGES.reactionTime.min,
      "Reaction time must be at least 150ms"
    )
    .max(
      VALIDATION_RANGES.reactionTime.max,
      "Reaction time cannot exceed 500ms"
    ),
  stimulus: z.enum(["visual", "audio", "mixed"]),
  notes: z.string().max(500).optional(),
});

export const visualReactionSpeedDrillSchema = z.object({
  attempts: z
    .array(visualReactionAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestReactionTime: z.number().optional(),
  meanReactionTime: z.number().optional(),
});

// ============================================
// 8. STANDING LONG JUMP VALIDATION
// ============================================

export const standingLongJumpAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  distance: z
    .number()
    .min(
      VALIDATION_RANGES.standingLongJump.min,
      "Standing long jump distance must be at least 100cm"
    )
    .max(
      VALIDATION_RANGES.standingLongJump.max,
      "Standing long jump distance cannot exceed 350cm"
    ),
  notes: z.string().max(500).optional(),
});

export const standingLongJumpTestSchema = z.object({
  attempts: z
    .array(standingLongJumpAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestDistance: z.number().optional(),
  meanDistance: z.number().optional(),
});

// ============================================
// 9. LONG JUMP VALIDATION
// ============================================

export const longJumpAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  distance: z
    .number()
    .min(
      VALIDATION_RANGES.longJump.min,
      "Long jump distance must be at least 200cm"
    )
    .max(
      VALIDATION_RANGES.longJump.max,
      "Long jump distance cannot exceed 900cm"
    ),
  runupSteps: z.number().int().min(5).max(25).optional(),
  notes: z.string().max(500).optional(),
});

export const longJumpTestSchema = z.object({
  attempts: z
    .array(longJumpAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestDistance: z.number().optional(),
  meanDistance: z.number().optional(),
});

// ============================================
// 10. REACTIVE AGILITY T-TEST VALIDATION
// ============================================

export const reactiveAgilityAttemptSchema = z.object({
  attemptNumber: z.number().int().positive(),
  completionTime: z
    .number()
    .min(
      VALIDATION_RANGES.tTest.min,
      "Reactive Agility T-Test time must be at least 8.0 seconds"
    )
    .max(
      VALIDATION_RANGES.tTest.max + 2,
      "Reactive Agility T-Test time cannot exceed 17.0 seconds"
    ),
  correctResponseRate: z
    .number()
    .min(0, "Accuracy cannot be negative")
    .max(100, "Accuracy cannot exceed 100%")
    .optional(),
  notes: z.string().max(500).optional(),
});

export const reactiveAgilityTTestSchema = z.object({
  attempts: z
    .array(reactiveAgilityAttemptSchema)
    .min(1, "At least one attempt is required"),
  bestTime: z.number().optional(),
  meanTime: z.number().optional(),
  averageAccuracy: z.number().optional(),
});

// ============================================
// OVERALL SPEED & AGILITY DATA VALIDATION
// ============================================

export const speedAndAgilityDataSchema = z.object({
  id: z.string().optional(),
  statId: z.string().optional(),

  // Overall calculated scores
  sprintSpeed: z
    .number()
    .min(0, "Sprint speed score cannot be negative")
    .max(100, "Sprint speed score cannot exceed 100"),

  // Individual test data
  Ten_Meter_Sprint: tenMeterSprintTestSchema.optional(),
  Fourty_Meter_Dash: fourtyMeterDashTestSchema.optional(),
  Repeated_Sprint_Ability: repeatedSprintAbilityTestSchema.optional(),
  Five_0_Five_Agility_Test: five05AgilityTestSchema.optional(),
  T_Test: tTestDataSchema.optional(),
  Illinois_Agility_Test: illinoisAgilityTestSchema.optional(),
  Visual_Reaction_Speed_Drill: visualReactionSpeedDrillSchema.optional(),
  Long_Jump: longJumpTestSchema.optional(),
  Reactive_Agility_T_Test: reactiveAgilityTTestSchema.optional(),
  Standing_Long_Jump: standingLongJumpTestSchema.optional(),

  // Legacy fields (JSON)
  acceleration: z.any().optional(),
  agility: z.any().optional(),
  reactionTime: z.any().optional(),
  balance: z.any().optional(),
  coordination: z.any().optional(),

  // Shared anthropometric data
  anthropometricData: anthropometricDataSchema.optional(),

  // Metadata
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ============================================
// FORM SUBMISSION SCHEMA (For API)
// ============================================

export const speedAgilityFormSubmissionSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    speedAgility: speedAndAgilityDataSchema,
    isUpdate: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // At least one test must be completed
      const hasAtLeastOneTest =
        data.speedAgility.Ten_Meter_Sprint ||
        data.speedAgility.Fourty_Meter_Dash ||
        data.speedAgility.Repeated_Sprint_Ability ||
        data.speedAgility.T_Test ||
        data.speedAgility.Illinois_Agility_Test ||
        data.speedAgility.Five_0_Five_Agility_Test ||
        data.speedAgility.Visual_Reaction_Speed_Drill ||
        data.speedAgility.Standing_Long_Jump ||
        data.speedAgility.Long_Jump ||
        data.speedAgility.Reactive_Agility_T_Test;

      return hasAtLeastOneTest;
    },
    {
      message: "At least one speed or agility test must be completed",
      path: ["speedAgility"],
    }
  );

// ============================================
// TYPE INFERENCE EXPORTS
// ============================================

export type AnthropometricDataInput = z.infer<typeof anthropometricDataSchema>;
export type TenMeterSprintAttemptInput = z.infer<
  typeof tenMeterSprintAttemptSchema
>;
export type TenMeterSprintTestInput = z.infer<typeof tenMeterSprintTestSchema>;
export type FourtyMeterDashAttemptInput = z.infer<
  typeof fourtyMeterDashAttemptSchema
>;
export type FourtyMeterDashTestInput = z.infer<
  typeof fourtyMeterDashTestSchema
>;
export type RepeatedSprintAbilityTestInput = z.infer<
  typeof repeatedSprintAbilityTestSchema
>;
export type TTestAttemptInput = z.infer<typeof tTestAttemptSchema>;
export type TTestDataInput = z.infer<typeof tTestDataSchema>;
export type IllinoisAgilityAttemptInput = z.infer<
  typeof illinoisAgilityAttemptSchema
>;
export type IllinoisAgilityTestInput = z.infer<
  typeof illinoisAgilityTestSchema
>;
export type Five05AgilityAttemptInput = z.infer<
  typeof five05AgilityAttemptSchema
>;
export type Five05AgilityTestInput = z.infer<typeof five05AgilityTestSchema>;
export type VisualReactionAttemptInput = z.infer<
  typeof visualReactionAttemptSchema
>;
export type VisualReactionSpeedDrillInput = z.infer<
  typeof visualReactionSpeedDrillSchema
>;
export type StandingLongJumpAttemptInput = z.infer<
  typeof standingLongJumpAttemptSchema
>;
export type StandingLongJumpTestInput = z.infer<
  typeof standingLongJumpTestSchema
>;
export type LongJumpAttemptInput = z.infer<typeof longJumpAttemptSchema>;
export type LongJumpTestInput = z.infer<typeof longJumpTestSchema>;
export type ReactiveAgilityAttemptInput = z.infer<
  typeof reactiveAgilityAttemptSchema
>;
export type ReactiveAgilityTTestInput = z.infer<
  typeof reactiveAgilityTTestSchema
>;
export type SpeedAndAgilityDataInput = z.infer<
  typeof speedAndAgilityDataSchema
>;
export type SpeedAgilityFormSubmissionInput = z.infer<
  typeof speedAgilityFormSubmissionSchema
>;

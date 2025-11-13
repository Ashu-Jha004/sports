// ===============================================
// FILE: actions/strength-test.actions.ts
// Strength test management actions
// ============================================

import type { StrengthPowerTestData } from "@/lib/stats/types/strengthTests";
import { StrengthCalculations } from "@/lib/stats/types/strengthTests";
import type { TimerManager } from "@/lib/utils/timer-manager";
import { validateStrengthAttempt } from "../validators/test-data.validator";
import { WIZARD_CONFIG } from "@/types/config/wizard.config";

/**
 * Timer keys for debouncing
 */
const TIMER_KEYS = {
  RECALCULATE: "recalculate-scores",
  AUTO_SAVE: "auto-save",
} as const;

/**
 * Strength test attempt structure
 */
interface TestAttempt {
  attemptNumber: number;
  data: any;
  notes: string;
}

/**
 * Strength test with attempts
 */
interface TestWithAttempts {
  attempts: TestAttempt[];
  bestAttempt?: number;
}

/**
 * Strength test with sets
 */
interface TestWithSets {
  sets: any[];
  maxLoad?: number;
  totalTimeUsed?: number;
  totalReps?: number;
}

/**
 * Type guard to check if test has attempts
 */
function hasAttempts(test: unknown): test is TestWithAttempts {
  return (
    typeof test === "object" &&
    test !== null &&
    "attempts" in test &&
    Array.isArray((test as TestWithAttempts).attempts)
  );
}

/**
 * Type guard to check if test has sets
 */
function hasSets(test: unknown): test is TestWithSets {
  return (
    typeof test === "object" &&
    test !== null &&
    "sets" in test &&
    Array.isArray((test as TestWithSets).sets)
  );
}

/**
 * Creates strength test management actions
 */
export function createStrengthTestActions(
  timerManager: TimerManager,
  getState: () => any,
  setState: (partial: any) => void
) {
  /**
   * Trigger recalculation and auto-save with debouncing
   */
  const triggerRecalculateAndSave = (
    delay: number = WIZARD_CONFIG.RECALCULATE_DELAY
  ) => {
    timerManager.setDebounced(
      TIMER_KEYS.RECALCULATE,
      () => {
        const state = getState();
        const recalculatedData = recalculateStrengthScores(
          state.formData.strengthPower
        );

        setState({
          formData: {
            ...state.formData,
            strengthPower: recalculatedData,
          },
        });

        console.log("🔢 Scores recalculated and state updated");

        // Trigger auto-save after recalculation
        if (state.autoSave && typeof state.autoSave === "function") {
          state.autoSave();
        }
      },
      delay
    );
  };

  return {
    /**
     * Add a new test attempt
     */
    addTestAttempt: (
      testName: keyof StrengthPowerTestData,
      attemptData: any
    ): void => {
      try {
        // Validate attempt data
        const validationError = validateStrengthAttempt(attemptData, "reps");
        if (validationError) {
          console.error("❌ Invalid attempt data:", validationError.message);
          setState({ submitError: validationError.message });
          return;
        }

        const state = getState();
        const currentTest = state.formData.strengthPower[testName];

        let updatedTest: TestWithAttempts;

        if (!hasAttempts(currentTest)) {
          // Initialize test with first attempt
          updatedTest = {
            attempts: [
              {
                attemptNumber: 1,
                data: attemptData,
                notes: "",
              },
            ],
            bestAttempt: 0,
          };
          console.log(`✅ Initialized ${String(testName)} with first attempt`);
        } else {
          // Add new attempt
          const newAttempt: TestAttempt = {
            attemptNumber: currentTest.attempts.length + 1,
            data: attemptData,
            notes: "",
          };

          updatedTest = {
            ...currentTest,
            attempts: [...currentTest.attempts, newAttempt],
          };
          console.log(
            `✅ Added attempt #${newAttempt.attemptNumber} to ${String(
              testName
            )}`
          );
        }

        setState({
          formData: {
            ...state.formData,
            strengthPower: {
              ...state.formData.strengthPower,
              [testName]: updatedTest,
            },
          },
          isDraftSaved: false,
        });

        triggerRecalculateAndSave();
      } catch (error) {
        console.error("❌ Failed to add test attempt:", error);
        setState({
          submitError:
            error instanceof Error ? error.message : "Failed to add attempt",
        });
      }
    },

    /**
     * Remove a test attempt
     */
    removeTestAttempt: (
      testName: keyof StrengthPowerTestData,
      attemptIndex: number
    ): void => {
      try {
        const state = getState();
        const currentTest = state.formData.strengthPower[testName];

        if (!hasAttempts(currentTest)) {
          console.warn(`⚠️ ${String(testName)} has no attempts to remove`);
          return;
        }

        if (attemptIndex < 0 || attemptIndex >= currentTest.attempts.length) {
          console.error(`❌ Invalid attempt index: ${attemptIndex}`);
          return;
        }

        const updatedAttempts = currentTest.attempts.filter(
          (_, index) => index !== attemptIndex
        );

        // Renumber attempts sequentially
        const renumberedAttempts = updatedAttempts.map((attempt, index) => ({
          ...attempt,
          attemptNumber: index + 1,
        }));

        setState({
          formData: {
            ...state.formData,
            strengthPower: {
              ...state.formData.strengthPower,
              [testName]: {
                ...currentTest,
                attempts: renumberedAttempts,
                bestAttempt: undefined, // Recalculate best attempt
              },
            },
          },
          isDraftSaved: false,
        });

        console.log(
          `🗑️ Removed attempt from ${String(testName)}, ${
            renumberedAttempts.length
          } remaining`
        );
        triggerRecalculateAndSave();
      } catch (error) {
        console.error("❌ Failed to remove test attempt:", error);
        setState({
          submitError:
            error instanceof Error ? error.message : "Failed to remove attempt",
        });
      }
    },

    /**
     * Update an existing test attempt
     */
    updateTestAttempt: (
      testName: keyof StrengthPowerTestData,
      attemptIndex: number,
      attemptData: any
    ): void => {
      try {
        // Validate attempt data
        const validationError = validateStrengthAttempt(attemptData, "reps");
        if (validationError) {
          console.error("❌ Invalid attempt data:", validationError.message);
          setState({ submitError: validationError.message });
          return;
        }

        const state = getState();
        const currentTest = state.formData.strengthPower[testName];

        if (!hasAttempts(currentTest)) {
          console.warn(`⚠️ ${String(testName)} has no attempts to update`);
          return;
        }

        if (attemptIndex < 0 || attemptIndex >= currentTest.attempts.length) {
          console.error(`❌ Invalid attempt index: ${attemptIndex}`);
          return;
        }

        const updatedAttempts = currentTest.attempts.map((attempt, index) =>
          index === attemptIndex
            ? { ...attempt, data: { ...attempt.data, ...attemptData } }
            : attempt
        );

        setState({
          formData: {
            ...state.formData,
            strengthPower: {
              ...state.formData.strengthPower,
              [testName]: {
                ...currentTest,
                attempts: updatedAttempts,
              },
            },
          },
          isDraftSaved: false,
        });

        console.log(
          `📝 Updated attempt #${attemptIndex + 1} in ${String(testName)}`
        );

        // Longer delay for updates to avoid excessive recalculations
        triggerRecalculateAndSave(WIZARD_CONFIG.UPDATE_RECALCULATE_DELAY);
      } catch (error) {
        console.error("❌ Failed to update test attempt:", error);
        setState({
          submitError:
            error instanceof Error ? error.message : "Failed to update attempt",
        });
      }
    },

    /**
     * Add a new test set
     */
    addTestSet: (testName: keyof StrengthPowerTestData, setData: any): void => {
      try {
        // Validate set data
        const validationError = validateStrengthAttempt(setData, "load");
        if (validationError) {
          console.error("❌ Invalid set data:", validationError.message);
          setState({ submitError: validationError.message });
          return;
        }

        const state = getState();
        const currentTest = state.formData.strengthPower[testName];

        let updatedTest: TestWithSets;

        if (!hasSets(currentTest)) {
          // Initialize test with first set
          updatedTest = {
            sets: [setData],
            maxLoad: setData.load || 0,
            totalTimeUsed: setData.restAfter || 0,
            totalReps: setData.reps || 0,
          };
          console.log(`✅ Initialized ${String(testName)} with first set`);
        } else {
          // Add new set
          updatedTest = {
            ...currentTest,
            sets: [...currentTest.sets, setData],
          };
          console.log(
            `✅ Added set #${updatedTest.sets.length} to ${String(testName)}`
          );
        }

        setState({
          formData: {
            ...state.formData,
            strengthPower: {
              ...state.formData.strengthPower,
              [testName]: updatedTest,
            },
          },
          isDraftSaved: false,
        });

        triggerRecalculateAndSave();
      } catch (error) {
        console.error("❌ Failed to add test set:", error);
        setState({
          submitError:
            error instanceof Error ? error.message : "Failed to add set",
        });
      }
    },

    /**
     * Remove a test set
     */
    removeTestSet: (
      testName: keyof StrengthPowerTestData,
      setIndex: number
    ): void => {
      try {
        const state = getState();
        const currentTest = state.formData.strengthPower[testName];

        if (!hasSets(currentTest)) {
          console.warn(`⚠️ ${String(testName)} has no sets to remove`);
          return;
        }

        if (setIndex < 0 || setIndex >= currentTest.sets.length) {
          console.error(`❌ Invalid set index: ${setIndex}`);
          return;
        }

        const updatedSets = currentTest.sets.filter(
          (_, index) => index !== setIndex
        );

        setState({
          formData: {
            ...state.formData,
            strengthPower: {
              ...state.formData.strengthPower,
              [testName]: {
                ...currentTest,
                sets: updatedSets,
              },
            },
          },
          isDraftSaved: false,
        });

        console.log(
          `🗑️ Removed set from ${String(testName)}, ${
            updatedSets.length
          } remaining`
        );
        triggerRecalculateAndSave();
      } catch (error) {
        console.error("❌ Failed to remove test set:", error);
        setState({
          submitError:
            error instanceof Error ? error.message : "Failed to remove set",
        });
      }
    },

    /**
     * Manually trigger score recalculation
     */
    recalculateScores: (): void => {
      try {
        const state = getState();
        const recalculatedData = recalculateStrengthScores(
          state.formData.strengthPower
        );

        setState({
          formData: {
            ...state.formData,
            strengthPower: recalculatedData,
          },
        });

        console.log("🔢 Scores manually recalculated");
      } catch (error) {
        console.error("❌ Failed to recalculate scores:", error);
      }
    },
  };
}

/**
 * Recalculate strength scores with error handling
 */
function recalculateStrengthScores(
  strengthData: StrengthPowerTestData
): StrengthPowerTestData {
  try {
    const explosivePower =
      StrengthCalculations.calculateExplosivePowerScore(strengthData);
    const muscleMass =
      StrengthCalculations.calculateMuscleMassScore(strengthData);
    const enduranceStrength =
      StrengthCalculations.calculateEnduranceStrengthScore(strengthData);

    // Round to 1 decimal place
    const roundedScores = {
      explosivePower: Math.round(explosivePower * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      enduranceStrength: Math.round(enduranceStrength * 10) / 10,
    };

    console.log("🔢 Recalculated scores:", roundedScores);

    return {
      ...strengthData,
      ...roundedScores,
    };
  } catch (error) {
    console.error("❌ Score calculation failed:", error);
    // Return original data if calculation fails
    return strengthData;
  }
}

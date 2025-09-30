// lib/api/middleware/validation.ts
import { z } from "zod";
import { ValidationError } from "@/lib/api/errors/api-errors";

/**
 * =============================================================================
 * VALIDATION MIDDLEWARE
 * =============================================================================
 */

/**
 * Validates API request data against schema
 */
export const validateApiRequest = async <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<T> => {
  try {
    const result = schema.safeParse(data);

    if (!result.success) {
      console.error("❌ Validation failed:", result.error.flatten());
      throw new ValidationError(
        "Validation failed",
        result.error.flatten().fieldErrors
      );
    }

    console.log("✅ Request validation successful");
    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Invalid request data");
  }
};

/**
 * Validates multiple schemas
 */
export const validateMultipleSchemas = async <T extends Record<string, any>>(
  validations: Array<{
    data: unknown;
    schema: z.ZodSchema<any>;
    name: string;
  }>
): Promise<T> => {
  const results = {} as T;

  for (const { data, schema, name } of validations) {
    try {
      results[name as keyof T] = await validateApiRequest(data, schema);
    } catch (error) {
      throw new ValidationError(`${name} validation failed`, error);
    }
  }

  return results;
};

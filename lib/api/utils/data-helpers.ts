// lib/api/utils/data-helpers.ts

/**
 * =============================================================================
 * DATA TRANSFORMATION UTILITIES
 * =============================================================================
 */

/**
 * Filters object to only include defined (non-undefined) values
 */
export const filterDefinedValues = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

/**
 * Maps frontend field names to database field names
 */
export const mapFieldNames = <T extends Record<string, any>>(
  data: T,
  fieldMapping: Record<string, string>
): Record<string, any> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const dbKey = fieldMapping[key] || key;
    acc[dbKey] = value;
    return acc;
  }, {} as Record<string, any>);
};

/**
 * Transforms date strings to Date objects
 */
export const transformDates = (
  data: Record<string, any>,
  dateFields: string[]
): Record<string, any> => {
  const transformed = { ...data };

  dateFields.forEach((field) => {
    if (transformed[field] && typeof transformed[field] === "string") {
      transformed[field] = new Date(transformed[field]);
    }
  });

  return transformed;
};

/**
 * Validates that at least one field is provided for updates
 */
export const validateUpdateData = (data: Record<string, any>): void => {
  const hasData = Object.values(data).some(
    (value) => value !== undefined && value !== null
  );

  if (!hasData) {
    throw new Error("At least one field must be provided for update");
  }
};

/**
 * Sanitizes string fields in an object
 */
export const sanitizeStringFields = (
  data: Record<string, any>,
  stringFields: string[]
): Record<string, any> => {
  const sanitized = { ...data };

  stringFields.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitized[field].trim().replace(/[<>]/g, "");
    }
  });

  return sanitized;
};

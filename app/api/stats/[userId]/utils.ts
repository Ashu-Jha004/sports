// ============================================
// FILE: app/api/stats/[userId]/utils.ts
// Utility functions for stats operations
// ============================================

import type { AuthenticatedUser } from "./types";

/**
 * Formats user's full name
 */
export function formatUserName(user: AuthenticatedUser): string {
  return `${user.firstName} ${user.lastName || ""}`.trim();
}

/**
 * Safely converts date string to Date object
 */
export function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Checks if stats record exists
 */
export async function statsExists(
  prisma: any,
  userId: string
): Promise<boolean> {
  const count = await prisma.stats.count({
    where: { userId },
  });
  return count > 0;
}

/**
 * Creates history backup entry metadata
 */
export function createHistoryMetadata(
  field: string,
  oldValue: any,
  newValue: any
): { field: string; value: any }[] {
  return [
    { field, value: oldValue },
    { field: `${field}_new`, value: newValue },
  ];
}

/**
 * Filters active injuries
 */
export function filterActiveInjuries(injuries: any[]): any[] {
  return injuries.filter(
    (injury) => injury.status === "active" || injury.status === "recovering"
  );
}

/**
 * Validates that a value has changed
 */
export function hasChanged<T>(oldValue: T, newValue: T): boolean {
  // Handle null/undefined
  if (oldValue === null || oldValue === undefined) {
    return newValue !== null && newValue !== undefined;
  }

  // Handle objects (shallow comparison)
  if (typeof oldValue === "object" && typeof newValue === "object") {
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  }

  return oldValue !== newValue;
}

/**
 * Sanitizes undefined values to null for Prisma
 */
export function sanitizeForPrisma<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (sanitized[key] === undefined) {
      sanitized[key] = null as any;
    }
  }

  return sanitized;
}

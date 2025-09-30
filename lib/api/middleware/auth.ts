// lib/api/middleware/auth.ts
import { currentUser } from "@clerk/nextjs/server";
import { AuthenticationError } from "@/lib/api/errors/api-errors";

/**
 * =============================================================================
 * AUTHENTICATION MIDDLEWARE
 * =============================================================================
 */

/**
 * Authenticates user using Clerk
 */
export const authenticateUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new AuthenticationError("Authentication required");
  }

  console.log(`✅ Authenticated user: ${user.id}`);
  return user;
};

/**
 * Optional authentication - returns null if not authenticated
 */
export const optionalAuthentication = async () => {
  try {
    return await currentUser();
  } catch {
    return null;
  }
};

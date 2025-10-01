// =============================================================================
// TYPE DEFINITIONS - MODERATOR REGISTRATION
// =============================================================================

import { z } from "zod";

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
  metadata: {
    traceId: string;
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    field?: string;
    details?: Record<string, any>;
    stack?: string;
  };
  metadata: {
    traceId: string;
    timestamp: string;
    version: string;
  };
}

export interface ModeratorRegistrationResponse {
  id: string;
  userId: string;
  guideEmail: string;
  status: "pending_review";
  submittedAt: string;
}

export interface ModeratorProfileDetails {
  hasModeratorProfile: boolean;
  profile?: ModeratorRegistrationResponse;
  details?: {
    primarySports: string;
    sports: string[];
    experience: number | null;
    location: {
      city: string | null;
      state: string | null;
      country: string;
    };
  };
  message?: string;
}

// Will be populated from validation.ts
export type ModeratorRegistrationData = {
  guideEmail: string;
  primarySports: string;
  sports: string[];
  documents: string[];
  country: string;
  experience?: number | null;
  state?: string | null;
  city?: string | null;
  lat?: number | null;
  lon?: number | null;
};

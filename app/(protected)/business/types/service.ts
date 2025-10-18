export interface ModeratorFormData {
  guideEmail: string;
  documents: string[];
  primarySports: string | undefined;
  sports: string[];
  experience: number | null;
  state: string;
  lat: number | null;
  lon: number | null;
  city: string;
  country: string;
}
export interface ModeratorProfile {
  id: string;
  userId: string;
  guideEmail: string;
  status: "pending_review" | "approved" | "rejected";
  submittedAt: string;
}

export interface ModeratorDetails {
  primarySports: string | null; // ✅ lowercase to match service
  sports: string[]; // ✅ lowercase to match service
  experience: number | null; // ✅ lowercase to match service
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  documents?: string[];
  reviewNote?: string | null;
  reviewedAt?: string | null;
}

export interface DashboardData {
  hasModeratorProfile: boolean;
  profile?: ModeratorProfile;
  details?: ModeratorDetails;
  message?: string;
}

export interface DashboardStats {
  totalApplications: number;
  approvedApplications: number;
  pendingReviews: number;
  rejectedApplications: number;
}
export interface ModeratorProfile {
  id: string;
  userId: string;
  guideEmail: string;
  status: "pending_review" | "approved" | "rejected";
  submittedAt: string;
}

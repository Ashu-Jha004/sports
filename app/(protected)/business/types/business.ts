// types/business.ts
export interface BusinessOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  features: string[];
  estimatedEarnings: {
    min: number;
    max: number;
    period: "month" | "year";
  };
  requirements: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: BusinessCategory;
}

export enum BusinessCategory {
  FACILITIES = "facilities",
  SERVICES = "services",
  MARKETPLACE = "marketplace",
}

// Error handling types
export interface BusinessError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// State management types
export interface BusinessState {
  selectedCategory: BusinessCategory | null;
  isLoading: boolean;
  error: BusinessError | null;
}

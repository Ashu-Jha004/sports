// Ensure all types are properly exported and defined:

export interface VerifiedUser {
  id: string;
  firstName: string | null;
  username: string | null;
  primarySport: string | null;
  profileImageUrl: string | null;
  role: string;
  rank: string;
  class: string;
  country: string | null;
  state: string | null;
  city: string | null;
  gender: string | null;
  requestId: string;
  scheduledDate: string;
  verifiedAt: number;
}

export interface ErrorState {
  type:
    | "INVALID_OTP"
    | "DATE_MISMATCH"
    | "EXPIRED_REQUEST"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | null;
  message: string | null;
}

export interface StatUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OTPVerificationFormProps {
  onVerificationSuccess: (user: VerifiedUser) => void;
  isLoading: boolean;
  error: ErrorState;
  onClearError: () => void;
}

export interface UserDetailsDisplayProps {
  user: VerifiedUser;
  className?: string;
}

export interface NavigationButtonProps {
  userId: string; // Keep for compatibility but won't be used in URL
  onNavigate: () => void;
  disabled?: boolean;
  className?: string;
}

// Export additional types needed by the stats wizard

import type { ProfileFormData } from "@/types/profile";
export interface ProfileWizardProps {
  readonly onComplete?: (profileData: ProfileFormData) => void;
  readonly onCancel?: () => void;
  readonly className?: string;
  readonly showHeader?: boolean;
  readonly allowStepSkipping?: boolean;
}

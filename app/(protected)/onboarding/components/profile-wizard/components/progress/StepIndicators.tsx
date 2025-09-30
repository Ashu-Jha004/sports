// onboarding/components/profile-wizard/components/progress/StepIndicators.tsx
"use client";

import React from "react";
import { DesktopStepIndicators } from "./DesktopStepIndicators";
import { MobileStepIndicators } from "./MobileStepIndicators";
import type { WizardStep } from "@/types/profile";

interface StepIndicatorsProps {
  readonly steps: readonly WizardStep[];
  readonly currentStep: number;
}

export const StepIndicators: React.FC<StepIndicatorsProps> = ({
  steps,
  currentStep,
}) => (
  <>
    {/* Desktop View */}
    <div className="hidden md:block">
      <DesktopStepIndicators steps={steps} currentStep={currentStep} />
    </div>

    {/* Mobile View */}
    <div className="block md:hidden">
      <MobileStepIndicators steps={steps} currentStep={currentStep} />
    </div>
  </>
);

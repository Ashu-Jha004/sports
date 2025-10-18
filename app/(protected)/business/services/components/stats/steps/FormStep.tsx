import React from "react";
import { BasicMetricsForm } from "../forms/BasicMetricsForm";
import { StrengthPowerForm } from "../forms/StrengthPowerForm";
import { SpeedAgilityForm } from "../forms/SpeedAgilityForm";
import { StaminaRecoveryForm } from "../forms/StaminaRecoveryForm";
import { InjuryManagementForm } from "../forms/InjuryManagementForm";

interface FormStepProps {
  section:
    | "basicMetrics"
    | "strengthPower"
    | "speedAgility"
    | "staminaRecovery"
    | "injuries"
    | "review";
  onNext: () => void;
  onPrevious: () => void;
}

export const FormStep: React.FC<FormStepProps> = ({
  section,
  onNext,
  onPrevious,
}) => {
  const renderForm = () => {
    switch (section) {
      case "basicMetrics":
        return <BasicMetricsForm onNext={onNext} onPrevious={onPrevious} />;

      case "strengthPower":
        return <StrengthPowerForm onNext={onNext} onPrevious={onPrevious} />;

      case "speedAgility":
        return <SpeedAgilityForm onNext={onNext} onPrevious={onPrevious} />;

      case "staminaRecovery":
        return <StaminaRecoveryForm onNext={onNext} onPrevious={onPrevious} />;

      case "injuries":
        return <InjuryManagementForm onNext={onNext} onPrevious={onPrevious} />;

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Form not available for this section.
            </p>
          </div>
        );
    }
  };

  return <div className="max-w-4xl mx-auto">{renderForm()}</div>;
};

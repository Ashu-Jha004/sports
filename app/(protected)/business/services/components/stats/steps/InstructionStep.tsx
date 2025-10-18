import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import { wizardInstructions } from "@/app/(protected)/business/utils/instructionContent";

interface InstructionStepProps {
  section:
    | "basicMetrics"
    | "strengthPower"
    | "speedAgility"
    | "staminaRecovery"
    | "injuries";
  onNext: () => void;
}

export const InstructionStep: React.FC<InstructionStepProps> = ({
  section,
  onNext,
}) => {
  const content = wizardInstructions[section];
  const IconComponent = content.icon;

  if (!content) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Instructions not available for this section.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-indigo-100 rounded-full p-4">
            <IconComponent className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600">{content.subtitle}</p>
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{content.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Main Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Step-by-Step Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.instructions.map((instruction, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: instruction.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-gray-900">$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Required */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Equipment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {content.equipment.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-amber-800">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Safety Notes (if available) */}
      {content.safetyNotes && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium text-red-800 mb-2">
              Safety Considerations:
            </div>
            <ul className="space-y-1">
              {content.safetyNotes.map((note, index) => (
                <li key={index} className="text-sm text-red-700">
                  • {note}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <div className="text-center pt-6">
        <Button onClick={onNext} size="lg" className="px-8">
          Proceed to Assessment Form
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Review the instructions carefully before starting the assessment
        </p>
      </div>
    </div>
  );
};

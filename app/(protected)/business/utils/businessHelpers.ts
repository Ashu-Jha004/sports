// utils/businessHelpers.ts
import { BusinessError } from "../types/business";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "Beginner":
      return "text-green-600 bg-green-50";
    case "Intermediate":
      return "text-yellow-600 bg-yellow-50";
    case "Advanced":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const createBusinessError = (
  code: string,
  message: string,
  details?: Record<string, any>
): BusinessError => ({
  code,
  message,
  details,
});

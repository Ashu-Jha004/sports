// lib/utils/form-styles.ts

/**
 * Get input classes based on state
 */
export const getInputClasses = (hasError: boolean, value?: string): string => {
  const baseClasses =
    "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500";

  if (hasError) {
    return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
  }

  if (value && !hasError) {
    return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50`;
  }

  return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white`;
};

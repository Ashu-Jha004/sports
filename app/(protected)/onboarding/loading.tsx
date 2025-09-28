// Loading.tsx

import React from "react";
import styles from "./Loading.module.css"; // Import the CSS module

// Define the component's props for flexibility
interface LoadingProps {
  /** The message displayed below the spinner. Defaults to "Loading...". */
  message?: string;
  /** The size of the spinner. Defaults to 'medium'. */
  size?: "small" | "medium" | "large";
  /** Optional class to apply to the main container. */
  className?: string;
}

/**
 * A reusable, accessible loading component with a smooth animation.
 * Uses Tailwind CSS for basic styling and a CSS Module for keyframes.
 */
const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = "medium",
  className = "",
}) => {
  // Determine spinner dimensions based on the 'size' prop
  const sizeClasses = {
    small: "w-6 h-6 border-2", // 24px x 24px, 2px border
    medium: "w-10 h-10 border-4", // 40px x 40px, 4px border
    large: "w-16 h-16 border-6", // 64px x 64px, 6px border
  };

  return (
    <div
      // Use flexbox to center content
      className={`flex flex-col items-center justify-center p-8 text-gray-700 ${className}`}
      aria-live="polite" // Announces content updates to screen readers
      aria-busy="true" // Indicates that the content is being loaded
    >
      <div
        className={`
          ${styles.spinner} 
          ${sizeClasses[size]} 
          border-t-blue-500 
          border-r-blue-500 
          border-b-transparent 
          border-l-transparent 
          mb-4
        `}
        role="status" // Semantically identifies the element as a status indicator
      >
        {/* Visually hidden text for screen readers */}
        <span className="sr-only">{message}</span>
      </div>

      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export default Loading;

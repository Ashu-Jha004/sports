// =============================================================================
// UNAUTHORIZED ACCESS PAGE - PROFESSIONAL ERROR HANDLING
// =============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, ArrowLeft, Mail, AlertTriangle } from "lucide-react";

interface UnauthorizedReason {
  title: string;
  description: string;
  action?: string;
  actionLink?: string;
}

const UNAUTHORIZED_REASONS: Record<string, UnauthorizedReason> = {
  admin_required: {
    title: "Admin Access Required",
    description:
      "You need administrator privileges to access this area. Contact a founder or existing admin to request admin access.",
    action: "Contact Admin",
    actionLink: "mailto:admin@sparta.com?subject=Admin Access Request",
  },
  insufficient_permissions: {
    title: "Insufficient Permissions",
    description:
      "Your admin role doesn't have permission to access this resource. Contact a founder if you need additional permissions.",
    action: "Contact Founder",
    actionLink: "mailto:founder@sparta.com?subject=Permission Request",
  },
  default: {
    title: "Access Denied",
    description:
      "You don't have permission to access this area. Please contact an administrator if you believe this is an error.",
    action: "Go Home",
    actionLink: "/",
  },
};

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reason, setReason] = useState<UnauthorizedReason>(
    UNAUTHORIZED_REASONS.default
  );
  const [attemptedPath, setAttemptedPath] = useState<string>("");

  useEffect(() => {
    const reasonParam = searchParams.get("reason") || "default";
    const pathParam = searchParams.get("attempted_path") || "";

    setReason(
      UNAUTHORIZED_REASONS[reasonParam] || UNAUTHORIZED_REASONS.default
    );
    setAttemptedPath(pathParam);
  }, [searchParams]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {reason.title}
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {reason.description}
          </p>

          {attemptedPath && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">Attempted to access:</p>
              <code className="text-sm text-gray-800 break-all">
                {attemptedPath}
              </code>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>

            {reason.action && reason.actionLink && (
              <a
                href={reason.actionLink}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {reason.actionLink.startsWith("mailto:") && (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {reason.action}
              </a>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@sparta.com"
              className="text-indigo-600 hover:underline"
            >
              support@sparta.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

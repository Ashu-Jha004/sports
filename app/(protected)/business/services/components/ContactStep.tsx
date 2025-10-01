import React, { useState } from "react";
import { User } from "lucide-react";
import { StepProps } from "../page";
export const ContactStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => (
  <div>
    <div className="flex items-center mb-6">
      <User className="w-6 h-6 text-indigo-600 mr-3" />
      <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Email Address *
        </label>
        <input
          type="email"
          value={formData.guideEmail}
          onChange={(e) => updateFormData({ guideEmail: e.target.value })}
          placeholder="Enter your assigned organization email"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.guideEmail ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.guideEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.guideEmail}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          This should be the official email address assigned to you by your
          organization
        </p>
      </div>
    </div>
  </div>
);

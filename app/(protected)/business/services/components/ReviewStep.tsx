import React, { useState, useRef } from "react";
import { ModeratorFormData } from "../../types/service";
export const ReviewStep: React.FC<{ formData: ModeratorFormData }> = ({
  formData,
}) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-6">
      Review Your Application
    </h2>

    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">
          Contact Information
        </h3>
        <p className="text-gray-700">Email: {formData.guideEmail}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">
          Sports & Experience
        </h3>
        <p className="text-gray-700">Primary Sport: {formData.primarySports}</p>
        <p className="text-gray-700">
          Additional Sports: {formData.sports.join(", ")}
        </p>
        {formData.experience && (
          <p className="text-gray-700">
            Experience: {formData.experience} years
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
        <p className="text-gray-700">
          {[formData.city, formData.state, formData.country]
            .filter(Boolean)
            .join(", ")}
        </p>
        {(formData.lat || formData.lon) && (
          <p className="text-gray-700">
            Coordinates: {formData.lat}, {formData.lon}
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
       
         doc: info
    
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-800">
          By submitting this application, you confirm that all information
          provided is accurate and you understand the responsibilities of a
          Sparta Moderator.
        </p>
      </div>
    </div>
  </div>
);

import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { StepProps } from "../page";
export const SportsExperienceStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const sportsOptions = [
    "Football",
    "Basketball",
    "Tennis",
    "Swimming",
    "Track & Field",
    "Baseball",
    "Soccer",
    "Volleyball",
    "Gymnastics",
    "Wrestling",
    "Boxing",
    "Cricket",
    "Hockey",
    "Golf",
    "Badminton",
  ];

  const handleSportsChange = (sport: string, checked: boolean) => {
    if (checked) {
      updateFormData({ sports: [...formData.sports, sport] });
    } else {
      updateFormData({ sports: formData.sports.filter((s) => s !== sport) });
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Trophy className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Sports & Experience</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Sport *
          </label>
          <select
            name="Sport"
            title="Sport"
            value={formData.primarySports}
            onChange={(e) => updateFormData({ primarySports: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.primarySports ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select your primary sport</option>
            {sportsOptions.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
          {errors.primarySports && (
            <p className="mt-1 text-sm text-red-600">{errors.primarySports}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Additional Sports (Select all that apply) *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            {sportsOptions.map((sport) => (
              <label key={sport} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sports.includes(sport)}
                  onChange={(e) => handleSportsChange(sport, e.target.checked)}
                  className="mr-2 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">{sport}</span>
              </label>
            ))}
          </div>
          {errors.sports && (
            <p className="mt-1 text-sm text-red-600">{errors.sports}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience (Optional)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.experience || ""}
            onChange={(e) =>
              updateFormData({
                experience: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="Enter years of experience in sports"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

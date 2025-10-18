import React from "react";
import { Star, Users, TrendingUp, FileText } from "lucide-react";
const ModeratorTools = ({ profile }: any) => {
  return (
    <div>
      {profile?.status === "approved" && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
            <div className="p-8">
              <div className="text-center mb-8">
                <Star className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Moderator Tools
                </h2>
                <p className="text-gray-600">
                  Access your moderator privileges and manage the community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                  <Users className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                  <span className="text-lg font-semibold text-gray-900 mb-2">
                    Athlete Management
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Manage athlete profiles, evaluations, and performance
                    tracking
                  </span>
                </button>

                <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                  <TrendingUp className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                  <span className="text-lg font-semibold text-gray-900 mb-2">
                    Performance Analytics
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    View comprehensive metrics, trends, and performance insights
                  </span>
                </button>

                <button className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group">
                  <FileText className="w-10 h-10 text-indigo-600 group-hover:text-indigo-700 mb-4" />
                  <span className="text-lg font-semibold text-gray-900 mb-2">
                    Reports & Documentation
                  </span>
                  <span className="text-sm text-gray-500 text-center">
                    Generate detailed reports and manage documentation
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorTools;

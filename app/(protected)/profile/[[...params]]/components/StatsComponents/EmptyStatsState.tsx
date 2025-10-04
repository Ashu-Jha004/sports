// app/(protected)/profile/[[...params]]/components/StatsComponents/EmptyStatsState.tsx
import { UserSearch, MapPin, TrendingUp } from "lucide-react";

interface EmptyStatsStateProps {
  onFindGuides: () => void;
  loading?: boolean;
}

export const EmptyStatsState = ({
  onFindGuides,
  loading = false,
}: EmptyStatsStateProps) => {
  return (
    <div className="space-y-6">
      {/* Main Empty State */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="relative">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-xs">!</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Statistics Available
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Connect with verified guides near you to get your athletic performance
          metrics professionally recorded and tracked.
        </p>

        {/* CTA Button */}
        <button
          onClick={onFindGuides}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-blue-400 text-white px-6 py-3 rounded-lg 
                     font-medium transition-colors duration-200 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Finding Guides...
            </>
          ) : (
            <>
              <UserSearch className="w-4 h-4" />
              Find Nearby Guides
            </>
          )}
        </button>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            {
              label: "Performance Metrics",
              description: "Speed, strength, endurance",
              icon: "📊",
              color: "blue",
            },
            {
              label: "Progress Tracking",
              description: "Historical improvements",
              icon: "📈",
              color: "green",
            },
            {
              label: "Professional Insights",
              description: "Expert evaluations",
              icon: "🎯",
              color: "purple",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 
                         hover:border-gray-300 transition-colors duration-200"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>Guides are verified professionals in your area</span>
        </div>
      </div>
    </div>
  );
};

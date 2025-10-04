// app/(protected)/profile/[[...params]]/components/StatsComponents/GuideDiscoveryModal.tsx (COMPLETE FIXED VERSION)
import { X, MapPin, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface GuideDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: {
    lat: number;
    lon: number;
    city?: string;
    state?: string;
  } | null;
  onLocationPermission?: () => void;
  children?: React.ReactNode;
}

export const GuideDiscoveryModal = ({
  isOpen,
  onClose,
  userLocation,
  onLocationPermission,
  children,
}: GuideDiscoveryModalProps) => {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                   animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container - FIXED HEIGHT CONSTRAINTS */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl bg-white rounded-xl shadow-2xl 
                       animate-in slide-in-from-bottom duration-300
                       flex flex-col h-[90vh] max-h-[800px] min-h-[500px]"
        >
          {/* Header - FIXED HEIGHT */}
          <div
            className="flex items-center justify-between p-6 border-b border-gray-200 
                         flex-shrink-0 bg-white rounded-t-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Find Nearby Guides
                </h2>
                {userLocation ? (
                  <p className="text-sm text-gray-600">
                    {userLocation.city && userLocation.state
                      ? `${userLocation.city}, ${userLocation.state}`
                      : "Your location"}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Location access needed
                  </p>
                )}
              </div>
            </div>

            <button
              title="close"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full
                       hover:bg-gray-100 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content Area - SCROLLABLE */}
          <div className="flex-1 overflow-hidden min-h-0 bg-gray-50">
            {!userLocation ? (
              <LocationPermissionRequest onRequest={onLocationPermission} />
            ) : (
              <div className="h-full">
                {children || (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading nearby guides...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Location Permission Sub-Component
const LocationPermissionRequest = ({
  onRequest,
}: {
  onRequest?: () => void;
}) => (
  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <MapPin className="w-8 h-8 text-blue-600" />
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Location Access Required
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      We need your location to find verified guides near you. Your location data
      is only used for finding nearby professionals.
    </p>

    <button
      onClick={onRequest}
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
               text-white px-6 py-3 rounded-lg font-medium transition-colors 
               duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
               focus:ring-offset-2"
    >
      <MapPin className="w-4 h-4" />
      Allow Location Access
    </button>

    <p className="text-xs text-gray-500 mt-4">
      Or we'll use your profile location as backup
    </p>
  </div>
);

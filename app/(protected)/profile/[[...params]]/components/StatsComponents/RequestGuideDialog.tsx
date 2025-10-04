// app/(protected)/profile/[[...params]]/components/StatsComponents/RequestGuideDialog.tsx
import { useState } from "react";
import { X, Send, User, MapPin, Trophy, MessageSquare } from "lucide-react";

interface Guide {
  id: string;
  PrimarySports: string | null;
  Experience: number | null;
  city: string | null;
  state: string | null;
  distance: number;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    Rank: string;
    Class: string;
  };
}

interface RequestGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
  onSendRequest: (guideId: string, message: string) => Promise<boolean>;
  loading: boolean;
}

const MAX_MESSAGE_LENGTH = 150; // ~2 lines

export const RequestGuideDialog = ({
  isOpen,
  onClose,
  guide,
  onSendRequest,
  loading,
}: RequestGuideDialogProps) => {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");

  const handleMessageChange = (value: string) => {
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
      setCharCount(value.length);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guide || !message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (message.trim().length < 10) {
      setError("Message should be at least 10 characters");
      return;
    }
    console.log("🔍 Full guide object:", {
      guide: guide,
      guideId: guide?.id,
      guideName: `${guide?.user.firstName} ${guide?.user.lastName}`,
    });

    try {
      const success = await onSendRequest(guide.id, message.trim());
      if (success) {
        setMessage("");
        setCharCount(0);
        onClose();
      }
    } catch (err) {
      setError("Failed to send request. Please try again.");
    }
  };

  const handleClose = () => {
    setMessage("");
    setCharCount(0);
    setError("");
    onClose();
  };

  if (!isOpen || !guide) return null;

  const getRankIcon = (rank: string) => {
    const icons = {
      KING: "👑",
      QUEEN: "♛",
      ROOK: "🏰",
      BISHOP: "⛪",
      KNIGHT: "🐴",
      PAWN: "♟️",
    };
    return icons[rank as keyof typeof icons] || "⭐";
  };

  const getClassColor = (cls: string) => {
    const colors = {
      A: "text-green-600 bg-green-50 border-green-200",
      B: "text-blue-600 bg-blue-50 border-blue-200",
      C: "text-yellow-600 bg-yellow-50 border-yellow-200",
      D: "text-orange-600 bg-orange-50 border-orange-200",
      E: "text-red-600 bg-red-50 border-red-200",
    };
    return (
      colors[cls as keyof typeof colors] ||
      "text-gray-600 bg-gray-50 border-gray-200"
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 
                   animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-white rounded-xl shadow-2xl 
                       animate-in slide-in-from-bottom duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Request Guide
              </h3>
            </div>
            <button
              title="close"
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full
                       hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Guide Info */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {guide.user.profileImageUrl ? (
                  <img
                    src={guide.user.profileImageUrl}
                    alt={`${guide.user.firstName} ${guide.user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {guide.user.firstName} {guide.user.lastName}
                  </h4>
                  <span className="text-lg">
                    {getRankIcon(guide.user.Rank)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${getClassColor(
                      guide.user.Class
                    )}`}
                  >
                    Class {guide.user.Class}
                  </span>
                  {guide.Experience && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      <span>{guide.Experience}+ yrs</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {guide.city}, {guide.state}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 font-medium">
                    {guide.distance.toFixed(1)}km
                  </span>
                </div>

                {guide.PrimarySports && (
                  <div className="mt-1 text-xs text-gray-600">
                    Specializes in {guide.PrimarySports}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message to Guide
                <span className="text-red-500 ml-1">*</span>
              </label>

              <textarea
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Hi! I'd like to request an evaluation for my athletic performance metrics..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm placeholder-gray-400"
                disabled={loading}
              />

              {/* Character Count */}
              <div className="flex justify-between items-center mt-2">
                <div
                  className={`text-xs ${
                    charCount > MAX_MESSAGE_LENGTH * 0.9
                      ? "text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {charCount}/{MAX_MESSAGE_LENGTH} characters
                </div>
                {charCount === MAX_MESSAGE_LENGTH && (
                  <div className="text-xs text-orange-600">
                    Maximum length reached
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Info Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Your request will be sent to the guide. They can accept or
                decline, and all requests automatically expire after 7 days.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200
                         rounded-lg font-medium transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading || !message.trim() || message.trim().length < 10
                }
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         disabled:bg-blue-400 text-white rounded-lg font-medium 
                         transition-colors duration-200 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// hooks/useGuideRequests.ts (CREATE THIS FILE)
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface RequestUser {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  PrimarySport: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

interface GuideRequest {
  id: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  respondedAt?: string | null;
  guideResponse?: string | null;
  user: RequestUser;
}

interface RequestStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export const useGuideRequests = () => {
  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching guide requests...");
      const response = await fetch("/api/guides/incoming-requests");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch requests");
      }

      const data = await response.json();
      console.log("✅ Requests fetched:", data);

      setRequests(data.requests);
      setStats(data.stats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load requests";
      setError(errorMessage);
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "ACCEPT" | "REJECT",
    response?: string
  ) => {
    try {
      setActionLoading(requestId);

      console.log(`🔄 ${action}ing request:`, { requestId, response });

      const res = await fetch(`/api/guides/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, response }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update request");
      }

      const result = await res.json();
      console.log("✅ Request updated:", result);

      // Refresh requests after successful action
      await fetchRequests();

      toast.success(`Request ${action.toLowerCase()}ed successfully!`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Action failed";
      toast.error(errorMessage);
      console.error("Error handling request:", err);
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    stats,
    loading,
    actionLoading,
    error,
    refetch: fetchRequests,
    acceptRequest: (id: string, response?: string) =>
      handleRequest(id, "ACCEPT", response),
    rejectRequest: (id: string, response?: string) =>
      handleRequest(id, "REJECT", response),
  };
};

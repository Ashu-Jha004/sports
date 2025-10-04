// components/RequestTest.tsx (TEMPORARY TEST COMPONENT)
"use client";

import { useGuideRequests } from "../hooks/useGuideRequests";

export const RequestTest = () => {
  const { requests, stats, loading, error, refetch } = useGuideRequests();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-white border rounded">
      <h3>Guide Requests Test</h3>
      <div className="mb-4">
        <p>Total: {stats.total}</p>
        <p>Pending: {stats.pending}</p>
        <p>Accepted: {stats.accepted}</p>
        <p>Rejected: {stats.rejected}</p>
      </div>
      <button
        onClick={refetch}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
      >
        Refresh
      </button>
      <div>
        {requests.map((request) => (
          <div key={request.id} className="border p-2 mb-2">
            <p>
              From: {request.user.firstName} {request.user.lastName}
            </p>
            <p>Status: {request.status}</p>
            <p>Message: {request.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

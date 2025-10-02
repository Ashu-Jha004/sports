"use client";

import { useUser, useAuth } from "@clerk/nextjs";

export default function DebugAuthPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { userId, sessionId, getToken } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">useUser Hook:</h2>
          <p>isSignedIn: {String(isSignedIn)}</p>
          <p>isLoaded: {String(isLoaded)}</p>
          <p>User ID: {user?.id || "undefined"}</p>
          <p>Email: {user?.emailAddresses?.[0]?.emailAddress || "undefined"}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">useAuth Hook:</h2>
          <p>userId: {userId || "undefined"}</p>
          <p>sessionId: {sessionId || "undefined"}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">User Object:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast"; // Keep this import, remove Toaster
// REMOVE: import toast, { Toaster } from 'react-hot-toast';
import {
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { user } = useUser();

  const testNotifications = () => {
    toast.success("Welcome! 🎉");

    setTimeout(() => {
      toast("Info notification", {
        icon: "ℹ️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }, 1000);

    setTimeout(() => {
      toast.error("Something went wrong!");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* REMOVE: <Toaster ... /> component - it's now global */}

      {/* Keep all your existing content exactly the same */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your athletic network
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">--</p>
              <p className="text-gray-600">Followers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <TrophyIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">--</p>
              <p className="text-gray-600">Achievements</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">--</p>
              <p className="text-gray-600">Performance</p>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-blue-50"
          onClick={testNotifications}
        >
          <div className="flex items-center">
            <PlusIcon className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900">Test</p>
              <p className="text-gray-600">Notifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🔔 Global Notification Tests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => toast.success("Action completed successfully!")}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            ✅ Success
          </button>

          <button
            onClick={() => toast.error("Something went wrong!")}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            ❌ Error
          </button>

          <button
            onClick={() => {
              const loadingToast = toast.loading("Processing...");
              setTimeout(() => {
                toast.success("Done!", { id: loadingToast });
              }, 2000);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:blue-600 transition-colors"
          >
            ⏳ Loading
          </button>

          <button
            onClick={() =>
              toast("Custom notification", {
                icon: "👋",
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                },
              })
            }
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            💬 Custom
          </button>
        </div>
      </div>

      <div className="mt-6 bg-green-50 rounded-lg p-4">
        <p className="text-green-800 font-medium">
          🌍 Global Notifications Active
        </p>
        <p className="text-green-700 text-sm mt-1">
          Notifications now work on all pages! Try visiting profile and testing
          there.
        </p>
      </div>
    </div>
  );
}

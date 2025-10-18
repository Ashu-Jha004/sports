import React, { useState } from "react";
import { Settings, Shield, Mails } from "lucide-react";
import { InboxDialog } from "../components/guide/InboxDialog";
const Header = ({ profile }: any) => {
  // ADD INBOX STATE
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Moderator Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back to your Sparta moderator panel
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* ADD INBOX BUTTON - Only for approved guides */}
            {profile?.status === "approved" && (
              <Mails onClick={() => setIsInboxOpen(true)} />
            )}

            <button
              title="Settings"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <InboxDialog isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
    </header>
  );
};

export default Header;

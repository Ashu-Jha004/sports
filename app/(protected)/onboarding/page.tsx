import { currentUser, auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { syncUserWithDB } from "@/lib/syncUserDb";
import ProfileWizard from "./components/profile-wizard/ProfileWizard";

export default async function OnboardingPage() {
  // Use currentUser() to get server-side user data from Clerk
  const { userId } = await auth();

  // only try to sync if user is signed in
  let dbUser = null;
  if (userId) {
    dbUser = await syncUserWithDB();
  }
  const user = await currentUser();
  const userName =
    user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress;

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 sm:p-8">
      {/* Header */}
      <header className="flex justify-between gap-4 sm:gap-0 pb-1.5 border-b border-gray-200">
        <h2 className="text-xl sm:text-xl font-bold text-gray-900 text-left sm:text-left">
          Onboarding
        </h2>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
          Sparta
        </h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto w-full mt-6">
        {/* Welcome Box */}
        <div className="p-4 sm:p-6 bg-green-50 border-l-4 border-green-500 rounded-lg text-center sm:text-left">
          <p className="font-semibold text-green-800 text-lg">
            Welcome, {userName}!
          </p>
          <p className="text-green-700 mt-2">
            Please fill your profile details to complete the onboarding process.
          </p>
        </div>

        {/* Profile Wizard */}
        <div className="w-full">
          <ProfileWizard />
        </div>
      </main>
    </div>
  );
}

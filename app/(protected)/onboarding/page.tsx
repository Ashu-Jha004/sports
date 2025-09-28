import { currentUser, auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { syncUserWithDB } from "@/lib/syncUserDb";
import ProfileWizard from "./components/profile-wizard/ProfileWizard";
export default async function DashboardPage() {
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
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <header className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <p className="font-semibold text-green-800">Welcome, {userName}!</p>
          <p className="text-green-700 mt-2">
            Please fill your profile details to complete the onboarding process.
          </p>
        </div>
        <div className="">
          <ProfileWizard />
        </div>
      </main>
    </div>
  );
}

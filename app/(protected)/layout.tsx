import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../components/layout/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

// =============================================================================
// MODERATOR DASHBOARD PAGE - SHOWS USER'S OWN APPLICATION STATUS
// =============================================================================

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ModeratorDashboardComponent from "./ModeratorDashboardComponent";

export default async function ModeratorDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard/moderator");
  }

  return <ModeratorDashboardComponent />;
}

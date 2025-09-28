// lib/syncUser.ts
import { currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function syncUserWithDB() {
  const user = await currentUser();

  if (!user) {
    console.warn("⚠️ No Clerk user found.");
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress || "";

  try {
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        clerkId: user.id,
        profileImageUrl: user.imageUrl,
      },
      create: {
        email,
        clerkId: user.id,
        profileImageUrl: user.imageUrl,
      },
    });

    console.log("✅ Synced user:", dbUser);
    return dbUser;
  } catch (error) {
    console.error("❌ Error syncing user with DB:", error);
    return null;
  }
}

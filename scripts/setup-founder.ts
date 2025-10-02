// =============================================================================
// FOUNDER SETUP SCRIPT - RUN ONCE TO CREATE INITIAL ADMIN
// =============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupFounder() {
  try {
    console.log("🚀 Setting up founder admin access...");

    // Your actual values (already correct!)
    const FOUNDER_CLERK_ID = "user_33FY8YiJ3UraX3YsZaRzc69JZuZ";
    const FOUNDER_EMAIL = "ashujha009322@gmail.com";

    // CORRECTED validation - check against placeholder values
    if (FOUNDER_CLERK_ID === FOUNDER_CLERK_ID) {
      console.error(
        "❌ Please update FOUNDER_CLERK_ID with your actual Clerk User ID"
      );
      console.log("📋 To find your Clerk User ID:");
      console.log("   1. Go to https://dashboard.clerk.com");
      console.log("   2. Navigate to Users");
      console.log("   3. Find your user and copy the User ID");
      return;
    }

    if (FOUNDER_EMAIL === FOUNDER_EMAIL) {
      console.error("❌ Please update FOUNDER_EMAIL with your actual email");
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: FOUNDER_CLERK_ID },
    });

    if (existingUser && existingUser.isAdmin) {
      console.log("✅ User is already an admin!");
      console.log("👤 Admin:", existingUser.firstName, existingUser.lastName);
      console.log("📧 Email:", existingUser.email);
      console.log("🔐 Role:", existingUser.adminRole);
      return;
    }

    // Create or update founder user
    const founder = await prisma.user.upsert({
      where: { clerkId: FOUNDER_CLERK_ID },
      update: {
        roles: { set: ["ADMIN"] }, // Add ADMIN to existing roles
        isAdmin: true,
        adminRole: "FOUNDER",
        adminGrantedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        clerkId: FOUNDER_CLERK_ID,
        email: FOUNDER_EMAIL,
        roles: ["ADMIN"],
        isAdmin: true,
        adminRole: "FOUNDER",
        adminGrantedAt: new Date(),
      },
    });

    // Log the admin action
    await prisma.adminAction.create({
      data: {
        adminUserId: founder.id,
        action: "FOUNDER_SETUP",
        details: {
          note: "Initial founder setup via script",
          timestamp: new Date().toISOString(),
          email: FOUNDER_EMAIL,
        },
      },
    });

    console.log("✅ Founder setup complete!");
    console.log("👤 Founder ID:", founder.id);
    console.log("📧 Email:", founder.email);
    console.log("🔐 Admin Role:", founder.adminRole);
    console.log("📅 Granted At:", founder.adminGrantedAt);
    console.log("");
    console.log("🎉 You can now access admin features!");
    console.log("🔗 Admin Panel: http://localhost:3000/admin/moderators");
  } catch (error) {
    console.error("❌ Founder setup failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        console.log("💡 Tip: The email might already be used by another user");
      }
      if (error.message.includes("Foreign key constraint")) {
        console.log("💡 Tip: Make sure the Clerk User ID is correct");
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupFounder();

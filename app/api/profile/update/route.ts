import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// FIXED: Server-side validation schema for profile updates with proper enum values
const profileUpdateSchema = z.object({
  // Location data (all optional for updates)
  city: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(130).optional(),
  firstName: z.string().min(1).max(150).optional(),
  lastName: z.string().min(1).max(50).optional(),
  state: z.string().min(1).max(100).optional(),

  // Personal details
  dateOfBirth: z
    .string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, "You must be between 13 and 120 years old")
    .optional(),

  // FIXED: Gender enum values to match your Prisma schema exactly
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  bio: z.string().min(10).max(500).optional(),

  // Image data
  profileImageUrl: z.string().url().optional(),
  profileImagePublicId: z.string().optional(),

  // Sport information
  primarySport: z.string().min(1).optional(),

  // Geolocation data
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationAccuracy: z.number().min(0).optional(),
});

export async function PUT(req: NextRequest) {
  console.log("🔄 Profile update request received");

  try {
    // --- 1. Authentication ---
    const user = await currentUser();

    if (!user) {
      console.error("❌ No authenticated user found");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // --- 2. Parse and validate request body ---
    const body = await req.json();
    console.log("📝 Update request body keys:", Object.keys(body));

    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    console.log("✅ Validation successful");

    // --- 3. Get current user ---
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        profile: {
          include: {
            location: true,
          },
        },
        counters: true, // FIXED: Include counters to match schema
      },
    });

    if (!existingUser) {
      console.error("❌ User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log(
      `📋 Found existing user with profile: ${!!existingUser.profile}`
    );

    // --- 4. Use transaction for consistency ---
    const result = await prisma.$transaction(async (prisma) => {
      // --- 4.1 Handle Location Updates ---
      let locationId = existingUser.profile?.locationId;

      if (data.latitude && data.longitude) {
        if (locationId) {
          // Update existing location
          console.log("📍 Updating existing location");
          await prisma.location.update({
            where: { id: locationId },
            data: {
              state: data.state || existingUser.state || "",
              city: data.city || existingUser.city || "",
              country: data.country || existingUser.country || "",
              lat: data.latitude,
              lon: data.longitude,
            },
          });
          console.log("✅ Location updated");
        } else {
          // Create new location
          console.log("📍 Creating new location");
          const location = await prisma.location.create({
            data: {
              state: data.state || existingUser.state || "",
              city: data.city || existingUser.city || "",
              country: data.country || existingUser.country || "",
              lat: data.latitude,
              lon: data.longitude,
            },
          });
          locationId = location.id;
          console.log("✅ New location created:", location.id);
        }
      }

      // --- 4.2 Prepare user update data (only include defined fields) ---
      const userUpdateData: any = {};

      if (data.primarySport !== undefined)
        userUpdateData.PrimarySport = data.primarySport;
      if (data.username !== undefined) userUpdateData.username = data.username;
      if (data.firstName !== undefined)
        userUpdateData.firstName = data.firstName;
      if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
      if (data.dateOfBirth !== undefined)
        userUpdateData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender !== undefined) userUpdateData.gender = data.gender; // FIXED: Now properly handles MALE/FEMALE enum
      if (data.country !== undefined) userUpdateData.country = data.country;
      if (data.state !== undefined) userUpdateData.state = data.state;
      if (data.city !== undefined) userUpdateData.city = data.city;
      if (data.profileImageUrl !== undefined)
        userUpdateData.profileImageUrl = data.profileImageUrl;

      // Update User record only if there are changes
      let updatedUser = existingUser;
      if (Object.keys(userUpdateData).length > 0) {
        console.log(
          "👤 Updating user record with:",
          Object.keys(userUpdateData)
        );
        updatedUser = await prisma.user.update({
          where: { clerkId: user.id },
          data: userUpdateData,
        });
        console.log("✅ User updated");
      }

      // --- 4.3 Handle Profile Updates ---
      let updatedProfile;
      const profileUpdateData: any = {};

      if (data.bio !== undefined) profileUpdateData.bio = data.bio;
      if (data.profileImageUrl !== undefined)
        profileUpdateData.avatarUrl = data.profileImageUrl;
      if (locationId !== undefined) profileUpdateData.locationId = locationId;

      if (existingUser.profile) {
        // Update existing profile
        if (Object.keys(profileUpdateData).length > 0) {
          console.log(
            "📋 Updating existing profile with:",
            Object.keys(profileUpdateData)
          );
          updatedProfile = await prisma.profile.update({
            where: { userId: existingUser.id },
            data: profileUpdateData,
          });
          console.log("✅ Profile updated");
        } else {
          updatedProfile = existingUser.profile;
        }
      } else {
        // Create profile if it doesn't exist
        console.log("📋 Creating new profile");
        updatedProfile = await prisma.profile.create({
          data: {
            userId: existingUser.id,
            bio: data.bio || null,
            avatarUrl: data.profileImageUrl || null,
            locationId: locationId,
          },
        });
        console.log("✅ New profile created:", updatedProfile.id);
      }

      // --- 4.4 Ensure UserCounters exist ---
      await prisma.userCounters.upsert({
        where: { userId: existingUser.id },
        update: {},
        create: {
          userId: existingUser.id,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        },
      });

      return { user: updatedUser, profile: updatedProfile };
    });

    console.log("--- ✅ TRANSACTION COMPLETED SUCCESSFULLY ---");

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.user.id,
          profileId: result.profile.id,
          message: "Profile updated successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("--- ❌ PROFILE UPDATE FAILURE ---", error);

    // FIXED: Enhanced error handling
    if (error instanceof Error) {
      // Handle Prisma unique constraint violations
      if (error.message.includes("Unique constraint")) {
        const field = error.message.includes("username") ? "username" : "email";
        return NextResponse.json(
          {
            success: false,
            error: `This ${field} is already taken. Please choose another.`,
            field,
          },
          { status: 409 }
        );
      }

      // Handle foreign key constraint violations
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { success: false, error: "Invalid reference provided" },
          { status: 400 }
        );
      }

      // Handle enum constraint violations
      if (error.message.includes("enum")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid enum value provided",
            details: error.message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// BONUS: Add a DELETE endpoint for profile deletion
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Find user with profile
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: { profile: true },
      });

      if (!existingUser || !existingUser.profile) {
        throw new Error("Profile not found");
      }

      // Delete profile (this will cascade delete location if no other profiles use it)
      await prisma.profile.delete({
        where: { userId: existingUser.id },
      });

      return { userId: existingUser.id };
    });

    console.log("✅ Profile deleted successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.userId,
          message: "Profile deleted successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete profile",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

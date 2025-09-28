import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// FIXED: Server-side validation schema matching your wizard data with proper enum values
const profileCreateSchema = z.object({
  // Location data
  city: z.string().min(1, "City is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(130),
  firstName: z.string().min(1, "First name is required").max(150),
  lastName: z.string().min(1, "Last name is required").max(50),

  // Personal details
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  }, "You must be between 13 and 120 years old"),

  // FIXED: Gender enum values to match your Prisma schema exactly
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500),

  // Cloudinary image data
  profileImageUrl: z.string().url().optional(),
  profileImagePublicId: z.string().optional(),

  // Sport information
  primarySport: z.string().min(1, "Primary sport is required"),

  // Geolocation data (optional)
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationAccuracy: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  console.log("--- 1. PROFILE CREATE REQUEST RECEIVED ---");

  try {
    // --- 1.1 Authenticate User ---
    const user = await currentUser();

    if (!user) {
      console.error("❌ No authenticated user found");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // --- 1.2 Parse and Validate Request Body ---
    const body = await req.json();
    console.log("📝 Request body received:", Object.keys(body));

    const validation = profileCreateSchema.safeParse(body);
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

    // --- 1.3 Check if User Exists in Database ---
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { profile: true },
    });

    if (!existingUser) {
      console.error("❌ User not found in database");
      return NextResponse.json(
        {
          success: false,
          error: "User not found. Please try logging out and back in.",
        },
        { status: 404 }
      );
    }

    // --- 1.4 Check if Profile Already Exists ---
    if (existingUser.profile) {
      console.warn("⚠️ Profile already exists for user");
      return NextResponse.json(
        {
          success: false,
          error: "Profile already exists. Use update instead.",
        },
        { status: 409 }
      );
    }

    // --- 2. DATABASE OPERATIONS ---
    console.log("--- 2. STARTING DATABASE OPERATIONS ---");

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // --- 2.1 Create Location Record (if geolocation provided) ---
      let locationId: string | undefined;

      if (data.latitude && data.longitude) {
        console.log("📍 Creating location record");
        const location = await prisma.location.create({
          data: {
            state: data.state,
            city: data.city,
            country: data.country,
            lat: data.latitude,
            lon: data.longitude,
          },
        });
        locationId = location.id;
        console.log("✅ Location created:", location.id);
      }

      // --- 2.2 Update User Record ---
      console.log("👤 Updating user record");
      const updatedUser = await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          PrimarySport: data.primarySport,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender, // FIXED: Now properly handles MALE/FEMALE enum
          country: data.country,
          state: data.state,
          city: data.city,
          // Update profile image if provided from Cloudinary
          profileImageUrl: data.profileImageUrl || existingUser.profileImageUrl,
        },
      });
      console.log("✅ User updated");

      // --- 2.3 Create Profile Record ---
      console.log("📋 Creating profile record");
      const profile = await prisma.profile.create({
        data: {
          userId: existingUser.id,
          bio: data.bio,
          avatarUrl: data.profileImageUrl,
          locationId: locationId,
        },
      });
      console.log("✅ Profile created:", profile.id);

      // --- 2.4 Initialize User Counters (if not exists) ---
      console.log("📊 Ensuring user counters exist");
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
      console.log("✅ User counters initialized");

      return { user: updatedUser, profile, locationId };
    });

    console.log("--- 3. TRANSACTION COMPLETED SUCCESSFULLY ---");

    // --- 3. Return Success Response ---
    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.user.id,
          profileId: result.profile.id,
          locationId: result.locationId,
          message: "Profile created successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("--- 3. DATABASE FAILURE ---", error);

    // FIXED: Enhanced error handling with specific error types
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
          { success: false, error: "Invalid user reference" },
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
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Enhanced: GET endpoint to check if profile exists
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        profile: {
          include: {
            location: true,
          },
        },
        counters: true, // FIXED: Added counters to match your schema
      },
    });

    if (!userWithProfile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hasProfile: !!userWithProfile.profile,
        user: {
          ...userWithProfile,
          // FIXED: Convert gender back to frontend format if needed
          gender: userWithProfile.gender || null,
        },
      },
    });
  } catch (error) {
    console.error("Profile check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

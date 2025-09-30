// lib/api/services/profile-service.ts
import prisma from "@/lib/prisma";
import {
  ProfileCreationError,
  UserNotFoundError,
  NotFoundError,
} from "@/lib/api/errors/api-errors";
import type {
  ProfileCreateData,
  ProfileUpdateData,
  ProfileCreationResult,
  ProfileUpdateResult,
  CurrentProfileData,
} from "@/lib/api/types/profile-types";
import { formatCurrentProfileData } from "@/lib/api/utils/profile-formatters";

/**
 * =============================================================================
 * PROFILE SERVICE LAYER
 * =============================================================================
 */

/**
 * Main profile creation service
 */
const createProfileService = {
  /**
   * Creates a complete user profile
   */
  async createProfile(
    clerkId: string,
    data: ProfileCreateData
  ): Promise<ProfileCreationResult> {
    console.log("🔄 Starting profile creation service");

    // Check if user exists
    const existingUser = await this.getUserWithProfile(clerkId);

    if (existingUser.profile) {
      throw new ProfileCreationError(
        "Profile already exists. Use update instead.",
        409
      );
    }

    // Execute profile creation transaction
    const result = await this.executeProfileTransaction(existingUser, data);

    console.log("✅ Profile creation service completed");
    return result;
  },

  /**
   * Checks if user exists and has profile
   */
  async checkProfileExists(clerkId: string) {
    const userWithProfile = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        profile: {
          include: { location: true },
        },
        counters: true,
      },
    });

    if (!userWithProfile) {
      throw new UserNotFoundError();
    }

    return {
      hasProfile: !!userWithProfile.profile,
      user: {
        ...userWithProfile,
        gender: userWithProfile.gender || null,
      },
    };
  },

  /**
   * Gets user with profile data
   */
  async getUserWithProfile(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  },

  /**
   * Executes profile creation transaction
   */
  async executeProfileTransaction(
    user: any,
    data: ProfileCreateData
  ): Promise<ProfileCreationResult> {
    return await prisma.$transaction(async (tx) => {
      // Create location if coordinates provided
      let locationId: string | undefined;

      if (data.latitude && data.longitude) {
        console.log("📍 Creating location record");
        const location = await tx.location.create({
          data: {
            state: data.state,
            city: data.city,
            country: data.country,
            lat: data.latitude,
            lon: data.longitude,
          },
        });
        locationId = location.id;
      }

      // Update user record
      console.log("👤 Updating user record");
      const updatedUser = await tx.user.update({
        where: { clerkId: user.clerkId },
        data: {
          PrimarySport: data.primarySport,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          country: data.country,
          state: data.state,
          city: data.city,
          profileImageUrl: data.profileImageUrl || user.profileImageUrl,
        },
      });

      // Create profile record
      console.log("📋 Creating profile record");
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          bio: data.bio,
          avatarUrl: data.profileImageUrl,
          locationId,
        },
      });

      // Initialize user counters
      console.log("📊 Initializing user counters");
      await tx.userCounters.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        },
      });

      return {
        userId: updatedUser.id,
        profileId: profile.id,
        locationId,
      };
    });
  },
};
/**
 * Profile update service
 */
const updateProfileService = async (
  clerkId: string,
  data: ProfileUpdateData
): Promise<ProfileUpdateResult> => {
  console.log("🔄 Starting profile update service");

  // Get existing user with profile
  const existingUser = await getExistingUserWithProfile(clerkId);

  // Execute update transaction
  const result = await executeUpdateTransaction(existingUser, data);

  console.log("✅ Profile update service completed");
  return result;
};

/**
 * Profile deletion service
 */
const deleteProfileService = async (clerkId: string) => {
  console.log("🗑️ Starting profile deletion service");

  const result = await prisma.$transaction(async (tx) => {
    // Find user with profile
    const existingUser = await tx.user.findUnique({
      where: { clerkId },
      include: { profile: true },
    });

    if (!existingUser || !existingUser.profile) {
      throw new NotFoundError("Profile not found");
    }

    // Delete profile (cascades to location if unused)
    await tx.profile.delete({
      where: { userId: existingUser.id },
    });

    return { userId: existingUser.id };
  });

  console.log("✅ Profile deletion service completed");
  return result;
};

const getCurrentProfileService = async (
  clerkId: string
): Promise<CurrentProfileData> => {
  console.log("📋 Starting current profile service");

  // Get user data with all relationships
  const userData = await getUserWithFullProfile(clerkId);

  // Initialize counters if missing
  await ensureUserCountersExist(userData);

  // Format profile data for response
  const profileData = formatCurrentProfileData(userData);

  console.log("✅ Current profile service completed");
  return profileData;
};

/**
 * Helper: Get user with complete profile data
 */
const getUserWithFullProfile = async (clerkId: string) => {
  const userData = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      profile: {
        include: {
          location: true,
        },
      },
      counters: true,
      _count: {
        select: {
          followers: true,
          following: true,
          // posts: true, // Uncomment when Post model is ready
        },
      },
    },
  });

  if (!userData) {
    throw new UserNotFoundError();
  }

  return userData;
};

/**
 * Helper: Ensure user counters exist
 */
const ensureUserCountersExist = async (userData: any) => {
  if (!userData.counters) {
    console.log("🔢 Creating initial user counters...");
    await prisma.userCounters.create({
      data: {
        userId: userData.id,
        followersCount: userData._count.followers,
        followingCount: userData._count.following,
        postsCount: 0,
      },
    });
  }
};

/**
 * Helper: Get existing user with profile and location
 */
const getExistingUserWithProfile = async (clerkId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      profile: {
        include: { location: true },
      },
      counters: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  console.log(`📋 Found existing user with profile: ${!!user.profile}`);
  return user;
};

/**
 * Helper: Execute profile update transaction
 */
const executeUpdateTransaction = async (
  user: any,
  data: ProfileUpdateData
): Promise<ProfileUpdateResult> => {
  return await prisma.$transaction(async (tx) => {
    // Handle Location Updates
    let locationId = user.profile?.locationId;

    if (data.latitude && data.longitude) {
      if (locationId) {
        // Update existing location
        console.log("📍 Updating existing location");
        await tx.location.update({
          where: { id: locationId },
          data: {
            state: data.state || user.state || "",
            city: data.city || user.city || "",
            country: data.country || user.country || "",
            lat: data.latitude,
            lon: data.longitude,
          },
        });
      } else {
        // Create new location
        console.log("📍 Creating new location");
        const location = await tx.location.create({
          data: {
            state: data.state || user.state || "",
            city: data.city || user.city || "",
            country: data.country || user.country || "",
            lat: data.latitude,
            lon: data.longitude,
          },
        });
        locationId = location.id;
      }
    }

    // Prepare user update data (only defined fields)
    const userUpdateData = buildUserUpdateData(data);

    // Update User record if there are changes
    let updatedUser = user;
    if (Object.keys(userUpdateData).length > 0) {
      console.log("👤 Updating user record with:", Object.keys(userUpdateData));
      updatedUser = await tx.user.update({
        where: { clerkId: user.clerkId },
        data: userUpdateData,
      });
    }

    // Handle Profile Updates
    let updatedProfile;
    const profileUpdateData = buildProfileUpdateData(data, locationId);

    if (user.profile) {
      // Update existing profile
      if (Object.keys(profileUpdateData).length > 0) {
        console.log(
          "📋 Updating existing profile with:",
          Object.keys(profileUpdateData)
        );
        updatedProfile = await tx.profile.update({
          where: { userId: user.id },
          data: profileUpdateData,
        });
      } else {
        updatedProfile = user.profile;
      }
    } else {
      // Create profile if it doesn't exist
      console.log("📋 Creating new profile");
      updatedProfile = await tx.profile.create({
        data: {
          userId: user.id,
          bio: data.bio || null,
          avatarUrl: data.profileImageUrl || null,
          locationId,
        },
      });
    }

    // Ensure UserCounters exist
    await tx.userCounters.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      },
    });

    return {
      userId: updatedUser.id,
      profileId: updatedProfile.id,
    };
  });
};

const buildUserUpdateData = (data: ProfileUpdateData) => {
  const updateData: any = {};

  // Field mappings with proper type handling
  if (data.primarySport !== undefined)
    updateData.PrimarySport = data.primarySport;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.profileImageUrl !== undefined)
    updateData.profileImageUrl = data.profileImageUrl;

  // Special handling for dateOfBirth - convert string to Date
  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = new Date(data.dateOfBirth);
  }

  return updateData;
};

/**
 * Helper: Build profile update data object
 */
const buildProfileUpdateData = (
  data: ProfileUpdateData,
  locationId?: string
) => {
  const updateData: any = {};

  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.profileImageUrl !== undefined)
    updateData.avatarUrl = data.profileImageUrl;
  if (locationId !== undefined) updateData.locationId = locationId;

  return updateData;
};

// Export individual services
export {
  createProfileService,
  updateProfileService,
  deleteProfileService,
  getCurrentProfileService,
};

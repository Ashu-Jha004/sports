-- CreateEnum
CREATE TYPE "public"."Rank" AS ENUM ('KING', 'PAWN', 'ROOK', 'KNIGHT', 'BISHOP', 'QUEEN');

-- CreateEnum
CREATE TYPE "public"."Class" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ATHLETE', 'BUSINESS');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER DEFAULT 1,
    "PrimarySport" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'ATHLETE',
    "dateOfBirth" TIMESTAMP(3),
    "Rank" "public"."Rank" DEFAULT 'PAWN',
    "Class" "public"."Class" DEFAULT 'E',
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_username_idx" ON "public"."User"("createdAt", "username");

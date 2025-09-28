import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ensure this environment variable is set
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

export async function POST(req: Request) {
  console.log("--- 1. WEBHOOK REQUEST RECEIVED ---");

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing!");
    return new Response("Webhook Secret is missing", { status: 500 });
  }

  // --- 1.1 Get Headers and Body ---
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("SVIX HEADERS MISSING");
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const body = await req.text();

  // --- 1.2 Verify Signature ---
  console.log("Headers and Body ready. Attempting Svix verification...");
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log("Verification SUCCESSFUL.");
  } catch (err) {
    console.error("Verification FAILED:", err);
    return new Response("Error: Invalid signature or body parsing issue.", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const data = evt.data as UserJSON;

  console.log(`--- 2. EVENT TYPE: ${eventType} (Clerk ID: ${data.id}) ---`);

  if (!data.id) {
    return new Response("Error: User ID not found in payload", { status: 400 });
  }

  // --- 2.1 Robust Email Extraction and Validation ---
  let primaryEmail = data.email_addresses.find(
    (email) => email.id === data.primary_email_address_id
  )?.email_address;
  // Fallback
  if (!primaryEmail && data.email_addresses.length > 0) {
    primaryEmail = data.email_addresses[0].email_address;
    console.warn(
      `WARN: Primary email ID missing. Falling back to first email: ${primaryEmail}`
    );
  }

  // CRITICAL: Your Prisma model 'email' is REQUIRED (String @unique).
  if (
    !primaryEmail &&
    (eventType === "user.created" || eventType === "user.updated")
  ) {
    console.error(
      `FATAL: Required 'email' not found for user ${data.id}. Aborting sync.`
    );
    return new Response(
      "Error: Required primary email not found in Clerk payload.",
      { status: 400 }
    );
  }

  // --- 2.2 Prepare User Data (for upsert events) ---
  // Prioritize Clerk's username, fallback to first_name

  const userData = {
    clerkId: data.id,
    // Cast is safe due to the critical check above
    email: primaryEmail as string,
    profileImageUrl: data.image_url,
  };

  // --- 3. Handle Events and Database Sync ---
  try {
    switch (eventType) {
      case "user.created":
      case "user.updated": {
        console.log(`Attempting Prisma upsert for Clerk ID: ${data.id}`);

        // Upsert data using clerkId as the unique identifier for the lookup
        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: userData,
          create: userData,
        });

        console.log(
          `--- 3. DATABASE SUCCESS: User ${data.id} synced with email: ${primaryEmail}. ---`
        );
        break;
      }

      case "user.deleted": {
        console.log(`Attempting Prisma delete for Clerk ID: ${data.id}`);

        // Delete the user record using the unique clerkId
        await prisma.user.delete({
          where: { clerkId: data.id },
        });

        console.log(`--- 3. DATABASE SUCCESS: User ${data.id} deleted. ---`);
        break;
      }

      default:
        console.log(`Webhook event received: ${eventType} (Ignored)`);
        break;
    }

    // Always return 200 OK after successful processing/verification
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // This catches database connection issues or Prisma errors (e.g., unique constraint violation)
    console.error(`--- 3. DATABASE FAILURE for event ${eventType}:`, error);

    // Return a 500 error to signal Clerk to retry later
    return new Response("Internal Server Error (Database failed)", {
      status: 500,
    });
  }
}

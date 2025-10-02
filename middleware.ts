// =============================================================================
// SIMPLIFIED MIDDLEWARE - NO DATABASE CALLS
// =============================================================================

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// =============================================================================
// ROUTE MATCHERS
// =============================================================================

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/unauthorized",
  "/error",
  "/debug-auth",
]);

const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

// =============================================================================
// SIMPLIFIED CLERK MIDDLEWARE - JUST AUTH, NO DB CALLS
// =============================================================================

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  console.log(`🔍 Processing route: ${pathname}`);

  // For public routes, just continue
  if (isPublicRoute(req)) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  try {
    // For non-public routes, ensure authentication
    const authObject = await auth();
    console.log(`🔍 Auth result:`, {
      userId: authObject.userId,
      sessionId: authObject.sessionId,
      authenticated: !!authObject.userId,
    });

    // Protect non-public routes
    await auth.protect();

    // For admin routes, just ensure user is authenticated
    // The actual admin check will happen in the route handler
    if (isAdminRoute(req) || isAdminApiRoute(req)) {
      console.log(`🛡️ Admin route detected: ${pathname}`);

      if (!authObject.userId) {
        console.log(`❌ No userId found, redirecting to sign-in`);
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Add user info to headers for the route handler to use
      const response = NextResponse.next();
      response.headers.set("x-clerk-user-id", authObject.userId);
      response.headers.set("x-clerk-session-id", authObject.sessionId || "");

      console.log(
        `✅ Authenticated user ${authObject.userId} accessing admin route`
      );
      return response;
    }

    // Allow other authenticated routes to proceed
    return NextResponse.next();
  } catch (error) {
    console.error(`❌ Middleware error for ${pathname}:`, error);

    // If it's an admin route and auth failed, redirect to sign-in
    if (isAdminRoute(req) || isAdminApiRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

// =============================================================================
// MIDDLEWARE CONFIG
// =============================================================================

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isUserRoute = createRouteMatcher(["/user(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, orgRole } = await auth();

    // Protect admin routes
    if (isAdminRoute(req)) {
        await auth.protect();

        // If user is not an admin, redirect to user dashboard
        if (orgRole !== "org:admin") {
            const userExplorerUrl = new URL("/user/explorer", req.url);
            return NextResponse.redirect(userExplorerUrl);
        }
    }

    // Protect user routes (members and admins)
    if (isUserRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};


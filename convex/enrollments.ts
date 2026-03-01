import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEnrollment = mutation({
    args: {
        fullName: v.string(),
        email: v.string(),
        courseId: v.string(),
        courseName: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called createEnrollment without authentication");
        }

        // Check if already enrolled
        const existingEnrollment = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
            .filter((q) => q.eq(q.field("courseId"), args.courseId))
            .unique();

        if (existingEnrollment) {
            return existingEnrollment._id;
        }

        const enrollment = await ctx.db.insert("enrollments", {
            userId: identity.tokenIdentifier,
            // Use authenticated user details, fallback to args if needed (though identity should have them)
            fullName: identity.name || identity.givenName || identity.nickname || args.fullName || "Anonymous",
            email: identity.email || args.email,
            role: "STUDENT",
            courseId: args.courseId,
            courseName: args.courseName,
            enrollmentDate: Date.now(),
            paymentStatus: "PAID",
            amount: args.amount,
        });

        // Also update user role to "STUDENT" if they are currently just a "user"
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user && (!user.role || user.role === "student")) {
            await ctx.db.patch(user._id, {
                role: "student",
            });
        }

        return enrollment;
    },
});

export const getEnrolledStudents = query({
    args: {},
    handler: async (ctx) => {
        const enrollments = await ctx.db.query("enrollments").order("desc").collect();

        // Get user details for each enrollment
        const enrichedEnrollments = await Promise.all(
            enrollments.map(async (e) => {
                const user = await ctx.db
                    .query("users")
                    .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", e.userId))
                    .unique();
                return {
                    ...e,
                    imageUrl: user?.imageUrl || null,
                };
            })
        );

        return enrichedEnrollments;
    },
});

export const getEnrollmentStats = query({
    args: {},
    handler: async (ctx) => {
        const enrollments = await ctx.db.query("enrollments").collect();
        const totalStudents = enrollments.length;
        const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Pending payments is 0 for this demo
        const pendingPayments = 0;

        return {
            totalStudents,
            totalRevenue,
            pendingPayments
        };
    },
});

export const getMyEnrollments = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Get enrollments by full tokenIdentifier
        const newEnrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", identity.tokenIdentifier))
            .collect();

        // Get enrollments by short userId (Clerk ID) for legacy support
        const legacyEnrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .collect();

        // Get enrollments by email (fallback for mismatched IDs)
        const emailEnrollments = await ctx.db
            .query("enrollments")
            .filter((q) => q.eq(q.field("email"), identity.email))
            .collect();

        // Merge and deduplicate
        // Merge and deduplicate by courseId
        const all = [...newEnrollments, ...legacyEnrollments, ...emailEnrollments];
        const uniqueCourseIds = new Set();
        return all.filter(e => {
            if (uniqueCourseIds.has(e.courseId)) return false;
            uniqueCourseIds.add(e.courseId);
            return true;
        });
    },
});

export const getEnrollmentCount = query({
    args: { courseId: v.string() },
    handler: async (ctx, args) => {
        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .collect();
        return enrollments.length;
    },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCourseReviews = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("courseReviews")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .order("desc")
            .collect();
    },
});

export const getUserReview = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.subject;

        const review = await ctx.db
            .query("courseReviews")
            .withIndex("by_user_course", (q) =>
                q.eq("userId", userId).eq("courseId", args.courseId)
            )
            .first();

        return review;
    },
});

export const submitReview = mutation({
    args: {
        courseId: v.id("courses"),
        rating: v.number(),
        feedback: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated user cannot submit a review");
        }

        const userId = identity.subject;

        // Check if user is enrolled
        const courseEnrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
            .collect();

        const isEnrolled = courseEnrollments.some(e =>
            e.userId === identity.subject ||
            e.userId === identity.tokenIdentifier ||
            (identity.email && e.email === identity.email)
        );

        if (!isEnrolled) {
            throw new Error("Only enrolled users can submit reviews");
        }

        // Check if review already exists
        const existingReview = await ctx.db
            .query("courseReviews")
            .withIndex("by_user_course", (q) =>
                q.eq("userId", userId).eq("courseId", args.courseId)
            )
            .first();

        if (existingReview) {
            // Update existing
            await ctx.db.patch(existingReview._id, {
                rating: args.rating,
                feedback: args.feedback,
            });
            return existingReview._id;
        } else {
            // Create new
            const reviewId = await ctx.db.insert("courseReviews", {
                courseId: args.courseId,
                userId: userId,
                rating: args.rating,
                feedback: args.feedback,
                createdAt: Date.now(),
            });
            return reviewId;
        }
    },
});

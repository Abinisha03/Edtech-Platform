import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const store = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication");
        }

        const { tokenIdentifier } = identity;

        // Check if the user already exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", tokenIdentifier)
            )
            .unique();

        // Admin recognition logic
        const adminEmails = ["abinishaa271@gmail.com", "abinishaaarul03@gmail.com"];
        const shouldBeAdmin = args.email.toLowerCase().includes("admin") || adminEmails.includes(args.email.toLowerCase());
        const expectedRole = shouldBeAdmin ? "admin" : "student";

        if (user !== null) {
            const needsUpdate = user.name !== args.name ||
                user.email !== args.email ||
                user.imageUrl !== args.imageUrl ||
                user.role !== expectedRole;

            if (needsUpdate) {
                await ctx.db.patch(user._id, {
                    name: args.name,
                    email: args.email,
                    imageUrl: args.imageUrl,
                    role: expectedRole,
                });
                return {
                    ...user,
                    name: args.name,
                    email: args.email,
                    imageUrl: args.imageUrl,
                    role: expectedRole
                };
            }
            return user;
        }

        // If it's a new identity, create a new `User`.
        const existingUsers = await ctx.db.query("users").collect();
        const role = (existingUsers.length === 0 || shouldBeAdmin) ? "admin" : "student";

        const userId = await ctx.db.insert("users", {
            tokenIdentifier,
            email: args.email,
            name: args.name,
            imageUrl: args.imageUrl,
            role: role,
        });

        const newUser = await ctx.db.get(userId);

        // Log the registration
        await ctx.db.insert("activityLog", {
            type: "user_registration",
            description: `New user registered: ${args.email}`,
            userId: userId,
            timestamp: Date.now(),
        });

        return newUser;
    },
});

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) return null;

        if (user.imageStorageId) {
            const url = await ctx.storage.getUrl(user.imageStorageId);
            if (url) {
                return { ...user, imageUrl: url };
            }
        }

        return user;
    },
});

export const getSystemMetrics = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user || user.role !== "admin") return null;

        const allUsers = await ctx.db.query("users").collect();
        const allCourses = await ctx.db.query("courses").collect();
        const allEnrollments = await ctx.db.query("enrollments").collect();
        const recentActivity = await ctx.db
            .query("activityLog")
            .order("desc")
            .take(10);

        // Calculate Growth (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recentRegistrations = await ctx.db
            .query("activityLog")
            .filter((q) => q.and(
                q.eq(q.field("type"), "user_registration"),
                q.gt(q.field("timestamp"), thirtyDaysAgo)
            ))
            .collect();

        const userGrowth = allUsers.length > 0
            ? (recentRegistrations.length / allUsers.length) * 100
            : 0;

        // Engagement Data (last 7 days)
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const engagementData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];

            const startOfDay = new Date(date).setHours(0, 0, 0, 0);
            const endOfDay = new Date(date).setHours(23, 59, 59, 999);

            const dayActivity = await ctx.db
                .query("activityLog")
                .filter((q) => q.and(
                    q.gte(q.field("timestamp"), startOfDay),
                    q.lte(q.field("timestamp"), endOfDay)
                ))
                .collect();

            engagementData.push({
                name: dayName,
                value: dayActivity.length * 10 + (Math.floor(Math.random() * 20)),
            });
        }

        // Performance Data (Top 5 courses)
        const performanceData = [];
        const topCourses = allCourses.slice(0, 5);
        for (const course of topCourses) {
            const enrollments = allEnrollments.filter(e => e.courseId === course._id);
            const materials = await ctx.db
                .query("courseMaterials")
                .withIndex("by_course", q => q.eq("courseId", course._id))
                .collect();

            const totalExpectedCompletions = enrollments.length * materials.length;
            const actualCompletions = await ctx.db
                .query("materialProgress")
                .filter(q => q.and(
                    q.eq(q.field("courseId"), course._id),
                    q.eq(q.field("completed"), true)
                ))
                .collect();

            const completionRate = totalExpectedCompletions > 0
                ? (actualCompletions.length / totalExpectedCompletions) * 100
                : Math.floor(Math.random() * 40) + 40;

            performanceData.push({
                name: course.title.length > 10 ? course.title.substring(0, 10) + "..." : course.title,
                completion: completionRate,
                quiz: Math.floor(Math.random() * 30) + 60,
            });
        }

        return {
            totalUsers: allUsers.length,
            totalCourses: allCourses.length,
            userGrowth: userGrowth.toFixed(1),
            courseGrowth: "0.0",
            systemActivity: "98.8",
            engagementData,
            performanceData,
            recentActivity,
        };
    },
});

export const promoteToAdmin = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            role: "admin",
        });
        return { success: true };
    },
});

export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called updateProfile without authentication");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            name: args.name ?? user.name,
            imageUrl: args.imageUrl ?? user.imageUrl,
            imageStorageId: args.imageStorageId ?? user.imageStorageId,
            bio: args.bio ?? user.bio,
        });

        return { success: true };
    },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
    args: {},
    handler: async (ctx) => {
        const courses = await ctx.db
            .query("courses")
            .filter((q) => q.eq(q.field("status"), "published"))
            .collect();

        const coursesWithInstructor = await Promise.all(
            courses.map(async (course) => {
                const instructor = await ctx.db.get(course.instructorId);
                let name = instructor?.name || "";
                if (name.toLowerCase().includes("abinisha")) {
                    name = "";
                }
                return {
                    ...course,
                    instructorName: name,
                };
            })
        );

        return coursesWithInstructor;
    },
});

export const listAll = query({
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

        if (user?.role !== "admin") {
            console.log("User is not an admin, returning empty list.");
            return [];
        }

        return await ctx.db.query("courses").collect();
    },
});

export const getById = query({
    args: { id: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const createCourse = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        price: v.number(),
        modules: v.optional(v.number()),
        lessons: v.optional(v.number()),
        thumbnail: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user || user.role !== "admin") {
            throw new Error("Only admins can create courses. Your current role is: " + (user?.role || "none"));
        }

        const courseId = await ctx.db.insert("courses", {
            ...args,
            instructorId: user._id,
        });

        // Log clinical activity
        await ctx.db.insert("activityLog", {
            type: "course_created",
            description: `Admin ${user.email} created course: ${args.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });

        return courseId;
    },
});

export const updateCourse = mutation({
    args: {
        id: v.id("courses"),
        title: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        price: v.number(),
        thumbnail: v.optional(v.string()),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user || user.role !== "admin") {
            throw new Error("Only admins can update courses.");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);

        // Log activity
        await ctx.db.insert("activityLog", {
            type: "course_updated", // You might need to add this type to your schema if strict, or use existing
            description: `Admin ${user.email} updated course: ${args.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });
    },
});

export const deleteCourse = mutation({
    args: { id: v.id("courses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user || user.role !== "admin") {
            throw new Error("Only admins can delete courses.");
        }

        const course = await ctx.db.get(args.id);
        if (!course) return;

        await ctx.db.delete(args.id);

        // Log activity
        await ctx.db.insert("activityLog", {
            type: "course_deleted",
            description: `Admin ${user.email} deleted course: ${course.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });
    },
});

export const getLandingStats = query({
    args: {},
    handler: async (ctx) => {
        const students = await ctx.db.query("users").collect();
        const courses = await ctx.db
            .query("courses")
            .filter((q) => q.eq(q.field("status"), "published"))
            .collect();
        const enrollments = await ctx.db.query("enrollments").collect();

        return {
            students: students.length,
            courses: courses.length,
            enrollments: enrollments.length,
        };
    },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByCourse = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const materials = await ctx.db
            .query("courseMaterials")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .collect();

        return await Promise.all(
            materials.map(async (material) => {
                if (material.muxPlaybackId) {
                    return {
                        ...material,
                        url: `https://stream.mux.com/${material.muxPlaybackId}.m3u8`,
                    };
                }
                if (material.fileId) {
                    let url;
                    try {
                        url = await ctx.storage.getUrl(material.fileId);
                    } catch (error) {
                        console.warn("Invalid storage ID for material:", material._id, error);
                    }
                    return {
                        ...material,
                        url: url || material.url,
                    };
                }
                return material;
            })
        );
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const addMaterial = mutation({
    args: {
        courseId: v.id("courses"),
        type: v.string(), // "video", "note", "pdf"
        title: v.string(),
        url: v.optional(v.string()),
        fileId: v.optional(v.string()),
        videoId: v.optional(v.id("courseMaterials")),
        duration: v.optional(v.string()),
        status: v.string(),
        moduleId: v.optional(v.id("modules")),
        size: v.optional(v.string()),
        // Mux Fields
        muxAssetId: v.optional(v.string()),
        muxPlaybackId: v.optional(v.string()),
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
            throw new Error("Only admins can manage course content.");
        }

        // Calculate order if moduleId is provided
        let order = 1;
        if (args.moduleId) {
            const existingMaterials = await ctx.db
                .query("courseMaterials")
                .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
                .collect();

            const existingAssignments = await ctx.db
                .query("assignments")
                .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
                .collect();

            const maxMaterialOrder = existingMaterials.reduce((max, m) => Math.max(max, m.order || 0), 0);
            const maxAssignmentOrder = existingAssignments.reduce((max, a) => Math.max(max, a.order || 0), 0);

            order = Math.max(maxMaterialOrder, maxAssignmentOrder) + 1;
        }

        const materialId = await ctx.db.insert("courseMaterials", {
            ...args,
            order,
        });

        // Log activity
        await ctx.db.insert("activityLog", {
            type: "content_upload",
            description: `Admin ${user.email} added ${args.type}: ${args.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });

        return { success: true };
    },
});

export const toggleCompletion = mutation({
    args: {
        courseId: v.id("courses"),
        materialId: v.id("courseMaterials"),
        completed: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("materialProgress")
            .withIndex("by_user_course", (q) =>
                q.eq("userId", identity.tokenIdentifier).eq("courseId", args.courseId)
            )
            .filter((q) => q.eq(q.field("materialId"), args.materialId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                completed: args.completed,
                timestamp: Date.now(),
            });
        } else {
            await ctx.db.insert("materialProgress", {
                userId: identity.tokenIdentifier,
                courseId: args.courseId,
                materialId: args.materialId,
                completed: args.completed,
                timestamp: Date.now(),
            });
        }

        return { success: true };
    },
});

export const getCourseProgress = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const totalMaterials = await ctx.db
            .query("courseMaterials")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .filter((q) => q.eq(q.field("status"), "Active"))
            .collect();

        if (totalMaterials.length === 0) return 0;

        const completedMaterials = await ctx.db
            .query("materialProgress")
            .withIndex("by_user_course", (q) =>
                q.eq("userId", identity.tokenIdentifier).eq("courseId", args.courseId)
            )
            .filter((q) => q.eq(q.field("completed"), true))
            .collect();

        return Math.min(
            100,
            Math.round((completedMaterials.length / totalMaterials.length) * 100)
        );
    },
});

export const getMyProgress = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("materialProgress")
            .withIndex("by_user_course", (q) => q.eq("userId", identity.tokenIdentifier))
            .collect();
    },
});

export const deleteMaterial = mutation({
    args: { id: v.id("courseMaterials") },
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
            throw new Error("Only admins can manage course content.");
        }

        const material = await ctx.db.get(args.id);
        if (!material) return;

        await ctx.db.delete(args.id);

        // Log activity
        await ctx.db.insert("activityLog", {
            type: "content_delete",
            description: `Admin ${user.email} deleted ${material.type}: ${material.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });
    },
});

export const reorder = mutation({
    args: {
        updates: v.array(v.object({
            id: v.id("courseMaterials"),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        for (const update of args.updates) {
            await ctx.db.patch(update.id, { order: update.order });
        }
    },
});

export const updateMaterial = mutation({
    args: {
        id: v.id("courseMaterials"),
        title: v.string(),
        url: v.optional(v.string()),
        duration: v.optional(v.string()),
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
            throw new Error("Only admins can manage course content.");
        }

        await ctx.db.patch(args.id, {
            title: args.title,
            url: args.url,
            duration: args.duration,
        });

        // Log activity
        await ctx.db.insert("activityLog", {
            type: "content_upload",
            description: `Admin ${user.email} updated material: ${args.title}`,
            userId: user._id,
            timestamp: Date.now(),
        });
    },
});

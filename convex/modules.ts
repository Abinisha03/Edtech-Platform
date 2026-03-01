import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getModules = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        const modules = await ctx.db
            .query("modules")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .collect();

        return modules.sort((a, b) => a.order - b.order);
    },
});

export const create = mutation({
    args: {
        courseId: v.id("courses"),
        title: v.string(),
        description: v.optional(v.string()),
        isPublished: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Get current max order
        const existingModules = await ctx.db
            .query("modules")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .collect();

        const maxOrder = existingModules.reduce((max, m) => Math.max(max, m.order), 0);

        const moduleId = await ctx.db.insert("modules", {
            courseId: args.courseId,
            title: args.title,
            description: args.description,
            isPublished: args.isPublished,
            order: existingModules.length === 0 ? 1 : maxOrder + 1,
        });

        return moduleId;
    },
});

export const update = mutation({
    args: {
        moduleId: v.id("modules"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { moduleId, ...updates } = args;
        await ctx.db.patch(moduleId, updates);
    },
});

export const requestDelete = mutation({
    args: { moduleId: v.id("modules") },
    handler: async (ctx, args) => {
        // In a real app, we might want to check for children or cascade delete.
        // For now, we'll just delete the module and let the frontend handle orphaned content/warnings if needed,
        // or we could unlink them here.
        // Ideally: content should be deleted or moved.

        // 1. Unlink materials
        const materials = await ctx.db
            .query("courseMaterials")
            .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
            .collect();

        for (const m of materials) {
            await ctx.db.patch(m._id, { moduleId: undefined });
        }

        // 2. Unlink assignments
        const assignments = await ctx.db
            .query("assignments")
            .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
            .collect();

        for (const a of assignments) {
            await ctx.db.patch(a._id, { moduleId: undefined });
        }

        await ctx.db.delete(args.moduleId);
    },
});

export const updateOrder = mutation({
    args: {
        updates: v.array(v.object({
            id: v.id("modules"),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        for (const update of args.updates) {
            await ctx.db.patch(update.id, { order: update.order });
        }
    },
});

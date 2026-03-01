import { query } from "./_generated/server";
import { v } from "convex/values";

export const listStudentActivity = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // Fetch general activities and student registrations
        // In a real app, you might filter by courses they are enrolled in
        return await ctx.db
            .query("activityLog")
            .order("desc")
            .take(15);
    },
});

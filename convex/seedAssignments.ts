
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = internalMutation({
    args: {},
    handler: async (ctx) => {
        // 1. Get or Create User (Instructor)
        let user = await ctx.db.query("users").first();
        if (!user) {
            user = await ctx.db.insert("users", {
                tokenIdentifier: "seed_admin",
                email: "admin@example.com",
                name: "Admin User",
                role: "admin",
            }).then(id => ctx.db.get(id));
        }
        if (!user) throw new Error("Failed to get user");

        // 2. Get or Create Course
        let course = await ctx.db.query("courses").first();
        if (!course) {
            const courseId = await ctx.db.insert("courses", {
                title: "Computer Science 101",
                description: "Intro to CS",
                price: 100,
                status: "published",
                instructorId: user._id,
            });
            course = await ctx.db.get(courseId);
        }
        if (!course) throw new Error("Failed to get course");

        // 3. Create Assignments
        await ctx.db.insert("assignments", {
            title: "Final Project: Web Architecture",
            courseId: course._id,
            type: "assignment",
            dueDate: Date.now() + 86400000 * 7, // 7 days from now
            status: "Active",
            description: "Build a web app",
        });

        await ctx.db.insert("assignments", {
            title: "Typography & Grid Systems",
            courseId: course._id,
            type: "assignment",
            dueDate: Date.now() + 86400000 * 3,
            status: "Active",
            description: "Design a layout",
        });

        // 4. Create Quiz
        await ctx.db.insert("assignments", {
            title: "React Hooks Basics",
            courseId: course._id,
            type: "quiz",
            dueDate: Date.now() + 86400000 * 5,
            status: "Active",
            description: "Test your knowledge",
        });

        console.log("Seeding completed!");
    },
});

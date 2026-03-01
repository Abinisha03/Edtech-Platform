import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getDashboardStats = query({
    // Fetch stats for the user dashboard
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const userId = identity.tokenIdentifier;

        // 1. Fetch Enrollments
        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        const totalCourses = enrollments.length;
        let completedCourses = 0;
        let totalLessonsCompleted = 0;
        let totalQuizScore = 0;
        let quizCount = 0;

        const courseProgressDetails = [];

        // 2. Calculate Progress per Course
        const processedCourseIds = new Set<string>();
        for (const enrollment of enrollments) {
            const courseId = enrollment.courseId as Id<"courses">;

            // Prevent duplicate courses in the list
            if (processedCourseIds.has(courseId)) {
                console.log("Skipping duplicate course:", courseId);
                continue;
            }
            processedCourseIds.add(courseId);

            // Fetch Course Details
            const course = await ctx.db.get(courseId);
            if (!course) continue;

            // Fetch Total Materials for Course
            const materials = await ctx.db
                .query("courseMaterials")
                .withIndex("by_course", (q) => q.eq("courseId", courseId))
                .collect();

            const totalMaterialsCount = materials.length;

            // Fetch Completed Materials for User in this Course
            const progressRecords = await ctx.db
                .query("materialProgress")
                .withIndex("by_user_course", (q) => q.eq("userId", userId).eq("courseId", courseId))
                .filter(q => q.eq(q.field("completed"), true))
                .collect();

            const completedCount = progressRecords.length;
            totalLessonsCompleted += completedCount;

            const progressPercentage = totalMaterialsCount > 0
                ? Math.round((completedCount / totalMaterialsCount) * 100)
                : 0;

            if (progressPercentage === 100) {
                completedCourses++;
            }

            courseProgressDetails.push({
                courseId: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                totalMaterials: totalMaterialsCount,
                completedMaterials: completedCount,
                progress: progressPercentage,
            });
        }

        // 3. Calculate Quiz/Assignment Averages
        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        for (const sub of submissions) {
            if (sub.grade !== undefined) {
                totalQuizScore += sub.grade;
                quizCount++;
            }
        }

        const averageGrade = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;

        return {
            stats: {
                totalCourses,
                completedCourses,
                totalLessonsCompleted,
                averageGrade,
                certificates: completedCourses, // Assuming 1 certificate per completed course
            },
            courses: courseProgressDetails,
            recentActivity: submissions.slice(0, 5).map(s => ({
                id: s._id,
                type: "submission",
                date: s.submittedAt,
                grade: s.grade
            })) // Simplified activity log
        };
    },
});

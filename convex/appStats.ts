import { query } from "./_generated/server";
// stats query

export const getLandingStats = query({
    args: {},
    handler: async (ctx) => {
        // Count Students (Users)
        const students = await ctx.db
            .query("users")
            .filter((q) => q.neq(q.field("role"), "admin"))
            .collect();
        const studentCount = students.length;

        // Count Published Courses
        const courses = await ctx.db
            .query("courses")
            .filter((q) => q.eq(q.field("status"), "published"))
            .collect();
        const courseCount = courses.length;

        // Count Enrollments (as proxy for "Success Stories" or Active Learners)
        const enrollments = await ctx.db.query("enrollments").collect();
        const enrollmentCount = enrollments.length;

        return {
            students: studentCount,
            courses: courseCount,
            enrollments: enrollmentCount,
        };
    },
});

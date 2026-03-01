import { v } from "convex/values";
import { mutation, query, internalAction, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const submitAssignment = mutation({
    args: {
        assignmentId: v.id("assignments"),
        storageId: v.optional(v.id("_storage")), // made optional just in case text-only submission is allowed later
        comment: v.optional(v.string()),
        fileName: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        answers: v.optional(v.array(v.object({
            questionId: v.string(),
            selectedOption: v.number(),
        }))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) throw new Error("User not found");

        const assignment = await ctx.db.get(args.assignmentId);
        if (!assignment) throw new Error("Assignment not found");

        let grade = undefined;
        let status = "submitted";

        // Auto-grade if it's a quiz
        if (assignment.type === "quiz" && assignment.questions && args.answers) {
            let correctCount = 0;
            const totalQuestions = assignment.questions.length;

            args.answers.forEach(answer => {
                const question = assignment.questions?.find(q => q.id === answer.questionId);
                if (question && question.correctAnswer === answer.selectedOption) {
                    correctCount++;
                }
            });

            // Calculate score based on points or percentage
            const maxPoints = assignment.points || 100;
            grade = Math.round((correctCount / totalQuestions) * maxPoints);
            status = "graded";
        }

        // Check if submission already exists
        const existingSubmission = await ctx.db
            .query("submissions")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .unique();

        if (existingSubmission) {
            await ctx.db.patch(existingSubmission._id, {
                submittedAt: Date.now(),
                status: status,
                grade: grade,
                storageId: args.storageId,
                comment: args.comment,
                fileName: args.fileName,
                fileUrl: args.fileUrl,
                answers: args.answers,
            });
            return existingSubmission._id;
        } else {
            return await ctx.db.insert("submissions", {
                assignmentId: args.assignmentId,
                userId: user._id,
                submittedAt: Date.now(),
                status: status,
                grade: grade,
                storageId: args.storageId,
                comment: args.comment,
                fileName: args.fileName,
                fileUrl: args.fileUrl,
                answers: args.answers,
            });
        }
    },
});

export const getMySubmission = query({
    args: { assignmentId: v.id("assignments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) return null;

        const submission = await ctx.db
            .query("submissions")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .unique();

        if (!submission) return null;

        // If there's a file, get the URL
        let fileUrl = submission.fileUrl;
        if (submission.storageId && !fileUrl) {
            fileUrl = await ctx.storage.getUrl(submission.storageId) || undefined;
        }

        return {
            ...submission,
            fileUrl,
        };
    },
});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const assignments = await ctx.db.query("assignments").collect();

        // Fetch related course and submission data needed for the UI
        const assignmentsWithDetails = await Promise.all(
            assignments.map(async (assignment) => {
                const course = await ctx.db.get(assignment.courseId);

                // Count submissions for this assignment
                const submissions = await ctx.db
                    .query("submissions")
                    .withIndex("by_assignment", (q) => q.eq("assignmentId", assignment._id))
                    .collect();

                // Get total enrollments for the course (max submissions)
                const enrollments = await ctx.db
                    .query("enrollments")
                    .withIndex("by_courseId", (q) => q.eq("courseId", assignment.courseId))
                    .collect();

                return {
                    ...assignment,
                    course: course ? course.title : "Unknown Course",
                    submissions: submissions.length,
                    maxSubmissions: enrollments.length || 0, // Fallback if no enrollments
                };
            })
        );

        return assignmentsWithDetails;
    },
});


export const createAssignment = mutation({
    // Creating a new assignment
    args: {
        title: v.string(),
        courseId: v.id("courses"),
        type: v.string(), // "assignment" or "quiz"
        dueDate: v.number(),
        status: v.string(),
        description: v.optional(v.string()),
        points: v.optional(v.number()),
        files: v.optional(v.array(v.object({
            name: v.string(),
            url: v.optional(v.string()),
            storageId: v.optional(v.id("_storage")),
            type: v.string(),
            size: v.optional(v.string())
        }))),
        questions: v.optional(v.array(v.object({
            id: v.string(),
            text: v.string(),
            options: v.array(v.string()),
            correctAnswer: v.number(),
        }))),
        moduleId: v.optional(v.id("modules")),
    },
    handler: async (ctx, args) => {
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

        const assignmentId = await ctx.db.insert("assignments", {
            title: args.title,
            courseId: args.courseId,
            type: args.type,
            dueDate: args.dueDate,
            status: args.status,
            description: args.description,
            points: args.points,
            files: args.files,
            questions: args.questions,
            moduleId: args.moduleId,
            order,
        });
        return assignmentId;
    },
});

export const reorder = mutation({
    args: {
        updates: v.array(v.object({
            id: v.id("assignments"),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        for (const update of args.updates) {
            await ctx.db.patch(update.id, { order: update.order });
        }
    },
});

export const deleteAssignment = mutation({
    args: {
        id: v.id("assignments"),
    },
    handler: async (ctx, args) => {
        // Also delete associated submissions? 
        // For now just delete the assignment as per plan, cascading deletes can be handled if needed but not specified.
        // However, the UI alert says "All student submissions... will be permanently removed", so I should probably delete them or at least allow it.
        // Let's implement cascading delete for cleanup.

        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.id))
            .collect();

        for (const submission of submissions) {
            await ctx.db.delete(submission._id);
        }

        await ctx.db.delete(args.id);
    },
});

export const getById = query({
    args: { id: v.id("assignments") },
    handler: async (ctx, args) => {
        const assignment = await ctx.db.get(args.id);
        if (!assignment) return null;

        // Generate URLs for files with storageId
        if (assignment.files) {
            const filesWithUrls = await Promise.all(
                assignment.files.map(async (file) => {
                    if (file.storageId && !file.url) {
                        return {
                            ...file,
                            url: await ctx.storage.getUrl(file.storageId) || undefined
                        };
                    }
                    return file;
                })
            );
            return { ...assignment, files: filesWithUrls };
        }

        return assignment;
    },
});

export const update = mutation({
    args: {
        id: v.id("assignments"),
        title: v.string(),
        courseId: v.id("courses"),
        type: v.string(), // "assignment" or "quiz"
        dueDate: v.number(),
        status: v.string(),
        description: v.optional(v.string()),
        points: v.optional(v.number()),
        files: v.optional(v.array(v.object({
            name: v.string(),
            url: v.optional(v.string()),
            storageId: v.optional(v.id("_storage")),
            type: v.string(),
            size: v.optional(v.string())
        }))),
        questions: v.optional(v.array(v.object({
            id: v.string(),
            text: v.string(),
            options: v.array(v.string()),
            correctAnswer: v.number(),
        }))),
        moduleId: v.optional(v.id("modules")),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest);
    },
});

export const listByCourse = query({
    args: { courseId: v.id("courses") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("assignments")
            .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
            .collect();
    },
});

export const getSubmissionsByAssignment = query({
    args: { assignmentId: v.id("assignments") },
    handler: async (ctx, args) => {
        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_assignment", (q) => q.eq("assignmentId", args.assignmentId))
            .collect();

        const submissionsWithUserDetails = await Promise.all(
            submissions.map(async (submission) => {
                let userInfo = { name: "Unknown", email: "Unknown", imageUrl: "" };

                if (submission.userId) {
                    try {
                        const u = await ctx.db.get(submission.userId as Id<"users">);
                        if (u) userInfo = { name: u.name || "Unknown", email: u.email, imageUrl: u.imageUrl || "" };
                    } catch (e) {
                        // ignore
                    }
                }

                // Get file URL if available
                let fileUrl = submission.fileUrl;
                if (submission.storageId && !fileUrl) {
                    fileUrl = await ctx.storage.getUrl(submission.storageId) || undefined;
                }

                return {
                    ...submission,
                    user: userInfo,
                    fileUrl,
                };
            })
        );

        return submissionsWithUserDetails;
    },
});

export const getPendingAssignments = query({
    args: { userId: v.optional(v.string()) }, // Optional for now, can be strict if user is always auth'd
    handler: async (ctx, args) => {
        // This is a simplified implementation. 
        // In a real app, we would join with submissions to filter out completed ones.
        // For now, we'll just return all active assignments for enrolled courses.
        // NOTE: This could be optimized.

        if (!args.userId) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", args.userId!))
            .unique();

        if (!user) return [];

        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId!))
            .collect();

        const courseIds = enrollments.map(e => e.courseId);

        // Fetch all assignments for these courses
        const allAssignments = await ctx.db.query("assignments").collect();

        // Fetch user's submissions
        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        const submittedAssignmentIds = new Set(submissions.map(s => s.assignmentId));

        const userAssignments = allAssignments.filter(a =>
            courseIds.includes(a.courseId) &&
            (a.status === "Active" || a.status === "Published") &&
            !submittedAssignmentIds.has(a._id)
        );

        // Sort by due date
        return userAssignments.sort((a, b) => a.dueDate - b.dueDate);
    },
});

export const getMyAssignments = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!user) return [];

        const enrollments = await ctx.db
            .query("enrollments")
            .withIndex("by_userId", (q) => q.eq("userId", user.tokenIdentifier))
            .collect();

        const courseIds = enrollments.map((e) => e.courseId);

        // Fetch all assignments for these courses
        // Note: In a production app with many assignments, we'd want a more efficient query
        // e.g., by_course index lookups in parallel
        const allAssignments = await Promise.all(
            courseIds.map((courseId) =>
                ctx.db
                    .query("assignments")
                    .withIndex("by_course", (q) => q.eq("courseId", courseId as Id<"courses">))
                    .collect()
            )
        );

        // Flatten the array of arrays
        const flatAssignments = allAssignments.flat();

        // Filter for Active assignments only
        const activeAssignments = flatAssignments.filter(a => a.status === "Published" || a.status === "Active"); // Handle both status conventions if any

        // Fetch submissions for these assignments by this user
        const submissions = await ctx.db
            .query("submissions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Create a map for faster lookup
        const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));

        // Fetch course details for course names
        const courses = await Promise.all(
            courseIds.map(id => ctx.db.get(id as Id<"courses">))
        );
        const courseMap = new Map(courses.filter(c => c !== null).map(c => [c!._id, c!]));

        // Merge data
        const result = activeAssignments.map((assignment) => {
            const submission = submissionMap.get(assignment._id);
            const course = courseMap.get(assignment.courseId);

            return {
                ...assignment,
                courseTitle: course?.title || "Unknown Course",
                submission: submission ? {
                    status: submission.status,
                    grade: submission.grade,
                    submittedAt: submission.submittedAt,
                    fileUrl: submission.fileUrl || (submission.storageId ? "File Submitted" : undefined), // Simplified for list view
                } : null,
                isCompleted: !!submission, // Simple check, can be refined based on status
            };
        });

        return result.sort((a, b) => a.dueDate - b.dueDate);
    },
});
export { };

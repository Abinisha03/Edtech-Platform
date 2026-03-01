import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    courseReviews: defineTable({
        courseId: v.id("courses"),
        userId: v.string(), // Clerk user ID or Convex user tokenIdentifier
        rating: v.number(), // 1 to 5
        feedback: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_course", ["courseId"])
        .index("by_user_course", ["userId", "courseId"]),

    users: defineTable({
        tokenIdentifier: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        bio: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
        role: v.optional(v.string()), // "admin" or "student"
    }).index("by_tokenIdentifier", ["tokenIdentifier"]),

    courses: defineTable({
        title: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        instructorId: v.id("users"),
        price: v.number(),
        modules: v.optional(v.number()),
        lessons: v.optional(v.number()),
        thumbnail: v.optional(v.string()),
        status: v.string(), // "draft", "published"
    }).index("by_instructor", ["instructorId"]),

    modules: defineTable({
        courseId: v.id("courses"),
        title: v.string(),
        description: v.optional(v.string()),
        order: v.number(),
        isPublished: v.boolean(),
    }).index("by_course", ["courseId"]),

    activityLog: defineTable({
        type: v.string(), // "user_registration", "course_created", "content_upload"
        description: v.string(),
        userId: v.optional(v.id("users")),
        timestamp: v.number(),
    }),

    enrollments: defineTable({
        userId: v.string(), // identifier from authentication
        fullName: v.string(),
        email: v.string(),
        role: v.string(), // fixed as "STUDENT"
        courseId: v.string(),
        courseName: v.string(),
        enrollmentDate: v.number(), // timestamp
        paymentStatus: v.string(), // fixed as "PAID"
        amount: v.optional(v.number()),
    }).index("by_userId", ["userId"])
        .index("by_courseId", ["courseId"]),

    courseMaterials: defineTable({
        courseId: v.id("courses"),
        type: v.string(), // "video", "note", "pdf"
        title: v.string(),
        url: v.optional(v.string()), // For videos (YouTube/Vimeo)
        fileId: v.optional(v.string()), // For uploaded files (Convex storage)
        videoId: v.optional(v.id("courseMaterials")), // Parent video ID (for notes/PDFs)
        size: v.optional(v.string()),
        duration: v.optional(v.string()), // For videos
        // Mux Fields
        muxAssetId: v.optional(v.string()),
        muxPlaybackId: v.optional(v.string()),
        status: v.string(), // "Active", "Processing", "Pending", "Ready", "Error"
        moduleId: v.optional(v.id("modules")),
        order: v.optional(v.number()),
    }).index("by_course", ["courseId"])
        .index("by_module", ["moduleId"]),

    materialProgress: defineTable({
        userId: v.string(),
        courseId: v.id("courses"),
        materialId: v.id("courseMaterials"),
        completed: v.boolean(),
        timestamp: v.number(),
    }).index("by_user_course", ["userId", "courseId"])
        .index("by_material_completion", ["materialId", "userId", "completed"]),

    assignments: defineTable({
        title: v.string(),
        courseId: v.id("courses"),
        type: v.string(), // "assignment" or "quiz"
        dueDate: v.number(),
        status: v.string(), // "Active", "Draft", "Archived"
        description: v.optional(v.string()),
        points: v.optional(v.number()),
        moduleId: v.optional(v.id("modules")),
        order: v.optional(v.number()),
        files: v.optional(v.array(v.object({
            name: v.string(),
            url: v.optional(v.string()), // Kept for backward compatibility or external links
            storageId: v.optional(v.id("_storage")), // New field for Convex storage
            type: v.string(),
            size: v.optional(v.string())
        }))),
        questions: v.optional(v.array(v.object({
            id: v.string(),
            text: v.string(),
            options: v.array(v.string()),
            correctAnswer: v.number(),
        }))),
    }).index("by_course", ["courseId"])
        .index("by_type", ["type"])
        .index("by_module", ["moduleId"]),

    submissions: defineTable({
        assignmentId: v.id("assignments"),
        userId: v.string(),
        submittedAt: v.number(),
        status: v.string(), // "submitted", "graded", "late"
        grade: v.optional(v.number()),
        feedback: v.optional(v.string()),
        // New fields for file submission
        storageId: v.optional(v.id("_storage")),
        comment: v.optional(v.string()),
        fileName: v.optional(v.string()),
        fileUrl: v.optional(v.string()),
        // New field for quiz answers
        answers: v.optional(v.array(v.object({
            questionId: v.string(),
            selectedOption: v.number(),
        }))),
    }).index("by_assignment", ["assignmentId"])
        .index("by_user", ["userId"]),
});

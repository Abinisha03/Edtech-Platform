"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    Clock,
    Play,
    Star,
    Globe,
    FileText,
    Settings,
    User,
    ChevronRight,
    Lock,
    ShieldCheck,
    Video,
    BarChart,
    ChevronDown,
    Award,
    AlertCircle,
    Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


function CourseContentList({ materials, modules, isEnrolled, courseId }: any) {
    if (!materials || materials.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p className="font-medium">Content is being updated.</p>
            </div>
        );
    }

    const videoTutorials = materials.filter((m: any) => m.type === "video");
    const allResources = materials.filter((m: any) => m.type === "pdf" || m.type === "note");

    const resourcesByVideo = videoTutorials.reduce((acc: any, video: any) => {
        acc[video._id] = allResources.filter((r: any) => r.videoId === video._id);
        return acc;
    }, {} as Record<string, any>);

    const contentByModule = modules && modules.length > 0
        ? modules.map((module: any) => ({
            ...module,
            videos: videoTutorials.filter((v: any) => v.moduleId === module._id)
        })).filter((m: any) => m.videos.length > 0)
        : [{ _id: "general", title: "Course Content", videos: videoTutorials }];

    return (
        <div className="space-y-8">
            {contentByModule.map((section: any, sectionIdx: number) => (
                <Card key={section._id} className="border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-slate-800">
                                {section._id === "general" ? section.title : `Section ${sectionIdx + 1}: ${section.title}`}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500 font-medium">
                                {section.videos.length} lectures
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {section.videos.map((video: any) => {
                                const resources = resourcesByVideo[video._id] || [];
                                const canWatch = isEnrolled;

                                return (
                                    <div key={video._id} className={cn(
                                        "group/card flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 rounded-xl transition-colors hover:bg-slate-50/50 border border-transparent hover:border-slate-100",
                                        !canWatch && "opacity-75"
                                    )}>
                                        {/* Thumbnail Container - Fixed width on desktop */}
                                        <div className="relative shrink-0 w-full sm:w-64 aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm group-hover/card:shadow-md transition-all">
                                            {canWatch ? (
                                                <Link href={`/user/courses/${courseId}/learn`}>
                                                    <div className="cursor-pointer w-full h-full">
                                                        {video.muxPlaybackId ? (
                                                            <img
                                                                src={`https://image.mux.com/${video.muxPlaybackId}/thumbnail.png?width=400&height=225&fit_mode=preserve`}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-900 group-hover/card:bg-slate-800 transition-colors">
                                                                <Video className="w-10 h-10 text-white/50" />
                                                            </div>
                                                        )}
                                                        {/* Play Overlay */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/card:bg-black/20 transition-all duration-300">
                                                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-75 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 transition-all duration-300">
                                                                <Play className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                    <Lock className="w-6 h-6 text-slate-300" />
                                                </div>
                                            )}
                                            {/* Duration Badge */}
                                            {video.duration && (
                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
                                                    {video.duration}
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info - Flexible width */}
                                        <div className="flex-1 flex flex-col justify-center gap-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn("text-base font-bold leading-tight", canWatch ? "text-slate-900 group-hover/card:text-primary transition-colors" : "text-slate-500")}>
                                                    {video.title}
                                                </h4>
                                            </div>

                                            {/* Description or extra metadata could go here */}
                                            {/* Resources - if any */}
                                            {resources.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {resources.map((res: any) => (
                                                        <div key={res._id} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                                                            <FileText className="w-3 h-3 text-slate-400" />
                                                            <span className="truncate max-w-[200px]">{res.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as Id<"courses">;

    const course = useQuery(api.courses.getById, { id: courseId });
    const materials = useQuery(api.materials.listByCourse, { courseId });
    const assignments = useQuery(api.assignments.listByCourse, { courseId });
    const myEnrollments = useQuery(api.enrollments.getMyEnrollments);
    const enrollmentCount = useQuery(api.enrollments.getEnrollmentCount, { courseId });
    const modules = useQuery(api.modules.getModules, { courseId });

    const isEnrolled = !!myEnrollments?.find(e => String(e.courseId) === String(courseId));

    // Calculate course stats
    const totalVideos = materials?.filter(m => m.type === "video").length || 0;
    const totalResources = materials?.filter(m => m.type === "pdf" || m.type === "note").length || 0;
    const totalAssignments = assignments?.length || 0;

    // Calculate total duration
    const totalDurationSeconds = materials?.reduce((acc, curr) => {
        if (curr.type !== "video" || !curr.duration) return acc;
        const parts = curr.duration.split(':').map(Number);
        if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
        if (parts.length === 3) return acc + parts[0] * 3600 + parts[1] * 60 + parts[2];
        return acc;
    }, 0) || 0;

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const totalDuration = formatDuration(totalDurationSeconds);

    if (course === undefined) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fcfdff]">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
    );

    if (course === null) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdff] gap-4">
            <h1 className="text-2xl font-black text-slate-900">Course not found</h1>
            <Button onClick={() => router.push('/user/explorer')}>Back to Explorer</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700 font-sans">
            {!isEnrolled ? (
                /* -------------------------------------------------------------------------- */
                /*                                SALES PAGE VIEW                             */
                /* -------------------------------------------------------------------------- */
                <>
                    {/* Dark Header Section (Udemy Style) */}
                    <div className="bg-[#1c1d1f] text-white py-12 relative">
                        <div className="max-w-[1184px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-2 text-sm font-bold text-[#cec0fc] mb-4">
                                    <Link href="/user/explorer" className="hover:text-white transition-colors">Explorer</Link>
                                    <ChevronRight className="w-3 h-3 text-white" />
                                    <Link href={`/user/explorer?category=${course.category}`} className="hover:text-white transition-colors capitalize">{course.category || "Development"}</Link>
                                    <ChevronRight className="w-3 h-3 text-white" />
                                    <span className="text-white truncate max-w-[200px]">{course.title}</span>
                                </div>

                                <h1 className="text-4xl font-black tracking-tight leading-tight text-white mb-4">
                                    {course.title}
                                </h1>
                                <p className="text-lg text-white font-medium leading-relaxed max-w-3xl">
                                    {course.description || "Master these skills with our comprehensive, project-based curriculum designed for career transformation."}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    {/* Bestseller Badge - Logic could be added here later */}
                                    <Badge className="bg-[#eceb98] text-[#3d3c0a] border-none px-2 py-1 rounded-sm font-bold text-xs uppercase tracking-wide">
                                        Bestseller
                                    </Badge>

                                    <div className="flex items-center gap-1">
                                    </div>
                                    <span className="text-white text-sm">
                                        {enrollmentCount ? `${enrollmentCount.toLocaleString()} students` : "Join now"}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-white" />
                                        Last updated {new Date(course._creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-white" />
                                        English
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="max-w-[1184px] mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* What You'll Learn Box */}
                            <div className="border border-[#d1d7dc] p-6">
                                <h2 className="text-2xl font-black text-[#2d2f31] mb-6">What you'll learn</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                                            <p className="text-sm text-[#2d2f31]">
                                                Comprehensive understanding of professional {i < 4 ? 'design' : 'delivery'} standards and best practices.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Course Content Section (Sales View) */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-[#2d2f31]">Course content</h2>
                                <div className="flex items-center justify-between text-sm text-[#2d2f31] mb-2">
                                    <span>{totalVideos} lectures • {totalDuration} total length</span>
                                    <span className="font-bold text-[#5624d0] cursor-pointer hover:text-[#401b9c]">Expand all sections</span>
                                </div>
                                <div className="border border-[#d1d7dc] divide-y divide-[#d1d7dc]">
                                    <CourseContentList
                                        materials={materials}
                                        modules={modules}
                                        isEnrolled={isEnrolled}
                                        courseId={courseId}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sticky Sidebar */}
                        <div className="lg:col-span-1 relative">
                            <div className="sticky top-8 bg-white border border-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)]">
                                {/* Video Preview Image */}
                                <div className="relative aspect-video w-full bg-slate-900 cursor-pointer group overflow-hidden">
                                    <img
                                        src={course.thumbnail || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600&auto=format&fit=crop"}
                                        alt={course.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-black fill-current ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-lg pointer-events-none">
                                        Preview this course
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl font-black text-[#2d2f31]">₹{course.price}</span>
                                            <span className="text-lg text-[#6a6f73] line-through">₹{course.price * 5}</span>
                                            <span className="text-base text-[#2d2f31]">80% off</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#b32d0f] text-sm">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-bold">1 day left at this price!</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Link href={`/user/enroll/${course._id}`}>
                                            <Button className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all">
                                                Add to cart
                                            </Button>
                                        </Link>
                                        <Button variant="outline" className="w-full h-12 rounded-none border-[#2d2f31] text-[#2d2f31] font-bold text-base hover:bg-slate-50">
                                            Buy now
                                        </Button>
                                        <p className="text-center text-xs text-[#2d2f31]">30-Day Money-Back Guarantee</p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h4 className="font-bold text-[#2d2f31] text-sm">This course includes:</h4>
                                        <div className="space-y-2 text-sm text-[#2d2f31]">
                                            <div className="flex items-center gap-3">
                                                <Video className="w-4 h-4" />
                                                <span>{totalDuration} on-demand video</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4" />
                                                <span>{totalAssignments} assignments</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Download className="w-4 h-4" />
                                                <span>{totalResources} downloadable resources</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-4 h-4" />
                                                <span>Access on mobile and TV</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Award className="w-4 h-4" />
                                                <span>Certificate of completion</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between underline text-xs font-bold text-[#2d2f31] pt-2 cursor-pointer">
                                        <span>Share</span>
                                        <span>Gift this course</span>
                                        <span>Apply Coupon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* -------------------------------------------------------------------------- */
                /*                               ENROLLED USER VIEW                           */
                /* -------------------------------------------------------------------------- */
                <div className="max-w-[1000px] mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="mb-8 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-2">
                            <Link href="/user/courses" className="hover:text-slate-900 transition-colors">My Learning</Link>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-900 truncate max-w-[300px]">{course.title}</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{course.title}</h1>
                        {/* Optional: Progress bar could go here */}
                    </div>

                    <div className="space-y-12">
                        {/* Course Content */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Course Content</h2>
                            </div>

                            <div className="bg-transparent">
                                <CourseContentList
                                    materials={materials}
                                    modules={modules}
                                    isEnrolled={isEnrolled}
                                    courseId={courseId}
                                />
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Assignments</h2>
                            <div className="grid gap-4">
                                {assignments && assignments.length > 0 ? (
                                    assignments.map((assignment, idx) => (
                                        <div key={assignment._id} className="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm hover:border-slate-300 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900 leading-tight mb-1">{assignment.title}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                        <span className="uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                                                            {assignment.type}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                        </span>
                                                        {assignment.points && (
                                                            <span className="flex items-center gap-1">
                                                                {assignment.points} pts
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/user/assignments/${assignment._id}`}>
                                                <Button size="sm" className="font-bold">
                                                    {assignment.type === "quiz" ? "Start Quiz" : "Start Assignment"}
                                                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-lg p-8 text-center text-slate-500">
                                        No assignments for this course yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    FileText,
    Star,
    MessageSquare,
    Calendar,
    Bell,
    ArrowUpRight,
    Search,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function StudentDashboardPage() {
    const user = useQuery(api.users.currentUser);
    const enrollments = useQuery(api.enrollments.getMyEnrollments);
    const notifications = useQuery(api.activityLog.listStudentActivity);
    const allCourses = useQuery(api.courses.listPublished);
    const allProgress = useQuery(api.materials.getMyProgress);
    const pendingAssignments = useQuery(api.assignments.getPendingAssignments, { userId: user?.tokenIdentifier });

    const enrolledCourses = enrollments?.map((e) => {
        const course = allCourses?.find(c => String(c._id) === String(e.courseId));
        const progressRecords = allProgress?.filter(p => String(p.courseId) === String(e.courseId) && p.completed);

        // This is a simplified progress calculation for display
        // In a real app, you'd fetch the total material count per course
        const mockTotalMaterials = 10;
        const progress = Math.round(((progressRecords?.length || 0) / mockTotalMaterials) * 100);

        return {
            id: e._id,
            courseId: e.courseId,
            title: e.courseName,
            progress: progress || 0,
            image: course?.thumbnail || "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=400&h=400&fit=crop"
        };
    }) || [];

    // const assignments = [
    //     { title: "Watch Intro Video", due: "ASAP", course: "Incomplete Lessons" },
    //     { title: "Review Course Notes", due: "Weekly", course: "Incomplete Lessons" },
    // ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-inter max-w-[1400px] mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                <Link href="/user/explorer" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">Dashboard</span>
            </div>

            {/* Header */}
            <div className="space-y-1.5 pl-1">
                <h1 className="text-[42px] font-black text-foreground tracking-tight leading-none">Connected Dashboard</h1>
                <p className="text-[17px] text-muted-foreground font-medium">Everything you need to succeed, all in one place.</p>
            </div>

            {/* main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
                {/* 1. Enrolled Courses */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-6">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <CardTitle className="text-[20px] font-black tracking-tight">Enrolled Courses</CardTitle>
                        </div>
                        <Link href="/user/courses" className="text-primary text-[13px] font-black flex items-center gap-1 hover:underline">
                            Go to Courses <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                        {enrolledCourses.length > 0 ? (
                            enrolledCourses.map((course) => (
                                <Link key={course.id} href={`/user/courses/${course.courseId}`}>
                                    <div className="flex items-center gap-5 p-5 bg-muted/50 rounded-[2rem] border border-transparent hover:border-border hover:bg-card transition-all group cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted shrink-0 shadow-sm">
                                            <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                        </div>
                                        <div className="flex-1 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-black text-foreground text-[15px] truncate max-w-[200px]">{course.title}</h3>
                                                <span className="text-[11px] font-black text-muted-foreground tracking-wider">{(course.progress || 0)}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-20 text-center text-muted-foreground font-bold bg-muted/30 rounded-[2rem] border-2 border-dashed border-border">
                                text-muted-foreground text-slate-400 font-bold bg-muted/30 rounded-[2rem] border-2 border-dashed border-border
                                No courses enrolled yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Pending Assignments */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <CardTitle className="text-[20px] font-black tracking-tight">Pending Assignments</CardTitle>
                        </div>
                        <Link href="/user/assignments" className="text-primary text-[13px] font-black flex items-center gap-1 hover:underline">
                            Go to Assignments <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                        {pendingAssignments && pendingAssignments.length > 0 ? (
                            pendingAssignments.map((assignment) => {
                                const course = allCourses?.find(c => c._id === assignment.courseId);
                                const dueDate = new Date(assignment.dueDate).toLocaleDateString();
                                return (
                                    <div key={assignment._id} className="flex items-center justify-between p-5 bg-muted/50 rounded-[2rem] border border-transparent hover:border-border hover:bg-card transition-all group cursor-pointer">
                                        <div className="space-y-1">
                                            <h3 className="font-black text-foreground text-[15px]">{assignment.title}</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-0.5">
                                                Due: {dueDate} • {course?.title || "Unknown Course"}
                                            </p>
                                        </div>
                                        <Link href={`/user/assignments/${assignment._id}`}>
                                            <Button size="sm" className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl text-[11px] shadow-lg shadow-primary/20 transition-all uppercase tracking-wider">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center text-muted-foreground font-bold bg-muted/30 rounded-[2rem] border-2 border-dashed border-border">
                                No pending assignments.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Recent Notifications */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-6">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-primary" />
                            <CardTitle className="text-[20px] font-black tracking-tight">Recent Notifications</CardTitle>
                        </div>
                        <Link href="/user/notifications" className="text-primary text-[13px] font-black flex items-center gap-1 hover:underline">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-8">
                        {notifications && notifications.length > 0 ? (
                            notifications.map((n) => {
                                const isRegistration = n.type === "user_registration";
                                const isCourse = n.type === "course_created";
                                const isUpload = n.type === "content_upload";

                                return (
                                    <div key={n._id} className="flex gap-5 group cursor-pointer">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md",
                                            isRegistration ? "bg-blue-500/10" : isCourse ? "bg-emerald-500/10" : "bg-purple-500/10"
                                        )}>
                                            {isRegistration ? <Star className="w-5 h-5 text-blue-500" /> : isCourse ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Play className="w-5 h-5 text-purple-500" />}
                                        </div>
                                        <div className="space-y-1 pt-0.5">
                                            <p className="text-[14px] font-bold text-foreground/80 leading-tight">
                                                {n.description}
                                            </p>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                {new Date(n.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center text-muted-foreground font-bold bg-muted/30 rounded-[2rem] border-2 border-dashed border-border">
                                No activity yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Progress Overview */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-8 pb-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <CardTitle className="text-[20px] font-black tracking-tight">Progress Overview</CardTitle>
                        </div>
                        <Link href="/user/analytics" className="text-primary text-[13px] font-black flex items-center gap-1 hover:underline">
                            Go to Analytics <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 grid grid-cols-2 gap-8 pb-12">
                        {/* Chart 1: Completion */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-36 h-36 flex items-center justify-center group cursor-pointer">
                                <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted" />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        stroke="currentColor" strokeWidth="10" fill="transparent"
                                        strokeDasharray={263.9} strokeDashoffset={263.9 * (1 - 0.75)}
                                        className="text-primary transition-all duration-1000 group-hover:stroke-[12px]"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                                    <span className="text-3xl font-black text-foreground tracking-tighter">75%</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Completion</p>
                        </div>

                        {/* Chart 2: GPA */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative w-36 h-36 flex items-center justify-center group cursor-pointer">
                                <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted" />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        stroke="currentColor" strokeWidth="10" fill="transparent"
                                        strokeDasharray={263.9} strokeDashoffset={263.9 * (1 - 0.85)}
                                        className="text-emerald-500 transition-all duration-1000 group-hover:stroke-[12px]"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                                    <span className="text-3xl font-black text-foreground tracking-tighter">3.8</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current GPA</p>
                        </div>
                    </CardContent>
                </Card>
            </div>


        </div >
    );
}

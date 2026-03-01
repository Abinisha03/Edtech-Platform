"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    CheckCircle2,
    Trophy,
    TrendingUp,
    ArrowRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProgressPage() {
    const stats = useQuery(api.progress.getDashboardStats, {});

    if (!stats) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const { stats: overview, courses: rawCourses } = stats;

    // Deduplicate courses on frontend as a safety net
    const courses = rawCourses.filter((course, index, self) =>
        index === self.findIndex((c) => c.courseId === course.courseId)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-inter max-w-[1200px] mx-auto pb-10">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Learning Progress</h1>
                <p className="text-slate-500 font-medium">Track your journey and achievements.</p>
            </div>

            {/* Overview Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Courses Enrolled"
                    value={overview.totalCourses}
                    icon={BookOpen}
                    color="text-blue-500"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Lessons Completed"
                    value={overview.totalLessonsCompleted}
                    icon={CheckCircle2}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Average Score"
                    value={`${overview.averageGrade}%`}
                    icon={TrendingUp}
                    color="text-purple-500"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Certificates"
                    value={overview.certificates}
                    icon={Trophy}
                    color="text-amber-500"
                    bg="bg-amber-50"
                />
            </div>

            {/* Course Progress Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Progress
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <Card key={course.courseId} className="border-none shadow-sm hover:shadow-md transition-all rounded-[24px] overflow-hidden bg-white group">
                            <div className="flex flex-col h-full">
                                {/* Thumbnail & Content */}
                                <div className="p-6 pb-2 flex gap-5">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                                <BookOpen className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="font-bold text-slate-900 text-lg truncate mb-1">{course.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium">
                                            {course.completedMaterials} / {course.totalMaterials} Lessons Completed
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="px-6 py-4 space-y-3 mt-auto">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                                        <span className="text-sm font-black text-primary">{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2.5 rounded-full bg-slate-100" />
                                </div>

                                {/* Action Footer */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <Link href={`/user/courses/${course.courseId}`}>
                                        <Button size="sm" className="rounded-xl font-bold gap-2 group-hover:bg-primary group-hover:text-white transition-colors" variant="ghost">
                                            Continue Learning <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400 font-medium bg-slate-50/50 rounded-[24px] border-2 border-dashed border-slate-200">
                            No courses enrolled yet. <Link href="/user/courses" className="text-primary hover:underline font-bold">Browse Courses</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: any, color: string, bg: string }) {
    return (
        <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

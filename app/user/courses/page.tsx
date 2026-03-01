"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
    BookOpen,
    Search,
    ChevronRight,
    BarChart3,
    Clock,
    ChevronDown,
    GraduationCap,
    ArrowRight,
    Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MyCoursesPage() {
    const enrollments = useQuery(api.enrollments.getMyEnrollments);
    const allCourses = useQuery(api.courses.listPublished);
    const allProgress = useQuery(api.materials.getMyProgress);
    const [searchQuery, setSearchQuery] = useState("");

    const enrolledCourses = enrollments?.map((e) => {
        const course = allCourses?.find(c => String(c._id) === String(e.courseId));
        const progressRecords = allProgress?.filter(p => String(p.courseId) === String(e.courseId) && p.completed);

        // Simple progress calculation
        const mockTotalMaterials = 10;
        const progressPercentage = Math.round(((progressRecords?.length || 0) / mockTotalMaterials) * 100);

        return {
            id: e._id,
            courseId: e.courseId,
            title: e.courseName,
            progress: Math.min(progressPercentage, 100) || 0,
            image: course?.thumbnail || "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=400&h=400&fit=crop",
            category: course?.category || "Professional Development",
        };
    }) || [];

    const filteredCourses = enrolledCourses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (enrollments === undefined) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-1.5">
                    <h1 className="text-[42px] font-black text-slate-900 tracking-tight leading-none">My Learning</h1>
                    <p className="text-[17px] text-slate-500 font-medium">Pick up where you left off and master new skills.</p>
                </div>

                <div className="relative group w-full md:w-[350px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Courses Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
                <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{enrolledCourses.length}</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ongoing Courses</p>
                    </div>
                </div>
                <div className="bg-amber-50/50 rounded-[2.5rem] p-8 border border-amber-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">0</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    </div>
                </div>
                <div className="bg-indigo-50/50 rounded-[2.5rem] p-8 border border-indigo-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <BarChart3 className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">12</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Study Hours</p>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
                    {filteredCourses.map((course) => (
                        <Link key={course.id} href={`/user/courses/${course.courseId}`} className="group block h-full">
                            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                                    <img
                                        src={course.image}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={course.title}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white">
                                            <Play className="w-6 h-6 fill-current" />
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-white/95 backdrop-blur shadow-sm text-slate-900 border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                                            {course.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="mt-auto space-y-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <span>Progress</span>
                                                <span className="text-slate-900">{course.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 12h left
                                            </p>
                                            <p className="text-[11px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Continue <ArrowRight className="w-3 h-3" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-32 px-1 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center mb-8">
                        <BookOpen className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">No courses found</h2>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                        Explore our catalog of professional courses and start your learning journey today.
                    </p>
                    <Link href="/user/explorer">
                        <Button className="h-14 px-10 bg-primary hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all text-base">
                            Browse Catalog
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

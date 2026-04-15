"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserNavbar } from "@/components/user-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProgramsPage() {
    const courses = useQuery(api.courses.listPublished);

    return (
        <div className="min-h-screen bg-[#fcfdff] antialiased pt-20">
            <UserNavbar />

            <div className="max-w-[1400px] mx-auto pt-12 px-12 space-y-16 pb-20">
                {/* Hero */}
                <div className="space-y-6 max-w-3xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-blue-600">Intensive Career Tracks</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                        Professional <br /> <span className="text-primary">Certification Programs</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        End-to-end curriculums designed to take you from beginner to job-ready in months, not years.
                    </p>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {courses?.map((course: any) => (
                        <Card key={course._id} className="p-8 rounded-[2.5rem] border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-40 h-40 text-primary" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <Badge className="bg-slate-900 text-white hover:bg-slate-800 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Professional Certificate
                                    </Badge>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                                        {course.title} Professional Program
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">
                                        {course.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        "Job-ready portfolio",
                                        "Career support",
                                        "Real-world projects",
                                        "Industry certification"
                                    ].map(feature => (
                                        <div key={feature} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-bold text-slate-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                    {course.instructorName && (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-slate-100">
                                                <AvatarImage src={`https://i.pravatar.cc/100?u=${course.instructorId}`} />
                                                <AvatarFallback>IN</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 leading-none mb-1">{course.instructorName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Instructor</p>
                                            </div>
                                        </div>
                                    )}

                                    <Link href={`/user/enroll/${course._id}`}>
                                        <Button className="rounded-xl font-black h-12 px-8 bg-slate-900 text-white hover:bg-primary transition-colors">
                                            Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

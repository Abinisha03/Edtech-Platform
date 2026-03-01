"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Id } from "@/convex/_generated/dataModel";

export default function SuccessPage() {
    const params = useParams();
    const router = useRouter();

    const courseId = params.id as Id<"courses">;
    const course = useQuery(api.courses.getById, { id: courseId });

    const { user: clerkUser } = useUser();
    const createEnrollment = useMutation(api.enrollments.createEnrollment);
    const [isEnrolling, setIsEnrolling] = useState(false);

    useEffect(() => {
        // Persist enrollment if we have course and user
        if (course && clerkUser && !isEnrolling) {
            const searchParams = new URLSearchParams(window.location.search);
            const amount = parseInt(searchParams.get("price") || String(course.price || "599"));

            setIsEnrolling(true);
            createEnrollment({
                fullName: clerkUser.fullName || clerkUser.username || "Anonymous",
                email: clerkUser.primaryEmailAddress?.emailAddress || "",
                courseId: String(course._id),
                courseName: course.title,
                amount: amount,
            }).then(() => {
                toast.success("Successfully enrolled!");
            }).catch((err) => {
                console.error("Enrollment failed:", err);
                toast.error("Failed to persist enrollment data.");
            });
        }
    }, [course, clerkUser, createEnrollment, isEnrolling]);

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfdff] py-20 px-6 sm:px-12 flex items-center justify-center font-inter overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-[600px] w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative inline-block">
                    <div className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="relative w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-12">
                        <Check className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                        Enrollment Successful!
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        Welcome to the course. Your learning journey begins now. We've sent the details to your email.
                    </p>
                </div>

                <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_rgba(0,0,0,0.06)] bg-white overflow-hidden p-8 space-y-6">
                    <div className="flex gap-6 text-left items-center p-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-slate-100 shrink-0">
                            <img
                                src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                                className="w-full h-full object-cover"
                                alt={course.title}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Lifetime Access</p>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                {course.title}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-3xl text-left space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment ID</p>
                            <p className="text-sm font-black text-slate-700">ORD-{String(params.id).slice(0, 6).toUpperCase()}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl text-left space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-sm font-black text-emerald-600">Active / Paid</p>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6 pt-4">
                    <Link href="/user/dashboard">
                        <Button
                            className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-lg gap-3 transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                        Need help? <span className="text-slate-900 underline cursor-pointer">Contact Support</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

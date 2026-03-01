"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Calendar,
    CreditCard,
    FileText,
    Zap,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const months = searchParams.get("months") || "3";
    const totalAmount = searchParams.get("price") || "1497";

    // Fetch course from Convex
    const courseId = params.id as Id<"courses">;
    const course = useQuery(api.courses.getById, { id: courseId });

    const handleContinueToPayment = () => {
        if (!course) return;
        router.push(`/user/enroll/payment/${course._id}?months=${months}&price=${totalAmount}`);
    };

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfdff] py-20 px-6 sm:px-12 animate-in fade-in duration-700 font-inter">
            <div className="max-w-[1100px] mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="text-slate-500 font-bold gap-2 p-0 hover:bg-transparent hover:text-primary transition-colors"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" /> Edit Selection
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-slate-900 tracking-tighter uppercase text-xs">Unified Secure Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                    {/* Left: Payment Instructions */}
                    <div className="md:col-span-7 space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Review & Pay</h1>
                            <p className="text-lg text-slate-500 font-medium">Verify your program details before proceeding to our secure payment gateway.</p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Enrollment Instructions</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: Zap, title: "Instant Activation", desc: "Gain immediate access to all lectures and resources upon successful payment verification." },
                                    { icon: FileText, title: "LMS Onboarding", desc: "A welcome kit with login credentials and program roadmap will be sent to your registered email." },
                                    { icon: Lock, title: "Verified Credentials", desc: "Your certificate ID will be generated and unique to your professional profile." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <item.icon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900">{item.title}</p>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-6 items-start">
                            <Info className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                            <div className="space-y-2">
                                <p className="font-black text-amber-900 text-sm">Experimental Payment Gateway</p>
                                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                                    You are using a sandbox environment. No actual funds will be deducted from your account. Use the automated "Pay Now" flow to simulate a successful transaction.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="md:col-span-5 relative">
                        <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_rgba(0,0,0,0.06)] bg-white overflow-hidden sticky top-32">
                            <div className="p-10 space-y-10">
                                <div className="space-y-6">
                                    <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                                        <img
                                            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                                            className="w-full h-full object-cover"
                                            alt={course.title}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Badge className="bg-slate-900 text-white border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">
                                            Selected Track
                                        </Badge>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            by EduFlow Certified
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-10 border-t border-slate-50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tier Plan</span>
                                        <span className="text-slate-900 font-black">{months} Months Access</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Base Tuition</span>
                                        <span className="text-slate-900 font-black">₹{totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Platform Fee</span>
                                        <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Waived</span>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable Total</p>
                                            <p className="text-5xl font-black text-slate-900 tracking-tighter">₹{totalAmount}</p>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-lg gap-3 transition-all shadow-xl shadow-slate-100 active:scale-95 group"
                                        onClick={handleContinueToPayment}
                                    >
                                        Continue to Payment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <div className="flex items-center justify-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
                                        <CreditCard className="w-4 h-4" />
                                        Encryption Active
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

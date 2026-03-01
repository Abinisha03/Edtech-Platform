"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CreditCard,
    ShieldCheck,
    Lock,
    Info,
    CheckCircle2,
    Loader2,
    Smartphone,
    Building2,
    Check,
    Clock,
    Award,
    Calendar,
    Infinity,
    Zap,
    Shield,
    Globe,
    ArrowRight
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function EnrollmentPage() {
    const params = useParams();
    const router = useRouter();

    // Fetch course from Convex
    const courseId = params.id as Id<"courses">;
    const course = useQuery(api.courses.getById, { id: courseId });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [couponCode, setCouponCode] = useState("");
    const [isCouponApplied, setIsCouponApplied] = useState(false);

    const [duration, setDuration] = useState("3");
    const [price, setPrice] = useState(0);

    // Fetch current user's enrollments to check if already enrolled
    const myEnrollments = useQuery(api.enrollments.getMyEnrollments);

    useEffect(() => {
        if (course && myEnrollments) {
            const isEnrolled = myEnrollments.some(e => String(e.courseId) === String(course._id));
            if (isEnrolled) {
                router.push("/user/dashboard");
            }
        }
    }, [course, myEnrollments, router]);

    useEffect(() => {
        if (course) {
            const baseTotal = typeof course.price === 'string' ? parseInt(course.price) : (course.price || 599);
            let calculatedPrice = baseTotal;

            if (duration === "1") {
                calculatedPrice = Math.round(baseTotal * 0.4);
            } else if (duration === "6") {
                calculatedPrice = Math.round(baseTotal * 1.8);
            }

            setPrice(calculatedPrice);
        }
    }, [course, duration]);

    const handleContinue = () => {
        if (!course) return;
        router.push(`/user/enroll/checkout/${course._id}?months=${duration}&price=${price}`);
    };

    if (!course) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );



    return (
        <div className="min-h-screen bg-white py-20 px-6 sm:px-12 animate-in fade-in duration-700 font-inter">
            <div className="max-w-[1000px] mx-auto">
                <Button
                    variant="ghost"
                    className="text-slate-500 font-bold gap-2 p-0 mb-12 hover:bg-transparent hover:text-primary transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Explorer
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                    {/* Left: Course Info */}
                    <div className="md:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                    <Globe className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offered by</p>
                                    <p className="text-sm font-extrabold text-slate-900">EduFlow Certified</p>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                                {course.title}
                            </h1>

                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                {course.description || "Start your journey to becoming a professional. This course covers everything from fundamentals to advanced concepts used by industry leaders."}
                            </p>
                        </div>

                        <div className="space-y-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">What's included in this program:</h3>
                            <ul className="space-y-4">
                                {[
                                    { icon: Infinity, text: "Unlimited access to all course materials", color: "text-blue-500" },
                                    { icon: Award, text: "Professional Certificate on completion", color: "text-emerald-500" },
                                    { icon: Calendar, text: "Flexible schedule with lifetime updates", color: "text-purple-500" },
                                    { icon: Shield, text: "Secure learning environment", color: "text-primary" }
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className={cn("w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all group-hover:scale-110", feature.color)}>
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-slate-700 font-bold text-sm tracking-tight">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Pricing & Commitment */}
                    <div className="md:col-span-5 relative">
                        <Card className="rounded-[3rem] border-none shadow-[0_40px_80px_rgba(0,0,0,0.08)] bg-white overflow-hidden sticky top-32">
                            <div className="p-10 space-y-10">
                                <div className="space-y-2 text-center">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Select your plan</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Flexible Enrollment</h3>
                                </div>

                                <RadioGroup
                                    defaultValue="3"
                                    onValueChange={setDuration}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    {[
                                        { id: '1', label: '1 Month', desc: 'Short-term focus' },
                                        { id: '3', label: '3 Months', desc: 'Accelerated learning', badge: 'Popular' },
                                        { id: '6', label: '6 Months', desc: 'Full mastery path' },
                                    ].map(opt => (
                                        <Label
                                            key={opt.id}
                                            htmlFor={`duration-${opt.id}`}
                                            className={cn(
                                                "relative flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all",
                                                duration === opt.id
                                                    ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                                    : "border-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <RadioGroupItem value={opt.id} id={`duration-${opt.id}`} className="border-slate-300 text-primary" />
                                                <div>
                                                    <p className="font-extrabold text-slate-900">{opt.label}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{opt.desc}</p>
                                                </div>
                                            </div>
                                            {opt.badge && (
                                                <Badge className="bg-primary hover:bg-primary text-white text-[8px] px-2 py-0.5 rounded-full uppercase absolute -top-2 right-6">
                                                    {opt.badge}
                                                </Badge>
                                            )}
                                        </Label>
                                    ))}
                                </RadioGroup>

                                <div className="pt-8 border-t border-slate-50 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{price}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 italic mb-1">Tax included</p>
                                    </div>

                                    <Button
                                        className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-lg gap-3 transition-all shadow-xl shadow-slate-100 active:scale-95 group"
                                        onClick={handleContinue}
                                    >
                                        Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 line-clamp-1">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            7-Day Money Back
                                        </div>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <div className="flex items-center gap-1.5 line-clamp-1">
                                            <Lock className="w-4 h-4 text-slate-300" />
                                            Secure Access
                                        </div>
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

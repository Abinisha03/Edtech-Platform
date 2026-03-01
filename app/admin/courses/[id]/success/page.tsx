"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, LayoutDashboard, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function CourseSuccessPage() {
    const params = useParams();
    const courseId = params.id as Id<"courses">;
    const course = useQuery(api.courses.getById, { id: courseId });

    return (
        <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
            <Card className="max-w-md w-full border-none shadow-2xl shadow-primary/10 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Success!</h1>
                        <p className="text-slate-500 font-medium">
                            <span className="font-bold text-slate-800">"{course?.title || "Your Course"}"</span> has been successfully published. What would you like to do next?
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link href={`/admin/courses/${courseId}/content`} className="block">
                            <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
                                <Rocket className="w-5 h-5" />
                                Continue to Content Management
                            </Button>
                        </Link>

                        <Link href="/admin/courses" className="block">
                            <Button variant="ghost" className="w-full h-14 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl gap-2">
                                <LayoutDashboard className="w-5 h-5" />
                                Skip
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

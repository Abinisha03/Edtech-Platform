"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    LayoutDashboard,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    ChevronRight,
    HelpCircle,
    Calendar,
    BookOpen,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function QuizzesPage() {
    const assignments = useQuery(api.assignments.getMyAssignments);
    const quizzes = assignments?.filter(a => a.type === "quiz") || [];

    if (assignments === undefined) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Your Quizzes</h1>
                    <p className="text-slate-500 font-medium text-lg">Test your knowledge and track your progress.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search quizzes..."
                            className="h-12 pl-11 bg-white border-slate-200 rounded-xl font-medium shadow-sm focus-visible:ring-primary/20"
                        />
                    </div>
                    <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 p-0 shrink-0">
                        <Filter className="w-4 h-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Quizzes List */}
            {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <Link
                            href={`/user/quizzes/${quiz._id}`}
                            key={quiz._id}
                            className="group block"
                        >
                            <Card className={cn(
                                "h-full border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white group",
                                quiz.isCompleted ? "opacity-75 hover:opacity-100" : ""
                            )}>
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="p-8 space-y-6 flex-1">
                                        {/* Top Meta */}
                                        <div className="flex items-start justify-between gap-4">
                                            <Badge className={cn(
                                                "border-none px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                quiz.isCompleted
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-indigo-50 text-indigo-600"
                                            )}>
                                                {quiz.isCompleted ? "Completed" : "Pending"}
                                            </Badge>
                                            {quiz.points && (
                                                <span className="text-xs font-black text-slate-300">
                                                    {quiz.points} PTS
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Course */}
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {quiz.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold uppercase tracking-wide truncate">
                                                    {quiz.courseTitle}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold">
                                                Due {new Date(quiz.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                            quiz.isCompleted
                                                ? "bg-emerald-500 text-white"
                                                : "bg-white text-primary shadow-lg shadow-indigo-100 group-hover:bg-primary group-hover:text-white"
                                        )}>
                                            {quiz.isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5" />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No Quizzes Found</h2>
                    <p className="text-slate-500 font-medium">You don't have any quizzes assigned yet.</p>
                </div>
            )}
        </div>
    );
}

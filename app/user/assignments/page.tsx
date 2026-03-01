"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import {
    FileText,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AssignmentsPage() {
    const assignments = useQuery(api.assignments.getMyAssignments);
    const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
    const [searchQuery, setSearchQuery] = useState("");

    if (assignments === undefined) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    const now = Date.now();

    const filteredAssignments = assignments.filter(assignment => {
        // Text Match
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        // Tab Filtering
        if (activeTab === "upcoming") {
            return !assignment.isCompleted; // Show all incomplete assignments (future + overdue)
        } else if (activeTab === "completed") {
            return assignment.isCompleted;
        }

        return false;
    });

    return (
        <div className="space-y-8 font-inter">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assignments</h1>
                <p className="text-slate-500 font-medium mt-2">Manage your tasks and track your progress.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Custom Tabs */}
                <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1">
                    {(["upcoming", "completed"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                                activeTab === tab
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-slate-200 rounded-xl focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => {
                    const isOverdue = !assignment.isCompleted && assignment.dueDate < now;
                    const dueDate = new Date(assignment.dueDate);

                    return (
                        <Link
                            key={assignment._id}
                            href={`/user/assignments/${assignment._id}`}
                            className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-primary/20 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-6 h-6" />
                                </div>
                                {assignment.isCompleted ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Completed
                                    </Badge>
                                ) : isOverdue ? (
                                    <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none px-3 py-1">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Overdue
                                    </Badge>
                                ) : (
                                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-3 py-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {Math.ceil((assignment.dueDate - now) / (1000 * 60 * 60 * 24))} days left
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-2 mb-6 flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                                    {assignment.courseTitle}
                                </p>
                                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {assignment.title}
                                </h3>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>{dueDate.toLocaleDateString()}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {filteredAssignments.length === 0 && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Filter className="w-6 h-6 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900">No assignments found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
                        </div>
                        {activeTab !== "upcoming" && (
                            <Button variant="outline" onClick={() => setActiveTab("upcoming")}>
                                View Upcoming
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

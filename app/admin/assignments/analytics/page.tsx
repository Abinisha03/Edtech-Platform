"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Zap,
    CheckCircle2,
    HelpCircle,
    Users,
    ChevronDown,
    BookOpen,
    Download,
    MoreHorizontal,
    ArrowUpRight,
    Search,
    User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AssessmentAnalyticsPage() {
    const [timeRange, setTimeRange] = useState("last-30");

    const summaryCards = [
        {
            title: "Overall Completion Rate",
            value: "84.2%",
            trend: "+2.4%",
            isPositive: true,
            icon: CheckCircle2,
            progress: 84.2,
            color: "text-primary",
            bg: "bg-primary"
        },
        {
            title: "Avg. Quiz Score",
            value: "76/100",
            trend: "-1.5%",
            isPositive: false,
            icon: HelpCircle,
            progress: 76,
            color: "text-orange-500",
            bg: "bg-orange-500"
        },
        {
            title: "Active User Growth",
            value: "+12.8%",
            trend: "+5.2%",
            isPositive: true,
            icon: TrendingUp,
            progress: 65, // Arbitrary visual
            color: "text-emerald-500",
            bg: "bg-emerald-500"
        }
    ];

    const studentActivities = [
        { id: "JD", name: "Jane Doe", course: "Advanced Mathematics", activity: "QUIZ COMPLETED", date: "Oct 12, 2023", score: "98/100", status: "emerald" },
        { id: "MS", name: "Mark Smith", course: "Physics 101", activity: "LECTURE JOINED", date: "Oct 12, 2023", score: "-", status: "blue" },
        { id: "LR", name: "Lisa Ray", course: "World History", activity: "ASSIGNMENT SUBMITTED", date: "Oct 11, 2023", score: "Pending", status: "orange" }
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-700 pb-20 font-inter bg-[#f8fafc]/50">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Link href="/admin/assignments" className="hover:text-primary cursor-pointer transition-colors">Assignments</Link>
                <span className="mx-1">/</span>
                <span className="text-slate-600">Analytics & Reports</span>
            </div>

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/assignments" className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics & Reports</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl px-1">
                        Monitor student performance and platform engagement metrics across all courses.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-4 bg-white/60 p-2 rounded-[2rem] border border-slate-100 shadow-sm backdrop-blur-sm">
                    <Select defaultValue="all-courses">
                        <SelectTrigger className="h-12 w-[160px] rounded-[1.5rem] border-none bg-slate-50 font-bold text-slate-600 focus:ring-0">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.25rem]">
                            <SelectItem value="all-courses">All Courses</SelectItem>
                            <SelectItem value="cs">Comp Sci</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="user">
                        <SelectTrigger className="h-12 w-[160px] rounded-[1.5rem] border-none bg-slate-50 font-bold text-slate-600 focus:ring-0">
                            <User className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Individual User" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.25rem]">
                            <SelectItem value="user">Individual User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="h-12 w-[140px] rounded-[1.5rem] border-none bg-slate-50 font-bold text-slate-600 focus:ring-0">
                            <SelectValue placeholder="Last 30 Days" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1.25rem]">
                            <SelectItem value="last-7">Last 7 Days</SelectItem>
                            <SelectItem value="last-30">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((card, i) => (
                    <Card key={i} className="border-slate-100 shadow-sm rounded-[2rem] bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-400">{card.title}</p>
                                <card.icon className={cn("w-5 h-5", card.color)} />
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-slate-900">{card.value}</h3>
                                    <p className={cn(
                                        "text-xs font-black flex items-center gap-1",
                                        card.isPositive ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {card.trend}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", card.bg)}
                                    style={{ width: `${card.progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Performance Chart */}
                <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Student Performance by Course</CardTitle>
                        <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/5 gap-2 rounded-xl">
                            Details <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10 h-[400px]">
                        <div className="h-full w-full flex items-end justify-between gap-6 pt-10 px-4 mt-6">
                            {[
                                { label: "MATH 101", height: "85%", color: "bg-primary/10" },
                                { label: "PHYSICS", height: "65%", color: "bg-primary/10" },
                                { label: "HISTORY", height: "45%", color: "bg-primary/10" },
                                { label: "BIOLOGY", height: "75%", color: "bg-primary/10" },
                                { label: "DESIGN", height: "95%", color: "bg-primary/10" }
                            ].map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-6 group">
                                    <div className="w-full relative h-[250px] flex items-end">
                                        <div
                                            className={cn("w-full rounded-2xl transition-all duration-1000 group-hover:bg-primary/20", bar.color)}
                                            style={{ height: bar.height }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Active Students Chart */}
                <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Daily Active Students</CardTitle>
                            <p className="text-xs font-bold text-slate-400 mt-1">User engagement over the last 7 days</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/20" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 h-[400px] relative">
                        <div className="h-full w-full pt-10 mt-6 relative">
                            {/* SVG Line Chart */}
                            <svg className="w-full h-full" overflow="visible">
                                <path
                                    d="M0,150 100,160 200,140 300,90 400,105 500,120 600,60"
                                    fill="url(#gradient-line)"
                                    className="opacity-10"
                                    transform="scale(1.2) translate(20, 20)"
                                />
                                <defs>
                                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: 'oklch(var(--primary))', stopOpacity: 0.5 }} />
                                        <stop offset="100%" style={{ stopColor: 'oklch(var(--primary))', stopOpacity: 0 }} />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,150 L100,165 L200,145 L300,95 L400,110 L500,125 L600,65"
                                    fill="none"
                                    stroke="oklch(var(--primary))"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="animate-[dash_3s_ease-out]"
                                    transform="scale(1.2, 1.2) translate(0, 0)"
                                />
                                {/* Data Points */}
                                {[
                                    { x: 0, y: 150 }, { x: 100, y: 165 }, { x: 200, y: 145 },
                                    { x: 300, y: 95 }, { x: 400, y: 110 }, { x: 500, y: 125 }, { x: 600, y: 65 }
                                ].map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={p.x * 1.2}
                                        cy={p.y * 1.2}
                                        r="6"
                                        fill="oklch(var(--primary))"
                                        className="shadow-xl"
                                    />
                                ))}
                            </svg>
                            <div className="absolute bottom-0 w-full flex justify-between px-2 pt-6">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                                    <span key={i} className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{day}</span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Students Activity Table */}
            <Card className="border-slate-100 shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Recent Student Activities</CardTitle>
                    <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/5 rounded-xl">
                        View All
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc]/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-50">
                                <tr>
                                    <th className="px-10 py-6">Student</th>
                                    <th className="py-6">Course</th>
                                    <th className="py-6">Activity</th>
                                    <th className="py-6">Date</th>
                                    <th className="px-10 py-6 text-right">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {studentActivities.map((act) => (
                                    <tr key={act.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm relative group-hover:scale-110 transition-transform",
                                                    act.status === "emerald" ? "bg-emerald-50 text-emerald-600" :
                                                        act.status === "blue" ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-600"
                                                )}>
                                                    {act.id}
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", act.status === "blue" ? "bg-primary" : `bg-${act.status}-500`)} />
                                                    </div>
                                                </div>
                                                <span className="font-extrabold text-slate-900 leading-tight">
                                                    {act.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-8">
                                            <span className="text-sm font-bold text-slate-500">{act.course}</span>
                                        </td>
                                        <td className="py-8">
                                            <Badge className={cn(
                                                "rounded-lg font-black text-[9px] px-2 py-1 tracking-widest uppercase border-none",
                                                act.status === "emerald" ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100" :
                                                    act.status === "blue" ? "bg-primary/10 text-primary shadow-sm shadow-primary/20" :
                                                        "bg-orange-50 text-orange-500 shadow-sm shadow-orange-100"
                                            )}>
                                                {act.activity}
                                            </Badge>
                                        </td>
                                        <td className="py-8">
                                            <span className="text-sm font-bold text-slate-500">{act.date}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className={cn(
                                                "font-black text-sm",
                                                act.score === "Pending" ? "text-slate-400 italic" : "text-slate-900"
                                            )}>
                                                {act.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

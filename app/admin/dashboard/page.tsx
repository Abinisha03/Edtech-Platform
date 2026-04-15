"use client";

import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Users,
    BookOpen,
    Zap,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    ArrowUpRight,
    Search,
    Filter,
    Calendar,
    ChevronDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

export default function AdminDashboardPage() {
    const metrics = useQuery(api.users.getSystemMetrics);

    if (metrics === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
                <div className="bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Your account does not have administrator privileges.
                        Please ensure you are logged in with an admin account or contact the system owner.
                    </p>
                </div>
                <Button asChild className="rounded-xl px-8">
                    <Link href="/user/dashboard">Go to User Dashboard</Link>
                </Button>
            </div>
        );
    }

    if (metrics === undefined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Syncing real-time dashboard data...</p>
            </div>
        );
    }

    const {
        totalUsers,
        totalCourses,
        userGrowth,
        courseGrowth,
        systemActivity,
        engagementData,
        performanceData,
        recentActivity
    } = metrics;

    const notifications = [
        { id: 1, type: "critical", title: "Critical: Database latency spike", description: "Latency increased by 40% in EU region", time: "12:45 PM", color: "bg-red-500" },
        { id: 2, type: "warning", title: "Warning: Content storage 85% full", description: "Expansion recommended within 48 hours", time: "11:20 AM", color: "bg-amber-500" },
        { id: 3, type: "info", title: "Info: New course requests (12)", description: "Waiting for administrative approval", time: "09:15 AM", color: "bg-primary" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Card className="border-none shadow-sm bg-card overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Users</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-black text-foreground">{totalUsers.toLocaleString()}</h3>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">Total registered users</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Courses</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-black text-foreground">{totalCourses}</h3>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">Total active courses</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Activity</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-black text-foreground">Active</h3>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">Real-time uptime monitoring</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                <Zap className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-card p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Course Engagement</h3>
                            <p className="text-xs text-muted-foreground font-medium">Daily active interactions by category</p>
                        </div>
                        <Button variant="outline" size="sm" className="bg-muted border-none text-[10px] font-bold h-8 rounded-xl">
                            Last 7 Days <ChevronDown className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={engagementData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Interactions"
                                    stroke="oklch(var(--primary))"
                                    strokeWidth={4}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-card p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Course Performance</h3>
                            <p className="text-xs text-muted-foreground font-medium">Enrollments vs Completions</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Enrollments</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Completions</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="enrollments" fill="oklch(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="completions" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Logs Table */}
                <Card className="xl:col-span-2 border-none shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border px-8 py-6">
                        <CardTitle className="text-lg font-bold text-foreground">Recent System Logs</CardTitle>
                        <Button variant="link" className="text-primary text-xs font-bold p-0 h-auto">View All</Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none">
                                    <TableHead className="px-8 text-[10px] font-bold text-primary uppercase tracking-widest">Event</TableHead>
                                    <TableHead className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin</TableHead>
                                    <TableHead className="text-[10px] font-bold text-primary uppercase tracking-widest">Timestamp</TableHead>
                                    <TableHead className="text-[10px] font-bold text-primary uppercase tracking-widest">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map((log: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-muted/50 border-border">
                                        <TableCell className="px-8 py-5">
                                            <span className="text-sm font-semibold text-foreground/80">{log.description}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-muted-foreground">System</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-muted-foreground/80">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "rounded-lg px-2.5 py-1 text-[10px] font-bold flex w-fit items-center gap-1.5 border-none shadow-none bg-primary/10 text-primary"
                                                )}
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                Success
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="border-none shadow-sm bg-card p-8">
                    <h3 className="text-lg font-bold text-foreground mb-8 tracking-tight">Active Notifications</h3>
                    <div className="space-y-8">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="flex gap-4 relative">
                                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", notif.color)} />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-foreground leading-tight">{notif.title}</h4>
                                    <p className="text-xs text-primary font-medium">{notif.description}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">{notif.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" className="w-full mt-10 rounded-xl border-border text-muted-foreground text-xs font-bold hover:bg-muted">
                        Clear All Logs
                    </Button>
                </Card>
            </div>
        </div>
    );
}

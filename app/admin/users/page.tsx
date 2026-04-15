"use client";

import { useState } from "react";
import {
    Users,
    Search,
    Filter,
    Plus,
    Download,
    MoreVertical,
    Eye,
    Edit2,
    UserX,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Clock,
    X,
    ExternalLink,
    ShieldCheck
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// Manual date formatting
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
};
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock Data removed

export default function UserManagementPage() {
    const enrollments = useQuery(api.enrollments.getEnrolledStudents);
    const stats = useQuery(api.enrollments.getEnrollmentStats);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const exportToCSV = () => {
        if (!enrollments || enrollments.length === 0) return;

        const headers = ["Full Name", "Email", "Course", "Enrollment Date", "Payment Status", "Amount"];
        const rows = enrollments.map(e => [
            e.fullName,
            e.email,
            e.courseName,
            new Date(e.enrollmentDate).toLocaleDateString(),
            e.paymentStatus,
            `₹${e.amount}`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `enrollments_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Deduplicate enrollments to show unique users
    const uniqueEnrollments = enrollments?.reduce((acc: any[], current) => {
        const existingUser = acc.find(item => item.email === current.email);
        if (existingUser) {
            existingUser.courses.push(current.courseName);
            // Keep the latest enrollment details if needed, or just aggregate
            return acc;
        } else {
            return acc.concat([{ ...current, courses: [current.courseName] }]);
        }
    }, []) || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ... Header and Stats sections unchanged ... */}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-primary font-semibold">User Management</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">User Management</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Oversee student enrollments, financial statuses, and account roles with advanced administration tools.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl font-bold gap-2" onClick={exportToCSV}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2">
                        <Plus className="w-5 h-5" />
                        Add New User
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="TOTAL STUDENTS"
                    value={stats?.totalStudents?.toString() || "0"}
                    icon={Users}
                />
                <MetricCard
                    title="TOTAL REVENUE"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
                    icon={DollarSign}
                />
                <MetricCard
                    title="PENDING PAYMENTS"
                    value={stats?.pendingPayments?.toString() || "0"}
                    icon={Clock}
                />
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or role..."
                            className="w-full pl-11 h-11 bg-card border-border rounded-2xl focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" className="h-11 rounded-xl text-muted-foreground border-border bg-card gap-2 flex-1 md:flex-none">
                            <span className="font-semibold">All Roles</span>
                        </Button>
                        <Button variant="outline" className="h-11 rounded-xl text-muted-foreground border-border bg-card gap-2 flex-1 md:flex-none">
                            <span className="font-semibold">Payment Status</span>
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="py-4 font-bold text-muted-foreground px-6">USER</TableHead>
                                <TableHead className="font-bold text-muted-foreground">EMAIL</TableHead>
                                <TableHead className="font-bold text-muted-foreground">ROLE</TableHead>
                                <TableHead className="font-bold text-muted-foreground">COURSES</TableHead>
                                <TableHead className="font-bold text-muted-foreground">STATUS</TableHead>
                                <TableHead className="font-bold text-muted-foreground">PAYMENT</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-right pr-6">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {uniqueEnrollments?.map((user) => (
                                <TableRow key={user._id} className="group hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewUser(user)}>
                                    <TableCell className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-border">
                                                <AvatarImage src={user.imageUrl || undefined} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {user.fullName.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-foreground leading-tight">{user.fullName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Joined {formatDate(user.enrollmentDate)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={cn(
                                            "rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-wider",
                                            user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground leading-tight">
                                                {user.courses?.length > 1 ? `${user.courses.length} Courses` : user.courseName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                {user.courses?.length > 1 ? "Enrolled" : "Course"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                "text-primary"
                                            )}>
                                                ACTIVE
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase",
                                            user.paymentStatus === "PAID" ? "bg-primary/10 text-primary border-primary/20" :
                                                "bg-muted text-muted-foreground border-border"
                                        )} variant="outline">
                                            {user.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 border-t border-border flex items-center justify-between bg-card text-sm text-muted-foreground font-medium">
                    <p>Showing {enrollments?.length || 0} students</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl px-3 h-9 font-bold border-border">
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button size="sm" className="w-9 h-9 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20">1</Button>
                            <Button variant="ghost" size="sm" className="w-9 h-9 font-bold text-muted-foreground rounded-xl hover:bg-muted">2</Button>
                            <Button variant="ghost" size="sm" className="w-9 h-9 font-bold text-muted-foreground rounded-xl hover:bg-muted">3</Button>
                            <span className="px-2">...</span>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl px-3 h-9 font-bold border-border">
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* User Details Drawer Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">User Details</h2>
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted" onClick={() => setIsDrawerOpen(false)}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-4 border-card shadow-xl">
                                        <AvatarImage src={selectedUser?.imageUrl || undefined} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold uppercase">
                                            {selectedUser?.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {selectedUser?.status === "ACTIVE" && (
                                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary border-4 border-card rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">{selectedUser?.fullName}</h3>
                                    <p className="text-muted-foreground font-medium">{selectedUser?.email}</p>
                                </div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-widest text-[10px]">
                                    {selectedUser?.role === "ADMIN" ? "ADMINISTRATOR" : "STUDENT"}
                                </Badge>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">ENROLLMENT HISTORY</h4>
                                    <div className="space-y-3">
                                        {enrollments?.filter((e: any) => e.email === selectedUser?.email).map((enrollment: any) => (
                                            <div key={enrollment._id} className="p-4 bg-muted/50 rounded-2xl border border-border group hover:border-primary/20 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-foreground">{enrollment.courseName}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">Enrolled: {formatDate(enrollment.enrollmentDate)}</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-background/50 text-[10px] h-5 px-2">
                                                        {enrollment.paymentStatus}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {enrollments?.filter((e: any) => e.email === selectedUser?.email).length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">No enrollments found.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TRANSACTION LOG</h4>
                                    </div>
                                    <div className="space-y-5">
                                        {enrollments?.filter((e: any) => e.email === selectedUser?.email).map((enrollment: any) => (
                                            <div key={enrollment._id} className="flex gap-4 relative">
                                                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10 shrink-0" />
                                                <div className="flex-1 border-l-2 border-border border-dashed pl-6 pb-2 last:border-0 last:pb-0">
                                                    <div className="absolute left-[3.5px] top-4 h-full w-[1px] bg-border last:hidden" />
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-foreground text-sm">Course Enrollment</p>
                                                            <p className="text-[11px] text-muted-foreground mt-1">₹{enrollment.amount} • {enrollment.courseName}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground">{formatDate(enrollment.enrollmentDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-border bg-muted/30 space-y-3">
                            <Button className="w-full h-12 bg-card hover:bg-muted/50 text-foreground border-border border-2 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] gap-2">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                            <Button variant="ghost" className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold gap-2">
                                <UserX className="w-4 h-4" />
                                Deactivate Account
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon: Icon
}: {
    title: string;
    value: string;
    icon: any
}) {
    return (
        <Card className="rounded-[2rem] border-border shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card">
            <CardContent className="p-7">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">{title}</p>
                    <h3 className="text-3xl font-black text-foreground">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );
}

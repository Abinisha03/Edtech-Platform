"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    ChevronRight,
    Plus,
    Pencil,
    Trash2,
    Eye,
    ArrowRight,
    FileText,
    TrendingUp,
    SearchX,
    GraduationCap,
    HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AssignmentManagementPage() {
    const [activeTab, setActiveTab] = useState<"assignments" | "quizzes">("assignments");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const courses = useQuery(api.courses.listAll) || [];
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const rawAssignments = useQuery(api.assignments.get);
    const deleteAssignment = useMutation(api.assignments.deleteAssignment);

    // Initial loading state or empty data
    const allStats = rawAssignments || [];

    // Filter by type (Assignment vs Quiz)
    const data = allStats.filter(item =>
        activeTab === "assignments" ? item.type === "assignment" : item.type === "quiz"
    );

    // Data Processing: Filter -> Sort -> Paginate
    const filteredData = data.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.course.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = selectedCourse === "all" || item.courseId === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortBy === "newest") return b._creationTime - a._creationTime;
        if (sortBy === "oldest") return a._creationTime - b._creationTime;
        if (sortBy === "submissions") return b.submissions - a.submissions;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = async (id: Id<"assignments">) => {
        await deleteAssignment({ id });
    };

    const handleTabChange = (tab: "assignments" | "quizzes") => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    // Calculate metrics
    const totalSubmissions = allStats.reduce((acc, curr) => acc + curr.submissions, 0);
    // Placeholder for average score if we had that data, for now static or 0
    const averageScore = "84.5%";

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 font-inter">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-bold">Assignments & Quizzes</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Management Dashboard</h1>
                    <p className="text-slate-500 font-medium">Oversee all course assessments and student progress.</p>
                </div>
                <Link href="/admin/assignments/new">
                    <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2 px-8">
                        <Plus className="w-5 h-5 text-white" />
                        Create New Assessment
                    </Button>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                    <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Submissions</p>
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900">{totalSubmissions}</h3>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>+12% from last month</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                    <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Average Score</p>
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-slate-900">{averageScore}</h3>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>+3.2% vs baseline</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-primary text-white">
                    <CardContent className="p-8 space-y-4">
                        <p className="text-[11px] font-black text-white/60 uppercase tracking-widest">Quick Actions</p>
                        <div className="space-y-3 pt-1">
                            <Link href="/admin/assignments/analytics" className="flex items-center justify-between w-full group py-2">
                                <span className="font-bold text-sm">View Detailed Analytics</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="h-[1px] bg-white/10" />
                            <Link href="/admin/courses" className="flex items-center justify-between w-full group py-2">
                                <span className="font-bold text-sm">Return to Course Management</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-slate-100">
                    <button
                        onClick={() => handleTabChange("assignments")}
                        className={cn(
                            "flex items-center gap-2 pb-4 text-sm font-black transition-all relative cursor-pointer",
                            activeTab === "assignments"
                                ? "text-primary"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        Assignments
                        {activeTab === "assignments" && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_oklch(var(--primary)/0.3)]" />
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange("quizzes")}
                        className={cn(
                            "flex items-center gap-2 pb-4 text-sm font-black transition-all relative cursor-pointer",
                            activeTab === "quizzes"
                                ? "text-primary"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <HelpCircle className="w-4 h-4" />
                        Quizzes
                        {activeTab === "quizzes" && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_8px_oklch(var(--primary)/0.3)]" />
                        )}
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or course..."
                            className="h-12 bg-white border-slate-200/60 rounded-xl pl-11 focus-visible:ring-primary/20 placeholder:text-slate-400 font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="h-12 bg-white border-slate-200/60 rounded-xl px-4 min-w-[150px] font-bold text-slate-700 cursor-pointer">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl font-semibold">
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-12 bg-white border-slate-200/60 rounded-xl px-4 min-w-[150px] font-bold text-slate-700 cursor-pointer">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl font-semibold">
                                <SelectItem value="newest">Sort by: Newest</SelectItem>
                                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                                <SelectItem value="submissions">Sort by: Submissions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Section */}
                <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-6 px-8">Assignment Details</TableHead>
                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-6">Course</TableHead>
                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-6 text-center">Submissions</TableHead>
                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-6 text-center">Due Date</TableHead>
                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest py-6 text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item._id} className="group hover:bg-slate-50/50 transition-all border-slate-50 last:border-0">
                                            <TableCell className="py-6 px-8">
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-900 leading-tight">{item.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6">
                                                <span className="text-sm font-bold text-primary hover:underline cursor-pointer transition-all decoration-2 underline-offset-4">
                                                    {item.course}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-6 text-center">
                                                <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                                                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                                                        <span>{item.submissions}/{item.maxSubmissions}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                                            style={{ width: `${item.maxSubmissions > 0 ? (item.submissions / item.maxSubmissions) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 text-center">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-600 text-sm">
                                                        {new Date(item.dueDate).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    {new Date(item.dueDate) < new Date() && (
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Ended</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-6 text-right pr-8">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/assignments/${activeTab === "assignments" ? "assignment" : "quiz"}/${item._id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/assignments/${activeTab === "assignments" ? "assignment" : "quiz"}/${item._id}/view`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-10">
                                                            <AlertDialogHeader className="space-y-4">
                                                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-2">
                                                                    <Trash2 className="w-8 h-8" />
                                                                </div>
                                                                <AlertDialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                                                                    Delete this {activeTab === "assignments" ? "Assignment" : "Quiz"}?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">
                                                                    This action cannot be undone. All student submissions and associated data for <span className="text-slate-900 font-bold underline decoration-red-200 decoration-4 underline-offset-4">{item.title}</span> will be permanently removed.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="mt-8 gap-4">
                                                                <AlertDialogCancel className="h-12 rounded-xl font-bold px-8 border-slate-200">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(item._id)}
                                                                    className="h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold px-8 shadow-lg shadow-red-200 cursor-pointer"
                                                                >
                                                                    Permanently Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24">
                                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                                <div className="p-4 bg-slate-50 text-slate-300 rounded-[2rem]">
                                                    <SearchX className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">No results found</p>
                                                    <p className="text-sm font-medium text-slate-400">Try adjusting your search or filters.</p>
                                                    <div className="mt-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {/* Implement seed or just encourage creation */ }}
                                                        >
                                                            Create your first {activeTab === "assignments" ? "Assignment" : "Quiz"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <p className="text-sm font-bold text-slate-400">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0)} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} {activeTab}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl border-slate-200 disabled:opacity-30 cursor-pointer"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "h-10 w-10 rounded-xl font-bold cursor-pointer",
                                        page === currentPage ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-400 hover:text-primary border-none shadow-none"
                                    )}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl border-slate-200 disabled:opacity-30 cursor-pointer"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

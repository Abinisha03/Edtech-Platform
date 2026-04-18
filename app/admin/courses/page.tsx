"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
    BookOpen,
    Search,
    Plus,
    Download,
    ChevronRight,
    Pencil,
    Trash2,
    ChevronLeft,
    MoreHorizontal
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";



import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function CourseManagementPage() {
    const convexCourses = useQuery(api.courses.listAll);
    const deleteCourse = useMutation(api.courses.deleteCourse);
    const [currentPage, setCurrentPage] = useState(1);

    const handleDeleteCourse = async (id: Id<"courses">) => {
        await deleteCourse({ id });
    };

    const courses = convexCourses?.map(c => ({
        id: c._id,
        title: c.title,
        thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=200&auto=format&fit=crop",
        lastUpdated: new Date(c._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: c.status === "published" ? "Published" : "Draft",
    })) || [];

    const totalPages = Math.ceil(courses.length / 4);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span>Home</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                        <span className="text-primary font-semibold">Course Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Course Management</h1>
                    <p className="text-muted-foreground max-w-2xl font-medium">
                        Manage, update, and monitor all educational offerings with a unified administration dashboard.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-xl font-bold gap-2 px-6 border-border">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Link href="/admin/courses/new">
                        <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-6">
                            <Plus className="w-5 h-5" />
                            Create New Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-[500px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by course title or instructor..."
                        className="w-full pl-11 h-12 bg-muted/50 border-none rounded-2xl focus-visible:ring-primary/20 placeholder:text-muted-foreground font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl text-muted-foreground bg-muted/50 hover:bg-muted gap-4 font-bold min-w-[140px] justify-between">
                        <span>All Status</span>
                        <ChevronRight className="w-4 h-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" className="h-12 px-6 rounded-2xl text-muted-foreground bg-muted/50 hover:bg-muted gap-4 font-bold min-w-[140px] justify-between">
                        <span>Category</span>
                        <ChevronRight className="w-4 h-4 rotate-90" />
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card border border-border/60 rounded-[2.5rem] shadow-sm overflow-hidden pb-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="py-6 font-black text-[11px] text-muted-foreground uppercase tracking-widest px-8">COURSE TITLE</TableHead>
                                <TableHead className="py-6 font-black text-[11px] text-muted-foreground uppercase tracking-widest text-center">LAST UPDATED</TableHead>
                                <TableHead className="py-6 font-black text-[11px] text-muted-foreground uppercase tracking-widest text-center">STATUS</TableHead>
                                <TableHead className="py-6 font-black text-[11px] text-muted-foreground uppercase tracking-widest text-right pr-12">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id} className="group hover:bg-muted/50 transition-all border-b border-border/50 last:border-0">
                                    <TableCell className="py-5 px-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/50 shadow-sm">
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-base tracking-tight leading-none">{course.title}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-bold text-muted-foreground">{course.lastUpdated}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider",
                                            course.status === "Published"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 shadow-sm shadow-emerald-50"
                                                : "bg-muted text-muted-foreground border-border hover:bg-muted"
                                        )} variant="outline">
                                            <div className={cn("w-1.5 h-1.5 rounded-full mr-2", course.status === "Published" ? "bg-emerald-500" : "bg-muted-foreground")} />
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-12">
                                        <div className="flex items-center justify-end gap-2 px-1 py-1" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </Button>
                                            </Link>

                                            <Link href={`/admin/courses/${course.id}/content`}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-colors" title="Manage Content">
                                                    <BookOpen className="w-4.5 h-4.5" />
                                                </Button>
                                            </Link>


                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2rem] p-8 border-border shadow-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogMedia>
                                                            <div className="bg-destructive/10 p-2 rounded-lg">
                                                                <Trash2 className="w-6 h-6 text-destructive" />
                                                            </div>
                                                        </AlertDialogMedia>
                                                        <AlertDialogTitle className="text-xl font-black text-foreground">Delete Course?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-sm font-semibold text-muted-foreground">
                                                            This action cannot be undone. This will permanently delete course <span className="text-foreground font-bold">"{course.title}"</span>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-6 gap-3">
                                                        <AlertDialogCancel className="h-12 rounded-xl font-bold border-border">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="h-12 rounded-xl font-bold bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 text-destructive-foreground"
                                                            onClick={() => handleDeleteCourse(course.id)}
                                                        >
                                                            Yes, Delete Course
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="px-8 py-6 border-t border-border/50 flex items-center justify-between text-sm">
                    <p className="font-semibold text-muted-foreground tracking-tight">
                        Showing <span className="text-foreground font-black">{courses.length}</span> course{courses.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3].map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    className={cn(
                                        "w-9 h-9 rounded-xl font-bold transition-all",
                                        currentPage === page
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                            : "bg-transparent text-muted-foreground hover:bg-muted"
                                    )}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors disabled:opacity-30"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

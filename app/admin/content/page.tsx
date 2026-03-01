"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Bell,
    ChevronRight,
    PlayCircle,
    FileText,
    File,
    Upload,
    Plus,
    Pencil,
    Trash2,
    CheckCircle2,
    CloudUpload,
    ArrowRight,
    SearchX,
    FileType,
    AlertCircle
} from "lucide-react";
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
import { cn } from "@/lib/utils";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function ContentManagementPage() {
    const convexCourses = useQuery(api.courses.listAll);
    const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadingForVideoId, setUploadingForVideoId] = useState<Id<"courseMaterials"> | null>(null);

    // Fetch materials for selected course
    const materials = useQuery(
        api.materials.listByCourse,
        selectedCourseId ? { courseId: selectedCourseId } : "skip"
    );

    const addMaterialMutation = useMutation(api.materials.addMaterial);
    const deleteMaterialMutation = useMutation(api.materials.deleteMaterial);

    // Filter courses locally
    const filteredCourses = convexCourses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const activeCourse = convexCourses?.find(c => c._id === selectedCourseId);

    // Initial selection
    useEffect(() => {
        if (convexCourses && convexCourses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(convexCourses[0]._id);
        }
    }, [convexCourses, selectedCourseId]);

    // Refs for hidden file inputs
    const noteInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    // Group materials
    const videoTutorials = materials?.filter(m => m.type === "video") || [];
    const allResources = materials?.filter(m => m.type === "note" || m.type === "pdf") || [];

    // Create a map of videoId -> resources
    const resourcesByVideo = videoTutorials.reduce((acc, video) => {
        acc[video._id] = allResources.filter(r => r.videoId === video._id);
        return acc;
    }, {} as Record<string, typeof allResources>);

    // Find orphaned resources (no videoId)
    const generalResources = allResources.filter(r => !r.videoId);

    // Handlers
    const onUploadClick = (type: 'note' | 'pdf', videoId?: Id<"courseMaterials">) => {
        setUploadingForVideoId(videoId || null);
        if (type === 'note') noteInputRef.current?.click();
        else pdfInputRef.current?.click();
    };

    const generateUploadUrl = useMutation(api.materials.generateUploadUrl);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'note' | 'pdf') => {
        const file = e.target.files?.[0];
        if (!file || !selectedCourseId) return;

        try {
            // 1. Get secure upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file to Convex Storage
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error("Upload failed");

            const { storageId } = await result.json();

            // 3. Save metadata to DB with storage ID
            await addMaterialMutation({
                courseId: selectedCourseId,
                type: type,
                title: file.name,
                videoId: uploadingForVideoId || undefined,
                fileId: storageId, // Store the reference
                size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
                status: "Active"
            });
            toast.success(`${type === 'note' ? 'Note' : 'PDF'} uploaded successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload material");
        } finally {
            setUploadingForVideoId(null);
            // Reset input
            e.target.value = "";
        }
    };

    const handleDelete = async (id: Id<"courseMaterials">) => {
        try {
            await deleteMaterialMutation({ id });
            toast.success("Material deleted successfully");
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Hidden Inputs */}
            <input
                type="file"
                ref={noteInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'note')}
                accept=".docx,.txt,.md,.pdf"
            />
            <input
                type="file"
                ref={pdfInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'pdf')}
                accept=".pdf"
            />

            {/* Top Navigation Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Link href="/admin/dashboard" className="hover:text-slate-600 transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-slate-900 font-bold">Content Management</span>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/courses"
                        className="text-primary font-bold text-sm underline-offset-4 hover:underline decoration-2 flex items-center gap-1.5"
                    >
                        Go to Course Management
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-slate-100/50 border-none rounded-xl focus-visible:ring-primary/20 placeholder:text-slate-400 text-sm"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-white hover:text-primary rounded-xl relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8faff]" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Course Selector (Same as before) */}
                <div className="xl:col-span-3 space-y-4 font-inter">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Your Courses</h2>
                    <div className="space-y-3 min-h-[300px]">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <button
                                    key={course._id}
                                    onClick={() => setSelectedCourseId(course._id)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between group",
                                        selectedCourseId === course._id
                                            ? "bg-white border-primary shadow-lg shadow-primary/5 ring-1 ring-primary"
                                            : "bg-white/50 border-slate-200/60 hover:border-slate-300 hover:bg-white"
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className={cn(
                                            "font-bold text-sm mb-1 truncate",
                                            selectedCourseId === course._id ? "text-slate-900" : "text-slate-600"
                                        )}>
                                            {course.title}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {course.status}
                                        </p>
                                    </div>
                                    {selectedCourseId === course._id && (
                                        <div className="bg-primary rounded-full p-1 shadow-md shadow-primary/20">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/30 rounded-[2rem] border border-dashed border-slate-200">
                                <div className="p-4 bg-slate-50 rounded-2xl mb-4 text-slate-300">
                                    <SearchX className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">No courses found</h3>
                                <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-[150px]">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Content Viewer */}
                <div className="xl:col-span-9 space-y-8 font-inter">
                    {activeCourse ? (
                        <>
                            {/* Course Header */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeCourse.title}</h1>
                                    <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
                                        Manage lessons and attach materials directly to each video tutorial.
                                    </p>
                                </div>
                                <Link href={`/admin/content/videos/new?courseId=${activeCourse._id}`}>
                                    <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 gap-3 px-8">
                                        <Plus className="w-5 h-5 text-white" />
                                        Add New Video Lesson
                                    </Button>
                                </Link>
                            </div>

                            {/* Video Lessons List */}
                            <div className="space-y-4">
                                {videoTutorials.length > 0 ? (
                                    videoTutorials.map((video) => {
                                        const resources = resourcesByVideo[video._id] || [];
                                        return (
                                            <div key={video._id} className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden group">
                                                {/* Video Header Row */}
                                                <div className="p-4 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                                        <PlayCircle className="w-5 h-5 text-primary/80" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{video.title}</h3>
                                                                    <Badge className={cn("rounded-md px-1.5 py-0 text-[9px] font-bold uppercase", video.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                                                        {video.status}
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                                    {video.duration || "No duration"}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <Link href={`/admin/content/video/${video._id}/edit`}>
                                                                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5">
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(video._id)}
                                                                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resources Section & Actions */}
                                                <div className="bg-slate-50/50 border-t border-slate-100 p-4 pt-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                                            Materials ({resources.length})
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => onUploadClick('note', video._id)}
                                                                className="h-7 px-3 rounded-lg text-[9px] font-bold uppercase border-slate-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary gap-1.5"
                                                            >
                                                                <FileText className="w-3 h-3" /> Note
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => onUploadClick('pdf', video._id)}
                                                                className="h-7 px-3 rounded-lg text-[9px] font-bold uppercase border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 gap-1.5"
                                                            >
                                                                <File className="w-3 h-3" /> PDF
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Resources List */}
                                                    {resources.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {resources.map(res => {
                                                                // Identify ghost files (no fileId and no stored URL)
                                                                const isBroken = !res.fileId && !res.url;

                                                                return (
                                                                    <div key={res._id} className={cn(
                                                                        "flex items-center gap-2.5 p-2 rounded-lg border shadow-sm group/res transition-all",
                                                                        isBroken
                                                                            ? "bg-red-50/50 border-red-200"
                                                                            : "bg-white border-slate-200/60"
                                                                    )}>
                                                                        <div className={cn(
                                                                            "p-1.5 rounded-md shrink-0",
                                                                            isBroken ? "bg-red-100 text-red-600" :
                                                                                res.type === 'note' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                                                                        )}>
                                                                            {isBroken ? <AlertCircle className="w-3.5 h-3.5" /> :
                                                                                res.type === 'note' ? <FileText className="w-3.5 h-3.5" /> : <File className="w-3.5 h-3.5" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <p className={cn("text-[11px] font-bold truncate leading-tight", isBroken ? "text-red-700" : "text-slate-900")}>
                                                                                    {res.title}
                                                                                </p>
                                                                                {isBroken && (
                                                                                    <Badge className="h-4 px-1 rounded-sm bg-red-100 text-red-600 border-none text-[8px] uppercase tracking-wider font-black">
                                                                                        Broken
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className={cn("text-[9px] font-medium", isBroken ? "text-red-400" : "text-slate-400")}>
                                                                                {isBroken ? "Re-upload required" : res.size}
                                                                            </p>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleDelete(res._id)}
                                                                            className={cn(
                                                                                "h-6 w-6 rounded-md transition-opacity",
                                                                                isBroken
                                                                                    ? "text-red-500 hover:bg-red-200 hover:text-red-700 bg-red-100 opacity-100"
                                                                                    : "text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/res:opacity-100"
                                                                            )}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                                            <p className="text-[10px] font-bold text-slate-400">No materials attached yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <PlayCircle className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">No videos yet</h3>
                                        <p className="text-slate-500 text-xs font-medium mb-4">Start by adding the first video lesson.</p>
                                        <Link href={`/admin/content/videos/new?courseId=${activeCourse._id}`}>
                                            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 rounded-lg font-bold text-xs h-9 px-4">
                                                Add First Video
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                                <SearchX className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Course Not Selected</h2>
                                <p className="text-slate-500 font-medium">Please select a course from the left to manage its content.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
}

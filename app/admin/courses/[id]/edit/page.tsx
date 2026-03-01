"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Upload,
    Image as ImageIcon,
    Save,
    X,
    LayoutGrid,
    Type,
    FileText,
    DollarSign,
    Target,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as Id<"courses">;

    const course = useQuery(api.courses.getById, { id: courseId });
    const updateCourse = useMutation(api.courses.updateCourse);

    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("development");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("draft");
    const [thumbnail, setThumbnail] = useState("");

    useEffect(() => {
        if (course) {
            setTitle(course.title);
            setDescription(course.description);
            setCategory(course.category || "development");
            setPrice(course.price.toString());
            setStatus(course.status);
            setThumbnail(course.thumbnail || "");
        }
    }, [course]);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateCourse({
                id: courseId,
                title,
                description,
                category,
                price: parseFloat(price) || 0,
                status,
                thumbnail,
            });
            router.push("/admin/courses");
        } catch (error) {
            console.error("Failed to update course:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!course) {
        return (
            <div className="h-[60vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading course data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/admin/courses" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group mb-2 w-fit">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Courses
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        Edit Course
                        <Badge variant="outline" className="text-xs py-1 rounded-lg uppercase bg-primary/5 text-primary border-primary/10">ID: {course._id}</Badge>
                    </h1>
                    <p className="text-slate-500 font-medium">Update your course information, pricing, and visibility settings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-xl font-bold px-6 border-slate-200 hover:bg-slate-50" onClick={() => router.back()}>
                        Discard Changes
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Update Course
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            {/* Course Title */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Type className="w-4 h-4 text-primary" />
                                    <Label htmlFor="title" className="text-base">Course Title</Label>
                                </div>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 text-lg font-semibold placeholder:text-slate-400"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <Label htmlFor="description" className="text-base">Course Description</Label>
                                </div>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[200px] bg-slate-50 border-none rounded-[2rem] focus-visible:ring-primary/20 font-medium text-slate-600 p-6"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                {/* Category */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <LayoutGrid className="w-4 h-4 text-primary" />
                                        <Label className="text-base">Course Category</Label>
                                    </div>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-primary/20 font-semibold px-6">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-semibold">
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="development">Development</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        <Label htmlFor="price" className="text-base">Course Price (₹)</Label>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 pl-10 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Assets Area */}
                <div className="space-y-8">
                    {/* Thumbnail Upload */}
                    <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                                <ImageIcon className="w-4 h-4 text-primary" />
                                <Label className="text-base">Course Thumbnail</Label>
                            </div>

                            <div className="group relative aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer transition-all hover:border-primary/40">
                                <img
                                    src={thumbnail || "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=200&auto=format&fit=crop"}
                                    className="w-full h-full object-cover transition-all group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <Upload className="w-8 h-8 text-white mb-2" />
                                    <p className="text-white font-bold text-sm">Change Image</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Settings */}
                    <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
                                <Target className="w-4 h-4 text-primary" />
                                <Label className="text-base">Course Visibility</Label>
                            </div>

                            <div className="space-y-4">
                                <div onClick={() => setStatus("published")} >
                                    <VisibilityToggle
                                        label="Published"
                                        description="Course is live for everyone."
                                        isActive={status === "published"}
                                    />
                                </div>
                                <div onClick={() => setStatus("draft")}>
                                    <VisibilityToggle
                                        label="Draft"
                                        description="Only admins can see this."
                                        isActive={status === "draft"}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function VisibilityToggle({ label, description, isActive }: { label: string, description: string, isActive: boolean }) {
    return (
        <div
            className={cn(
                "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-slate-50 bg-white hover:bg-slate-50/50"
            )}
        >
            <div className="flex items-center justify-between font-black text-xs tracking-tight uppercase">
                <span className={isActive ? "text-primary" : "text-slate-400"}>{label}</span>
                {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{description}</p>
        </div>
    );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
            className
        )}>
            {children}
        </span>
    );
}

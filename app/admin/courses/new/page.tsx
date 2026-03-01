"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Upload,
    Image as ImageIcon,
    Save,
    X,

    Type,
    FileText,
    DollarSign,
    Target,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CreateCoursePage() {
    const [status, setStatus] = useState("published");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const createCourse = useMutation(api.courses.createCourse);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!title) return;
        setIsSubmitting(true);

        try {
            const courseId = await createCourse({
                title,
                description,
                category: "Development",
                price: parseFloat(price) || 0,
                status: status === "published" ? "published" : "draft",
                modules: Math.floor(Math.random() * 12) + 1,
                lessons: Math.floor(Math.random() * 50) + 10,
                thumbnail: selectedImage || "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=200&auto=format&fit=crop"
            });
            router.push(`/admin/courses/${courseId}/success`);
        } catch (error) {
            console.error("Failed to create course:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/admin/courses" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group mb-2 w-fit">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Courses
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create New Course</h1>
                    <p className="text-slate-500 font-medium">Draft your next educational masterpiece and share it with the world.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-xl font-bold px-6 border-slate-200 hover:bg-slate-50">
                        Save as Draft
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isSubmitting || !title}
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Publish Course
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
                                    placeholder="e.g. Advanced UI Design Masterclass"
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 text-lg font-semibold placeholder:text-slate-400"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Keep it concise and descriptive.</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <Label htmlFor="description" className="text-base">Course Description</Label>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Tell your students what they will learn..."
                                    className="min-h-[200px] bg-slate-50 border-none rounded-[2rem] focus-visible:ring-primary/20 font-medium text-slate-600 p-6"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">


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
                                            placeholder="99.99"
                                            className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 pl-10 font-bold"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
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

                            <div
                                className="aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center group hover:bg-slate-100 transition-colors cursor-pointer border-spacing-4 relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedImage ? (
                                    <img src={selectedImage} className="absolute inset-0 w-full h-full object-cover" alt="Selected thumbnail" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-slate-900">Choose thumbnail image</p>
                                        <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">JPG, PNG, WEBP • MAX 2MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <p className="text-xs font-medium text-slate-500 leading-relaxed bg-primary/5 p-4 rounded-2xl">
                                <span className="text-primary font-black mr-1 underline">Note:</span>
                                High-quality thumbnails increase student engagement by up to 40%.
                            </p>
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
                                <div
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                        status === "published" ? "border-primary bg-primary/5" : "border-slate-50 bg-white"
                                    )}
                                    onClick={() => setStatus("published")}
                                >
                                    <div className="flex items-center justify-between font-black text-xs tracking-tight uppercase">
                                        <span className={status === "published" ? "text-primary" : "text-slate-400"}>Published</span>
                                        {status === "published" && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Course is live for everyone.</p>
                                </div>

                                <div
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                        status === "draft" ? "border-primary bg-primary/5" : "border-slate-50 bg-white"
                                    )}
                                    onClick={() => setStatus("draft")}
                                >
                                    <div className="flex items-center justify-between font-black text-xs tracking-tight uppercase">
                                        <span className={status === "draft" ? "text-primary" : "text-slate-400"}>Draft</span>
                                        {status === "draft" && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Only admins can see this.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    ChevronLeft,
    Save,
    PlayCircle,
    Youtube,
    Link as LinkIcon,
    Clock,
    Type,
    FileText,
    AlertCircle,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function AddVideoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId") as Id<"courses"> | null;

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [duration, setDuration] = useState("");
    const [status, setStatus] = useState("Active");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const urlInputRef = useRef<HTMLInputElement>(null);
    const addMaterial = useMutation(api.materials.addMaterial);

    const handleAddVideo = async () => {
        if (!title || !url || !courseId) {
            toast.error("Missing required information");
            return;
        }

        setIsSubmitting(true);
        try {
            await addMaterial({
                courseId,
                type: "video",
                title,
                url,
                duration,
                status,
            });
            toast.success("Video added successfully");
            router.push("/admin/content");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add video");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push("/admin/content");
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-inter text-slate-900">
            {/* Error state if no courseId */}
            {!courseId && (
                <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-900 animate-pulse">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-black uppercase tracking-tight text-sm">Course Association Missing</h3>
                        <p className="text-sm font-medium text-red-700/80">Please return to the content management page and select a course before adding a video tutorial.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto rounded-xl border-red-200 text-red-600 hover:bg-red-100 font-bold"
                        onClick={() => router.push('/admin/content')}
                    >
                        Go Back
                    </Button>
                </div>
            )}

            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <Link href="/admin/content" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group mb-2 w-fit">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Content Management
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight tracking-tight">Add Video Tutorial</h1>
                    <p className="text-slate-500 font-medium font-medium">Connect a video link to your course curriculum.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl font-bold px-6 border-slate-200"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8 disabled:opacity-50"
                        onClick={handleAddVideo}
                        disabled={isSubmitting || !title || !url || !courseId}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Adding..." : "Add Video"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-slate-200/60 shadow-sm shadow-sm rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-10 space-y-8">
                            {/* Video Title */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold font-bold">
                                    <Type className="w-4 h-4 text-primary" />
                                    <Label htmlFor="title" className="text-base uppercase tracking-tighter tracking-tighter">Video Title</Label>
                                </div>
                                <Input
                                    id="title"
                                    placeholder="e.g. Lec 01: Introduction to Mechanics"
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 text-lg font-semibold placeholder:text-slate-400"
                                    value={title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Video URL */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2 text-slate-900 font-bold font-bold">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-primary" />
                                        <Label htmlFor="url" className="text-base uppercase tracking-tighter">Video URL</Label>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] uppercase font-black tracking-widest">
                                        <Youtube className="w-3 h-3 text-red-500" />
                                        YouTube Recommended
                                    </div>
                                </div>
                                <div className="relative isolate">
                                    <Input
                                        ref={urlInputRef}
                                        id="url"
                                        placeholder="Paste link from YouTube, Vimeo, or a direct MP4 URL..."
                                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 px-6 font-medium text-slate-900 font-medium text-slate-900"
                                        value={url}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 font-bold text-slate-400 uppercase tracking-widest pl-1">Supports common video streaming providers.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                {/* Duration */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold font-bold">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <Label htmlFor="duration" className="text-base uppercase tracking-tighter tracking-tighter">Duration</Label>
                                    </div>
                                    <Input
                                        id="duration"
                                        placeholder="MM:SS (e.g. 45:00)"
                                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 px-6 font-bold text-center text-xl font-bold text-center text-xl"
                                        value={duration}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold font-bold">
                                        <PlayCircle className="w-4 h-4 text-primary" />
                                        <Label className="text-base uppercase tracking-tighter tracking-tighter">Initial Status</Label>
                                    </div>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-primary/20 font-bold px-6">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-semibold">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Processing">Processing</SelectItem>
                                            <SelectItem value="Hidden">Hidden</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold font-bold">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <Label htmlFor="description" className="text-base uppercase tracking-tighter font-bold uppercase tracking-tighter">Video Overview</Label>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Provide a brief summary of what's covered in this video..."
                                    className="min-h-[150px] bg-slate-50 border-none rounded-[2rem] focus-visible:ring-primary/20 font-medium text-slate-600 p-6 font-medium text-slate-600 p-6"
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Preview Section */}
                    <Card
                        onClick={() => urlInputRef.current?.focus()}
                        className="border-slate-200/60 shadow-sm shadow-sm rounded-[2.5rem] overflow-hidden sticky top-8 cursor-pointer group hover:scale-[1.02] transition-all duration-500 active:scale-95 transition-all duration-500 active:scale-95"
                    >
                        <div className="bg-slate-900 p-2 font-black text-[10px] text-white uppercase tracking-widest text-center">Video Preview</div>
                        <CardContent className="p-8 space-y-6">
                            <div className={cn(
                                "aspect-video rounded-3xl flex items-center justify-center transition-all duration-700 border-2 border-dashed",
                                url
                                    ? "bg-primary/5 border-primary/20 scale-100 shadow-inner"
                                    : "bg-slate-50 border-slate-200 group-hover:border-primary/40 group-hover:bg-primary/[0.02]"
                            )}>
                                {url ? (
                                    <div className="space-y-2 text-center animate-in zoom-in-95 duration-700">
                                        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/20 overflow-hidden">
                                            <PlayCircle className="w-8 h-8 text-white fill-current" />
                                        </div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest font-black text-primary uppercase tracking-widest">URL Detected</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-center p-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100 shadow-sm border border-slate-100">
                                            <LinkIcon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors transition-colors" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Click to paste URL</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-widest">Estimated Size</span>
                                    <span className="text-xs font-bold text-slate-900 font-bold text-slate-900">~250 MB</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-widest">Streaming Quality</span>
                                    <span className="text-xs font-bold text-slate-900 font-bold text-slate-900">HD (1080p)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}

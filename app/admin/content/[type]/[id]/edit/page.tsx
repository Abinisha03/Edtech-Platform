"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    FileText,
    File,
    PlayCircle,
    Type,
    Clock,
    HardDrive,
    Youtube,
    Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EditResourceProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default function EditResourcePage({ params }: EditResourceProps) {
    const { type, id } = use(params);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Resource specific states
    const [url, setUrl] = useState("");
    const [duration, setDuration] = useState("");

    // Mock data fetching based on ID and Type
    useEffect(() => {
        // In a real app, fetch data here
        if (type === "video") {
            setTitle("Lec 01: Newton's Laws of Motion");
            setUrl("https://www.youtube.com/watch?v=kKKM8Y-u7ds");
            setDuration("45:20");
        } else if (type === "note") {
            setTitle("Kinematics_Overview.docx");
        } else if (type === "pdf") {
            setTitle("Week1_Exercises.pdf");
        }
    }, [type, id]);

    const getIcon = () => {
        switch (type) {
            case "video": return <PlayCircle className="w-6 h-6" />;
            case "note": return <FileText className="w-6 h-6" />;
            case "pdf": return <File className="w-6 h-6" />;
            default: return <File className="w-6 h-6" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case "video": return "bg-primary/10 text-primary";
            case "note": return "bg-orange-50 text-orange-600";
            case "pdf": return "bg-red-50 text-red-600";
            default: return "bg-slate-50 text-slate-600";
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <Link href="/admin/content" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group mb-2 w-fit">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Content Management
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${getColors()}`}>
                            {getIcon()}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Resource</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest px-2 py-0 h-5 border-slate-200 text-slate-400">
                                    ID: {id}
                                </Badge>
                                <Badge className={`uppercase text-[9px] font-black tracking-widest px-2 py-0 h-5 border-none ${getColors()}`}>
                                    {type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-xl font-bold px-6 border-slate-200">
                        Discard
                    </Button>
                    <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8">
                        <Save className="w-5 h-5" />
                        Update {type === "video" ? "Video" : "File"}
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                    {/* General Section */}
                    <div className="space-y-8">
                        <div className="space-y-1 border-b border-slate-50 pb-4">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">General Information</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global settings for this resource</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Type className="w-4 h-4 text-primary" />
                                    <Label htmlFor="title" className="text-sm uppercase tracking-tighter">Display Title</Label>
                                </div>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <Label className="text-sm uppercase tracking-tighter">Modified Date</Label>
                                </div>
                                <div className="h-14 bg-slate-50 rounded-2xl flex items-center px-6 font-bold text-slate-400 italic">
                                    Last edit was 2 hours ago
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specific Section */}
                    {type === "video" ? (
                        <div className="space-y-8 pt-4">
                            <div className="space-y-1 border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Video Content</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage stream URL and metadata</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <LinkIcon className="w-4 h-4 text-primary" />
                                        <Label htmlFor="url" className="text-sm uppercase tracking-tighter">Stream URL</Label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 pl-14 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <Label htmlFor="duration" className="text-sm uppercase tracking-tighter">Duration</Label>
                                        </div>
                                        <Input
                                            id="duration"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 px-6 font-bold text-center"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <HardDrive className="w-4 h-4 text-primary" />
                                            <Label className="text-sm uppercase tracking-tighter">Estimated Payload</Label>
                                        </div>
                                        <div className="h-14 bg-slate-50 rounded-2xl flex items-center px-6 font-bold text-slate-700">
                                            256.4 MB (HD)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 pt-4">
                            <div className="space-y-1 border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">File Assets</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage file properties</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <HardDrive className="w-4 h-4 text-primary" />
                                        <Label className="text-sm uppercase tracking-tighter">File Weight</Label>
                                    </div>
                                    <div className="h-14 bg-slate-50 rounded-2xl flex items-center px-6 font-bold text-slate-700">
                                        {type === "note" ? "2.4 MB" : "1.1 MB"}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <Label className="text-sm uppercase tracking-tighter">File Format</Label>
                                    </div>
                                    <div className="h-14 bg-slate-50 rounded-2xl flex items-center px-6 font-bold text-slate-700 uppercase">
                                        {type === "note" ? "DOCX" : "PDF"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <FileText className="w-4 h-4 text-primary" />
                            <Label htmlFor="description" className="text-sm uppercase tracking-tighter">Resource Description</Label>
                        </div>
                        <Textarea
                            id="description"
                            placeholder="Optional: Provide more context about this resource for students..."
                            className="min-h-[150px] bg-slate-50 border-none rounded-[2rem] focus-visible:ring-primary/20 font-medium text-slate-600 p-6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle,
    Play,
    FileText,
    ChevronDown,
    Lock,
    Menu,
    X,
    MessageSquare,
    Star,
    MoreVertical,
    Share2,
    Download,
    ChevronRight,
    Search,
    Video,
    ListChecks,
    File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import MuxPlayer from "@mux/mux-player-react";
import { CourseFeedbackModal } from "@/components/course-feedback-modal";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CourseLearnPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as Id<"courses">;

    const course = useQuery(api.courses.getById, { id: courseId });
    const materials = useQuery(api.materials.listByCourse, { courseId });
    const assignments = useQuery(api.assignments.listByCourse, { courseId });

    const modules = useQuery(api.modules.getModules, { courseId });

    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    // Reset video state when changing videos
    useEffect(() => {
        setIsVideoLoading(true);
        setVideoError(false);
    }, [currentVideoId]);

    // Suppress noisy Mux/HLS console errors that appear when a playback ID is invalid.
    // These are expected when a video hasn't been fully processed by Mux yet.
    useEffect(() => {
        const originalError = console.error;
        const originalWarn = console.warn;
        const suppress = (fn: typeof console.error) => (...args: any[]) => {
            const msg = args[0]?.toString?.() ?? "";
            if (
                msg.includes("getErrorFromHlsErrorData") ||
                msg.includes("MediaError") ||
                msg.includes("mux-player") ||
                msg.includes("playback-id does not exist") ||
                msg.includes("HLS")
            ) return;
            fn.apply(console, args);
        };
        console.error = suppress(originalError);
        console.warn = suppress(originalWarn);
        return () => {
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    // Close sidebar on mobile by default
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Group materials by module
    useEffect(() => {
        if (materials && materials.length > 0 && !currentVideoId) {
            const firstVideo = materials.find(m => m.type === "video");
            if (firstVideo) setCurrentVideoId(firstVideo._id);
        }
    }, [materials, currentVideoId]);

    if (course === undefined || materials === undefined || modules === undefined || assignments === undefined) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
        </div>
    );

    if (course === null) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-gray-900 gap-4">
            <h1 className="text-2xl font-black">Course not found</h1>
            <Button onClick={() => router.push('/user/explorer')} variant="secondary">Back to Explorer</Button>
        </div>
    );

    const currentVideo = materials.find((m: any) => m._id === currentVideoId);

    // Grouping logic
    const videoTutorials = materials.filter((m: any) => m.type === "video");
    const allResources = materials.filter((m: any) => m.type === "pdf" || m.type === "note");

    const isLastVideo = videoTutorials.length > 0 && currentVideoId === videoTutorials[videoTutorials.length - 1]._id;

    const resourcesByVideo = videoTutorials.reduce((acc: any, video: any) => {
        acc[video._id] = allResources.filter((r: any) =>
            r.videoId === video._id || (r.moduleId && r.moduleId === video.moduleId)
        );
        return acc;
    }, {} as Record<string, any[]>);

    const currentResources = currentVideoId ? resourcesByVideo[currentVideoId] || [] : [];

    // Group content by modules
    const contentByModule = (() => {
        if (!modules || modules.length === 0) {
            return [{
                _id: "general",
                title: "Course Content",
                videos: videoTutorials,
                resources: allResources,
                assignments: assignments
            }];
        }

        const grouped = modules.map((module: any) => ({
            ...module,
            videos: videoTutorials.filter((v: any) => v.moduleId === module._id),
            resources: allResources.filter((r: any) => r.moduleId === module._id),
            assignments: assignments.filter((a: any) => a.moduleId === module._id)
        })).filter((m: any) => m.videos.length > 0 || m.resources.length > 0 || m.assignments.length > 0);

        return grouped;
    })();

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* Custom thin scrollbar for sidebar */}
            <style>{`
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #c7d2e0; }
            `}</style>

            {/* ── Page Header ── */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 relative">
                <div className="flex items-center gap-4">
                    <Link href={`/user/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200" />
                    <h1 className="font-bold text-gray-900 text-lg truncate max-w-[300px] md:max-w-2xl">
                        {course.title}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-gray-900">4.8</span>
                        <span className="text-gray-400">|</span>
                        <span>120 ratings</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:bg-gray-100 hidden md:flex"
                    >
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                    {/* Mobile sidebar toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:bg-gray-100 md:hidden"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </header>

            {/* ── Main Body: left content + right sidebar ── */}
            <div className="flex flex-1 overflow-hidden relative z-0" style={{ minHeight: 0 }}>

                {/* ── LEFT: Video & Content (scrolls freely) ── */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 scroll-smooth relative z-10">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Video Player */}
                        <div className="bg-black w-full aspect-video shadow-lg relative group z-20 overflow-hidden">
                            {currentVideo ? (
                                (currentVideo.url) ? (
                                    <div className="w-full h-full relative">
                                        {isVideoLoading && !currentVideo.url.includes("stream.mux.com") && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                                <div className="w-12 h-12 border-4 border-white/30 border-t-white animate-spin rounded-full" />
                                            </div>
                                        )}
                                        {videoError ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-20">
                                                <p className="text-red-400 font-medium mb-4">Failed to load video</p>
                                                <Button
                                                    onClick={() => {
                                                        setVideoError(false);
                                                        setIsVideoLoading(true);
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        ) : (
                                            currentVideo.muxPlaybackId || currentVideo.url.includes("stream.mux.com") ? (
                                                <MuxPlayer
                                                    streamType="on-demand"
                                                    playbackId={currentVideo.muxPlaybackId || currentVideo.url.split('stream.mux.com/')[1]?.split('.m3u8')[0]}
                                                    src={!currentVideo.muxPlaybackId ? currentVideo.url : undefined}
                                                    autoPlay
                                                    className="w-full h-full"
                                                    accentColor="#5624d0"
                                                    metadata={{
                                                        video_id: currentVideo._id,
                                                        video_title: currentVideo.title,
                                                        course_title: course.title,
                                                    }}
                                                    onError={() => {
                                                        // Playback ID is invalid or video not processed yet — show error UI
                                                        setVideoError(true);
                                                        setIsVideoLoading(false);
                                                    }}
                                                />
                                            ) : (
                                                <ReactPlayer
                                                    key={currentVideoId}
                                                    url={currentVideo.url}
                                                    controls
                                                    width="100%"
                                                    height="100%"
                                                    onBuffer={() => setIsVideoLoading(true)}
                                                    onBufferEnd={() => setIsVideoLoading(false)}
                                                    onReady={() => setIsVideoLoading(false)}
                                                    onError={(e: any) => {
                                                        console.error("Video Player Error:", e);
                                                        setIsVideoLoading(false);
                                                        setVideoError(true);
                                                    }}
                                                    config={{
                                                        file: {
                                                            attributes: {
                                                                controlsList: 'nodownload'
                                                            }
                                                        }
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900">
                                        <Video className="w-16 h-16 text-gray-700 mb-4" />
                                        <p className="text-lg font-medium text-gray-400">No video uploaded for this lecture</p>
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900">
                                    <Play className="w-16 h-16 text-gray-700 mb-4" />
                                    <p className="text-lg font-medium text-gray-400">Select a lesson to start watching</p>
                                </div>
                            )}
                        </div>

                        {/* Below video: description + assignments + completion */}
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {currentVideo ? currentVideo.title : "Course Overview"}
                                </h2>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">About this lesson</h3>
                                        <p>{course.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="font-semibold text-gray-900 mb-1">Course Level</div>
                                            <p className="text-sm text-gray-500">All Levels</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="font-semibold text-gray-900 mb-1">Students</div>
                                            <p className="text-sm text-gray-500">12,453 enrolled</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="font-semibold text-gray-900 mb-1">Language</div>
                                            <p className="text-sm text-gray-500">English (US)</p>
                                        </div>

                                        {/* Assignments List */}
                                        {assignments && assignments.length > 0 && (
                                            <div className="col-span-1 md:col-span-3 mt-2">
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">Course Assignments</h3>
                                                <ul className="space-y-3">
                                                    {assignments.map((task: any, idx: number) => (
                                                        <li key={task._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                    <ListChecks className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">{task.title}</p>
                                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">{task.type || "Assignment"}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                                <Link href={`/user/assignments/${task._id}`}>Start Now</Link>
                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {isLastVideo && (
                                        <div className="mt-8 p-10 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                                            <div className="w-20 h-20 bg-white shadow-sm text-yellow-500 rounded-full flex items-center justify-center mb-5 rotate-12 transition-transform hover:rotate-0 duration-300">
                                                <Star className="w-10 h-10 fill-current" />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">You've reached the end! 🎉</h3>
                                            <p className="text-gray-600 mb-8 max-w-md text-base leading-relaxed">Congratulations on completing the video lessons. Please take a moment to rate this course and leave your feedback below.</p>
                                            <Button
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-6 px-10 shadow-lg shadow-emerald-500/20 border-none text-lg rounded-full transition-transform hover:scale-105 active:scale-95"
                                                onClick={() => setIsFeedbackModalOpen(true)}
                                            >
                                                <Star className="w-5 h-5 mr-3 fill-current" />
                                                Finish Course &amp; Rate
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    RIGHT SIDEBAR — 3-part layout
                    1. Fixed header  (shrink-0, never scrolls)
                    2. Scrollable content  (flex-1 min-h-0 overflow-y-auto)
                    3. Fixed footer  (shrink-0, never scrolls)
                ══════════════════════════════════════════════ */}
                <aside
                    className={cn(
                        // Base structure
                        "flex flex-col bg-white border-l border-gray-100 overflow-hidden",
                        // Mobile: right-side fixed drawer
                        "fixed inset-y-0 right-0 z-40 w-[22rem] shadow-2xl",
                        "transform transition-transform duration-300 ease-in-out",
                        // Desktop: static sticky, height = viewport minus page header (4rem = 64px)
                        "md:relative md:inset-auto md:right-auto md:shadow-none md:z-0",
                        "md:sticky md:top-0 md:h-[calc(100vh-4rem)] md:w-[22rem] md:shrink-0",
                        "md:translate-x-0",
                        // Mobile toggle
                        sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                    )}
                >
                    {/* ── Part 1: Fixed Header ── */}
                    <div className="shrink-0 bg-white border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base tracking-tight leading-none">
                                    Course Content
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    {contentByModule.length} section{contentByModule.length !== 1 ? "s" : ""} &bull; {videoTutorials.length} lesson{videoTutorials.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Rating chip — desktop only */}
                                <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full select-none">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>4.8</span>
                                </div>
                                {/* Mobile close */}
                                <button
                                    className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                    onClick={() => setSidebarOpen(false)}
                                    aria-label="Close sidebar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Part 2: Scrollable content list (ONLY this area scrolls) ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll">
                        {contentByModule.map((section: any, sectionIdx: number) => (
                            <div key={section._id} className="border-b border-gray-100 last:border-0">

                                {/* Sticky section header — stays at top of scroll container */}
                                <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 mb-0.5">
                                                Section {sectionIdx + 1}
                                            </p>
                                            <h4 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-1">
                                                {section.title}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1 shrink-0 mt-0.5">
                                            {section.videos.length > 0 && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-200">
                                                    {section.videos.length} Vid{section.videos.length > 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {section.resources.length > 0 && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                                                    {section.resources.length} Doc{section.resources.length > 1 ? "s" : ""}
                                                </span>
                                            )}
                                            {section.assignments.filter((a: any) => a.type !== "quiz").length > 0 && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                                                    {section.assignments.filter((a: any) => a.type !== "quiz").length} Task
                                                </span>
                                            )}
                                            {section.assignments.filter((a: any) => a.type === "quiz").length > 0 && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
                                                    {section.assignments.filter((a: any) => a.type === "quiz").length} Quiz
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section items */}
                                <div>
                                    {/* ── Videos ── */}
                                    {section.videos.map((video: any, idx: number) => (
                                        <button
                                            key={video._id}
                                            onClick={() => {
                                                setCurrentVideoId(video._id);
                                                if (window.innerWidth < 768) setSidebarOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-3.5 flex gap-3 transition-all duration-150 relative group border-b border-gray-50 last:border-0",
                                                currentVideoId === video._id
                                                    ? "bg-violet-50"
                                                    : "bg-white hover:bg-gray-50/70"
                                            )}
                                        >
                                            {/* Active left bar */}
                                            {currentVideoId === video._id && (
                                                <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-violet-500 rounded-r-full" />
                                            )}
                                            {/* Icon */}
                                            <div className="shrink-0 mt-0.5">
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150",
                                                    currentVideoId === video._id
                                                        ? "bg-violet-500 text-white shadow-sm shadow-violet-200"
                                                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                                )}>
                                                    <Play className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-[13px] font-medium line-clamp-2 leading-snug transition-colors",
                                                    currentVideoId === video._id
                                                        ? "text-violet-700"
                                                        : "text-gray-700 group-hover:text-gray-900"
                                                )}>
                                                    {idx + 1}. {video.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Video className="w-3 h-3 text-gray-300" />
                                                    <span className="text-[11px] text-gray-400">{video.duration || "5:00"}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {/* ── Resources / Notes ── */}
                                    {section.resources.map((res: any) => (
                                        <a
                                            key={res._id}
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-sky-50/60 transition-all duration-150 group bg-white border-b border-gray-50 last:border-0"
                                        >
                                            <div className="shrink-0">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-150">
                                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">{res.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5 uppercase font-semibold tracking-wide">Resource &middot; {res.type}</p>
                                            </div>
                                            <Download className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                                        </a>
                                    ))}

                                    {/* ── Assignments ── */}
                                    {section.assignments.filter((a: any) => a.type !== "quiz").map((assign: any) => (
                                        <Link
                                            key={assign._id}
                                            href={`/user/assignments/${assign._id}`}
                                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-emerald-50/60 transition-all duration-150 group bg-white border-b border-gray-50 last:border-0"
                                        >
                                            <div className="shrink-0">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-150">
                                                    <File className="w-3.5 h-3.5 text-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-emerald-700 transition-colors">{assign.title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wide">{assign.type || "Assignment"}</span>
                                                    {assign.dueDate && <span className="text-[11px] text-gray-400">&middot; Due {new Date(assign.dueDate).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                                        </Link>
                                    ))}

                                    {/* ── Quizzes ── */}
                                    {section.assignments.filter((a: any) => a.type === "quiz").map((assign: any) => (
                                        <Link
                                            key={assign._id}
                                            href={`/user/quizzes/${assign._id}`}
                                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-purple-50/60 transition-all duration-150 group bg-white border-b border-gray-50 last:border-0"
                                        >
                                            <div className="shrink-0">
                                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-150">
                                                    <ListChecks className="w-3.5 h-3.5 text-purple-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-gray-700 truncate group-hover:text-purple-700 transition-colors">{assign.title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-purple-500 font-semibold uppercase tracking-wide">Quiz</span>
                                                    {assign.dueDate && <span className="text-[11px] text-gray-400">&middot; Due {new Date(assign.dueDate).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 shrink-0 transition-colors" />
                                        </Link>
                                    ))}
                                </div>

                            </div>
                        ))}
                        {/* Bottom breathing room */}
                        <div className="h-4" />
                    </div>

                    {/* ── Part 3: Fixed Footer ── */}
                    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-gray-700 truncate">{course.title}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {videoTutorials.length} lesson{videoTutorials.length !== 1 ? "s" : ""} &bull; {allResources.length} resource{allResources.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <Link
                                href={`/user/courses/${courseId}`}
                                className="shrink-0 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors whitespace-nowrap"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Mobile backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-[2px]"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>

            <CourseFeedbackModal
                courseId={courseId}
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />
        </div>
    );
}

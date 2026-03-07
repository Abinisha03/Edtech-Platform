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
        // Aggregate resources by module if videoId link isn't explicit, or correct linking
        // For now, assuming resources are linked by moduleId or videoId. 
        // A simple fallback is filtering by moduleId if videoId is missing.
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

        const uncategorizedVideos = videoTutorials.filter(v => !v.moduleId || !modules.some(m => m._id === v.moduleId));
        const uncategorizedResources = allResources.filter(r => !r.moduleId || !modules.some(m => m._id === r.moduleId));
        const uncategorizedAssignments = assignments.filter(a => !a.moduleId || !modules.some(m => m._id === a.moduleId));

        if (uncategorizedVideos.length > 0 || uncategorizedResources.length > 0 || uncategorizedAssignments.length > 0) {
            grouped.push({
                _id: "general",
                title: "General Content",
                videos: uncategorizedVideos,
                resources: uncategorizedResources,
                assignments: uncategorizedAssignments
            });
        }

        return grouped;
    })();

    return (
        <div className="flex flex-col h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* Header - Minimalist */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-50 relative">
                {/* ... header content ... */}
                <div className="flex items-center gap-4">
                    <Link href={`/user/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200" />
                    <h1 className="font-bold text-gray-900 text-lg truncate max-w-[300px] md:max-w-2xl">
                        {course.title}
                    </h1>
                </div>
                {/* ... right side of header ... */}
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

            {/* Main Content Layout */}
            <div className="flex flex-1 overflow-hidden relative z-0">
                {/* Left: Video & Content */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 scroll-smooth relative z-10">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Video Player Section */}
                        <div className="bg-black w-full aspect-video shadow-lg relative group z-20 overflow-hidden">
                            {currentVideo ? (
                                (currentVideo.url) ? (
                                    <div className="w-full h-full relative">
                                        {/* Loading Overlay (Only for ReactPlayer or initial load) */}
                                        {isVideoLoading && !currentVideo.url.includes("stream.mux.com") && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                                <div className="w-12 h-12 border-4 border-white/30 border-t-white animate-spin rounded-full" />
                                            </div>
                                        )}

                                        {/* Error State */}
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
                                                    onError={(e: any) => {
                                                        console.warn("Mux Player Encountered Error:", e);
                                                    }}
                                                />
                                            ) : (
                                                <ReactPlayer
                                                    key={currentVideoId} // Force remount on video change
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

                        {/* ... tabs content ... */}


                        {/* Tabs / Content Below Video */}
                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {currentVideo ? currentVideo.title : "Course Overview"}
                                </h2>
                            </div>

                            <div className="space-y-8">


                                {/* Description Section */}
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
                                                Finish Course & Rate
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar Navigation */}
                {/* Desktop: Always visible, pushes content. Mobile: Absolute overlay */}
                <div
                    className={cn(
                        "fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col",
                        sidebarOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "translate-x-full md:hidden"
                    )}
                >
                    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0">
                        <h3 className="font-bold text-gray-900 text-lg">Course Content</h3>
                        <Button variant="ghost" size="icon" className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 bg-white">
                        <div className="pb-20">
                            {contentByModule.map((section: any, sectionIdx: number) => (
                                <div key={section._id} className="border-b border-gray-100 last:border-0">
                                    <div className="bg-gray-50/80 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">
                                                Section {sectionIdx + 1}
                                            </h4>
                                            <div className="flex gap-1">
                                                {section.videos.length > 0 && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                                        {section.videos.length} Vids
                                                    </span>
                                                )}
                                                {section.resources.length > 0 && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                        {section.resources.length} Docs
                                                    </span>
                                                )}
                                                {section.assignments.length > 0 && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                        {section.assignments.length} Task
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1 font-medium">{section.title}</p>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {/* Videos */}
                                        {section.videos.map((video: any, idx: number) => (
                                            <button
                                                key={video._id}
                                                onClick={() => {
                                                    setCurrentVideoId(video._id);
                                                    if (window.innerWidth < 768) setSidebarOpen(false); // Close on mobile click
                                                }}
                                                className={cn(
                                                    "w-full text-left p-4 flex gap-3 hover:bg-primary/5 transition-all duration-200 relative group",
                                                    currentVideoId === video._id
                                                        ? "bg-primary/10"
                                                        : "bg-white"
                                                )}
                                            >
                                                {/* Left current indicator line */}
                                                {currentVideoId === video._id && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                                )}

                                                <div className="mt-1">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                        currentVideoId === video._id ? "border-primary bg-primary text-white" : "border-gray-300 text-transparent"
                                                    )}>
                                                        {currentVideoId === video._id ? <Play className="w-2.5 h-2.5 fill-current" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm font-medium mb-1 line-clamp-2 group-hover:text-primary transition-colors", currentVideoId === video._id ? "text-primary" : "text-gray-700")}>
                                                        {idx + 1}. {video.title}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Video className="w-3 h-3" /> {video.duration || "5:00"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}

                                        {/* Resources */}
                                        {section.resources.map((res: any) => (
                                            <a
                                                key={res._id}
                                                href={res.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-4 hover:bg-blue-50/50 transition-all group w-full bg-blue-50/5"
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-blue-500">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600">{res.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Resource • {res.type}</p>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                            </a>
                                        ))}

                                        {/* Assignments */}
                                        {section.assignments.map((assign: any) => (
                                            <Link
                                                key={assign._id}
                                                href={`/user/assignments/${assign._id}`}
                                                className="flex items-center gap-3 p-4 hover:bg-emerald-50/50 transition-all group w-full bg-emerald-50/5"
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-emerald-500">
                                                    {assign.type === 'quiz' ? <ListChecks className="w-4 h-4" /> : <File className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-emerald-600">{assign.title}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold mt-0.5">
                                                        <span className="text-emerald-500">{assign.type}</span>
                                                        {assign.dueDate && <span>• Due {new Date(assign.dueDate).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Mobile Overlay for Sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
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

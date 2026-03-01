"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Download,
    Award,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AssignmentDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AssignmentDetailsPage({ params }: AssignmentDetailsPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const assignmentId = id as Id<"assignments">;

    const assignment = useQuery(api.assignments.getById, { id: assignmentId });
    const submission = useQuery(api.assignments.getMySubmission, { assignmentId });

    // mutations
    const generateUploadUrl = useMutation(api.assignments.generateUploadUrl);
    const submitAssignment = useMutation(api.assignments.submitAssignment);

    // state
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // We need course details too, probably. 
    // Ideally getById should return course info or we fetch it separately.
    // existing getById just returns the assignment. 
    // Let's fetch course separately if we have the ID.
    const courseId = assignment?.courseId;
    const course = useQuery(api.courses.getById, courseId ? { id: courseId } : "skip");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);

            // 1. Get upload URL
            const postUrl = await generateUploadUrl();

            // 2. Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            // 3. Save submission
            await submitAssignment({
                assignmentId,
                storageId,
                fileName: file.name,
                fileUrl: "", // Convex generates URL dynamically
            });

            setFile(null);
            // Optional: Show success message
        } catch (error) {
            console.error("Upload failed:", error);
            // Optional: Show error
        } finally {
            setIsUploading(false);
        }
    };

    if (assignment === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfdff]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    if (assignment === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdff] gap-4">
                <h1 className="text-2xl font-black text-slate-900">Assignment not found</h1>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const dueDate = new Date(assignment.dueDate);
    const isOverdue = Date.now() > assignment.dueDate;

    return (
        <div className="min-h-screen bg-[#fcfdff] pb-20 font-inter">
            {/* Header / Nav */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/user/dashboard"
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                            {course?.title || "Course Assignment"}
                        </span>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-500">
                {/* Title Section */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-indigo-50 text-indigo-600 border-none px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                                    {assignment.type}
                                </Badge>
                                <span className={isOverdue ? "text-red-500 text-xs font-bold flex items-center gap-1" : "text-emerald-600 text-xs font-bold flex items-center gap-1"}>
                                    {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {isOverdue ? "Overdue" : "In Progress"}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                {assignment.title}
                            </h1>
                        </div>

                        {assignment.points && (
                            <div className="bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100 flex flex-col items-end">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Max Points</span>
                                <span className="text-2xl font-black text-slate-900">{assignment.points}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-slate-500 border-y border-slate-100 py-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Due: <span className="text-slate-900 font-bold">{dueDate.toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Time: <span className="text-slate-900 font-bold">{dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Instructions & Files */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Description */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Instructions
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                {assignment.description ? (
                                    <p className="whitespace-pre-wrap">{assignment.description}</p>
                                ) : (
                                    <p className="italic text-slate-400">No instructions provided.</p>
                                )}
                            </div>
                        </section>

                        {/* Attachments */}
                        {assignment.files && assignment.files.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-indigo-500" />
                                    Attachments
                                </h2>
                                <div className="grid grid-cols-1 gap-3">
                                    {assignment.files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{file.name}</p>
                                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{file.size || "Unknown Size"}</p>
                                                </div>
                                            </div>
                                            {file.url ? (
                                                <a
                                                    href={file.url}
                                                    download={file.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl font-bold text-xs transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs cursor-default" title="File URL not available">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Unavailable
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Submission */}
                    <div className="space-y-6">
                        <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] bg-white overflow-hidden sticky top-24">
                            <div className="bg-slate-900 p-6">
                                <h3 className="text-white font-black text-lg">Your Submission</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Submit your work before the deadline.</p>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                {submission ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-bold text-lg">Assignment Submitted!</p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {submission.fileName && (
                                            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 text-left border border-slate-100">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-indigo-500">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate text-sm">{submission.fileName}</p>
                                                    <a href={submission.fileUrl} target="_blank" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                                                        View File
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            className="w-full text-xs"
                                        >
                                            Resubmit Assignment
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="text-center space-y-3 py-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl border-2 border-transparent hover:border-dashed hover:border-slate-200"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                                                <CloudUpload className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {file ? file.name : "No work submitted"}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {file ? "Click to change file" : "Upload your files to get started"}
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || isUploading}
                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-xl shadow-indigo-100 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUploading ? "Uploading..." : "Add Submission"}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

function CloudUpload(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m16 16-4-4-4 4" />
        </svg>
    );
}

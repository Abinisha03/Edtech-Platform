"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    Save,
    Type,
    Calendar,
    BookOpen,
    FileText,
    HelpCircle,
    Plus,
    Trash2,
    Target,
    CloudUpload,
    CheckCircle2,
    X
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

export default function CreateAssessmentPage() {
    const router = useRouter();
    const [type, setType] = useState<"assignment" | "quiz">("assignment");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convex Hooks
    const courses = useQuery(api.courses.listAll) || [];
    const createAssignment = useMutation(api.assignments.createAssignment);

    const searchParams = useSearchParams();
    const initialCourseId = searchParams.get("courseId") || "";

    // State
    const [title, setTitle] = useState("");
    const [courseId, setCourseId] = useState<string>(initialCourseId);
    const [dueDate, setDueDate] = useState("");
    const [points, setPoints] = useState("");
    const [description, setDescription] = useState("");
    const generateUploadUrl = useMutation(api.assignments.generateUploadUrl);
    const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: string; storageId?: string }[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { id: "1", text: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);
    const [isUploading, setIsUploading] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        try {
            const newAttachments = await Promise.all(Array.from(files).map(async (file) => {
                // Get upload URL
                const postUrl = await generateUploadUrl();


                // Upload file
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) {
                    console.error("Upload failed:", result.statusText);
                    throw new Error(`Upload failed: ${result.statusText}`);
                }

                const { storageId } = await result.json();

                return {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
                    type: file.name.split('.').pop() || "file",
                    storageId: storageId
                };
            }));

            setAttachments(prev => [...prev, ...newAttachments]);
        } catch (error) {
            console.error("File upload failed:", error);
            alert("Failed to upload one or more files. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed (or if failed)
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(f => f.id !== id));
    };

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            text: "",
            options: ["", "", "", ""],
            correctAnswer: 0
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        if (questions.length === 1) return; // Keep at least one question
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestionText = (id: string, text: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
    };

    const updateOption = (qId: string, optIndex: number, text: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIndex] = text;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const setCorrectOption = (qId: string, optIndex: number) => {
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctAnswer: optIndex } : q));
    };

    const handleCreate = async () => {
        if (!title || !courseId || !dueDate) return;
        setIsSubmitting(true);

        try {
            await createAssignment({
                title,
                courseId: courseId as Id<"courses">,
                type,
                dueDate: new Date(dueDate).getTime(),
                status: "Active",
                description: description,
                points: points ? parseInt(points) : 100,
                files: attachments.map(f => ({
                    name: f.name,
                    url: "", // Generated by backend
                    storageId: f.storageId as Id<"_storage">,
                    type: f.type,
                    size: f.size
                })),
                questions: type === "quiz" ? questions : undefined,
            });

            if (courseId) {
                // Redirect back to course content with quiz prompt
                router.push(`/admin/courses/${courseId}/content?prompt=create_quiz`);
            } else {
                router.push("/admin/assignments");
            }
        } catch (error) {
            console.error("Failed to create assignment:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-inter">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.docx,.zip,.txt"
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <Link href="/admin/assignments" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group mb-2 w-fit">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Assignments
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create New {type === "assignment" ? "Assignment" : "Quiz"}</h1>
                    <p className="text-slate-500 font-medium">Configure the assessment details for your students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl font-bold px-6 border-slate-200"
                        onClick={() => router.push("/admin/assignments")}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8"
                        onClick={handleCreate}
                        disabled={isSubmitting || isUploading || !title || !courseId}
                    >
                        {isSubmitting || isUploading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isUploading ? "Uploading..." : isSubmitting ? "Creating..." : "Create Assessment"}
                    </Button>
                </div>
            </div>

            {/* Type Selector Toggle */}
            <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] w-full max-w-sm flex items-center mx-auto md:mx-0">
                <button
                    onClick={() => setType("assignment")}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-[1.2rem] text-sm font-black transition-all flex items-center justify-center gap-2",
                        type === "assignment"
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <FileText className="w-4 h-4" />
                    Assignment
                </button>
                <button
                    onClick={() => setType("quiz")}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-[1.2rem] text-sm font-black transition-all flex items-center justify-center gap-2",
                        type === "quiz"
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <HelpCircle className="w-4 h-4" />
                    Quiz
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-slate-200/60 shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
                        <CardContent className="p-10 space-y-8">
                            {/* General Title */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Type className="w-4 h-4 text-primary" />
                                    <Label className="text-sm uppercase tracking-tighter">Assessment Title</Label>
                                </div>
                                <Input
                                    placeholder={type === "assignment" ? "e.g. Final Project: System Architecture" : "e.g. Week 1: Basic Principles Quiz"}
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 font-bold text-slate-700"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Course Selection */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        <Label className="text-sm uppercase tracking-tighter">Linking Course</Label>
                                    </div>
                                    <Select onValueChange={setCourseId} value={courseId}>
                                        <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-primary/20 font-bold px-6">
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-semibold">
                                            {courses.map((course) => (
                                                <SelectItem key={course._id} value={course._id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Maximum Points */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Target className="w-4 h-4 text-primary" />
                                        <Label className="text-sm uppercase tracking-tighter">Max Points</Label>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 font-bold text-slate-700 px-6"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <Label className="text-sm uppercase tracking-tighter">Due Date & Time</Label>
                                </div>
                                <Input
                                    type="datetime-local"
                                    className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 font-bold text-slate-700 px-6 block"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>

                            {/* Separator */}
                            <div className="h-[1px] bg-slate-100" />

                            {/* Dynamic Content Based on Type */}
                            {type === "assignment" ? (
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <Label className="text-sm uppercase tracking-tighter">Assignment Instructions</Label>
                                            </div>
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Upload Template</button>
                                        </div>
                                        <Textarea
                                            placeholder="Clearly outline the requirements and objectives for this assignment..."
                                            className="min-h-[200px] bg-slate-50 border-none rounded-[2rem] focus-visible:ring-primary/20 font-medium text-slate-600 p-8 leading-relaxed"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/40 hover:bg-white transition-all"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <CloudUpload className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900">
                                            {isUploading ? "Uploading..." : "Add Attachments"}
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 max-w-[200px] mt-1 italic">
                                            {isUploading ? "Please wait..." : "Upload PDF, DOCX or ZIP files (Max 50MB)"}
                                        </p>
                                    </div>

                                    {/* Uploaded Files List */}
                                    {attachments.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Uploaded Files ({attachments.length})</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {attachments.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                                                        <div className="flex items-center gap-3 truncate">
                                                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{file.size}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeAttachment(file.id);
                                                            }}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Quiz Questions</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Add assessment items below</p>
                                        </div>
                                        <Button
                                            onClick={addQuestion}
                                            variant="outline"
                                            className="h-10 rounded-xl font-bold border-slate-200 text-xs px-4 flex items-center gap-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Question
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {questions.map((q, index) => (
                                            <div key={q.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6 relative group overflow-hidden animate-in zoom-in-95 duration-300">
                                                <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm">
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiple Choice Question</span>
                                                    </div>
                                                    {questions.length > 1 && (
                                                        <button
                                                            onClick={() => removeQuestion(q.id)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <Input
                                                    placeholder="Enter your question here..."
                                                    className="h-12 bg-slate-50 border-none rounded-xl font-bold text-slate-800"
                                                    value={q.text}
                                                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} className="flex items-center gap-3 group/opt">
                                                            <button
                                                                onClick={() => setCorrectOption(q.id, optIndex)}
                                                                className={cn(
                                                                    "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                                                                    q.correctAnswer === optIndex
                                                                        ? "bg-primary border-primary text-white"
                                                                        : "border-slate-200 group-hover/opt:border-primary/40"
                                                                )}
                                                            >
                                                                {q.correctAnswer === optIndex && <CheckCircle2 className="w-3 h-3" />}
                                                            </button>
                                                            <Input
                                                                placeholder={`Option ${optIndex + 1}`}
                                                                className="h-10 bg-slate-50/50 border-none rounded-lg text-sm"
                                                                value={opt}
                                                                onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info/Preview Area */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden sticky top-8">
                        <div className="bg-primary p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black leading-tight">Summary</h3>
                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest tracking-tighter">Drafting Phase</p>
                            </div>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-400">Status</span>
                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] rounded-lg">DRAFT</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-400">Course</span>
                                    <span className="font-black text-slate-900 uppercase text-right max-w-[150px] truncate">
                                        {courses.find(c => c._id === courseId)?.title || "Not Selected"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-400">Submissions</span>
                                    <span className="font-black text-slate-900 uppercase">Manual Enable</span>
                                </div>
                            </div>
                            <div className="h-[1px] bg-slate-50" />
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Best Practices</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-xs font-bold text-slate-600">Provide clear rubric details</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-xs font-bold text-slate-600">Set a realistic due date</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-xs font-bold text-slate-600">Sync with course schedule</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

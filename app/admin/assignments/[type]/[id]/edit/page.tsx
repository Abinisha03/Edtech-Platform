"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Clock,
    CheckCircle2
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

interface EditAssessmentProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default function EditAssessmentPage({ params }: EditAssessmentProps) {
    const router = useRouter();
    const { type, id } = use(params);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignmentId = id as Id<"assignments">;
    const assignment = useQuery(api.assignments.getById, { id: assignmentId });
    const courses = useQuery(api.courses.listAll) || [];
    const updateAssignment = useMutation(api.assignments.update);

    // Form State
    const [title, setTitle] = useState("");
    const [courseId, setCourseId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [points, setPoints] = useState("");
    const [description, setDescription] = useState("");
    const [attachments, setAttachments] = useState<{ id: string; name: string; size: string; type: string; storageId?: string; url?: string }[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([
        { id: "1", text: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);

    // Mutation for upload URL
    const generateUploadUrl = useMutation(api.assignments.generateUploadUrl);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAttachments = await Promise.all(Array.from(files).map(async (file) => {
            // Get upload URL
            const postUrl = await generateUploadUrl();

            // Upload file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            return {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
                type: file.name.split('.').pop() || "file",
                storageId: storageId,
                url: ""
            };
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
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
        if (questions.length === 1) return;
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

    // Populate form data
    useEffect(() => {
        if (assignment) {
            setTitle(assignment.title);
            setCourseId(assignment.courseId);
            const date = new Date(assignment.dueDate);
            // Adjust for local timezone for datetime-local input
            const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setDueDate(formattedDate);
            setDescription(assignment.description || "");
            setPoints(assignment.points?.toString() || "");
            if (assignment.files) {
                setAttachments(assignment.files.map(f => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: f.name,
                    size: f.size || "Unknown",
                    type: f.type,
                    storageId: f.storageId,
                    url: f.url
                })));
            }
            if (assignment.questions) {
                setQuestions(assignment.questions);
            }
        }
    }, [assignment]);

    const handleUpdate = async () => {
        if (!title || !courseId || !dueDate) return;
        setIsSubmitting(true);
        try {
            await updateAssignment({
                id: assignmentId,
                title,
                courseId: courseId as Id<"courses">,
                type: assignment?.type || type, // Use existing type or param type
                dueDate: new Date(dueDate).getTime(),
                status: assignment?.status || "Active",
                description,
                points: points ? parseInt(points) : undefined,
                files: attachments.map(f => ({
                    name: f.name,
                    url: f.storageId ? undefined : f.url, // Don't save URL if storageId is present (it's generated on fly)
                    storageId: f.storageId as Id<"_storage">,
                    type: f.type,
                    size: f.size
                })),
                questions: assignment?.type === "quiz" || type === "quiz" ? questions : undefined,
            });

            router.push("/admin/assignments");
        } catch (error) {
            console.error("Failed to update assignment:", error);
            setIsSubmitting(false);
        }
    };

    if (assignment === undefined) {
        return <div className="p-20 text-center font-bold text-slate-400">Loading assignment details...</div>;
    }

    if (assignment === null) {
        return <div className="p-20 text-center font-bold text-red-400">Assignment not found</div>;
    }

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
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-2xl",
                            type === "assignment" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                        )}>
                            {type === "assignment" ? <FileText className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit {type === "assignment" ? "Assignment" : "Quiz"}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest px-2 py-0 h-5 border-slate-200 text-slate-400">
                                    ID: {id.slice(-6).toUpperCase()}
                                </Badge>
                                <Badge className={cn(
                                    "uppercase text-[9px] font-black tracking-widest px-2 py-0 h-5 border-none",
                                    type === "assignment" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                                )}>
                                    {type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-12 rounded-xl font-bold px-6 border-slate-200"
                        onClick={() => router.push("/admin/assignments")}
                    >
                        Discard
                    </Button>
                    <Button
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 gap-2 px-8"
                        onClick={handleUpdate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Updating..." : "Update Assessment"}
                    </Button>
                </div>
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
                                    <Select value={courseId} onValueChange={setCourseId}>
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
                                        className="h-14 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary/20 font-bold text-slate-700 px-6"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                        placeholder="100"
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
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Download Current</button>
                                        </div>
                                        <Textarea
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
                                        <h4 className="text-lg font-black text-slate-900">Manage Attachments</h4>
                                        <p className="text-xs font-medium text-slate-500 max-w-[200px] mt-1 italic">Uploading new files will add to existing ones.</p>
                                    </div>

                                    {/* Uploaded Files List */}
                                    {attachments.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Attached Files ({attachments.length})</h4>
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Modify assessment items</p>
                                        </div>
                                        <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-xs px-4 flex items-center gap-2">
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

                {/* Sidebar Info Area */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden sticky top-8">
                        <div className="bg-slate-900 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black leading-tight">Last Modified</h3>
                                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">
                                    {assignment ? new Date(assignment._creationTime).toLocaleDateString() : "Loading..."}
                                </p>
                            </div>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-400">Status</span>
                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] rounded-lg tracking-widest uppercase">
                                        {assignment?.status || "Active"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-400">Course</span>
                                    <span className="font-black text-slate-900 uppercase text-right max-w-[150px] truncate">
                                        {courses.find(c => c._id === courseId)?.title || "Not Selected"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

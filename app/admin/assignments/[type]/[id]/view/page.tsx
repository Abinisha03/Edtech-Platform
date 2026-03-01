"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    User,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminAssignmentViewPageProps {
    params: Promise<{
        type: string;
        id: string;
    }>;
}

export default function AdminAssignmentViewPage({ params }: AdminAssignmentViewPageProps) {
    const { type, id } = use(params);
    const router = useRouter();
    const assignmentId = id as Id<"assignments">;

    const assignment = useQuery(api.assignments.getById, { id: assignmentId });
    const submissions = useQuery(api.assignments.getSubmissionsByAssignment, { assignmentId });

    if (assignment === undefined || submissions === undefined) {
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
        <div className="min-h-screen bg-[#fcfdff] pb-20 font-inter space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <Link href="/admin/assignments" className="hover:text-primary transition-colors">Assignments</Link>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                        <span className="text-slate-900 font-bold">{assignment.title}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Submission Overview</h1>
                </div>
                <Link href={`/admin/assignments/${type}/${id}/edit`}>
                    <Button variant="outline">Edit Assignment</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Assignment Stats / Info */}
                <Card className="md:col-span-3 border-none shadow-sm rounded-[2rem] bg-white">
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4">
                            <Badge variant="secondary" className="px-3 py-1">
                                {assignment.type}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="w-4 h-4" />
                                Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                            </div>
                            {assignment.points && (
                                <Badge variant="outline" className="px-3 py-1">
                                    {assignment.points} Points
                                </Badge>
                            )}
                        </div>
                        {assignment.description && (
                            <p className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                                {assignment.description}
                            </p>
                        )}
                        {assignment.files && assignment.files.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-700">Attachments:</p>
                                <div className="flex flex-wrap gap-2">
                                    {assignment.files.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            <Download className="w-3 h-3" />
                                            {file.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card className="md:col-span-3 border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Student Submissions ({submissions.length})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="pl-6">Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead className="text-right pr-6">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.length > 0 ? (
                                    submissions.map((sub) => (
                                        <TableRow key={sub._id}>
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={sub.user.imageUrl} />
                                                        <AvatarFallback>{sub.user.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{sub.user.name}</p>
                                                        <p className="text-xs text-slate-500">{sub.user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        sub.status === "submitted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            sub.status === "graded" ? "bg-primary/10 text-primary border-primary/20" :
                                                                "bg-slate-100 text-slate-600"
                                                    }
                                                >
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium text-slate-600">
                                                {new Date(sub.submittedAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {sub.fileUrl ? (
                                                    <a
                                                        href={sub.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        {sub.fileName || "View File"}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">No file</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {sub.grade ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                                            No submissions yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

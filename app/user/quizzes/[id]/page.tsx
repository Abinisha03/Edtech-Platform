"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Send,
    Trophy,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface QuizPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function QuizPage({ params }: QuizPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const assignmentId = id as Id<"assignments">;

    const assignment = useQuery(api.assignments.getById, { id: assignmentId });
    const submission = useQuery(api.assignments.getMySubmission, { assignmentId });
    const submitAssignment = useMutation(api.assignments.submitAssignment);

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReview, setShowReview] = useState(false);

    // Initialize answers if submission exists
    useEffect(() => {
        if (submission?.answers) {
            const initialAnswers: Record<string, number> = {};
            submission.answers.forEach((ans: any) => {
                initialAnswers[ans.questionId] = ans.selectedOption;
            });
            setAnswers(initialAnswers);
        }
    }, [submission]);

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (submission) return; // Prevent changing if already submitted
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!assignment?.questions) return;

        // Check if all questions are answered
        const unansweredCount = assignment.questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await submitAssignment({
                assignmentId,
                answers: Object.entries(answers).map(([qId, opt]) => ({
                    questionId: qId,
                    selectedOption: opt
                }))
            });

            // Celebration effect
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

        } catch (error) {
            console.error("Failed to submit quiz:", error);
            alert("Failed to submit quiz. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (assignment === undefined) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    if (!assignment || assignment.type !== "quiz") {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-slate-300" />
                <h1 className="text-2xl font-black text-slate-900">Quiz Not Found</h1>
                <Link href="/user/quizzes">
                    <Button variant="outline">Back to Quizzes</Button>
                </Link>
            </div>
        );
    }

    const isSubmitted = !!submission;
    const score = submission ? submission.grade : null;
    const maxPoints = assignment.points || 100;
    const percentage = score !== null && score !== undefined ? Math.round((score / maxPoints) * 100) : 0;


    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-inter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link href="/user/quizzes" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors w-fit group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Quizzes
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{assignment.title}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4" />
                            <span>{assignment.questions?.length || 0} Questions</span>
                        </div>
                    </div>
                </div>

                {isSubmitted && (
                    <Card className="bg-white border-slate-100 shadow-lg shadow-indigo-50/50 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-6">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
                                percentage >= 70 ? "bg-emerald-50" : "bg-amber-50"
                            )}>
                                <Trophy className={cn(
                                    "w-8 h-8",
                                    percentage >= 70 ? "text-emerald-500" : "text-amber-500"
                                )} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Your Score</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-4xl font-black tracking-tighter",
                                        percentage >= 70 ? "text-emerald-600" : "text-amber-600"
                                    )}>
                                        {score}
                                    </span>
                                    <span className="text-slate-400 font-bold">/ {maxPoints}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Questions List */}
            {(!isSubmitted || showReview) && (
                <div className="space-y-6">
                    {assignment.questions?.map((question, index) => {
                        const isAnswered = answers[question.id] !== undefined;
                        const isCorrect = isSubmitted && answers[question.id] === question.correctAnswer;

                        return (
                            <Card key={question.id} className={cn(
                                "border-slate-100 shadow-sm rounded-[2rem] overflow-hidden transition-all duration-300",
                                isSubmitted
                                    ? (isCorrect ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100")
                                    : "bg-white hover:shadow-md"
                            )}>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-slate-200">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        <div className="space-y-6 flex-1 pt-1.5">
                                            <h3 className="text-xl font-bold text-slate-800 leading-snug">
                                                {question.text}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-3">
                                                {question.options.map((option, optIndex) => {
                                                    const isSelected = answers[question.id] === optIndex;
                                                    const isThisCorrect = question.correctAnswer === optIndex;

                                                    let stateClass = "border-slate-200 hover:border-primary/40 hover:bg-slate-50";

                                                    if (isSubmitted) {
                                                        if (isThisCorrect) {
                                                            stateClass = "bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm";
                                                        } else if (isSelected && !isThisCorrect) {
                                                            stateClass = "bg-rose-100 border-rose-500 text-rose-900 shadow-sm";
                                                        } else {
                                                            stateClass = "border-slate-100 opacity-50";
                                                        }
                                                    } else if (isSelected) {
                                                        stateClass = "bg-primary text-white border-primary shadow-lg shadow-primary/20";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIndex}
                                                            onClick={() => handleOptionSelect(question.id, optIndex)}
                                                            disabled={isSubmitted}
                                                            className={cn(
                                                                "w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 flex items-center justify-between group",
                                                                stateClass
                                                            )}
                                                        >
                                                            <span>{option}</span>
                                                            {isSubmitted && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                                            {isSubmitted && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            {!isSubmitted ? (
                <div className="sticky bottom-6 z-10 flex justify-center">
                    <Card className="bg-slate-900/90 backdrop-blur-md border-none shadow-2xl rounded-full p-2 pl-6 pr-2">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{Object.keys(answers).length} / {assignment.questions?.length || 0} Answered</span>
                            </div>
                            <Button
                                size="lg"
                                className="rounded-full px-8 font-black bg-white text-slate-900 hover:bg-slate-200 transition-colors"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                <Send className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="flex justify-center mt-8">
                    <Button
                        size="lg"
                        variant={showReview ? "outline" : "default"}
                        className="rounded-full px-8 font-bold"
                        onClick={() => setShowReview(!showReview)}
                    >
                        {showReview ? "Hide Answers" : "Check Answers"}
                    </Button>
                </div>
            )}
        </div>
    );
}

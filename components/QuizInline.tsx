import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizInlineProps {
  quiz: any; // assignment object representing a quiz
}

export default function QuizInline({ quiz }: QuizInlineProps) {
  const assignmentId = quiz._id as Id<"assignments">;
  const submission = useQuery(api.assignments.getMySubmission, { assignmentId });
  const submitAssignment = useMutation(api.assignments.submitAssignment);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Initialize answers if a previous submission exists
  useEffect(() => {
    if (submission?.answers) {
      const init: Record<string, number> = {};
      submission.answers.forEach((ans: any) => {
        init[ans.questionId] = ans.selectedOption;
      });
      setAnswers(init);
    }
  }, [submission]);

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (submission) return; // prevent changes after submit
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz?.questions) return;
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await submitAssignment({
        assignmentId,
        answers: Object.entries(answers).map(([qId, opt]) => ({
          questionId: qId,
          selectedOption: opt as number,
        })),
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = !!submission;
  const score = submission ? submission.grade : null;
  const maxPoints = quiz.points || 100;
  const percentage = score != null ? Math.round((score / maxPoints) * 100) : 0;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-4">
        <Badge>{quiz.isCompleted ? "Completed" : "Pending"}</Badge>
        {quiz.points && <span>{quiz.points} PTS</span>}
      </div>
      {/* Score Card after submission */}
      {isSubmitted && (
        <Card className="bg-white border-slate-100 shadow-lg rounded-[2rem] overflow-hidden mb-4">
          <CardContent className="p-6 flex items-center gap-6">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
                percentage >= 70 ? "bg-emerald-50" : "bg-amber-50"
              )}
            >
              <CheckCircle2
                className={cn(
                  "w-8 h-8",
                  percentage >= 70 ? "text-emerald-500" : "text-amber-500"
                )}
              />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                Your Score
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-4xl font-black tracking-tighter",
                    percentage >= 70 ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {score}
                </span>
                <span className="text-slate-400 font-bold">/ {maxPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {(!isSubmitted || showReview) && (
        <div className="space-y-6">
          {quiz.questions?.map((question: any, index: number) => {
            const isAnswered = answers[question.id] !== undefined;
            const isCorrect = isSubmitted && answers[question.id] === question.correctAnswer;
            return (
              <Card
                key={question.id}
                className={cn(
                  "border-slate-100 shadow-sm rounded-[2rem] overflow-hidden transition-all duration-300",
                  isSubmitted
                    ? isCorrect
                      ? "bg-emerald-50/30 border-emerald-100"
                      : "bg-rose-50/30 border-rose-100"
                    : "bg-white hover:shadow-md"
                )}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-slate-200">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div className="space-y-6 flex-1 pt-1.5">
                      <h3 className="text-xl font-bold text-slate-800 leading-snug">
                        {question.text}
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {question.options.map((option: string, optIndex: number) => {
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
                              {isSubmitted && isThisCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              )}
                              {isSubmitted && isSelected && !isThisCorrect && (
                                <XCircle className="w-5 h-5 text-rose-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      {!isSubmitted ? (
        <div className="sticky bottom-6 z-10 flex justify-center mt-4">
          <Button
            size="lg"
            className="rounded-full px-8 font-black bg-white text-slate-900 hover:bg-slate-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>
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

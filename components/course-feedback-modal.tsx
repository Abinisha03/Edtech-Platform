"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CourseFeedbackModalProps {
    courseId: Id<"courses">;
    isOpen: boolean;
    onClose: () => void;
}

export function CourseFeedbackModal({ courseId, isOpen, onClose }: CourseFeedbackModalProps) {
    const existingReview = useQuery(api.reviews.getUserReview, { courseId });
    const submitReview = useMutation(api.reviews.submitReview);

    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync with existing review if modifying
    useState(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setFeedback(existingReview.feedback || "");
        }
    });

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitReview({
                courseId,
                rating,
                feedback: feedback.trim() === "" ? undefined : feedback.trim()
            });
            toast.success("Thank you for your feedback!");
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingReview ? "Update your review" : "Rate this course"}</DialogTitle>
                    <DialogDescription>
                        Help others decide if this course is right for them by leaving a review.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`w-10 h-10 ${(hoveredRating ? star <= hoveredRating : star <= rating)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-slate-200"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="w-full space-y-2">
                        <label className="text-sm font-medium text-slate-700">Additional Feedback (optional)</label>
                        <Textarea
                            placeholder="What did you think about the course content, instructor, and overall experience?"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="resize-none h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface CourseRatingDialogProps {
  course: {
    id: string;
    title: string;
    rating?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, review?: string) => Promise<void>;
}

export const CourseRatingDialog = ({
  course,
  open,
  onOpenChange,
  onSubmit,
}: CourseRatingDialogProps) => {
  const [rating, setRating] = useState(course.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit(rating, review || undefined);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kurs bewerten</DialogTitle>
          <DialogDescription>
            Wie hat Ihnen der Kurs "{course.title}" gefallen?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Optionale Bewertung (optional)
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Was hat Ihnen gefallen? Was könnte verbessert werden?"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? "Wird gespeichert..." : "Bewertung abgeben"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

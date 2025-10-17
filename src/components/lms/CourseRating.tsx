import { Star } from "lucide-react";

interface CourseRatingProps {
  rating: number;
  ratingCount: number;
}

export function CourseRating({ rating, ratingCount }: CourseRatingProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {ratingCount} {ratingCount === 1 ? "Bewertung" : "Bewertungen"}
      </span>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookIcon } from "@/components/ui/custom-icons";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    thumbnail_url?: string;
    price_chf: number | null;
    total_lessons?: number;
    difficulty?: string;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/lms/courses/${course.id}/preview`)}
    >
      {course.thumbnail_url ? (
        <img 
          src={course.thumbnail_url} 
          alt={course.title}
          className="w-full h-40 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center rounded-t-lg">
          <BookIcon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <div className="flex items-center justify-between text-sm">
          <Badge variant={course.price_chf === 0 || course.price_chf === null ? "secondary" : "default"}>
            {course.price_chf === 0 || course.price_chf === null ? "Kostenlos" : `CHF ${course.price_chf}`}
          </Badge>
          <span className="text-muted-foreground">
            {course.total_lessons || 0} Lektionen
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

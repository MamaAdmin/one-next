import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskChecklistCardProps {
  title: string;
  description?: string;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  saving?: boolean;
}

export const TaskChecklistCard = ({
  title,
  description,
  tasks,
  onTaskToggle,
  saving = false,
}: TaskChecklistCardProps) => {
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleTaskClick = (taskId: string) => {
    setAnimatingTaskId(taskId);
    onTaskToggle(taskId);
    setTimeout(() => setAnimatingTaskId(null), 300);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <span className="text-sm font-medium">
              {completedCount}/{tasks.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2" />

        {/* Task List */}
        <div className="space-y-2 mt-4">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent group text-left",
                task.completed && "bg-accent/50",
                animatingTaskId === task.id && "scale-105"
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 animate-scale-in" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
              )}
              <span
                className={cn(
                  "flex-1 text-sm",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

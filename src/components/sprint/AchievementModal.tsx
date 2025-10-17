import { Trophy, Award, Zap, Target, CheckCircle2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "award" | "zap" | "target" | "check" | "star";
  unlockedAt?: string;
}

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  achievement?: Achievement;
}

const iconMap = {
  trophy: Trophy,
  award: Award,
  zap: Zap,
  target: Target,
  check: CheckCircle2,
  star: Star,
};

export const AchievementModal = ({
  open,
  onClose,
  achievement,
}: AchievementModalProps) => {
  if (!achievement) return null;

  const Icon = iconMap[achievement.icon];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            {/* Animated Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-6 rounded-full">
                <Icon className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                Erfolg freigeschaltet!
              </Badge>
              <DialogTitle className="text-2xl font-bold">
                {achievement.title}
              </DialogTitle>
              <DialogDescription className="text-base">
                {achievement.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onClose} className="w-full">
            Weiter zum Sprint
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Erfolge ansehen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

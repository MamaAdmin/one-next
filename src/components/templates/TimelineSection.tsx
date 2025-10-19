import * as LucideIcons from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineItem {
  icon: string;
  title: string;
  description: string;
}

interface TimelineSectionProps {
  title?: string;
  description?: string;
  items: TimelineItem[];
}

export const TimelineSection = ({ title, description, items }: TimelineSectionProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : null;
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={index} className="relative flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                  {getIcon(item.icon)}
                </div>
                <Card className="flex-1 p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

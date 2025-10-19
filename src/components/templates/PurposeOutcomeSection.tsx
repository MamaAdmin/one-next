import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface PurposeOutcomeItem {
  icon: string;
  title: string;
  description?: string;
  list?: string[];
}

interface PurposeOutcomeSectionProps {
  items: PurposeOutcomeItem[];
}

export const PurposeOutcomeSection = ({ items }: PurposeOutcomeSectionProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : null;
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getIcon(item.icon)}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                )}
                {item.list && (
                  <ul className="space-y-2">
                    {item.list.map((listItem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{listItem}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

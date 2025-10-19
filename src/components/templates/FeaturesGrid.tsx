import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  title?: string;
  description?: string;
  columns?: number;
  items: FeatureItem[];
}

export const FeaturesGrid = ({ title, description, columns = 4, items }: FeaturesGridProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-8 w-8" /> : null;
  };

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4"
  }[columns] || "md:grid-cols-4";

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className={`grid gap-6 ${gridCols}`}>
          {items.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  {getIcon(item.icon)}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

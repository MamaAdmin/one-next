import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryButton?: { text: string; url: string };
  secondaryButton?: { text: string; url: string };
}

export const CTASection = ({ title, description, primaryButton, secondaryButton }: CTASectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
        {description && (
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton && (
            <Button asChild size="lg">
              <Link to={primaryButton.url}>{primaryButton.text}</Link>
            </Button>
          )}
          {secondaryButton && (
            <Button asChild variant="outline" size="lg">
              <Link to={secondaryButton.url}>{secondaryButton.text}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

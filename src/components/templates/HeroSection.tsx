import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  primaryCta?: { text: string; url: string };
  secondaryCta?: { text: string; url: string };
  layout?: 'main' | 'sub';
}

export const HeroSection = ({
  badge,
  title,
  subtitle,
  description,
  image,
  primaryCta,
  secondaryCta,
  layout = 'main'
}: HeroSectionProps) => {
  if (layout === 'sub' && image) {
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              {badge && (
                <Badge variant="secondary" className="mb-4">
                  {badge}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {title}
                {subtitle && <span className="block text-primary mt-2">{subtitle}</span>}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">{description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryCta && (
                  <Button asChild size="lg">
                    <Link to={primaryCta.url}>{primaryCta.text}</Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild variant="outline" size="lg">
                    <Link to={secondaryCta.url}>{secondaryCta.text}</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 text-center">
        {badge && (
          <Badge variant="secondary" className="mb-4">
            {badge}
          </Badge>
        )}
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {title}
          {subtitle && <span className="block text-primary mt-2">{subtitle}</span>}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryCta && (
            <Button asChild size="lg">
              <Link to={primaryCta.url}>{primaryCta.text}</Link>
            </Button>
          )}
          {secondaryCta && (
            <Button asChild variant="outline" size="lg">
              <Link to={secondaryCta.url}>{secondaryCta.text}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

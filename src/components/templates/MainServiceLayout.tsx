import { HeroSection } from "./HeroSection";
import { TimelineSection } from "./TimelineSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";

interface MainServiceLayoutProps {
  content: any;
}

export const MainServiceLayout = ({ content }: MainServiceLayoutProps) => {
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'timeline':
        return <TimelineSection key={index} {...section} />;
      case 'features':
        return <FeaturesGrid key={index} {...section} />;
      case 'target-audiences':
        return <FeaturesGrid key={index} columns={3} {...section} />;
      case 'faq':
        return <FAQSection key={index} {...section} />;
      default:
        return null;
    }
  };

  return (
    <main>
      {content.hero && <HeroSection {...content.hero} layout="main" />}
      {content.sections?.map(renderSection)}
      {content.cta && <CTASection {...content.cta} />}
    </main>
  );
};

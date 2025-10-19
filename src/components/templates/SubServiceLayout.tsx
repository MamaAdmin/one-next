import { HeroSection } from "./HeroSection";
import { PurposeOutcomeSection } from "./PurposeOutcomeSection";
import { ParticipantsSection } from "./ParticipantsSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { ProcessSteps } from "./ProcessSteps";
import { CTASection } from "./CTASection";

interface SubServiceLayoutProps {
  content: any;
}

export const SubServiceLayout = ({ content }: SubServiceLayoutProps) => {
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case 'purpose-outcome':
        return <PurposeOutcomeSection key={index} {...section} />;
      case 'participants':
        return <ParticipantsSection key={index} {...section} />;
      case 'when-useful':
        return <FeaturesGrid key={index} columns={3} {...section} />;
      case 'process-steps':
        return <ProcessSteps key={index} {...section} />;
      default:
        return null;
    }
  };

  return (
    <main>
      {content.hero && <HeroSection {...content.hero} layout="sub" />}
      {content.sections?.map(renderSection)}
      {content.cta && <CTASection {...content.cta} />}
    </main>
  );
};

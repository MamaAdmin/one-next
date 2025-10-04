import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";

interface AboutProps {
  isEditMode?: boolean;
}

const About = ({ isEditMode = false }: AboutProps) => {
  const { content, updateContent } = usePageContent('about');
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold">
            <InlineTextField
              value={content.title || 'Wir machen künstliche Intelligenz praktisch nutzbar – für schlankere Prozesse, klügere Entscheidungen und mehr Wirkung im Alltag'}
              onSave={(value) => updateContent('title', value)}
              isEditMode={isEditMode}
              className="text-4xl lg:text-5xl font-bold"
              placeholder="Section title"
              as="h2"
            />
          </h2>
          <InlineTextArea
            value={content.description || 'Wir lieben Herausforderungen, die Kreativität und innovative Technologien erfordern! Als innovatives AI-Entwicklungsunternehmen kombinieren wir starke technische Fähigkeiten mit strategischer Vision. Wir beginnen mit einer Geschäftsanalyse, die uns hilft, uns besser kennenzulernen und ein profitables Tech-Produkt zu liefern. Unser agiler Entwicklungsprozess ist perfekt auf Ihre Bedürfnisse zugeschnitten.'}
            onSave={(value) => updateContent('description', value)}
            isEditMode={isEditMode}
            className="text-xl text-muted-foreground leading-relaxed"
            placeholder="Section description"
            minRows={4}
          />
        </div>
      </div>
    </section>
  );
};

export default About;

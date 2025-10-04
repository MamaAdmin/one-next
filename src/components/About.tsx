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
              value={content.title || 'Wir sind ein Unternehmen für künstliche Intelligenz'}
              onSave={(value) => updateContent('title', value)}
              isEditMode={isEditMode}
              className="text-4xl lg:text-5xl font-bold"
              placeholder="Section title"
              as="h2"
            />
          </h2>
          <InlineTextArea
            value={content.description || 'Wir glauben, dass jede Herausforderung die Chance auf Innovation in sich trägt.Mit künstlicher Intelligenz, Kreativität und klarem Fokus machen wir Ihre Prozesse smarter – und Ihre Vision greifbar. Unser agiler Entwicklungsansatz bringt Ideen in Bewegung und schafft messbare Ergebnisse.'}
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

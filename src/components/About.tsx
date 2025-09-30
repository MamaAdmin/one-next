const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Wir sind ein Unternehmen für{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              künstliche Intelligenz
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Wir lieben Herausforderungen, die Kreativität und innovative Technologien erfordern!
            Als innovatives KI-Entwicklungsunternehmen kombinieren wir starke technische Fähigkeiten
            mit strategischer Vision. Wir beginnen mit einer Geschäftsanalyse, die uns hilft, uns
            besser kennenzulernen und ein profitables Tech-Produkt zu liefern. Unser agiler
            Entwicklungsprozess ist perfekt auf Ihre Bedürfnisse zugeschnitten.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;

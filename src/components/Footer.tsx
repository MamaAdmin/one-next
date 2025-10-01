import { Github, Linkedin, Twitter } from "lucide-react";
const Footer = () => {
  const footerLinks = {
    Services: ["AI Design Sprint", "Proof of AI Development", "Data Quality Audit", "Custom AI Development", "ML Consulting"],
    Lösungen: ["Automatisierung", "Data Science", "Computer Vision", "Natural Language Processing", "Empfehlungssysteme"],
    Unternehmen: ["Über uns", "Karriere", "Blog", "Case Studies", "Kontakt"]
  };
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              
              <span className="text-2xl font-bold">one-next</span>
            </div>
            <p className="text-background/80 mb-6 leading-relaxed">
              Ihr vertrauenswürdiger Partner für AI-Entwicklung. Wir bringen Ihr Unternehmen mit
              maßgeschneiderter Machine Learning Software auf die nächste Stufe.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => <div key={category}>
              <h3 className="font-bold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map(link => <li key={link}>
                    <a href="#" className="text-background/80 hover:text-background transition-colors">
                      {link}
                    </a>
                  </li>)}
              </ul>
            </div>)}
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2025 one-next. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              Datenschutz
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              Impressum
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              AGB
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
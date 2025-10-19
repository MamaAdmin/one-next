import { Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";

interface FooterProps {
  isEditMode?: boolean;
}

const Footer = ({ isEditMode = false }: FooterProps) => {
  const { content, updateContent } = usePageContent('footer');
  const footerLinks = {
    Leistungen: [
      { label: "AI Design Sprint", href: "/sprint-uebersicht" },
      { label: "Datenaudit", href: "/data-quality-audit" },
      { label: "Individuelle KI-Entwicklung", href: "/custom-ai-development" },
      { label: "Workshops", href: "/design-sprint-workshop" },
      { label: "AI Beratung", href: "/ai-consulting-services" },
    ],
    Unternehmen: [
      { label: "Über uns", href: "/about-us" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Kontakt", href: "/workshop-registration" },
    ]
  };
  return <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <InlineTextField
                value={content.company_name || 'one-next'}
                onSave={(value) => updateContent('company_name', value)}
                isEditMode={isEditMode}
                className="text-2xl font-bold"
                placeholder="Unternehmensname"
                as="span"
              />
            </div>
            <InlineTextArea
              value={content.company_description || 'Ihr vertrauenswürdiger Partner für AI-Entwicklung. Wir bringen Ihr Unternehmen mit maßgeschneiderter Machine Learning Software auf die nächste Stufe.'}
              onSave={(value) => updateContent('company_description', value)}
              isEditMode={isEditMode}
              className="text-background/80 mb-6 leading-relaxed"
              placeholder="Unternehmensbeschreibung"
              minRows={2}
            />
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
                {links.map(link => <li key={link.label}>
                    <Link to={link.href} className="text-background/80 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>)}
              </ul>
            </div>)}
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2025 one-next. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/datenschutz" className="text-background/60 hover:text-background transition-colors">
              Datenschutz
            </Link>
            <Link to="/impressum" className="text-background/60 hover:text-background transition-colors">
              Impressum
            </Link>
            <Link to="/agb" className="text-background/60 hover:text-background transition-colors">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
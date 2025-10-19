import { Github, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useNavigation } from "@/hooks/useNavigation";

interface FooterProps {
  isEditMode?: boolean;
}

const Footer = ({ isEditMode = false }: FooterProps) => {
  const { content, updateContent } = usePageContent('footer');
  
  // Load navigation dynamically from database
  const { items: footerItems } = useNavigation("footer");
  
  // Filter top-level items (categories like "Leistungen", "Unternehmen")
  const topLevelItems = footerItems.filter(item => !item.parent_id && item.is_active);
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

          {/* Dynamic navigation from database */}
          {topLevelItems.map((category) => (
            <div key={category.id}>
              <h3 className="font-bold text-lg mb-4">{category.label}</h3>
              <ul className="space-y-2">
                {category.children
                  ?.filter(child => child.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((link) => (
                    <li key={link.id}>
                      <Link 
                        to={link.url || "#"} 
                        className="text-background/80 hover:text-background transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
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
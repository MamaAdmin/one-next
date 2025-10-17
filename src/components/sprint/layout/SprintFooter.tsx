import { Link } from "react-router-dom";

export const SprintFooter = () => {
  return (
    <footer className="border-t border-border bg-background py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 one-next | Online Design Sprint 2.0</p>
          <div className="flex gap-6">
            <Link to="/about-us" className="hover:text-foreground transition-colors">
              Über uns
            </Link>
            <a href="/#about" className="hover:text-foreground transition-colors">
              Kontakt
            </a>
            <Link to="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/one-next-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const servicesItems = [
    { label: "AI Design Sprint", href: "/ai-design-sprint" },
    { label: "Proof of AI Development", href: "#services" },
    { label: "Data Quality Audit", href: "#services" },
    { label: "Custom AI Development", href: "#services" },
    { label: "Strategy Consulting", href: "#services" },
  ];

  const companyItems = [
    { label: "Über uns", href: "#about" },
    { label: "Karriere", href: "#about" },
    { label: "Case Studies", href: "#about" },
    { label: "Kontakt", href: "#about" },
  ];
  return <nav className="fixed top-0 w-full backdrop-blur-sm z-50 bg-[fffffff] bg-white">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="one-next logo" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors font-light outline-none">
                Services <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
                {servicesItems.map(item => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a href={item.href} className="cursor-pointer">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors font-light outline-none">
                Unternehmen <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
                {companyItems.map(item => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a href={item.href} className="cursor-pointer">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="/blog" className="text-foreground/70 hover:text-foreground transition-colors font-light">
              Blog
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <div className="text-foreground font-medium text-sm">Services</div>
              {servicesItems.map(item => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-foreground/70 hover:text-foreground transition-colors font-light pl-4" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-foreground font-medium text-sm">Unternehmen</div>
              {companyItems.map(item => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-foreground/70 hover:text-foreground transition-colors font-light pl-4" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <a 
              href="/blog" 
              className="text-foreground/70 hover:text-foreground transition-colors font-light" 
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </a>
          </div>}
      </div>
    </nav>;
};
export default Navigation;
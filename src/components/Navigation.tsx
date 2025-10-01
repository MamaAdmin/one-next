import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/one-next-logo.png";
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    label: "Services",
    href: "#services"
  }, {
    label: "Über uns",
    href: "#about"
  }, {
    label: "Blog",
    href: "/blog"
  }];
  return <nav className="fixed top-0 w-full backdrop-blur-sm z-50 bg-[fffffff] bg-white">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="one-next logo" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => <a key={item.label} href={item.href} className="text-foreground/70 hover:text-foreground transition-colors font-light">
                {item.label}
              </a>)}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            {navItems.map(item => <a key={item.label} href={item.href} className="text-foreground/70 hover:text-foreground transition-colors font-light" onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </a>)}
          </div>}
      </div>
    </nav>;
};
export default Navigation;
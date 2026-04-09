import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import oneNextLogo from "@/assets/one-next-logo-new.png";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigation } from "@/hooks/useNavigation";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { isAdmin, isBmadUser } = useUserRoles();
  
  // Load navigation dynamically from database
  const { items: headerItems } = useNavigation("header");
  
  // Filter top-level items (without parent_id)
  const topLevelItems = headerItems.filter(item => !item.parent_id && item.is_active);

  // Helper: Get all descendants (children + grandchildren) with depth
  const getAllDescendants = (item: any): any[] => {
    const descendants: any[] = [];
    
    const traverse = (current: any, depth: number = 0) => {
      if (current.children) {
        current.children
          .filter((child: any) => child.is_active)
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .forEach((child: any) => {
            descendants.push({ ...child, depth });
            traverse(child, depth + 1);
          });
      }
    };
    
    traverse(item, 0);
    return descendants;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={`fixed top-0 w-full backdrop-blur-sm z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/90 shadow-md" : "bg-white"
    }`}>
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="https://storage.googleapis.com/gpt-engineer-file-uploads/Y7p4K5s0ZYMhiUT4kyDR1QHgUs42/uploads/1760245953105-one-next-logo-new.png" alt="one-next Logo" className="h-[2.1rem] w-auto" />
          </Link>

          {/* Desktop Navigation - Dynamic */}
          <nav className="hidden md:flex items-center gap-8">
            {topLevelItems.map((item) => {
              // Has children? → Dropdown
              if (item.children && item.children.length > 0) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors outline-none">
                      {item.label} <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-50 bg-background">
                      {getAllDescendants(item).map((child) => (
                        <DropdownMenuItem 
                          key={child.id} 
                          asChild
                          className={child.depth > 0 ? "pl-8" : ""}
                        >
                          <Link to={child.url || "#"} className="cursor-pointer">
                            {child.depth > 0 && "└─ "}
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              // No dropdown → direct link
              return item.url ? (
                <Link 
                  key={item.id} 
                  to={item.url} 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : null;
            })}

            <Link to="/kurse" className="text-foreground hover:text-primary transition-colors">
              Kurse
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Konto
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-background">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Mein Profil
                    </Link>
                  </DropdownMenuItem>
                  {/* Regular users (not admin, not bmad_user) see LMS */}
                  {!isAdmin && !isBmadUser && (
                    <DropdownMenuItem asChild>
                      <Link to="/lms/dashboard" className="cursor-pointer">
                        Meine Kurse
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* BMAD users (not admin) see BMAD Portal */}
                  {!isAdmin && isBmadUser && (
                    <DropdownMenuItem asChild>
                      <Link to="/bmad" className="cursor-pointer">
                        BMAD Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Admin only sees admin links */}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/company/profile" className="cursor-pointer">
                          Unternehmensprofil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          Admin-Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/customers" className="cursor-pointer">
                          Kunden verwalten
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/lms/account/delete" className="cursor-pointer">
                      Account löschen
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Anmelden
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu - Dynamic */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4">
            <div className="flex flex-col gap-4">
              {topLevelItems.map((item) => (
                <div key={item.id} className="border-b pb-4">
                  <p className="text-sm font-semibold mb-2">{item.label}</p>
                  {getAllDescendants(item).map((child) => (
                    <Link
                      key={child.id}
                      to={child.url || "#"}
                      className={`block py-2 hover:bg-accent rounded-md ${
                        child.depth > 0 ? "pl-8" : "pl-4"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {child.depth > 0 && "└─ "}
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}

              <Link
                to="/kurse"
                className="block py-2 px-4 hover:bg-accent rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kurse
              </Link>

              {user ? (
                <>
                  {/* Regular users (not admin, not bmad_user) see LMS */}
                  {!isAdmin && !isBmadUser && (
                    <Link to="/lms/dashboard" className="block py-2 px-4 hover:bg-accent rounded-md">
                      Meine Kurse
                    </Link>
                  )}
                  {/* BMAD users (not admin) see BMAD Portal */}
                  {!isAdmin && isBmadUser && (
                    <Link to="/bmad" className="block py-2 px-4 hover:bg-accent rounded-md">
                      BMAD Portal
                    </Link>
                  )}
                  {/* Admin only sees admin links */}
                  {isAdmin && (
                    <Link to="/admin" className="block py-2 px-4 hover:bg-accent rounded-md">
                      Admin-Dashboard
                    </Link>
                  )}
                  <Link to="/lms/account/delete" className="block py-2 px-4 hover:bg-accent rounded-md">
                    Account löschen
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 px-4 hover:bg-accent rounded-md"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block py-2 px-4 hover:bg-accent rounded-md">
                  <Button variant="default" size="sm" className="w-full">
                    Anmelden
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

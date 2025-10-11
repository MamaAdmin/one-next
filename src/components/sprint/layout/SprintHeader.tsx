import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import oneNextLogo from "@/assets/one-next-logo-new.png";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useSprintSession } from "@/hooks/useSprintSession";

export const SprintHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { isAdmin } = useAdmin();
  const { session } = useSprintSession();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/sprint" },
    { label: "Setup", href: "/sprint/setup" },
    { label: "Session", href: "/sprint/session" },
  ];

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
      isScrolled ? "bg-white/90 dark:bg-background shadow-md" : "bg-white dark:bg-background"
    } border-b border-border`}>
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center" title="Zurück zur Hauptseite">
              <img src={oneNextLogo} alt="one-next logo" className="h-14 w-auto" />
            </Link>
            {session && (
              <div className="hidden md:block text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{session.team_name}</span>
                {" • "}Phase {session.current_phase}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm transition-colors ${
                  location.pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Website
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-background">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4">
            <div className="flex flex-col gap-4">
              {session && (
                <div className="text-sm text-muted-foreground pb-4 border-b">
                  <span className="font-semibold text-foreground">{session.team_name}</span>
                  {" • "}Phase {session.current_phase}
                </div>
              )}

              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block py-2 px-4 rounded-md ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/"
                className="block py-2 px-4 hover:bg-accent rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Zurück zur Website
              </Link>

              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block py-2 px-4 hover:bg-accent rounded-md">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-2 px-4 hover:bg-accent rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block py-2 px-4 hover:bg-accent rounded-md">
                  <Button variant="default" size="sm" className="w-full">
                    Sign In
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

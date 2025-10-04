import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSprintSession } from "@/hooks/useSprintSession";

export const SprintHeader = () => {
  const [user, setUser] = useState<any>(null);
  const { session } = useSprintSession();
  const location = useLocation();

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

  const getTeamInfo = () => {
    if (location.pathname === '/sprint/session' && session) {
      return {
        teamName: session.team_name,
        tag: session.current_day
      };
    }
    
    if (location.pathname === '/sprint/booking') {
      return {
        teamName: 'Sprint Booking',
        tag: 0
      };
    }
    
    if (location.pathname === '/sprint/setup') {
      return {
        teamName: 'Sprint Setup',
        tag: 0
      };
    }
    
    if (location.pathname === '/sprint') {
      return {
        teamName: session?.team_name || 'Sprint',
        tag: session?.current_day || 0
      };
    }

    return {
      teamName: 'Sprint',
      tag: 0
    };
  };

  const { teamName, tag } = getTeamInfo();

  return (
    <nav className="fixed top-0 w-full bg-background border-b border-border z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Links: Team-Name • Tag */}
          <div className="text-sm">
            <span className="font-semibold text-foreground">
              {teamName}
            </span>
            <span className="text-muted-foreground"> • Tag {tag}</span>
          </div>

          {/* Rechts: User-Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Light/Dark theme toggle. Persists selection via next-themes (localStorage),
 * applies the `.dark` class on <html> so all design tokens switch atomically.
 */
export const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration flicker — only render icon state after mount.
  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
      title={isDark ? "Helles Design" : "Dunkles Design"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-foreground hover:text-accent"
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4 opacity-0" />
      )}
    </Button>
  );
};

export default ThemeToggle;

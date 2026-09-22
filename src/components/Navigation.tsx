import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

import logo from "@/assets/one-next-logo-new.png";
import { Navbar5, type NavbarItem } from "@/components/ui/Navbar5";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigation, type NavigationItem } from "@/hooks/useNavigation";
import { useUserRoles } from "@/hooks/useUserRoles";

const flattenChildren = (item: NavigationItem, depth = 0): NavbarItem["children"] =>
  (item.children ?? [])
    .filter((child) => child.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((child) => [
      ...(child.url ? [{ id: child.id, label: child.label, href: child.url, depth }] : []),
      ...(flattenChildren(child, depth + 1) ?? []),
    ]);

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>(null);
  const { isAdmin, isBmadUser, isSprintUser } = useUserRoles();
  const { items: headerItems } = useNavigation("header");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const items = useMemo<NavbarItem[]>(() => {
    const dynamic = headerItems
      .filter((item) => !item.parent_id && item.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        label: item.label,
        href: item.url ?? undefined,
        children: flattenChildren(item),
      }));
    return [...dynamic, { id: "kurse", label: "Kurse", href: "/kurse" }];
  }, [headerItems]);

  const portalLinks = useMemo(() => {
    if (!user) return [];
    if (isAdmin) return [
      { label: "Unternehmensprofil", href: "/company/profile" },
      { label: "Admin-Dashboard", href: "/admin" },
      { label: "Kunden verwalten", href: "/admin/customers" },
    ];
    if (isBmadUser) return [{ label: "BMAD Portal", href: "/bmad" }];
    if (isSprintUser) return [{ label: "Meine Sprints", href: "/sprint" }];
    return [{ label: "Meine Kurse", href: "/lms/dashboard" }];
  }, [isAdmin, isBmadUser, isSprintUser, user]);

  const signOut = () => void supabase.auth.signOut();

  const account = user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User /> Konto <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link to="/profile">Mein Profil</Link></DropdownMenuItem>
        {portalLinks.map((link) => (
          <DropdownMenuItem asChild key={link.href}><Link to={link.href}>{link.label}</Link></DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={signOut}><LogOut /> Abmelden</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button size="sm" asChild><Link to="/auth">Anmelden</Link></Button>
  );

  const mobileAccount = user ? (
    <div className="space-y-1">
      <Link to="/profile" className="block rounded-md px-3 py-3 font-medium hover:bg-accent-soft">Mein Profil</Link>
      {portalLinks.map((link) => <Link key={link.href} to={link.href} className="block rounded-md px-3 py-3 hover:bg-accent-soft">{link.label}</Link>)}
      <Button variant="ghost" className="w-full justify-start" onClick={signOut}><LogOut /> Abmelden</Button>
    </div>
  ) : (
    <Button className="w-full" asChild><Link to="/auth">Anmelden</Link></Button>
  );

  return <Navbar5 logoSrc={logo} logoAlt="One Next" items={items} account={account} mobileAccount={mobileAccount} scrolled={isScrolled} />;
};

export default Navigation;
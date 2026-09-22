import { MenuIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavbarItem = {
  id: string;
  label: string;
  href?: string;
  children?: Array<{ id: string; label: string; href: string; depth?: number; description?: string; icon?: LucideIcon }>;
};

type Navbar5Props = {
  logoSrc: string;
  logoAlt: string;
  items: NavbarItem[];
  account: React.ReactNode;
  mobileAccount: React.ReactNode;
  scrolled?: boolean;
};

export const Navbar5 = ({ logoSrc, logoAlt, items, account, mobileAccount, scrolled = false }: Navbar5Props) => {
  const { pathname } = useLocation();
  const [desktopMenu, setDesktopMenu] = useState("");

  return (
  <header
    className={cn(
      "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
      scrolled ? "border-border/70 bg-background/90 backdrop-blur-md" : "border-transparent bg-background/95 backdrop-blur-sm",
    )}
  >
    <div className="container flex h-16 items-center justify-between px-4 md:px-6">
      <Link to="/" className="shrink-0" aria-label="One Next Startseite">
        <img src={logoSrc} alt={logoAlt} className="h-[2.1rem] w-auto" />
      </Link>

      <NavigationMenu
        value={desktopMenu}
        onValueChange={(value) => {
          if (value) setDesktopMenu(value);
        }}
        className="hidden lg:flex"
        onMouseLeave={() => setDesktopMenu("")}
      >
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.id} value={item.id}>
              {item.children?.length ? (
                <>
                  <NavigationMenuTrigger onMouseEnter={() => setDesktopMenu(item.id)} onFocus={() => setDesktopMenu(item.id)}>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[52rem] grid-cols-5 gap-2 p-5">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        const active = pathname === child.href;
                        return (
                        <li key={child.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={child.href}
                              className={cn(
                                "group/service block h-full rounded-lg border px-4 py-4 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active ? "border-primary bg-primary text-primary-foreground" : "border-transparent text-foreground",
                                child.depth ? "pl-7" : "font-medium",
                              )}
                            >
                              {Icon && <span className={cn("mb-4 flex size-10 items-center justify-center rounded-md bg-muted", active && "bg-primary-foreground/10")}><Icon className="size-5" /></span>}
                              <span className="block font-workshop-heading text-sm font-semibold leading-snug">{child.label}</span>
                              {child.description && <span className={cn("mt-2 block text-xs font-normal leading-relaxed", active ? "text-primary-foreground/75" : "text-muted-foreground")}>{child.description}</span>}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      )})}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : item.href ? (
                <NavigationMenuLink asChild>
                  <Link to={item.href} className={navigationMenuTriggerStyle()}>
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              ) : null}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="hidden lg:flex">{account}</div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Menü öffnen">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90vw] overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b border-border pb-5 text-left">
            <SheetTitle>
              <Link to="/" aria-label="One Next Startseite">
                <img src={logoSrc} alt={logoAlt} className="h-[2.1rem] w-auto" />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="py-5">
            <Accordion type="multiple" className="w-full">
              {items.map((item) => item.children?.length ? (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-base hover:no-underline">{item.label}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        return (
                        <SheetClose asChild key={child.id}>
                          <Link
                            to={child.href}
                            className={cn("flex min-h-14 items-start gap-3 rounded-md px-3 py-3 text-sm hover:bg-accent-soft", pathname === child.href && "bg-accent-soft", child.depth && "pl-7")}
                          >
                            {Icon && <Icon className="mt-0.5 size-5 shrink-0 text-primary" />}
                            <span><span className="block font-workshop-heading font-semibold">{child.label}</span>{child.description && <span className="mt-1 block text-xs text-muted-foreground">{child.description}</span>}</span>
                          </Link>
                        </SheetClose>
                      )})}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : item.href ? (
                <SheetClose asChild key={item.id}>
                  <Link to={item.href} className="block border-b border-border py-4 font-medium">
                    {item.label}
                  </Link>
                </SheetClose>
              ) : null)}
            </Accordion>
          </div>

          <div className="border-t border-border pt-5">{mobileAccount}</div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
  );
};
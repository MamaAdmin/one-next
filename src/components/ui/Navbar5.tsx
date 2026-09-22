import { MenuIcon, type LucideIcon } from "lucide-react";
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
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
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

  return (
  <header
    className={cn(
      "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
      scrolled ? "border-border/70 bg-white/80 backdrop-blur-md" : "border-transparent bg-white/60 backdrop-blur-sm",
    )}
  >
    <div className="container flex h-16 items-center justify-between px-4 md:px-6">
      <Link to="/" className="shrink-0" aria-label="One Next Startseite">
        <img src={logoSrc} alt={logoAlt} className="h-[2.1rem] w-auto" />
      </Link>

      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.id} className="group/nav relative">
              {item.children?.length ? (
                <>
                  <Button
                    variant="ghost"
                    className="h-10 rounded-none border border-transparent bg-transparent px-4 py-2 text-sm font-medium hover:border-border-accent hover:bg-transparent group-hover/nav:border-border-accent"
                    aria-haspopup="true"
                  >
                    {item.label}
                  </Button>
                  <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 opacity-0 transition-all group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100">
                    <ul className="w-[52rem] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg">
                      {item.children.map((child, index) => {
                        const active = pathname === child.href;
                        return (
                        <li key={child.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={child.href}
                              className={cn(
                                "group/service block border-l-2 px-5 py-4 text-sm transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active ? "border-primary bg-accent-soft" : "border-border/60",
                                index > 0 && "border-t border-t-border/40",
                                child.depth && "pl-8",
                              )}
                            >
                              <span className="block font-workshop-heading text-sm font-semibold leading-snug text-foreground">{child.label}</span>
                              {child.description && <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">{child.description}</span>}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      )})}
                    </ul>
                  </div>
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
                      {item.children.map((child) => (
                        <SheetClose asChild key={child.id}>
                          <Link
                            to={child.href}
                            className={cn("block min-h-14 border-l-2 border-border/60 px-4 py-3 text-sm hover:bg-accent-soft", pathname === child.href && "border-primary bg-accent-soft", child.depth && "pl-8")}
                          >
                            <span className="block font-workshop-heading font-semibold">{child.label}</span>
                            {child.description && <span className="mt-1 block text-xs text-muted-foreground">{child.description}</span>}
                          </Link>
                        </SheetClose>
                      ))}
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
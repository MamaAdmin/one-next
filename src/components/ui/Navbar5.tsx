import { MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";

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
  children?: Array<{ id: string; label: string; href: string; depth?: number }>;
};

type Navbar5Props = {
  logoSrc: string;
  logoAlt: string;
  items: NavbarItem[];
  account: React.ReactNode;
  mobileAccount: React.ReactNode;
  scrolled?: boolean;
};

export const Navbar5 = ({ logoSrc, logoAlt, items, account, mobileAccount, scrolled = false }: Navbar5Props) => (
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

      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {items.map((item) => (
            <NavigationMenuItem key={item.id}>
              {item.children?.length ? (
                <>
                  <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[34rem] grid-cols-2 gap-1 p-3">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={child.href}
                              className={cn(
                                "block rounded-md px-4 py-3 text-sm text-foreground transition-colors hover:bg-accent-soft focus:bg-accent-soft focus:outline-none",
                                child.depth ? "pl-7" : "font-medium",
                              )}
                            >
                              {child.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
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
                      {item.children.map((child) => (
                        <SheetClose asChild key={child.id}>
                          <Link
                            to={child.href}
                            className={cn("block rounded-md px-3 py-3 text-sm hover:bg-accent-soft", child.depth && "pl-7")}
                          >
                            {child.label}
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
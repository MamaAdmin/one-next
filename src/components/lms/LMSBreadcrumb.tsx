import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ChevronRight } from "lucide-react";

interface BreadcrumbItemType {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface LMSBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export const LMSBreadcrumb = ({ items }: LMSBreadcrumbProps) => {
  return (
    <nav className="bg-accent/30 border-b border-border fixed top-16 left-0 right-0 z-40" aria-label="breadcrumb">
      <div className="container mx-auto px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const isActive = item.active || isLast;

              return (
                <div key={index} className="flex items-center">
                  <BreadcrumbItem>
                    {isActive ? (
                      <BreadcrumbPage className="flex items-center gap-2">
                        {item.icon}
                        <span className="hidden sm:inline">{item.label}</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href || "#"} className="flex items-center gap-2">
                          {item.icon}
                          <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </nav>
  );
};

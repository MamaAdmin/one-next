import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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

interface BMADBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export const BMADBreadcrumb = ({ items }: BMADBreadcrumbProps) => {
  return (
    <nav className="fixed top-[72px] left-0 right-0 z-40 bg-accent/30 border-b border-border">
      <div className="container mx-auto px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <BreadcrumbItem key={index}>
                {item.active ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.icon && (
                      <span className="hidden sm:inline">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link to={item.href || "#"} className="flex items-center gap-2">
                        {item.icon && (
                          <span className="hidden sm:inline">{item.icon}</span>
                        )}
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                    {index < items.length - 1 && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </nav>
  );
};

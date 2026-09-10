import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItemType {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export const AdminBreadcrumb = ({ items }: AdminBreadcrumbProps) => {
  return (
    <nav
      className="bg-accent/30 border-b border-border fixed top-16 left-0 right-0 z-40"
      aria-label="breadcrumb"
    >
      <div className="container mx-auto px-6 py-3">
        <ol className="flex flex-nowrap items-center gap-2 overflow-x-auto text-sm text-muted-foreground whitespace-nowrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isActive = item.active || isLast;
            const content = (
              <>
                {item.icon}
                <span className="max-w-[16rem] truncate">{item.label}</span>
              </>
            );

            return (
              <li key={index} className="flex shrink-0 items-center gap-2">
                {item.href ? (
                  <Link
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-w-0 items-center gap-2 transition-colors hover:text-foreground ${
                      isActive ? "font-normal text-foreground" : ""
                    }`}
                  >
                    {content}
                  </Link>
                ) : (
                  <span
                    aria-current={isActive ? "page" : undefined}
                    className="flex min-w-0 items-center gap-2 font-normal text-foreground"
                  >
                    {content}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardPageProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export const DashboardPage = ({ children, className, contentClassName }: DashboardPageProps) => (
  <main className={cn("flex-1 w-full px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-8", className)}>
    <div className={cn("mx-auto w-full max-w-7xl space-y-6", contentClassName)}>{children}</div>
  </main>
);

export const DashboardHeader = ({ title, description, action, eyebrow }: DashboardHeaderProps) => (
  <header className="flex flex-col gap-5 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p> : null}
    </div>
    {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
  </header>
);

export const DashboardToolbar = ({ children, className }: DashboardPageProps) => (
  <div className={cn("flex flex-col gap-3 border-y border-border/70 bg-muted/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center", className)}>
    {children}
  </div>
);

export const DashboardSectionTitle = ({ title, description }: Pick<DashboardHeaderProps, "title" | "description">) => (
  <div>
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
  </div>
);
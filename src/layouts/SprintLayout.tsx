import { Outlet } from "react-router-dom";
import { SprintHeader } from "@/components/sprint/layout/SprintHeader";
import { SprintFooter } from "@/components/sprint/layout/SprintFooter";

export const SprintLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SprintHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SprintFooter />
    </div>
  );
};

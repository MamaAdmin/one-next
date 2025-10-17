import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourseTabsProps {
  overview: React.ReactNode;
  announcements?: React.ReactNode;
}

export function CourseTabs({ overview, announcements }: CourseTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="announcements">Ankündigungen</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-6 mt-6">
        {overview}
      </TabsContent>
      <TabsContent value="announcements" className="mt-6">
        {announcements || (
          <p className="text-muted-foreground text-center py-8">
            Keine Ankündigungen verfügbar
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

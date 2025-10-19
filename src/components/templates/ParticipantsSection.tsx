import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface ParticipantRole {
  title: string;
  description: string;
}

interface ParticipantsSectionProps {
  title?: string;
  count?: string;
  roles: ParticipantRole[];
}

export const ParticipantsSection = ({ title, count, roles }: ParticipantsSectionProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{title || "Teilnehmer & Rollen"}</CardTitle>
                {count && <p className="text-sm text-muted-foreground mt-1">{count}</p>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="pb-4 border-b last:border-b-0">
                  <h4 className="font-semibold mb-1">{role.title}</h4>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

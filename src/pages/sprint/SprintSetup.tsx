import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSprintSession } from "@/hooks/useSprintSession";
import { Calendar, Users, Mail, Sparkles, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  name: string;
  email: string;
  role: "decider" | "facilitator" | "designer" | "developer" | "team_member";
}

interface Expert {
  name: string;
  email: string;
  expertise: string;
  days: number[];
}

export default function SprintSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, createNewSession, updateSession } = useSprintSession();
  
  const [teamName, setTeamName] = useState("Mein Team");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: "", email: "", role: "decider" },
    { name: "", email: "", role: "facilitator" },
    { name: "", email: "", role: "designer" },
    { name: "", email: "", role: "developer" },
  ]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [kickoffDates, setKickoffDates] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const roleLabels = {
    decider: "Entscheider",
    facilitator: "Facilitator",
    designer: "Designer",
    developer: "Entwickler",
    team_member: "Team-Mitglied",
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", email: "", role: "team_member" }]);
  };

  const removeTeamMember = (index: number) => {
    if (index < 4) return; // Keep core roles
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const addExpert = () => {
    setExperts([...experts, { name: "", email: "", expertise: "", days: [1] }]);
  };

  const removeExpert = (index: number) => {
    setExperts(experts.filter((_, i) => i !== index));
  };

  const updateExpert = (index: number, field: keyof Expert, value: any) => {
    const updated = [...experts];
    updated[index] = { ...updated[index], [field]: value };
    setExperts(updated);
  };

  const toggleExpertDay = (expertIndex: number, day: number) => {
    const updated = [...experts];
    const days = updated[expertIndex].days;
    if (days.includes(day)) {
      updated[expertIndex].days = days.filter(d => d !== day);
    } else {
      updated[expertIndex].days = [...days, day].sort();
    }
    setExperts(updated);
  };

  const handleSubmit = async () => {
    // Validation
    if (!teamName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Team-Namen ein.",
        variant: "destructive",
      });
      return;
    }

    const validMembers = teamMembers.filter(m => m.name.trim() && m.email.trim());
    if (validMembers.length === 0) {
      toast({
        title: "Fehler",
        description: "Bitte fügen Sie mindestens ein Team-Mitglied hinzu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create or update session
      let sessionData = session;
      if (!sessionData) {
        sessionData = await createNewSession(teamName);
      } else {
        await updateSession({
          team_name: teamName,
          challenge_data: {
            ...session.challenge_data,
            teamSetup: {
              teamMembers: validMembers,
              experts,
              kickoffDates,
            },
          },
        });
      }

      // Send invitations via Edge Function
      const { error } = await supabase.functions.invoke('send-sprint-invitation', {
        body: {
          sessionToken: sessionData.session_token,
          teamName,
          teamMembers: validMembers,
          experts,
          kickoffDates,
        },
      });

      if (error) throw error;

      toast({
        title: "Erfolgreich!",
        description: "Einladungen wurden versendet. Weiterleitung zum Dashboard...",
      });

      setTimeout(() => {
        navigate(`/ai-design-sprint/dashboard?token=${sessionData.session_token}`);
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Fehler",
        description: "Einladungen konnten nicht versendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Sprint Setup
          </Badge>
          <h1 className="text-4xl font-bold">Sprint-Team einrichten</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Erstellen Sie Ihr Sprint-Team und laden Sie Mitglieder sowie Experten ein.
          </p>
        </div>

        {/* Team Name */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Team-Name</h2>
            </div>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="z.B. Product Innovation Team"
              className="text-lg"
            />
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Team-Mitglieder</h2>
              </div>
              <Button onClick={addTeamMember} variant="outline" size="sm">
                + Mitglied hinzufügen
              </Button>
            </div>

            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-Mail</Label>
                    <Input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                      placeholder="max@example.com"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1 justify-center">
                      {roleLabels[member.role]}
                    </Badge>
                    {index >= 4 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Experts */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Experten einladen (Optional)</h2>
              </div>
              <Button onClick={addExpert} variant="outline" size="sm">
                + Experten hinzufügen
              </Button>
            </div>

            {experts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Fügen Sie Experten hinzu, die an spezifischen Tagen teilnehmen sollen (z.B. Tag 1 & Tag 5).
              </p>
            ) : (
              <div className="space-y-4">
                {experts.map((expert, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={expert.name}
                          onChange={(e) => updateExpert(index, "name", e.target.value)}
                          placeholder="Dr. Anna Schmidt"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-Mail</Label>
                        <Input
                          type="email"
                          value={expert.email}
                          onChange={(e) => updateExpert(index, "email", e.target.value)}
                          placeholder="anna@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fachgebiet</Label>
                        <Input
                          value={expert.expertise}
                          onChange={(e) => updateExpert(index, "expertise", e.target.value)}
                          placeholder="UX Research"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Teilnahme an Phasen</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map(phase => (
                          <Button
                            key={phase}
                            variant={expert.days.includes(phase) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleExpertDay(index, phase)}
                          >
                            Phase {phase}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpert(index)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Experten entfernen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Kick-off Meetings */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Kick-off Termine (Optional)</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Planen Sie Ihre Sprint-Tage. Termine werden als Kalender-Einladung versendet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(phase => (
                <div key={phase} className="space-y-2">
                  <Label>Phase {phase} - {["Problem Framing", "Map", "Sketch", "Decide", "Prototype", "Test"][phase - 1]}</Label>
                  <Input
                    type="datetime-local"
                    value={kickoffDates[phase] || ""}
                    onChange={(e) => setKickoffDates({ ...kickoffDates, [phase]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-primary text-primary-foreground min-w-[200px]"
          >
            {isLoading ? (
              "Einladungen werden versendet..."
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Einladungen versenden
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

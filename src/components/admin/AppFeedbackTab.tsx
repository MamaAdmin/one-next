import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Lightbulb, HelpCircle, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface AppFeedback {
  id: string;
  user_id: string;
  page_url: string;
  category: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "Neu", color: "bg-blue-100 text-blue-800" },
  { value: "in_review", label: "In Bearbeitung", color: "bg-yellow-100 text-yellow-800" },
  { value: "resolved", label: "Erledigt", color: "bg-green-100 text-green-800" },
  { value: "dismissed", label: "Abgelehnt", color: "bg-gray-100 text-gray-600" },
];

const CATEGORY_ICONS: Record<string, any> = {
  bug: Bug,
  idea: Lightbulb,
  other: HelpCircle,
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug",
  idea: "Idee",
  other: "Sonstiges",
};

const AppFeedbackTab = () => {
  const [feedbacks, setFeedbacks] = useState<AppFeedback[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const loadFeedbacks = async () => {
    const query = (supabase.from("app_feedback" as any) as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (filter !== "all") query.eq("status", filter);
    const { data } = await query;
    const list = (data as AppFeedback[]) || [];
    setFeedbacks(list);

    const userIds = Array.from(new Set(list.map((f) => f.user_id)));
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .in("id", userIds);
      const map = new Map<string, Profile>();
      (profs || []).forEach((p: any) => map.set(p.id, p));
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeedbacks();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await (supabase.from("app_feedback" as any) as any).update({ status }).eq("id", id);
    toast({ title: "Status aktualisiert" });
    loadFeedbacks();
  };

  const saveNotes = async (id: string) => {
    await (supabase.from("app_feedback" as any) as any)
      .update({ admin_notes: editNotes })
      .eq("id", id);
    setEditingId(null);
    toast({ title: "Notiz gespeichert" });
    loadFeedbacks();
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Feedback wirklich löschen?")) return;
    await (supabase.from("app_feedback" as any) as any).delete().eq("id", id);
    toast({ title: "Feedback gelöscht" });
    loadFeedbacks();
  };

  const getUserName = (userId: string) => {
    const p = profiles.get(userId);
    return p?.full_name || p?.email || userId.slice(0, 8);
  };

  const statusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((o) => o.value === status);
    return <Badge className={`${s?.color || ""} border-0 font-normal`}>{s?.label || status}</Badge>;
  };

  const total = feedbacks.length;
  const newCount = feedbacks.filter((f) => f.status === "new").length;
  const bugCount = feedbacks.filter((f) => f.category === "bug").length;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">Gesamt</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{newCount}</p>
          <p className="text-xs text-muted-foreground">Neu</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-red-500">{bugCount}</p>
          <p className="text-xs text-muted-foreground">Bugs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{total - bugCount}</p>
          <p className="text-xs text-muted-foreground">Ideen & Sonstiges</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {feedbacks.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          Noch kein Feedback vorhanden.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => {
            const Icon = CATEGORY_ICONS[f.category] || HelpCircle;
            return (
              <Card key={f.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">{getUserName(f.user_id)}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {CATEGORY_LABELS[f.category] || f.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusBadge(f.status)}
                      <Select value={f.status} onValueChange={(v) => updateStatus(f.id, v)}>
                        <SelectTrigger className="h-7 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">{f.message}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Seite: {f.page_url}</span>
                    <span>{format(new Date(f.created_at), "dd. MMM yyyy HH:mm", { locale: de })}</span>
                  </div>

                  {editingId === f.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        placeholder="Admin-Notiz..."
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Abbrechen</Button>
                        <Button size="sm" onClick={() => saveNotes(f.id)}>Speichern</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {f.admin_notes && (
                        <p className="text-xs bg-muted rounded px-2 py-1 flex-1">{f.admin_notes}</p>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        onClick={() => {
                          setEditingId(f.id);
                          setEditNotes(f.admin_notes || "");
                        }}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" /> Notiz
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive"
                        onClick={() => deleteFeedback(f.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Löschen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppFeedbackTab;

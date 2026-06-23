import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  redirect_type: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export const RedirectManager = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [redirectType, setRedirectType] = useState("301");
  const { toast } = useToast();

  const fetchRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_redirects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error("Error fetching redirects:", error);
    }
  };

  const addRedirect = async () => {
    if (!fromPath || !toPath) {
      toast({
        title: "Fehler",
        description: "Bitte beide Pfade ausfüllen",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("seo_redirects").insert({
        from_path: fromPath,
        to_path: toPath,
        redirect_type: parseInt(redirectType),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Redirect erstellt",
      });

      setFromPath("");
      setToPath("");
      await fetchRedirects();
    } catch (error) {
      console.error("Error adding redirect:", error);
      toast({
        title: "Fehler",
        description: "Redirect konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("seo_redirects")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      await fetchRedirects();
    } catch (error) {
      console.error("Error updating redirect:", error);
    }
  };

  const deleteRedirect = async (id: string) => {
    try {
      const { error } = await supabase
        .from("seo_redirects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Redirect gelöscht",
      });

      await fetchRedirects();
    } catch (error) {
      console.error("Error deleting redirect:", error);
      toast({
        title: "Fehler",
        description: "Redirect konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Redirects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="from">Von (Pfad)</Label>
              <Input
                id="from"
                value={fromPath}
                onChange={(e) => setFromPath(e.target.value)}
                placeholder="/alter-pfad"
              />
            </div>
            <div>
              <Label htmlFor="to">Nach (Pfad)</Label>
              <Input
                id="to"
                value={toPath}
                onChange={(e) => setToPath(e.target.value)}
                placeholder="/neuer-pfad"
              />
            </div>
            <div>
              <Label htmlFor="type">Typ</Label>
              <Select value={redirectType} onValueChange={setRedirectType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 (Permanent)</SelectItem>
                  <SelectItem value="302">302 (Temporary)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addRedirect}>
            <Plus className="h-4 w-4 mr-2" />
            Redirect hinzufügen
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Von</TableHead>
              <TableHead>Nach</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Aktiv</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redirects.map((redirect) => (
              <TableRow key={redirect.id}>
                <TableCell className="font-mono text-sm">
                  {redirect.from_path}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {redirect.to_path}
                </TableCell>
                <TableCell>{redirect.redirect_type}</TableCell>
                <TableCell>
                  <Switch
                    checked={redirect.is_active ?? false}
                    onCheckedChange={(checked) => toggleActive(redirect.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRedirect(redirect.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {redirects.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Noch keine Redirects vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

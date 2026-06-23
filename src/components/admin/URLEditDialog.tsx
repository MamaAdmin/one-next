import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AffectedItem {
  id: string;
  label: string;
  menu_name: string;
  menu_label: string;
}

interface URLEditDialogProps {
  currentUrl: string;
  itemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newUrl: string, options: {
    createRedirect: boolean;
    updateAllItems: boolean;
  }) => Promise<void>;
}

export const URLEditDialog = ({
  currentUrl,
  itemId: _itemId,
  open,
  onOpenChange,
  onSave,
}: URLEditDialogProps) => {
  const [newUrl, setNewUrl] = useState(currentUrl);
  const [createRedirect, setCreateRedirect] = useState(true);
  const [updateAllItems, setUpdateAllItems] = useState(true);
  const [affectedItems, setAffectedItems] = useState<AffectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && currentUrl) {
      setNewUrl(currentUrl);
      fetchAffectedItems();
    }
  }, [open, currentUrl]);

  const fetchAffectedItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select(`
          id,
          label,
          navigation_menus!inner(name, label)
        `)
        .eq("url", currentUrl);

      if (error) throw error;

      const items = (data || []).map(item => ({
        id: item.id,
        label: item.label,
        menu_name: (item.navigation_menus as any).name,
        menu_label: (item.navigation_menus as any).label,
      }));

      setAffectedItems(items);
    } catch (error) {
      console.error("Error fetching affected items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newUrl.trim() || newUrl === currentUrl) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(newUrl.trim(), {
        createRedirect,
        updateAllItems,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving URL:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>URL umbenennen</DialogTitle>
          <DialogDescription>
            Ändere die URL und verwalte automatisch Redirects und Updates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="old-url">Alte URL</Label>
            <Input
              id="old-url"
              value={currentUrl}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-url">Neue URL</Label>
            <Input
              id="new-url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="/neue-url"
            />
          </div>

          {affectedItems.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{affectedItems.length} Navigationselement{affectedItems.length !== 1 ? "e" : ""} betroffen:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  {affectedItems.map(item => (
                    <li key={item.id}>
                      • {item.menu_label} &gt; {item.label}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-redirect"
                checked={createRedirect}
                onCheckedChange={(checked) => setCreateRedirect(!!checked)}
              />
              <Label
                htmlFor="create-redirect"
                className="text-sm font-normal cursor-pointer"
              >
                301 Redirect erstellen (alte URL → neue URL)
              </Label>
            </div>

            {affectedItems.length > 1 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="update-all"
                  checked={updateAllItems}
                  onCheckedChange={(checked) => setUpdateAllItems(!!checked)}
                />
                <Label
                  htmlFor="update-all"
                  className="text-sm font-normal cursor-pointer"
                >
                  Alle {affectedItems.length} betroffenen Items aktualisieren
                </Label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

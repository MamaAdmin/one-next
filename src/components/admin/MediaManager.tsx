import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2 } from "lucide-react";

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

const MediaManager = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Mediendateien konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setFiles(data || []);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Benutzer ist nicht angemeldet.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("media").insert([
        {
          filename: file.name,
          file_path: publicUrl,
          file_type: file.type,
          uploaded_by: user.id,
          file_size: file.size,
        },
      ]);

      if (dbError) throw dbError;

      toast({ title: "Erfolg", description: "Datei wurde erfolgreich hochgeladen." });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm("Möchten Sie diese Datei wirklich löschen?")) return;

    try {
      // Extract file path from public URL
      const fileName = filePath.split("/blog-images/")[1];

      const { error: storageError } = await supabase.storage
        .from("blog-images")
        .remove([fileName]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("media").delete().eq("id", id);

      if (dbError) throw dbError;

      toast({ title: "Erfolg", description: "Datei wurde erfolgreich gelöscht." });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Kopiert", description: "URL wurde in die Zwischenablage kopiert." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medien hochladen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="file-upload">
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Klicken Sie zum Hochladen oder ziehen Sie Dateien hierher
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF bis 10 MB
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*"
              />
            </Label>
            {uploading && <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mediathek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg overflow-hidden">
                <img
                  src={file.file_path}
                  alt={file.filename}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-2">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.file_path)}
                      className="flex-1"
                    >
                      URL kopieren
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file.id, file.file_path)}
                      aria-label="Datei löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaManager;

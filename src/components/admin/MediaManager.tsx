import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2, Search, Filter } from "lucide-react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import MediaFileNameEdit from "./MediaFileNameEdit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

const MediaManager = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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

  const uploadFile = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Benutzer ist nicht angemeldet.");

      // Compress image if it's an image
      let processedFile = file;
      let dimensions: { width: number | undefined; height: number | undefined } = { width: undefined, height: undefined };
      
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
        
        // Get image dimensions
        const img = await createImageBitmap(processedFile);
        dimensions = { width: img.width, height: img.height };
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, processedFile);

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
          file_size: processedFile.size,
          width: dimensions.width,
          height: dimensions.height,
        },
      ]);

      if (dbError) throw dbError;
      
      return true;
    } catch (error: any) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          await uploadFile(files[i]);
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({ 
          title: "Erfolg", 
          description: `${successCount} Datei(en) erfolgreich hochgeladen.` 
        });
      }
      if (failCount > 0) {
        toast({
          title: "Warnung",
          description: `${failCount} Datei(en) konnten nicht hochgeladen werden.`,
          variant: "destructive",
        });
      }
      fetchMedia();
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of acceptedFiles) {
        try {
          await uploadFile(file);
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast({ 
          title: "Erfolg", 
          description: `${successCount} Datei(en) erfolgreich hochgeladen.` 
        });
      }
      if (failCount > 0) {
        toast({
          title: "Warnung",
          description: `${failCount} Datei(en) konnten nicht hochgeladen werden.`,
          variant: "destructive",
        });
      }
      fetchMedia();
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 10485760, // 10MB
    multiple: true,
  });

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

  const handleRename = async (id: string, newFilename: string) => {
    try {
      const { error } = await supabase
        .from("media")
        .update({ filename: newFilename })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Datei wurde erfolgreich umbenannt.",
      });
      fetchMedia();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || file.file_type.startsWith(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medien hochladen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "hover:bg-accent/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Dateien hier ablegen..."
                  : "Klicken oder Dateien hierher ziehen"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF bis 10 MB • Mehrere Dateien möglich
              </p>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*"
                multiple
              />
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Wird hochgeladen und optimiert...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mediathek</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dateien durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="image">Bilder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm || filterType !== "all"
                ? "Keine passenden Dateien gefunden"
                : "Noch keine Mediendateien vorhanden"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
              <div key={file.id} className="border rounded-lg overflow-hidden">
                <img
                  src={file.file_path}
                  alt={file.filename}
                  className="w-full h-48 object-cover"
                />
                  <div className="p-4 space-y-2">
                    <MediaFileNameEdit
                      filename={file.filename}
                      onRename={(newName) => handleRename(file.id, newName)}
                    />
                    {file.width && file.height && (
                      <p className="text-xs text-muted-foreground">
                        {file.width} × {file.height} • {((file.file_size ?? 0) / 1024).toFixed(0)} KB
                      </p>
                    )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaManager;

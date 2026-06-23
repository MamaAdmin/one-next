import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useArtifacts } from "@/hooks/useArtifacts";
import { Upload, FileText, Image, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/blog/RichTextEditor";

interface ArtifactUploadProps {
  enrollmentId: string;
  moduleId: string;
  onUpload?: (artifact: any) => void;
}

export const ArtifactUpload = ({
  enrollmentId,
  moduleId,
  onUpload,
}: ArtifactUploadProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { artifacts, uploadArtifact, deleteArtifact, getArtifactUrl, loading } =
    useArtifacts(enrollmentId, moduleId);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast({
        title: "Fehler",
        description: "Bitte Datei und Titel angeben",
        variant: "destructive",
      });
      return;
    }

    try {
      const artifact = await uploadArtifact(
        selectedFile,
        moduleId,
        title,
        description
      );

      toast({
        title: "Erfolg",
        description: "Artifact hochgeladen",
      });

      onUpload?.(artifact);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Upload fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (artifactId: string, filePath: string) => {
    try {
      await deleteArtifact(artifactId, filePath);
      toast({
        title: "Erfolg",
        description: "Artifact gelöscht",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Löschen fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith("image/")) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Neues Artifact hochladen</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titel*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Journey Map Sprint XY"
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <RichTextEditor
              value={description}
              onSave={async (value) => {
                setDescription(value);
              }}
              isEditMode={true}
              placeholder="Optionale Beschreibung..."
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label>Datei</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-accent" : "border-muted"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Datei hierher ziehen oder klicken zum Auswählen
                  </p>
                </label>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title || loading}
            className="w-full"
          >
            Hochladen
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Hochgeladene Artifacts ({artifacts.length})
        </h3>

        {artifacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Artifacts hochgeladen
          </p>
        ) : (
          <div className="space-y-3">
            {artifacts.map((artifact) => (
              <Card key={artifact.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getFileIcon(artifact.file_type || "")}
                    <div>
                      <h4 className="font-medium">{artifact.title}</h4>
                      {artifact.description && (
                        <p className="text-sm text-muted-foreground">
                          {artifact.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(artifact.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={getArtifactUrl(artifact.file_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDelete(artifact.id, artifact.file_path)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

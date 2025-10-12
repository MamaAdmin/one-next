import { useState } from "react";
import { Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  onUpload: (file: File) => Promise<string>;
}

export const AvatarUpload = ({ currentAvatar, userName, onUpload }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert("Datei zu groß. Maximal 2MB erlaubt.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Bitte wählen Sie eine Bilddatei aus.");
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32">
        <AvatarImage src={currentAvatar || undefined} alt={userName} />
        <AvatarFallback className="text-4xl">
          <User className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>
      
      <Button
        variant="outline"
        disabled={uploading}
        className="relative"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Wird hochgeladen..." : "Foto hochladen"}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        JPG, PNG oder GIF. Max. 2MB.
      </p>
    </div>
  );
};

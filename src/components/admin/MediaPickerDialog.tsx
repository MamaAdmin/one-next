import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
}

interface MediaPickerDialogProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}

export const MediaPickerDialog = ({
  onSelect,
  trigger,
}: MediaPickerDialogProps) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Image className="h-4 w-4 mr-2" />
            Aus Mediathek wählen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Mediathek</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "border rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors",
                  "flex flex-col items-center gap-2"
                )}
                onClick={() => handleSelect(file.file_path)}
              >
                {file.file_type.startsWith("image/") ? (
                  <img
                    src={file.file_path}
                    alt={file.filename}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="text-xs text-center line-clamp-2 w-full">
                  {file.filename}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

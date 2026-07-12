import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookPlus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookshelf, type NewBookshelfBook } from "@/hooks/useBookshelf";

const bookSchema = z.object({
  title: z.string().trim().min(1, "Bitte einen Buchtitel angeben").max(200),
  author: z.string().trim().max(150).optional(),
  address: z.string().trim().min(3, "Bitte die Adresse des Milchkästchens angeben").max(200),
  available_from: z.string().min(1, "Bitte ein Startdatum angeben"),
  available_until: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
});

const today = () => new Date().toISOString().slice(0, 10);

export const AddBookDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [address, setAddress] = useState("");
  const [availableFrom, setAvailableFrom] = useState(today());
  const [availableUntil, setAvailableUntil] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const { addBook } = useBookshelf();

  const resetForm = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setTitle("");
    setAuthor("");
    setAddress("");
    setAvailableFrom(today());
    setAvailableUntil("");
    setNotes("");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fehler", description: "Bild darf maximal 5 MB groß sein", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Fehler", description: "Bitte eine Bilddatei auswählen", variant: "destructive" });
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated: NewBookshelfBook = bookSchema.parse({
        title,
        author: author || undefined,
        address,
        available_from: availableFrom,
        available_until: availableUntil || undefined,
        notes: notes || undefined,
      });

      setLoading(true);
      await addBook(validated, coverFile);
      resetForm();
      setOpen(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validierungsfehler", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({
          title: "Fehler",
          description: error.message || "Das Buch konnte nicht eingetragen werden",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="lg">
          <BookPlus className="w-4 h-4 mr-2" />
          Buch eintragen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buch in den Bücherschrank legen</DialogTitle>
          <DialogDescription>
            Trag dein Buch ein und gib an, in welchem Milchkästchen am Hirzel es liegt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            {coverPreview ? (
              <img src={coverPreview} alt="Buchcover Vorschau" className="h-40 w-28 object-cover rounded-md border" />
            ) : (
              <div className="h-40 w-28 rounded-md border border-dashed flex items-center justify-center text-muted-foreground text-xs text-center px-2">
                Kein Cover
              </div>
            )}
            <Button type="button" variant="outline" size="sm" className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-4 h-4 mr-2" />
              Cover hochladen
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-title">Buchtitel *</Label>
            <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-author">Autor:in</Label>
            <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-address">Adresse des Milchkästchens *</Label>
            <Input
              id="book-address"
              placeholder="z. B. Hirzelstrasse 12, 8816 Hirzel"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="book-from">Verfügbar von *</Label>
              <Input
                id="book-from"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-until">Verfügbar bis</Label>
              <Input
                id="book-until"
                type="date"
                min={availableFrom}
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-notes">Bemerkung</Label>
            <Textarea
              id="book-notes"
              placeholder="z. B. Zustand des Buchs, Genre, ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird eingetragen..." : "Buch eintragen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

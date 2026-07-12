import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BookshelfBook {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  address: string;
  available_from: string;
  available_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewBookshelfBook {
  title: string;
  author?: string;
  address: string;
  available_from: string;
  available_until?: string;
  notes?: string;
}

export const useBookshelf = () => {
  const [books, setBooks] = useState<BookshelfBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookshelf_books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error("Error loading bookshelf books:", error);
      toast({
        title: "Fehler",
        description: "Die Bücher konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const uploadCover = async (userId: string, file: File) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("bookshelf-covers")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("bookshelf-covers").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addBook = async (book: NewBookshelfBook, coverFile?: File | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Bitte melden Sie sich an, um ein Buch einzutragen");

    let coverImageUrl: string | null = null;
    if (coverFile) {
      coverImageUrl = await uploadCover(user.id, coverFile);
    }

    const { error } = await supabase.from("bookshelf_books").insert([
      {
        user_id: user.id,
        title: book.title,
        author: book.author || null,
        address: book.address,
        available_from: book.available_from,
        available_until: book.available_until || null,
        notes: book.notes || null,
        cover_image_url: coverImageUrl,
      },
    ]);

    if (error) throw error;

    toast({
      title: "Buch eingetragen",
      description: "Dein Buch ist jetzt in der Bibliothek sichtbar.",
    });

    await loadBooks();
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase.from("bookshelf_books").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Buch entfernt", description: "Der Eintrag wurde gelöscht." });
      await loadBooks();
    } catch (error: any) {
      console.error("Error deleting bookshelf book:", error);
      toast({
        title: "Fehler",
        description: "Der Eintrag konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  return { books, loading, addBook, deleteBook, refresh: loadBooks };
};

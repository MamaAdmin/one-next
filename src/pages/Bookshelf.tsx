import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { BookOpen, BookPlus, MapPin, Calendar, Trash2, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useBookshelf } from "@/hooks/useBookshelf";
import { AddBookDialog } from "@/components/bookshelf/AddBookDialog";

const formatDate = (value: string) => format(new Date(value), "d. MMMM yyyy", { locale: de });

const Bookshelf = () => {
  const { books, loading, deleteBook } = useBookshelf();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return books;
    return books.filter((book) =>
      [book.title, book.author, book.address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query))
    );
  }, [books, search]);

  return (
    <div className="min-h-screen">
      <SEO
        title="Bücherschrank am Hirzel"
        description="Die Bücherbibliothek am Hirzel: Bücher aus den Milchkästchen der Nachbarschaft entdecken und eigene Bücher eintragen."
      />
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <BookOpen className="w-10 h-10 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Bücherschrank am Hirzel</h1>
          <p className="text-muted-foreground text-lg">
            Legt eure Bücher ins Milchkästchen und teilt sie mit der Nachbarschaft. Hier seht ihr,
            welche Bücher gerade wo verfügbar sind.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nach Titel, Autor:in oder Adresse suchen"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {userId ? (
            <AddBookDialog />
          ) : (
            <Button size="lg" onClick={() => navigate("/auth?redirect=/buecherschrank")}>
              <BookPlus className="w-4 h-4 mr-2" />
              Buch eintragen
            </Button>
          )}
        </div>

        {!userId && (
          <p className="text-sm text-muted-foreground text-center mb-8">
            <Button variant="link" className="px-1" onClick={() => navigate("/auth?redirect=/buecherschrank")}>
              Melde dich mit Google an
            </Button>
            um selbst ein Buch einzutragen.
          </p>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground">Bücher werden geladen …</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {books.length === 0 ? "Noch keine Bücher eingetragen." : "Keine Bücher gefunden."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden flex flex-col">
                <div className="h-56 bg-muted flex items-center justify-center">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={`Cover von ${book.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="flex-1 flex flex-col gap-2 pt-4">
                  <h3 className="font-semibold text-lg leading-tight">{book.title}</h3>
                  {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
                  <div className="flex items-start gap-2 text-sm mt-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>{book.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>
                      {formatDate(book.available_from)}
                      {book.available_until ? ` bis ${formatDate(book.available_until)}` : " (auf unbestimmte Zeit)"}
                    </span>
                  </div>
                  {book.notes && <p className="text-sm text-muted-foreground mt-1">{book.notes}</p>}
                  {userId === book.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 self-start text-destructive hover:text-destructive"
                      onClick={() => deleteBook(book.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Entfernen
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Bookshelf;

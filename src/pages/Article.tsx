import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/config/seoConfig";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  published_at: string;
  featured_image?: string;
  media?: {
    file_path: string;
    alt_text: string | null;
  };
}

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager } = useContentManager();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("articles")
        .select("*, media:featured_image(file_path, alt_text)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching article:", error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [slug]);

  const handleUpdateArticle = async (field: string, value: string) => {
    if (!article) return;

    try {
      const { error } = await supabase
        .from("articles")
        .update({ [field]: value })
        .eq("id", article.id);

      if (error) throw error;

      setArticle((prev) => (prev ? { ...prev, [field]: value } : null));

      toast({
        title: "Erfolg",
        description: "Artikel erfolgreich aktualisiert",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Fehler",
        description: "Artikel konnte nicht aktualisiert werden",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Artikel nicht gefunden</h1>
            <p className="text-muted-foreground mb-8">
              Der gesuchte Artikel ist nicht vorhanden.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.content.substring(0, 160).replace(/<[^>]+>/g, '')}
        canonical={`https://one-next.de/blog/${article.slug}`}
        ogType="article"
        ogImage={article.media?.file_path}
        structuredData={[
          createBlogPostingSchema(
            article.title,
            article.content.substring(0, 200).replace(/<[^>]+>/g, ''),
            article.author,
            article.published_at,
            `https://one-next.de/blog/${article.slug}`,
            article.media?.file_path
          ),
          createBreadcrumbSchema([
            { name: "Home", url: "https://one-next.de/" },
            { name: "Blog", url: "https://one-next.de/blog" },
            { name: article.title, url: `https://one-next.de/blog/${article.slug}` }
          ])
        ]}
      />
      <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <article className="max-w-3xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Blog
            </Button>
          </Link>

          {isEditMode ? (
            <InlineTextField
              value={article.title}
              onSave={(value) => handleUpdateArticle("title", value)}
              isEditMode={isEditMode}
              className="text-4xl md:text-5xl font-bold mb-4"
              placeholder="Artikeltitel"
              as="h1"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
          )}
          
          <div className="text-muted-foreground mb-8">
            {isEditMode ? (
              <InlineTextField
                value={article.author || ""}
                onSave={(value) => handleUpdateArticle("author", value)}
                isEditMode={isEditMode}
                placeholder="Name der Autorin oder des Autors"
              />
            ) : (
              <span>{article.author}</span>
            )}
            {" • "}
            {format(new Date(article.published_at), "d. MMMM yyyy", { locale: de })}
          </div>

          {article.media?.file_path && (
            <img
              src={article.media.file_path}
              alt={article.media.alt_text || `Titelbild für Artikel: ${article.title}`}
              className="w-full h-auto rounded-lg mb-8"
            />
          )}

          <RichTextEditor
            value={article.content}
            onSave={(value) => handleUpdateArticle("content", value)}
            isEditMode={isEditMode}
            placeholder="Schreibe hier den Artikelinhalt..."
          />
        </article>
      </main>
      <Footer />
      {isContentManager && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}
      </div>
    </>
  );
};

export default Article;

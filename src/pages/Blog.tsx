import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string;
  featured_image?: string;
}

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const { isContentManager } = useContentManager();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  const handleUpdateArticle = async (articleId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ [field]: value })
        .eq("id", articleId);

      if (error) throw error;

      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, [field]: value } : article
        )
      );

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

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Einblicke, Updates und Perspektiven rund um KI und Technologie
          </p>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <div key={article.id}>
                  {isEditMode ? (
                    <Card className="overflow-hidden border-2 border-dashed border-primary/50">
                      {article.featured_image && (
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <CardHeader>
                        <InlineTextField
                          value={article.title}
                          onSave={(value) => handleUpdateArticle(article.id, "title", value)}
                          isEditMode={isEditMode}
                          className="text-2xl font-semibold"
                          placeholder="Artikeltitel"
                          as="h2"
                        />
                        <CardDescription>
                          {article.author} • {format(new Date(article.published_at), "d. MMMM yyyy", { locale: de })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <InlineTextArea
                          value={article.excerpt || ""}
                          onSave={(value) => handleUpdateArticle(article.id, "excerpt", value)}
                          isEditMode={isEditMode}
                          placeholder="Artikelzusammenfassung"
                          minRows={2}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Link to={`/blog/${article.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <CardHeader>
                          <CardTitle className="text-2xl hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                          <CardDescription>
                            {article.author} • {format(new Date(article.published_at), "d. MMMM yyyy", { locale: de })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div 
                            className="text-muted-foreground line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.excerpt || "") }}
                          />
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {isContentManager && (
        <EditToggleButton
          isEditMode={isEditMode}
          onToggle={() => setIsEditMode(!isEditMode)}
        />
      )}
    </div>
  );
};

export default Blog;

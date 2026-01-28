import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";
import { SEO } from "@/components/SEO";
import { createBreadcrumbSchema } from "@/config/seoConfig";
import { Clock } from "lucide-react";

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

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const sidebarArticles = articles.slice(3);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d. MMM yyyy", { locale: de });
  };

  return (
    <>
      <SEO
        title="Blog | AI & Innovation Insights | one-next"
        description="Aktuelle Einblicke, Updates und Perspektiven rund um KI, Innovation und Technologie. Expertenwissen aus der Praxis von one-next."
        keywords="AI Blog, KI Insights, Innovation Blog, Technologie News, AI Trends, Design Thinking"
        canonical="https://one-next.de/blog"
        structuredData={createBreadcrumbSchema([
          { name: "Home", url: "https://one-next.de/" },
          { name: "Blog", url: "https://one-next.de/blog" }
        ])}
      />
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Einblicke, Updates und Perspektiven rund um KI und Technologie
            </p>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Loading skeleton for featured */}
                <div className="lg:col-span-5 h-[500px] bg-muted animate-pulse rounded-xl" />
                {/* Loading skeleton for secondary */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="h-[240px] bg-muted animate-pulse rounded-xl" />
                  <div className="h-[240px] bg-muted animate-pulse rounded-xl" />
                </div>
                {/* Loading skeleton for sidebar */}
                <div className="lg:col-span-3 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted animate-pulse rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : articles.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                Noch keine Artikel vorhanden.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Featured Article - Large */}
                {featuredArticle && (
                  <Link
                    to={`/blog/${featuredArticle.slug}`}
                    className="lg:col-span-5 group"
                  >
                    <article className="relative h-[500px] rounded-xl overflow-hidden">
                      {featuredArticle.featured_image ? (
                        <img
                          src={featuredArticle.featured_image}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge className="mb-3 bg-primary text-primary-foreground">
                          Featured
                        </Badge>
                        <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(featuredArticle.published_at)}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-primary transition-colors">
                          {featuredArticle.title}
                        </h2>
                      </div>
                    </article>
                  </Link>
                )}

                {/* Secondary Articles - Medium */}
                <div className="lg:col-span-4 space-y-6">
                  {secondaryArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="group block"
                    >
                      <article className="relative h-[240px] rounded-xl overflow-hidden">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary/50 to-secondary/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <Badge variant="secondary" className="mb-2 bg-primary text-primary-foreground text-xs">
                            Artikel
                          </Badge>
                          <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Sidebar Articles - Small */}
                <div className="lg:col-span-3 space-y-4">
                  {sidebarArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="group flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
    </>
  );
};

export default Blog;

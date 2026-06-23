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
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { createBreadcrumbSchema } from "@/config/seoConfig";
import { Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  featured_image?: string | null;
  media?: {
    file_path: string;
    alt_text: string | null;
  } | null;
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
        .select("*, media:featured_image(file_path, alt_text)")
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



  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const sidebarArticles = articles.slice(3);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d. MMM yyyy", { locale: de });
  };

  return (
    <>
      <SEO
        title="Blog | KI & Innovation Innovation Insights | one-next"
        description="Aktuelle Einblicke, Updates und Perspektiven rund um KI, Innovation und Technologie. Expertenwissen aus der Praxis von one-next."
        keywords="KI Blog, KI Insights, Innovation Blog, Technologie News, KI Trends, Design Thinking"
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
                    <article className="relative h-[500px] rounded-[--radius] overflow-hidden shadow-[--shadow-card] hover:shadow-[--shadow-hover] transition-all duration-300 border border-border/50">
                      <img
                        src={featuredArticle.media?.file_path || "/placeholder.svg"}
                        alt={featuredArticle.media?.alt_text || featuredArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 saturate-[0.9]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <Badge className="mb-3 bg-accent text-accent-foreground border border-border/30">
                          Featured
                        </Badge>
                        <div className="flex items-center gap-2 text-background/80 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(featuredArticle.published_at)}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-background group-hover:text-accent transition-colors">
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
                      <article className="relative h-[240px] rounded-[--radius] overflow-hidden shadow-[--shadow-card] hover:shadow-[--shadow-hover] transition-all duration-300 border border-border/50">
                        <img
                          src={article.media?.file_path || "/placeholder.svg"}
                          alt={article.media?.alt_text || article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 saturate-[0.9]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <Badge variant="secondary" className="mb-2 bg-accent text-accent-foreground border border-border/30 text-xs">
                            Artikel
                          </Badge>
                          <div className="flex items-center gap-2 text-background/80 text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-background group-hover:text-accent transition-colors line-clamp-2">
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
                      className="group flex gap-4 p-2 -m-2 rounded-[calc(var(--radius)/2)] hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-[calc(var(--radius)/2)] overflow-hidden shrink-0 border border-border/50 shadow-sm">
                        <img
                          src={article.media?.file_path || "/placeholder.svg"}
                          alt={article.media?.alt_text || article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 saturate-[0.9]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-accent-foreground transition-colors line-clamp-2 text-sm">
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

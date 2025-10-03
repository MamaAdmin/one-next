import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useContentManager } from "@/hooks/useContentManager";
import { EditToggleButton } from "@/components/blog/EditToggleButton";
import { InlineTextField } from "@/components/blog/InlineTextField";
import { InlineTextArea } from "@/components/blog/InlineTextArea";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  published_at: string;
  featured_image?: string;
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
        .select("*")
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
        title: "Success",
        description: "Article updated successfully",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Error",
        description: "Failed to update article",
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
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <article className="max-w-3xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {isEditMode ? (
            <InlineTextField
              value={article.title}
              onSave={(value) => handleUpdateArticle("title", value)}
              isEditMode={isEditMode}
              className="text-4xl md:text-5xl font-bold mb-4"
              placeholder="Article title"
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
                placeholder="Author name"
              />
            ) : (
              <span>{article.author}</span>
            )}
            {" • "}
            {format(new Date(article.published_at), "MMMM d, yyyy")}
          </div>

          {article.featured_image && (
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto rounded-lg mb-8"
            />
          )}

          <div className="prose prose-lg max-w-none">
            {isEditMode ? (
              <InlineTextArea
                value={article.content}
                onSave={(value) => handleUpdateArticle("content", value)}
                isEditMode={isEditMode}
                placeholder="Article content"
                minRows={10}
              />
            ) : (
              <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                {article.content}
              </p>
            )}
          </div>
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
  );
};

export default Article;

import { useParams } from "react-router-dom";
import { useDynamicPage } from "@/hooks/useDynamicPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { MainServiceLayout } from "@/components/templates/MainServiceLayout";
import { SubServiceLayout } from "@/components/templates/SubServiceLayout";
import NotFound from "./NotFound";

export default function DynamicPage() {
  const { slug } = useParams();
  const { page, loading } = useDynamicPage(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={page.meta_title || page.title}
        description={page.meta_description || ""}
        keywords={page.meta_keywords?.join(", ")}
        canonical={page.canonical_url}
        ogImage={page.og_image}
      />
      <Navigation />
      {page.layout_type === 'main-service' ? (
        <MainServiceLayout content={page.content} />
      ) : (
        <SubServiceLayout content={page.content} />
      )}
      <Footer />
    </div>
  );
}

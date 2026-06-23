import { useState } from "react";
import { Search, ThumbsUp, ThumbsDown, Mail, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { createBreadcrumbSchema } from "@/config/seoConfig";
import { useFAQ, useFAQCategories } from "@/hooks/useFAQ";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import { decodeHtmlEntitiesDeep } from "@/lib/html";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarBookingDialog } from "@/components/CalendarBookingDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [feedbackFaqId, setFeedbackFaqId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const { faqs, loading, trackView, trackHelpful } = useFAQ();
  const { categories, loading: categoriesLoading } = useFAQCategories();
  const { toast } = useToast();

  // Filter FAQs
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryId || faq.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Most viewed FAQs (top 5)
  const mostViewedFAQs = [...faqs]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 5);

  // Submit feedback
  const handleFeedbackSubmit = async (faqId: string) => {
    try {
      await supabase.from("faq_feedback").insert({
        faq_id: faqId,
        feedback_text: feedbackText,
      });
      toast({
        title: "Danke für Ihr Feedback!",
        description: "Wir werden die Antwort verbessern.",
      });
      setFeedbackFaqId(null);
      setFeedbackText("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: filteredFAQs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>/g, ""), // Strip HTML
      },
    })),
  };

  const structuredData = [
    faqSchema,
    createBreadcrumbSchema([
      { name: "Home", url: "https://one-next.de/" },
      { name: "FAQ", url: "https://one-next.de/faq" },
    ]),
  ];

  return (
    <>
      <SEO
        title="FAQ - Häufig gestellte Fragen | one-next"
        description="Antworten auf alle Fragen zu KI Design Sprints, KI-Entwicklung, Workshops, Preisen und unseren Services. Erfahren Sie, wie one-next Ihr Unternehmen mit KI voranbringt."
        keywords="FAQ, KI Design Sprint, KI Beratung, Workshops, Preise, KI-Entwicklung, one-next"
        canonical="https://one-next.de/faq"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-32 pb-12 px-6">
          <div className="container mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">
              Häufig gestellte Fragen
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Alles, was Sie über unsere AI-Services wissen müssen
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Frage suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Most Viewed FAQs */}
        {!loading && mostViewedFAQs.length > 0 && (
          <section className="py-12 px-6 bg-accent/30">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Meist gelesene FAQs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mostViewedFAQs.map((faq, index) => {
                  const category = categories.find((c) => c.id === faq.category_id);
                  return (
                    <Card key={faq.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline" className="mb-2">
                            {category?.name}
                          </Badge>
                          <Badge variant="secondary">{faq.view_count} Aufrufe</Badge>
                        </div>
                        <CardTitle className="text-base line-clamp-2">
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            {!categoriesLoading && (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-8 flex flex-wrap justify-center gap-2">
                  <TabsTrigger
                    value="all"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    Alle Fragen
                    <Badge variant="secondary" className="ml-2">
                      {faqs.length}
                    </Badge>
                  </TabsTrigger>
                  {categories.map((cat) => {
                    const Icon = cat.icon ? (Icons as any)[cat.icon] : null;
                    const count = faqs.filter((f) => f.category_id === cat.id).length;
                    return (
                      <TabsTrigger
                        key={cat.id}
                        value={cat.slug}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className="gap-2"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {cat.name}
                        <Badge variant="secondary" className="ml-1">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value={selectedCategoryId || "all"}>
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Lädt FAQs...</p>
                    </div>
                  ) : filteredFAQs.length === 0 ? (
                    <div className="text-center py-12 bg-background rounded-lg shadow-md">
                      <p className="text-lg text-muted-foreground mb-6">
                        Keine passenden Fragen gefunden
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button asChild>
                          <a href="mailto:info@one-next.com">
                            <Mail className="mr-2 h-4 w-4" />
                            E-Mail senden
                          </a>
                        </Button>
                        <CalendarBookingDialog
                          buttonText="Termin buchen"
                          buttonSize="default"
                        />
                      </div>
                    </div>
                  ) : (
                    <Accordion
                      type="single"
                      collapsible
                      className="space-y-4"
                    >
                      {filteredFAQs.map((faq) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className="bg-background rounded-lg shadow-md border-none"
                        >
                          <AccordionTrigger
                            className="px-6 py-4 text-left hover:no-underline"
                            onClick={() => trackView(faq.id)}
                          >
                            <h3 className="text-lg font-semibold pr-4">
                              {faq.question}
                            </h3>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div
                              className="text-muted-foreground leading-relaxed mb-4 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtmlEntitiesDeep(faq.answer)) }}
                            />

                            {/* Helpful buttons */}
                            <div className="space-y-3 pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                  War diese Antwort hilfreich?
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    trackHelpful(faq.id, true);
                                  }}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Ja
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    trackHelpful(faq.id, false);
                                    setFeedbackFaqId(faq.id);
                                  }}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  Nein
                                </Button>
                              </div>

                              {/* Feedback form (shown after "No" click) */}
                              {feedbackFaqId === faq.id && (
                                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                                  <Label className="text-sm">
                                    Was hätten Sie erwartet? (Optional)
                                  </Label>
                                  <Textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Ihr Feedback hilft uns, die Antwort zu verbessern..."
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleFeedbackSubmit(faq.id)}
                                    >
                                      Absenden
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setFeedbackFaqId(null);
                                        setFeedbackText("");
                                      }}
                                    >
                                      Abbrechen
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-accent/50">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Frage nicht gefunden?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Kontaktieren Sie uns direkt oder buchen Sie ein kostenloses
              Erstgespräch
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <a href="mailto:info@one-next.com">
                  <Mail className="mr-2 h-5 w-5" />
                  Nachricht senden
                </a>
              </Button>
              <CalendarBookingDialog
                buttonText="Beratung buchen"
                buttonSize="lg"
              />
              <Button asChild variant="outline" size="lg">
                <Link to="/workshop-registration">Workshop buchen</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default FAQ;

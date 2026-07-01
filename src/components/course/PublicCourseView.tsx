import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, ChevronRight } from "lucide-react";

export interface PublicCourseViewCourse {
  title: string;
  description?: string | null;
  description_html?: string | null;
  price_chf?: number | null;
  max_participants?: number | null;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  featured_image?: string | null;
}

export interface PublicCourseViewDate {
  id: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface PublicCourseViewModule {
  id: string;
  title: string;
  content_html?: string | null;
  youtube_url?: string | null;
  module_type?: string | null;
  items?: any;
}

interface PublicCourseViewProps {
  course: PublicCourseViewCourse;
  dates?: PublicCourseViewDate[];
  modules?: PublicCourseViewModule[];
  primaryCta?: { label: string; onClick?: () => void; href?: string };
  secondaryCta?: { label: string; href: string } | null;
  showQuote?: boolean;
  quoteText?: string;
  quoteAttribution?: string;
  ctaSectionTitle?: string;
  ctaSectionSubtitle?: string;
  ctaSectionEyebrow?: string;
  belowHero?: ReactNode;
}

function toEmbed(url?: string | null) {
  if (!url) return null;
  return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
}

export function PublicCourseView({
  course,
  dates = [],
  modules = [],
  primaryCta = { label: "Jetzt anmelden →" },
  secondaryCta = { label: "Alle Kurse", href: "/kurse" },
  showQuote = true,
  quoteText = "Praxisnah, effizient und direkt anwendbar.",
  quoteAttribution = "Teilnehmer-Feedback",
  ctaSectionTitle = "Sichern Sie sich Ihren Platz",
  ctaSectionSubtitle = "Melden Sie sich jetzt an und profitieren Sie von praxisorientiertem Wissen.",
  ctaSectionEyebrow = "Jetzt starten",
  belowHero,
}: PublicCourseViewProps) {
  const youtubeEmbedUrl = toEmbed(course.youtube_url);
  const heroImage = course.featured_image || course.thumbnail_url;
  const descriptionHtml = course.description_html || "";

  const renderPrimary = () => {
    if (primaryCta.href) {
      return (
        <Button size="lg" asChild>
          <Link to={primaryCta.href}>{primaryCta.label}</Link>
        </Button>
      );
    }
    return (
      <Button size="lg" onClick={primaryCta.onClick}>
        {primaryCta.label}
      </Button>
    );
  };

  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="animate-fade-in">
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-4">Kurs</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">{course.description}</p>
            )}
            <div className="flex gap-3 flex-wrap">
              {renderPrimary()}
              {secondaryCta && (
                <Button variant="outline" size="lg" asChild>
                  <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </div>

          {youtubeEmbedUrl ? (
            <div className="animate-fade-in-up">
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-card border border-border">
                <iframe
                  src={youtubeEmbedUrl}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : heroImage ? (
            <div className="animate-fade-in-up">
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-card border border-border">
                <img src={heroImage} alt={course.title} className="w-full h-full object-cover" />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Stats */}
      {(course.price_chf != null || dates.length > 0 || course.max_participants) && (
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
              {course.price_chf != null && (
                <div className="py-10 px-8 border-r border-primary-foreground/10">
                  <div className="text-4xl font-bold mb-1">CHF {Number(course.price_chf).toFixed(0)}</div>
                  <div className="text-sm opacity-60">Kurspreis</div>
                </div>
              )}
              {dates.length > 0 && (
                <div className="py-10 px-8 border-r border-primary-foreground/10">
                  <div className="text-4xl font-bold mb-1">{dates.length}</div>
                  <div className="text-sm opacity-60">Termine</div>
                </div>
              )}
              {course.max_participants && (
                <div className="py-10 px-8">
                  <div className="text-4xl font-bold mb-1">{course.max_participants}</div>
                  <div className="text-sm opacity-60">Max. Teilnehmer</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {belowHero}

      {/* Content */}
      {descriptionHtml && (
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">Kursinhalt</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Was Sie lernen</h2>
            <div
              className="prose prose-neutral max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        </section>
      )}

      {/* Modules */}
      {modules.map((mod, idx) => (
        <ModuleSection key={mod.id} module={mod} index={idx + 1} />
      ))}

      {/* Dates */}
      {dates.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">Termine</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Nächste Kurstermine</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dates.map((d) => (
                  <Card key={d.id} className="border border-border">
                    <CardContent className="p-6">
                      <div className="text-5xl font-bold text-foreground/10 mb-1">
                        {new Date(d.event_date).toLocaleDateString("de-CH", { day: "2-digit" })}
                      </div>
                      <div className="text-lg font-semibold text-foreground mb-3">
                        {new Date(d.event_date).toLocaleDateString("de-CH", { month: "long", year: "numeric" })}
                      </div>
                      {d.start_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {d.start_time}
                            {d.end_time ? ` – ${d.end_time}` : ""}
                          </span>
                        </div>
                      )}
                      {d.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{d.location}</span>
                        </div>
                      )}
                      {d.notes && (
                        <p className="text-xs text-muted-foreground/70 mt-3 italic">{d.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quote */}
      {showQuote && (
        <section className="bg-accent/30 border-y border-border">
          <div className="max-w-2xl mx-auto text-center py-20 px-6">
            <blockquote className="text-2xl md:text-3xl font-bold text-foreground italic mb-4">
              "{quoteText}"
            </blockquote>
            <p className="text-sm text-muted-foreground tracking-wide uppercase">{quoteAttribution}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">
            {ctaSectionEyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{ctaSectionTitle}</h2>
          <p className="text-muted-foreground mb-8 max-w-lg">{ctaSectionSubtitle}</p>
          <div className="flex gap-3 flex-wrap">
            {renderPrimary()}
            {secondaryCta && (
              <Button variant="outline" size="lg" asChild>
                <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ──── Module renderers ──── */

const SECTION_BGS = ["", "bg-secondary/30", "bg-accent/20", "bg-muted/30"];

function ModuleSection({ module: mod, index }: { module: PublicCourseViewModule; index: number }) {
  const items = Array.isArray(mod.items) ? mod.items : [];
  const bgClass = SECTION_BGS[index % SECTION_BGS.length];
  const youtubeEmbedUrl = toEmbed(mod.youtube_url);

  return (
    <section className={bgClass}>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-3">
            Teil {String(index).padStart(2, "0")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{mod.title}</h2>

          {mod.content_html && (
            <div
              className="prose prose-neutral max-w-2xl text-muted-foreground mb-8"
              dangerouslySetInnerHTML={{ __html: mod.content_html }}
            />
          )}

          {youtubeEmbedUrl && (
            <div className="aspect-video w-full max-w-3xl rounded-2xl overflow-hidden border border-border shadow-card mb-8">
              <iframe
                src={youtubeEmbedUrl}
                title={mod.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {items.length > 0 && (
            <>
              {mod.module_type === "content" && <MosaicRenderer items={items} />}
              {mod.module_type === "steps" && <StepsGridRenderer items={items} />}
              {mod.module_type === "checklist" && <ChecklistRenderer items={items} />}
              {mod.module_type === "glossary" && <GlossaryGridRenderer items={items} />}
              {mod.module_type === "faq" && <AccordionModules items={items} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const MOSAIC_COLORS = [
  "bg-primary text-primary-foreground col-span-2",
  "bg-accent/40",
  "bg-secondary",
  "bg-muted",
  "bg-accent/30",
];

function MosaicRenderer({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
      {items.map((item, i) => {
        const colorClass = MOSAIC_COLORS[i % MOSAIC_COLORS.length];
        return (
          <div key={i} className={`rounded p-6 flex flex-col justify-between min-h-[200px] ${colorClass}`}>
            <div>
              {item.eyebrow && (
                <p className="text-[0.68rem] font-medium tracking-[0.1em] uppercase opacity-55 mb-2">{item.eyebrow}</p>
              )}
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              {item.description && <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>}
            </div>
            {item.chip && (
              <span className="inline-block mt-4 px-3 py-1 border border-current rounded-full text-xs opacity-60 w-fit">
                {item.chip}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const STEP_COLORS = ["bg-accent/30", "bg-secondary", "bg-muted"];

function StepsGridRenderer({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
      {items.map((item, i) => (
        <div key={i} className={`rounded p-8 ${STEP_COLORS[i % STEP_COLORS.length]}`}>
          <div className="text-5xl font-bold opacity-15 leading-none mb-4">
            {String(item.step || i + 1).padStart(2, "0")}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
          {item.description && <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>}
          {item.timeline && (
            <p className="mt-4 text-xs tracking-[0.08em] uppercase text-muted-foreground">{item.timeline}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ChecklistRenderer({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded bg-muted/40">
          <span className="text-primary mt-0.5 shrink-0">✓</span>
          <span className="text-sm text-foreground">{item.label || item.title}</span>
        </div>
      ))}
    </div>
  );
}

function GlossaryGridRenderer({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="bg-background p-5">
          <p className="font-bold text-foreground mb-1">{item.term}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.definition}</p>
        </div>
      ))}
    </div>
  );
}

function AccordionModules({ items }: { items: any[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="border-t border-border">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border-b border-border">
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-4 py-5 text-left hover:opacity-70 transition-opacity"
            >
              <span className="text-xs text-muted-foreground tracking-wide min-w-[2rem]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-lg font-bold text-foreground">{item.question || item.title}</span>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="pb-5 pl-10">
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer || item.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

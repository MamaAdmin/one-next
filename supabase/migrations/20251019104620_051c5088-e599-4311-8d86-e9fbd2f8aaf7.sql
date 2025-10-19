-- FAQ-Kategorien Tabelle
CREATE TABLE public.faq_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FAQ-Items Tabelle
CREATE TABLE public.faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQ categories are publicly readable"
  ON public.faq_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "FAQ items are publicly readable"
  ON public.faq_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage FAQ categories"
  ON public.faq_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'content_manager')
    )
  );

CREATE POLICY "Admins can manage FAQ items"
  ON public.faq_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'content_manager')
    )
  );

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_updated_at();

-- Funktionen für Analytics
CREATE OR REPLACE FUNCTION increment_faq_view(faq_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE faq_items 
  SET view_count = view_count + 1 
  WHERE id = faq_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION record_faq_vote(faq_id UUID, is_helpful BOOLEAN)
RETURNS void AS $$
BEGIN
  IF is_helpful THEN
    UPDATE faq_items 
    SET helpful_count = helpful_count + 1 
    WHERE id = faq_id;
  ELSE
    UPDATE faq_items 
    SET not_helpful_count = not_helpful_count + 1 
    WHERE id = faq_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed-Daten: Kategorien
INSERT INTO faq_categories (name, slug, description, icon, sort_order) VALUES
('AI Design Sprint', 'ai-design-sprint', 'Fragen zu unseren Design Sprint Workshops und Online-Formaten', 'Rocket', 1),
('Services & Preise', 'services-preise', 'Informationen zu unseren Leistungen, Preisen und Buchung', 'DollarSign', 2),
('Technisches', 'technisches', 'Technische Fragen zur KI-Entwicklung und Implementierung', 'Code', 3),
('Erste Schritte', 'erste-schritte', 'Wie Sie mit one-next starten können', 'Play', 4),
('Support & Kontakt', 'support-kontakt', 'Support, Buchung und Kontaktmöglichkeiten', 'HelpCircle', 5);

-- Seed-Daten: Beispiel-FAQs (Deutsche Inhalte)
INSERT INTO faq_items (question, answer, category_id, sort_order) VALUES
(
  'Was ist ein AI Design Sprint?',
  '<p>Ein AI Design Sprint ist ein strukturierter 2-5 Tage Prozess, in dem wir gemeinsam mit Ihrem Team AI-Potenziale identifizieren und validieren. Wir nutzen bewährte Design Thinking Methoden, um von der Challenge bis zum getesteten Prototyp zu gelangen.</p><p>Der Sprint besteht aus den Phasen: Verstehen → Ideenfindung → Entscheidung → Prototyping → Validierung.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'ai-design-sprint'),
  1
),
(
  'Welche Sprint-Formate bieten Sie an?',
  '<p>Wir bieten zwei Formate an:</p><ul><li><strong>Workshop (2 Tage vor Ort)</strong>: Intensives, fokussiertes Arbeiten mit Ihrem Team in unseren Räumlichkeiten oder bei Ihnen vor Ort.</li><li><strong>Online Sprint (flexibel)</strong>: Zeitlich flexible Durchführung über mehrere Wochen mit Online-Sessions und asynchroner Arbeit.</li></ul><p>Beide Formate führen zum gleichen Ergebnis: einem validierten AI-Konzept.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'ai-design-sprint'),
  2
),
(
  'Wie viel kostet ein AI Design Sprint?',
  '<p>Die Kosten variieren je nach Format und Teamgröße:</p><ul><li><strong>Workshop (2 Tage)</strong>: Ab CHF 4.999 für bis zu 8 Teilnehmer</li><li><strong>Online Sprint</strong>: Ab CHF 2.999 pro Team</li></ul><p>Wir erstellen gerne ein individuelles Angebot basierend auf Ihren spezifischen Anforderungen.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'services-preise'),
  1
),
(
  'Welche KI-Technologien setzen Sie ein?',
  '<p>Wir arbeiten technologieunabhängig und wählen die beste Lösung für Ihren Use Case. Dazu gehören:</p><ul><li>Large Language Models (OpenAI GPT, Claude, Gemini)</li><li>Computer Vision (YOLO, SAM)</li><li>Custom Machine Learning Modelle</li><li>RAG-Systeme (Retrieval Augmented Generation)</li><li>Fine-tuning und Prompt Engineering</li></ul>',
  (SELECT id FROM faq_categories WHERE slug = 'technisches'),
  1
),
(
  'Brauchen wir technische Vorkenntnisse?',
  '<p>Nein! Unsere Sprints und Workshops sind so konzipiert, dass keine technischen Vorkenntnisse erforderlich sind. Wir führen Sie durch den gesamten Prozess und übersetzen komplexe technische Konzepte in verständliche Business-Sprache.</p><p>Wichtig ist nur, dass Sie Ihr Fachgebiet und Ihre Herausforderungen kennen.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'erste-schritte'),
  1
),
(
  'Wie buche ich einen Workshop?',
  '<p>Es gibt drei einfache Wege:</p><ol><li><strong>Online buchen</strong>: Nutzen Sie unser Buchungsformular auf der Workshop-Seite</li><li><strong>Erstgespräch vereinbaren</strong>: Buchen Sie einen kostenlosen 30-min Termin über unseren Kalender</li><li><strong>Direkt kontaktieren</strong>: info@one-next.de</li></ol>',
  (SELECT id FROM faq_categories WHERE slug = 'support-kontakt'),
  1
),
(
  'Was passiert nach dem Sprint?',
  '<p>Nach dem Sprint haben Sie:</p><ul><li>Einen validierten AI-Prototyp</li><li>Dokumentation aller Ergebnisse</li><li>Roadmap für die Umsetzung</li><li>Optional: Wir unterstützen Sie bei der vollständigen Implementierung durch unser Entwicklungsteam</li></ul>',
  (SELECT id FROM faq_categories WHERE slug = 'ai-design-sprint'),
  3
),
(
  'Bieten Sie auch individuelle KI-Entwicklung an?',
  '<p>Ja! Nach dem Sprint oder direkt als eigenständiges Projekt können wir Ihre AI-Lösung entwickeln. Unsere Services umfassen:</p><ul><li>Custom AI Development</li><li>RAG-Systeme & Chatbots</li><li>Datenqualitäts-Audits</li><li>Langfristige AI-Beratung</li></ul><p>Mehr Infos finden Sie auf unserer <a href="/custom-ai-development">Individuelle KI-Entwicklung</a> Seite.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'services-preise'),
  2
);
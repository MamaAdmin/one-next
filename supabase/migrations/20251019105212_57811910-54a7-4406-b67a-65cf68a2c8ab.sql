-- Add more German FAQ content
INSERT INTO faq_items (question, answer, category_id, sort_order) VALUES
(
  'Wie lange dauert ein AI Design Sprint?',
  '<p>Die Dauer hängt vom gewählten Format ab:</p><ul><li><strong>2-Tage Workshop:</strong> Intensives Format mit vollständiger Durchführung an zwei aufeinanderfolgenden Tagen (ca. 9-17 Uhr)</li><li><strong>Online Sprint:</strong> Flexibel über 2-4 Wochen verteilt mit mehreren Sessions á 2-3 Stunden</li></ul><p>In beiden Fällen durchlaufen Sie alle 5 Phasen: Verstehen, Ideenfindung, Entscheidung, Prototyping und Validierung.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'ai-design-sprint'),
  10
),
(
  'Für welche Unternehmensgröße eignet sich der Sprint?',
  '<p>Der AI Design Sprint ist für Unternehmen jeder Größe geeignet:</p><ul><li><strong>Startups (5-20 MA):</strong> Schnelle Validierung von AI-Ideen ohne große Investitionen</li><li><strong>KMU (20-250 MA):</strong> Strukturierte Innovation mit begrenzten Ressourcen</li><li><strong>Konzerne (250+ MA):</strong> Agile Methodik für schnelle Entscheidungen trotz komplexer Strukturen</li></ul><p>Die optimale Teamgröße liegt bei 4-8 Personen aus verschiedenen Fachbereichen.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'ai-design-sprint'),
  11
),
(
  'Welche Team-Mitglieder sollten teilnehmen?',
  '<p>Ein ideales Sprint-Team besteht aus:</p><ul><li><strong>Entscheider</strong> (1 Person): Hat Budget- und Strategieverantwortung</li><li><strong>Fachexperten</strong> (2-3 Personen): Kennen die Geschäftsprozesse im Detail</li><li><strong>Tech-Vertreter</strong> (1 Person): Kann technische Machbarkeit einschätzen</li><li><strong>Kundenvertreter</strong> (1 Person): Versteht User-Bedürfnisse</li><li><strong>Designer/UX</strong> (optional): Für Prototyping hilfreich</li></ul><p>Wichtig: Alle Teilnehmer sollten Zeit für den gesamten Sprint haben - halbe Teilnahme funktioniert nicht.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'erste-schritte'),
  10
),
(
  'Gibt es Paketpreise oder Rabatte?',
  '<p>Ja, wir bieten verschiedene Preismodelle:</p><ul><li><strong>Einzelworkshop:</strong> CHF 4.999 (bis 8 Teilnehmer)</li><li><strong>3er-Paket:</strong> CHF 13.500 (3 Workshops, 10% Rabatt)</li><li><strong>Jahresabo:</strong> Ab CHF 39.000/Jahr (unbegrenzte Workshops + Beratung)</li><li><strong>Non-Profit:</strong> 20% Rabatt für gemeinnützige Organisationen</li><li><strong>Startups:</strong> Spezialkonditionen für Unternehmen < 2 Jahre</li></ul><p>Kontaktieren Sie uns für ein individuelles Angebot.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'services-preise'),
  10
),
(
  'Was beinhaltet der Preis genau?',
  '<p>Im Workshoppreis enthalten sind:</p><ul><li>Vorbereitung und Analyse Ihrer Ausgangssituation</li><li>Moderation durch erfahrene AI-Experten</li><li>Alle Workshop-Materialien und Tools</li><li>Digitale Kollaborationsplattform</li><li>Dokumentation aller Ergebnisse</li><li>Funktionstüchtiger AI-Prototyp</li><li>Roadmap für Umsetzung</li><li>30 Tage Follow-Up Support</li></ul><p><strong>Nicht enthalten:</strong> Reisekosten bei Vor-Ort Workshops, Catering, Raummiete (falls nicht bei Ihnen vor Ort).</p>',
  (SELECT id FROM faq_categories WHERE slug = 'services-preise'),
  11
),
(
  'Welche Daten werden für den Sprint benötigt?',
  '<p>Je nach Use Case benötigen wir unterschiedliche Daten:</p><ul><li><strong>Minimal:</strong> Beschreibung Ihrer Herausforderung und Geschäftsprozesse</li><li><strong>Optional hilfreich:</strong> Beispieldaten, bestehende Dokumentation, User-Feedback</li><li><strong>Für AI-Prototyp:</strong> Repräsentative Datensätze (anonymisiert)</li></ul><p><strong>Datenschutz:</strong> Alle Daten werden vertraulich behandelt. NDA auf Wunsch. Datenverarbeitung nach DSGVO. Sie behalten volle Kontrolle über Ihre Daten.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'technisches'),
  10
),
(
  'Wie sicher sind unsere Daten?',
  '<p>Datensicherheit hat höchste Priorität:</p><ul><li><strong>DSGVO-konform:</strong> Alle Prozesse entsprechen EU-Datenschutz</li><li><strong>NDA:</strong> Standardmäßig für alle Projekte</li><li><strong>Verschlüsselung:</strong> TLS 1.3 für Datenübertragung, AES-256 für Storage</li><li><strong>Zugriffskontrollen:</strong> Nur autorisierte Teammitglieder</li><li><strong>Schweizer Hosting:</strong> Server in Schweizer Rechenzentren (ISO 27001)</li><li><strong>Löschung:</strong> Daten werden nach Projektende auf Wunsch vollständig gelöscht</li></ul>',
  (SELECT id FROM faq_categories WHERE slug = 'technisches'),
  11
),
(
  'Können wir eigene AI-Modelle integrieren?',
  '<p>Ja, wir sind technologieoffen:</p><ul><li><strong>Eigene Modelle:</strong> Integration Ihrer bereits entwickelten AI-Modelle möglich</li><li><strong>Fine-tuning:</strong> Anpassung von Open-Source Modellen auf Ihre Daten</li><li><strong>Hybrid-Ansätze:</strong> Kombination mehrerer Modelle für optimale Ergebnisse</li><li><strong>On-Premise:</strong> Deployment auf Ihrer Infrastruktur möglich</li></ul><p>Wir beraten Sie, welcher Ansatz für Ihren Use Case optimal ist.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'technisches'),
  12
),
(
  'Wie bereiten wir uns auf den Workshop vor?',
  '<p>Optimale Vorbereitung in 3 Schritten:</p><ol><li><strong>2 Wochen vorher:</strong> Kickoff-Call (30 min) zur Abstimmung der Challenge</li><li><strong>1 Woche vorher:</strong> Fragebogen ausfüllen (15 min) zu Zielen und Kontext</li><li><strong>3 Tage vorher:</strong> Team-Briefing (intern, 30 min) - alle auf gleichem Stand</li></ol><p><strong>Optional:</strong> Beispieldaten sammeln, Stakeholder-Interviews durchführen, Budget-Rahmen klären.</p><p>Wir senden Ihnen eine detaillierte Checkliste nach der Buchung.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'erste-schritte'),
  11
),
(
  'Bieten Sie Nachbetreuung an?',
  '<p>Ja, auf mehreren Ebenen:</p><ul><li><strong>Inkludiert (30 Tage):</strong> E-Mail Support, Fragen zur Roadmap, kleine Anpassungen am Prototyp</li><li><strong>Extended Support:</strong> CHF 1.500/Monat - wöchentliche Calls, erweiterte Beratung</li><li><strong>Full Implementation:</strong> Wir entwickeln die finale AI-Lösung für Sie</li><li><strong>Training:</strong> Schulung Ihres Teams in AI-Grundlagen</li></ul><p>Die meisten Kunden entscheiden sich nach dem Sprint für ein Umsetzungsprojekt.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'support-kontakt'),
  10
),
(
  'Wie schnell erhalten wir eine Antwort?',
  '<p>Unsere Reaktionszeiten:</p><ul><li><strong>Buchungsanfragen:</strong> Innerhalb 4 Stunden (Werktags)</li><li><strong>Allgemeine Fragen:</strong> Innerhalb 24 Stunden</li><li><strong>Sprint-Support:</strong> Innerhalb 2 Stunden (während aktiver Sprints)</li><li><strong>Notfälle:</strong> Hotline für dringende technische Fragen</li></ul><p><strong>Erreichbarkeit:</strong> Mo-Fr 8:00-18:00 Uhr (CET), außerhalb dieser Zeiten E-Mail-Support.</p>',
  (SELECT id FROM faq_categories WHERE slug = 'support-kontakt'),
  11
);

-- Add feedback table for "Not Helpful" votes
CREATE TABLE IF NOT EXISTS public.faq_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id UUID REFERENCES public.faq_items(id) ON DELETE CASCADE NOT NULL,
  feedback_text TEXT,
  expected_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faq_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.faq_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view feedback"
  ON public.faq_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'content_manager')
    )
  );
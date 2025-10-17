-- Migration: AI Design Sprint Page Content Defaults
-- Fügt alle benötigten Default-Inhalte für die AI Design Sprint Seite hinzu

INSERT INTO page_content (page_name, section_name, content_type, content)
VALUES 
  -- Hero Section
  ('ai-design-sprint', 'hero_badge', 'text', 'AI Design Sprint'),
  ('ai-design-sprint', 'hero_title', 'text', 'Entdecken Sie die Möglichkeiten künstlicher Intelligenz und'),
  ('ai-design-sprint', 'hero_subtitle', 'text', 'transformieren Sie Ihr Unternehmen'),
  ('ai-design-sprint', 'hero_description', 'text', 'Mit zwei Tagen intensiver Arbeit identifiziert Ihr Team zusammen mit unseren AI-Ingenieuren und Design-Facilitatoren das Potenzial von AI-Lösungen, um neue Ideen und Visionen für Ihr Unternehmen zu schaffen.'),
  
  -- Zweck & Ergebnis
  ('ai-design-sprint', 'purpose_goal', 'text', 'Von der Challenge zur umsetzbaren AI-Lösung in 2 Tagen – mit validiertem Konzept, Machbarkeitsanalyse und klarem Implementierungsplan.'),
  ('ai-design-sprint', 'deliverable_1', 'text', 'Validierter Prototyp oder Konzept'),
  ('ai-design-sprint', 'deliverable_2', 'text', 'Machbarkeitsanalyse (technisch & wirtschaftlich)'),
  ('ai-design-sprint', 'deliverable_3', 'text', 'Entwicklungs-Roadmap mit Meilensteinen'),
  ('ai-design-sprint', 'deliverable_4', 'text', 'Detaillierter Report mit Empfehlungen'),
  
  -- Was ist ein AI Design Sprint
  ('ai-design-sprint', 'what_is_title', 'text', 'Was ist ein AI Design Sprint Workshop?'),
  ('ai-design-sprint', 'what_is_description', 'text', 'Ein intensiver 2-Tage-Workshop, der Ihrem Team hilft, AI-Potenziale systematisch zu identifizieren, zu bewerten und in konkrete Lösungen umzusetzen. Geleitet von erfahrenen AI-Experten und Facilitatoren.')
ON CONFLICT (page_name, section_name) DO UPDATE 
SET content = EXCLUDED.content, updated_at = now();
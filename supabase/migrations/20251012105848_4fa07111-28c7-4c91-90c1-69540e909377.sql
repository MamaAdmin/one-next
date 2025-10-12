-- Create lms_tools table
CREATE TABLE lms_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('understand', 'ideate', 'decide', 'prototype', 'validate', 'retrospect')),
  phase_number INTEGER CHECK (phase_number BETWEEN 1 AND 5),
  tool_type TEXT NOT NULL DEFAULT 'external' CHECK (tool_type IN ('external', 'embedded', 'template')),
  external_url TEXT,
  embed_code TEXT,
  template_data JSONB,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE lms_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage tools"
  ON lms_tools FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active tools"
  ON lms_tools FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_lms_tools_updated_at
  BEFORE UPDATE ON lms_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create lms_module_tools junction table
CREATE TABLE lms_module_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES lms_course_modules(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES lms_tools(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, tool_id)
);

-- Enable RLS
ALTER TABLE lms_module_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage module tools"
  ON lms_module_tools FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Enrolled participants can view module tools"
  ON lms_module_tools FOR SELECT
  USING (
    module_id IN (
      SELECT m.id FROM lms_course_modules m
      JOIN lms_course_purchases p ON m.course_id = p.course_id
      JOIN lms_course_enrollments e ON e.purchase_id = p.id
      JOIN participants pt ON e.participant_id = pt.id
      WHERE pt.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- Seed data: Insert all 30 Design Sprint tools
INSERT INTO lms_tools (title, slug, category, phase_number, tool_type, description, external_url) VALUES
('Problem Framing Canvas', 'problem-framing-canvas', 'understand', 1, 'template', 'Strukturiertes Framework zur Problemdefinition und Analyse der Ausgangssituation', NULL),
('Stakeholder Mapping', 'stakeholder-mapping', 'understand', 1, 'template', 'Visualisierung aller relevanten Stakeholder und deren Beziehungen zum Projekt', NULL),
('Experteninterviews', 'experteninterviews', 'understand', 1, 'external', 'Leitfaden für strukturierte Interviews mit Fachexperten und Stakeholdern', 'https://miro.com/miroverse/design-sprint-interviews/'),
('How Might We (HMW)-Fragen', 'hmw-fragen', 'ideate', 2, 'template', 'Fragestellungen für kreative Lösungsfindung und Ideengenerierung', NULL),
('Affinity Clustering', 'affinity-clustering', 'understand', 1, 'external', 'Gruppierung verwandter Ideen und Insights nach thematischen Clustern', 'https://miro.com/miroverse/affinity-diagram/'),
('Sprint-Ziel (Long-Term Goal)', 'sprint-ziel', 'understand', 1, 'template', 'Definition langfristiger Ziele und Vision für das Projekt', NULL),
('Sprint-Fragen', 'sprint-fragen', 'understand', 1, 'template', 'Kritische Fragen zur Hypothesenbildung und Risikobewertung', NULL),
('Customer Journey Mapping', 'customer-journey', 'understand', 1, 'external', 'Visualisierung der Nutzerreise mit allen Touchpoints und Emotionen', 'https://miro.com/miroverse/customer-journey-map/'),
('Map the Challenge / Target Map', 'map-challenge', 'understand', 1, 'template', 'Strukturierte Problemdarstellung mit allen relevanten Dimensionen', NULL),
('Lightning Demos', 'lightning-demos', 'ideate', 2, 'template', 'Kurze Präsentationen von Referenzbeispielen und Best Practices', NULL),
('Notizen & Ideenfindung (Note & Vote)', 'note-vote', 'ideate', 2, 'external', 'Kollektive Ideensammlung mit demokratischer Bewertung', 'https://miro.com/miroverse/brainstorming/'),
('Crazy 8s', 'crazy-8s', 'ideate', 2, 'template', '8 verschiedene Skizzen in 8 Minuten - schnelle Ideenvisualisierung', NULL),
('Solution Sketch', 'solution-sketch', 'ideate', 2, 'template', 'Detaillierte Lösungsskizze mit Annotations und Erklärungen', NULL),
('Art Gallery (Skizzen-Ausstellung)', 'art-gallery', 'decide', 3, 'template', 'Präsentation aller Skizzen an der Wand für gemeinsame Betrachtung', NULL),
('Silent Critique', 'silent-critique', 'decide', 3, 'template', 'Stilles Feedback zu Skizzen mit Post-its und Kommentaren', NULL),
('Dot Voting', 'dot-voting', 'decide', 3, 'external', 'Demokratische Abstimmung mit Klebepunkten oder digitalen Dots', 'https://miro.com/miroverse/dot-voting/'),
('Speed Critique', 'speed-critique', 'decide', 3, 'template', 'Schnelle 3-minütige Diskussion der Favoriten-Skizzen', NULL),
('Decider Vote', 'decider-vote', 'decide', 3, 'template', 'Finale Entscheidung durch den Decider mit Superheld-Sticker', NULL),
('Storyboard', 'storyboard', 'decide', 3, 'template', 'Schritt-für-Schritt Nutzer-Story als Comic-Strip (15 Frames)', NULL),
('Rollenverteilung', 'rollenverteilung', 'prototype', 4, 'template', 'Definition von Maker, Writer, Stitcher und Asset Collector', NULL),
('Rapid Prototyping', 'rapid-prototyping', 'prototype', 4, 'external', 'Tools für schnelle Prototypen-Erstellung (Figma, Keynote, etc.)', 'https://www.figma.com/templates/'),
('UX Copywriting', 'ux-copywriting', 'prototype', 4, 'template', 'Texte für Prototypen schreiben - Headlines, CTAs, Microcopy', NULL),
('Testskript-Erstellung', 'testskript', 'validate', 5, 'template', 'Strukturierter Leitfaden für Nutzer-Tests mit Intro und Fragen', NULL),
('Nutzerinterviews (5-User-Test)', '5-user-test', 'validate', 5, 'template', 'Testdurchführung mit 5 Nutzern nach Jakob Nielsen Methode', NULL),
('Think-Aloud-Methode', 'think-aloud', 'validate', 5, 'template', 'Nutzer verbalisieren ihre Gedanken während der Nutzung', NULL),
('Beobachtung & Notizen', 'beobachtung-notizen', 'validate', 5, 'template', 'Systematische Dokumentation von Beobachtungen während Tests', NULL),
('Pattern Recognition', 'pattern-recognition', 'validate', 5, 'template', 'Muster in Testergebnissen erkennen und clustern', NULL),
('Insight-Sammlung', 'insight-sammlung', 'validate', 5, 'template', 'Zentrale Erkenntnisse dokumentieren und priorisieren', NULL),
('Entscheidung über nächste Schritte', 'next-steps', 'retrospect', 5, 'template', 'Iterieren oder Pivotieren? Roadmap für die Zukunft', NULL),
('Retrospektive (optional)', 'retrospektive', 'retrospect', 5, 'template', 'Was lief gut? Was können wir verbessern? Team-Learnings', NULL);
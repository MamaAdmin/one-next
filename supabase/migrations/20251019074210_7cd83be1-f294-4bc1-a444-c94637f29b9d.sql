UPDATE lms_tools
SET
  title = 'Smart Sailboat (Retrospektive)',
  description = 'Visuelle Retrospektive-Methode mit 4 Perspektiven: Wind (Antrieb), Hafen (Ziel), Anker (Hindernisse), Eisberg (Risiken). Perfekt für Team-Reflexionen nach Sprints oder Projekten.',
  category = 'retrospect',
  tool_type = 'template',
  phase_number = 5,
  template_data = '{
    "type": "smart-sailboat",
    "title": "Smart Sailboat Discovery",
    "description": "Welches sind die potenziell wichtigsten Probleme, mit denen wir Zeit für das Framing aufwenden können? Mit anderen Worten: Welche Probleme sind gute Probleme, die man beim Problem Framing durchlaufen sollte?",
    "quadrants": [
      {
        "id": "wind",
        "title": "Wind",
        "color": "blue",
        "icon": "Wind",
        "questions": [
          "Was treibt uns in Richtung Hafen?",
          "Was hat gut für uns funktioniert?"
        ]
      },
      {
        "id": "hafen",
        "title": "Hafen",
        "color": "green",
        "icon": "Ship",
        "questions": [
          "Welchen Bestimmungsort verlassen?",
          "Um wo zu landen?"
        ]
      },
      {
        "id": "anker",
        "title": "Anker",
        "color": "amber",
        "icon": "Anchor",
        "questions": [
          "Was hält uns auf?",
          "Was sollten wir lösen oder erneuern?"
        ]
      },
      {
        "id": "eisberg",
        "title": "Eisberg",
        "color": "red",
        "icon": "Mountain",
        "questions": [
          "Welchen Bedrohungen sind wir ausgesetzt?",
          "Was für zukünftige Risiken sollten wir bedenken?"
        ]
      }
    ]
  }'::jsonb,
  tags = ARRAY['retrospektive', 'team', 'reflexion', 'sprint', 'discovery'],
  is_active = true,
  updated_at = now()
WHERE id = 'f6e19b2d-c765-4220-b821-32b72e1e62b7';
-- Befülle Hauptmenü (Header) mit existierenden Seiten
INSERT INTO navigation_items (menu_id, label, url, sort_order, is_active, target, icon)
VALUES
  -- Hauptnavigation
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Home', '/', 0, true, '_self', 'Home'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Leistungen', NULL, 1, true, '_self', 'Briefcase'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Blog', '/blog', 2, true, '_self', 'BookOpen'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Workshops', NULL, 3, true, '_self', 'Users'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Unternehmen', NULL, 4, true, '_self', 'Building'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'FAQ', '/faq', 5, true, '_self', 'HelpCircle');

-- Leistungen Submenu
WITH leistungen_item AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = 'adcdd123-6a35-4c32-92c6-af1f98912f6f' AND label = 'Leistungen'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  'adcdd123-6a35-4c32-92c6-af1f98912f6f',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM leistungen_item, (VALUES
  ('AI Consulting', '/ai-consulting-services', 0),
  ('Custom AI Development', '/custom-ai-development', 1),
  ('Data Quality Audit', '/data-quality-audit', 2)
) AS sub(label, url, sort_order);

-- Workshops Submenu
WITH workshops_item AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = 'adcdd123-6a35-4c32-92c6-af1f98912f6f' AND label = 'Workshops'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  'adcdd123-6a35-4c32-92c6-af1f98912f6f',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM workshops_item, (VALUES
  ('Sprint Übersicht', '/sprint-uebersicht', 0),
  ('Problem Framing', '/problem-framing-workshop', 1),
  ('Design Sprint', '/design-sprint-workshop', 2)
) AS sub(label, url, sort_order);

-- Unternehmen Submenu
WITH unternehmen_item AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = 'adcdd123-6a35-4c32-92c6-af1f98912f6f' AND label = 'Unternehmen'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  'adcdd123-6a35-4c32-92c6-af1f98912f6f',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM unternehmen_item, (VALUES
  ('Über uns', '/about-us', 0)
) AS sub(label, url, sort_order);

-- Befülle Footer-Menü
INSERT INTO navigation_items (menu_id, label, url, sort_order, is_active, target, icon)
VALUES
  -- Footer Hauptkategorien
  ('82f0c203-5383-42f5-892b-71368886acc3', 'Leistungen', NULL, 0, true, '_self', NULL),
  ('82f0c203-5383-42f5-892b-71368886acc3', 'Unternehmen', NULL, 1, true, '_self', NULL),
  ('82f0c203-5383-42f5-892b-71368886acc3', 'Rechtliches', NULL, 2, true, '_self', NULL);

-- Footer Leistungen
WITH footer_leistungen AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = '82f0c203-5383-42f5-892b-71368886acc3' AND label = 'Leistungen'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  '82f0c203-5383-42f5-892b-71368886acc3',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM footer_leistungen, (VALUES
  ('AI Consulting Services', '/ai-consulting-services', 0),
  ('Custom AI Development', '/custom-ai-development', 1),
  ('Data Quality Audit', '/data-quality-audit', 2),
  ('Sprint Übersicht', '/sprint-uebersicht', 3)
) AS sub(label, url, sort_order);

-- Footer Unternehmen
WITH footer_unternehmen AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = '82f0c203-5383-42f5-892b-71368886acc3' AND label = 'Unternehmen'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  '82f0c203-5383-42f5-892b-71368886acc3',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM footer_unternehmen, (VALUES
  ('Über uns', '/about-us', 0),
  ('Blog', '/blog', 1),
  ('FAQ', '/faq', 2)
) AS sub(label, url, sort_order);

-- Footer Rechtliches
WITH footer_rechtliches AS (
  SELECT id FROM navigation_items 
  WHERE menu_id = '82f0c203-5383-42f5-892b-71368886acc3' AND label = 'Rechtliches'
)
INSERT INTO navigation_items (menu_id, parent_id, label, url, sort_order, is_active, target)
SELECT 
  '82f0c203-5383-42f5-892b-71368886acc3',
  id,
  sub.label,
  sub.url,
  sub.sort_order,
  true,
  '_self'
FROM footer_rechtliches, (VALUES
  ('Datenschutz', '/privacy-policy', 0),
  ('Impressum', '/imprint', 1),
  ('AGB', '/terms-conditions', 2)
) AS sub(label, url, sort_order);
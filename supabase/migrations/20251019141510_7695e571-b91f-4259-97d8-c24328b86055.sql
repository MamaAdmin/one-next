-- Add sort_order to navigation_menus table
ALTER TABLE navigation_menus ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Set correct sort order: header before footer
UPDATE navigation_menus SET sort_order = 0 WHERE name = 'header';
UPDATE navigation_menus SET sort_order = 1 WHERE name = 'footer';

-- Delete old navigation items for clean slate
DELETE FROM navigation_items WHERE menu_id IN (
  'adcdd123-6a35-4c32-92c6-af1f98912f6f',
  '82f0c203-5383-42f5-892b-71368886acc3'
);

-- HAUPTMENÜ (Header) - Main categories
INSERT INTO navigation_items (menu_id, label, url, sort_order, is_active, target, icon)
VALUES
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Leistungen', NULL, 0, true, '_self', 'Briefcase'),
  ('adcdd123-6a35-4c32-92c6-af1f98912f6f', 'Unternehmen', NULL, 1, true, '_self', 'Building');

-- Leistungen Submenu (Header)
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
  ('Analyse', '/analyse', 0),
  ('Datenaudit', '/data-quality-audit', 1),
  ('Individuelle KI-Entwicklung', '/custom-ai-development', 2),
  ('Workshops', '/sprint-uebersicht', 3),
  ('AI Beratung', '/ai-consulting-services', 4)
) AS sub(label, url, sort_order);

-- Unternehmen Submenu (Header)
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
  ('Über uns', '/about-us', 0),
  ('FAQ', '/faq', 1),
  ('Blog', '/blog', 2),
  ('Kontakt', '/kontakt', 3)
) AS sub(label, url, sort_order);

-- FOOTER - Main categories
INSERT INTO navigation_items (menu_id, label, url, sort_order, is_active, target, icon)
VALUES
  ('82f0c203-5383-42f5-892b-71368886acc3', 'Leistungen', NULL, 0, true, '_self', NULL),
  ('82f0c203-5383-42f5-892b-71368886acc3', 'Unternehmen', NULL, 1, true, '_self', NULL);

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
  ('AI Design Sprint', '/sprint-uebersicht', 0),
  ('Datenaudit', '/data-quality-audit', 1),
  ('Individuelle KI-Entwicklung', '/custom-ai-development', 2),
  ('Workshops', '/sprint-uebersicht', 3),
  ('AI Beratung', '/ai-consulting-services', 4)
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
  ('FAQ', '/faq', 1),
  ('Blog', '/blog', 2),
  ('Kontakt', '/kontakt', 3)
) AS sub(label, url, sort_order);
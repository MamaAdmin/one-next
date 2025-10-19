-- Aktiviere automatische Versionierung für Tabellen
-- Die Trigger-Funktion wurde bereits erstellt, jetzt aktivieren wir die Trigger

-- Trigger für articles (falls noch nicht vorhanden)
DROP TRIGGER IF EXISTS articles_version_trigger ON articles;
CREATE TRIGGER articles_version_trigger
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION create_content_version();

-- Trigger für page_content (falls noch nicht vorhanden)
DROP TRIGGER IF EXISTS page_content_version_trigger ON page_content;
CREATE TRIGGER page_content_version_trigger
BEFORE UPDATE ON page_content
FOR EACH ROW
EXECUTE FUNCTION create_content_version();

-- Trigger für faq_items (falls noch nicht vorhanden)
DROP TRIGGER IF EXISTS faq_items_version_trigger ON faq_items;
CREATE TRIGGER faq_items_version_trigger
BEFORE UPDATE ON faq_items
FOR EACH ROW
EXECUTE FUNCTION create_content_version();
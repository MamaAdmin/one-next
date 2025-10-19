-- Update page content identifier from 'ai-design-sprint' to 'sprint-uebersicht'
UPDATE page_content 
SET page_name = 'sprint-uebersicht' 
WHERE page_name = 'ai-design-sprint';
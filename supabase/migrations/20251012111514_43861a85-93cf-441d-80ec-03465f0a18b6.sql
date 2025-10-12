-- Update the HMW tool to be an embedded type with the HMW generator
UPDATE lms_tools 
SET 
  tool_type = 'embedded',
  template_data = '{"type": "hmw-generator"}',
  description = 'Interaktiver Generator für "Wie können wir...?"-Fragen (How Might We). Erstellen Sie systematisch kreative Fragestellungen mit unserem Satzbaukasten.'
WHERE slug = 'hmw-fragen';

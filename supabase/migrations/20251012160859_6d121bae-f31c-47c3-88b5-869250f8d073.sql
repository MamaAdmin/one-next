-- Insert the User Testing Interview Tool
INSERT INTO lms_tools (
  title,
  slug,
  description,
  category,
  phase_number,
  tool_type,
  template_data,
  is_active,
  tags
) VALUES (
  'Experteninterview-Protokoll',
  'experteninterview-protokoll',
  'Strukturiertes Interview-Protokoll für User Testing mit Voice Bot Integration. Dokumentiere Hypothesen, Beobachtungen und Interview-Notizen.',
  'validate',
  4,
  'template',
  '{"type": "user-testing-form"}'::jsonb,
  true,
  ARRAY['interview', 'user-testing', 'voice-bot', 'validation']
);
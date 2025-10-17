-- Enable realtime for BMAD tables
ALTER TABLE bmad_sessions REPLICA IDENTITY FULL;
ALTER TABLE bmad_artifacts REPLICA IDENTITY FULL;
ALTER TABLE bmad_conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bmad_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE bmad_artifacts;
ALTER PUBLICATION supabase_realtime ADD TABLE bmad_conversations;

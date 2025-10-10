-- Rename columns from day to phase in design_sprint_sessions
ALTER TABLE design_sprint_sessions 
  RENAME COLUMN current_day TO current_phase;

ALTER TABLE design_sprint_sessions 
  RENAME COLUMN last_active_day TO last_active_phase;

-- Migrate existing data: current_day 0 becomes current_phase 1, etc.
UPDATE design_sprint_sessions 
SET current_phase = current_phase + 1
WHERE current_phase >= 0;

UPDATE design_sprint_sessions 
SET last_active_phase = last_active_phase + 1
WHERE last_active_phase >= 0;
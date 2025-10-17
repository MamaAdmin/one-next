-- Add missing agent types for complete BMAD methodology
DO $$ 
BEGIN
  -- Add developer agent type if not exists
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bmad_agent_type' AND typcategory = 'E') THEN
    CREATE TYPE bmad_agent_type AS ENUM ('business_analyst', 'product_manager', 'architect', 'developer');
  ELSE
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'developer';
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'ux_expert';
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'product_owner';
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'scrum_master';
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'qa_tester';
    ALTER TYPE bmad_agent_type ADD VALUE IF NOT EXISTS 'orchestrator';
  END IF;
END $$;

-- Add missing artifact types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bmad_artifact_type' AND typcategory = 'E') THEN
    CREATE TYPE bmad_artifact_type AS ENUM ('requirements', 'architecture', 'code', 'deployment');
  ELSE
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'product_vision';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'ux_wireframes';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'user_stories';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'sprint_plan';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'story_file';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'test_plan';
    ALTER TYPE bmad_artifact_type ADD VALUE IF NOT EXISTS 'orchestration_log';
  END IF;
END $$;

-- Migrate existing 'manager' entries to 'product_manager' if they exist
UPDATE bmad_artifacts 
SET agent_type = 'product_manager'::bmad_agent_type
WHERE agent_type::text = 'manager';

UPDATE bmad_conversations 
SET agent_type = 'product_manager'::bmad_agent_type
WHERE agent_type::text = 'manager';

-- Add comment documenting the BMAD methodology phases
COMMENT ON TYPE bmad_agent_type IS '9-phase BMAD methodology: business_analyst, product_manager, ux_expert, product_owner, architect, scrum_master, developer, qa_tester, orchestrator';
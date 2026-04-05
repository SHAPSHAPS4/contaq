-- Migration 006: Training Hub tables in Supabase
-- Replaces file-based JSON storage with durable DB tables

-- Training extractions (review queue)
CREATE TABLE IF NOT EXISTS training_extractions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL DEFAULT 'Unknown',
  extraction_type TEXT DEFAULT 'drawing',
  model_used    TEXT DEFAULT 'claude-sonnet-4-6',
  prompt_version INT DEFAULT 1,
  input_tokens  INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  validation_grade TEXT,
  validation_score INT,
  raw_result    JSONB DEFAULT '{}',
  item_count    INT DEFAULT 0,
  review_status TEXT DEFAULT 'pending',  -- pending, reviewed, dismissed
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Golden records (reviewed extractions with corrections)
CREATE TABLE IF NOT EXISTS training_golden_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id   UUID REFERENCES training_extractions(id) ON DELETE SET NULL,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_name   TEXT,
  extraction_type TEXT,
  corrected_items JSONB DEFAULT '[]',
  original_items  JSONB DEFAULT '[]',
  feedback        JSONB DEFAULT '[]',
  item_count      INT DEFAULT 0,
  correct_count   INT DEFAULT 0,
  wrong_count     INT DEFAULT 0,
  hallucination_count INT DEFAULT 0,
  missed_count    INT DEFAULT 0,
  accuracy_pct    NUMERIC(5,2) DEFAULT 0,
  reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Field-level feedback (individual item corrections)
CREATE TABLE IF NOT EXISTS training_feedback (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  golden_record_id UUID REFERENCES training_golden_records(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_index      INT,
  field_name      TEXT DEFAULT 'description',
  original_value  TEXT,
  corrected_value TEXT,
  tag             TEXT,  -- correct, wrong_value, hallucination, missed_item, rule_applied, rule_ignored
  comment         TEXT,
  rule_ref        TEXT,
  severity        TEXT DEFAULT 'medium',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_training_ext_org_status ON training_extractions(org_id, review_status);
CREATE INDEX IF NOT EXISTS idx_training_gr_org ON training_golden_records(org_id);
CREATE INDEX IF NOT EXISTS idx_training_fb_gr ON training_feedback(golden_record_id);

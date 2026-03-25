-- Migration: Add example before/after columns to learned_rules
-- Purpose: Store concrete before/after examples alongside rules for richer AI prompts
-- Date: 2026-03-24

-- Example columns: the old (incorrect) output and the corrected output
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS example_before TEXT;
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS example_after TEXT;

-- Context keywords: extracted MEP domain terms for faster relevance scoring
-- Stored as JSONB array, e.g. ["copper","pipe","15mm","lthw"]
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS context_keywords JSONB DEFAULT '[]';

-- Index on context_keywords for GIN-based search (future vector-free similarity)
CREATE INDEX IF NOT EXISTS idx_learned_rules_keywords ON learned_rules USING GIN (context_keywords);

-- Comment for documentation
COMMENT ON COLUMN learned_rules.example_before IS 'The AI output that was incorrect (before correction)';
COMMENT ON COLUMN learned_rules.example_after IS 'The estimator-corrected output (what it should have been)';
COMMENT ON COLUMN learned_rules.context_keywords IS 'MEP domain keywords extracted from the rule for relevance scoring';

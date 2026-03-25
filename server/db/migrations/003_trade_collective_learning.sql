-- Migration: Trade Collective Learning
-- Purpose: Enable cross-org learning within the same trade
-- Date: 2026-03-24
--
-- Architecture:
--   Layer 1: Static KB (shared by all) — industry standards
--   Layer 2: Trade Collective (new) — corrections shared within same trade
--   Layer 3: Org-Private (existing) — firm-specific corrections
--
-- Safety:
--   - Rules are org-private by default (scope = 'org')
--   - Admin must explicitly share to collective (scope = 'trade-collective')
--   - Minimum 3 occurrences required before sharing is allowed
--   - Pricing rules (rule_type = 'pricing') can NEVER be shared
--   - Orgs can opt out of receiving collective rules entirely

-- Add scope column to learned_rules (default: org-private)
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'org';
-- CHECK constraint ensures only valid values
ALTER TABLE learned_rules ADD CONSTRAINT chk_learned_rules_scope
  CHECK (scope IN ('org', 'trade-collective'));

-- Add trade column (populated when rule is shared to collective)
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS trade TEXT;

-- Add shared_by_org to track provenance (which org contributed)
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS shared_by_org UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add shared_at timestamp
ALTER TABLE learned_rules ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- Index for efficient collective rule queries by trade
CREATE INDEX IF NOT EXISTS idx_learned_rules_collective
  ON learned_rules(trade, scope)
  WHERE scope = 'trade-collective';

-- Add collective learning opt-in to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS collective_learning_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Comment documentation
COMMENT ON COLUMN learned_rules.scope IS 'org = private to this org, trade-collective = shared with all orgs in same trade';
COMMENT ON COLUMN learned_rules.trade IS 'Trade this rule applies to (set when shared to collective)';
COMMENT ON COLUMN learned_rules.shared_by_org IS 'The org that originally contributed this rule to the collective';
COMMENT ON COLUMN learned_rules.shared_at IS 'When this rule was shared to the collective';
COMMENT ON COLUMN organizations.collective_learning_enabled IS 'Whether this org receives trade collective learned rules';

-- Migration: Add Stripe billing columns to organizations
-- Date: 2026-03-25

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_organizations_stripe ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

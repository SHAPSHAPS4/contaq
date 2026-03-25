-- Migration: Change trial period from 14 days to 7 days
-- Date: 2026-03-24
-- Only affects NEW signups — existing orgs keep their current trial_ends

ALTER TABLE organizations ALTER COLUMN trial_ends SET DEFAULT (NOW() + INTERVAL '7 days');

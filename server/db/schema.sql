-- ═══════════════════════════════════════════════════════════════
-- CONTRAQ — Multi-Tenant Database Schema
-- PostgreSQL / Supabase
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ORGANIZATIONS (tenants) ────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,              -- URL-safe identifier e.g. "foxdon-insulation"
  plan        TEXT NOT NULL DEFAULT 'starter',    -- starter, professional, business
  trade       TEXT DEFAULT 'insulation',          -- primary trade
  max_users   INT NOT NULL DEFAULT 2,
  max_projects INT NOT NULL DEFAULT 5,
  trial_ends  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_id     UUID UNIQUE,                        -- links to Supabase Auth user
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',        -- admin, manager, user, viewer
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- ─── CLIENTS ────────────────────────────────────────────────
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  contact     TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  category    TEXT DEFAULT 'main-contractor',      -- main-contractor, developer, direct
  pay_terms   INT DEFAULT 30,
  status      TEXT DEFAULT 'active',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROJECTS ───────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  reference   TEXT NOT NULL,                       -- PRJ-2026-001
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',      -- active, complete, on-hold, archived
  value       NUMERIC(12,2) DEFAULT 0,
  start_date  DATE,
  end_date    DATE,
  site_address TEXT,
  trade       TEXT,                                -- insulation, ductwork, electrical, etc.
  manager_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── QUOTES / TENDERS ───────────────────────────────────────
CREATE TABLE quotes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  reference   TEXT NOT NULL,                       -- QTE-2026-012
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft',       -- draft, submitted, won, lost, expired
  value       NUMERIC(12,2) DEFAULT 0,
  margin_pct  NUMERIC(5,2),
  submit_date DATE,
  expiry_date DATE,
  spec_ref    TEXT,                                -- NBS section reference
  version     INT DEFAULT 1,
  notes       TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── QUOTE LINE ITEMS ───────────────────────────────────────
CREATE TABLE quote_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id    UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  trade       TEXT,                                -- mechanical, electrical, insulation
  quantity    NUMERIC(12,3) DEFAULT 0,
  unit        TEXT DEFAULT 'nr',                   -- nr, m, m2, kg, hr, etc.
  material_rate NUMERIC(10,2) DEFAULT 0,
  labour_rate NUMERIC(10,2) DEFAULT 0,
  total       NUMERIC(12,2) DEFAULT 0,
  confidence  TEXT DEFAULT 'high',                 -- high, medium, low
  source_ref  TEXT,                                -- drawing reference
  spec_ref    TEXT,                                -- spec clause
  ai_extracted BOOLEAN DEFAULT FALSE,
  manually_adjusted BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AI EXTRACTIONS ─────────────────────────────────────────
CREATE TABLE extractions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_id    UUID REFERENCES quotes(id) ON DELETE SET NULL,
  stage       TEXT NOT NULL,                       -- drawing, spec, takeoff, pricing
  input_files JSONB DEFAULT '[]',                  -- [{name, type, size_kb}]
  result_json JSONB,                               -- full AI extraction result
  grade       TEXT,                                -- A, B, C, D, F
  score       INT,                                 -- 0-100 validation score
  items_count INT DEFAULT 0,
  flags_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  model       TEXT DEFAULT 'claude-sonnet-4-6',
  processing_ms INT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INVOICES ───────────────────────────────────────────────
CREATE TABLE invoices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  reference   TEXT NOT NULL,                       -- INV-2026-0005
  type        TEXT DEFAULT 'standard',             -- standard, valuation, final-account
  status      TEXT NOT NULL DEFAULT 'draft',       -- draft, sent, paid, overdue, disputed
  net_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount  NUMERIC(12,2) DEFAULT 0,
  gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  retention_pct NUMERIC(5,2) DEFAULT 0,
  retention_amount NUMERIC(12,2) DEFAULT 0,
  cis_deduction NUMERIC(12,2) DEFAULT 0,
  issue_date  DATE,
  due_date    DATE,
  paid_date   DATE,
  payment_ref TEXT,
  notes       TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PURCHASE ORDERS ────────────────────────────────────────
CREATE TABLE purchase_orders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  supplier_id UUID,                                -- references suppliers table
  reference   TEXT NOT NULL,                       -- PO-INS-003
  status      TEXT NOT NULL DEFAULT 'draft',       -- draft, ordered, delivered, partial, cancelled
  total       NUMERIC(12,2) DEFAULT 0,
  order_date  DATE,
  delivery_date DATE,
  items_json  JSONB DEFAULT '[]',
  notes       TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ENGINEERS / WORKFORCE ──────────────────────────────────
CREATE TABLE engineers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  role        TEXT DEFAULT 'engineer',             -- engineer, supervisor, apprentice, subcontractor
  trade       TEXT,
  day_rate    NUMERIC(8,2),
  status      TEXT DEFAULT 'active',               -- active, inactive, on-leave
  emergency_contact TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CERTIFICATIONS ─────────────────────────────────────────
CREATE TABLE certifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                       -- CSCS, IPAF, Asbestos, Hot Works, First Aid, etc.
  card_number TEXT,
  issue_date  DATE,
  expiry_date DATE,
  status      TEXT DEFAULT 'valid',                -- valid, expiring, expired
  file_url    TEXT,                                -- uploaded cert scan
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUPPLIERS ──────────────────────────────────────────────
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  contact     TEXT,
  email       TEXT,
  phone       TEXT,
  category    TEXT,                                -- pipe insulation, ductwork, fixings, etc.
  account_ref TEXT,
  pay_terms   INT DEFAULT 30,
  status      TEXT DEFAULT 'active',
  rating      INT DEFAULT 3,                       -- 1-5
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── JOURNAL ENTRIES (site diary) ───────────────────────────
CREATE TABLE journal_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  type        TEXT DEFAULT 'general',              -- general, instruction, delay, variation, safety, weather
  title       TEXT,
  content     TEXT NOT NULL,
  weather     TEXT,
  workforce_count INT,
  ai_analysis JSONB,                               -- EOT/contract analysis result
  attachments JSONB DEFAULT '[]',                  -- [{name, url, type}]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SCHEDULE / DIARY EVENTS ────────────────────────────────
CREATE TABLE schedule_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,
  start_time  TIME,
  end_time    TIME,
  color       TEXT DEFAULT 'blue',
  engineer_ids UUID[] DEFAULT '{}',                -- array of engineer IDs assigned
  notes       TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DOCUMENTS / FILES ──────────────────────────────────────
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  folder      TEXT DEFAULT '/',
  name        TEXT NOT NULL,
  type        TEXT,                                -- pdf, dwg, xlsx, docx, jpg, etc.
  size_bytes  BIGINT DEFAULT 0,
  storage_url TEXT,                                -- Supabase Storage or S3 URL
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  version     INT DEFAULT 1,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CIS RETURNS ────────────────────────────────────────────
CREATE TABLE cis_returns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tax_month   TEXT NOT NULL,                       -- "2026-03"
  status      TEXT DEFAULT 'draft',                -- draft, submitted, accepted
  total_paid  NUMERIC(12,2) DEFAULT 0,
  total_deducted NUMERIC(12,2) DEFAULT 0,
  subcontractors_json JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRICE BOOK ─────────────────────────────────────────────
CREATE TABLE pricebook_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,                       -- pipe-insulation, duct-insulation, fixings, etc.
  description TEXT NOT NULL,
  unit        TEXT DEFAULT 'nr',
  material_rate NUMERIC(10,2) DEFAULT 0,
  labour_rate NUMERIC(10,2) DEFAULT 0,
  supplier    TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  source      TEXT DEFAULT 'manual',               -- manual, eca-2026, ai-learned
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AI LEARNED RULES (knowledge base) ──────────────────────
CREATE TABLE learned_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_type   TEXT NOT NULL,                       -- extraction, pricing, scope, pattern-error
  trigger_text TEXT NOT NULL,
  action_text TEXT NOT NULL,
  reason      TEXT,
  source_project TEXT,
  occurrences INT DEFAULT 1,
  is_promoted BOOLEAN DEFAULT FALSE,               -- promoted to permanent KB
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ACTIVITY LOG ───────────────────────────────────────────
CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                       -- created, updated, deleted, sent, extracted, etc.
  entity_type TEXT NOT NULL,                       -- project, quote, invoice, engineer, etc.
  entity_id   UUID,
  description TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════
-- INDEXES — query performance
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_email ON users(org_id, email);
CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_projects_status ON projects(org_id, status);
CREATE INDEX idx_quotes_org ON quotes(org_id);
CREATE INDEX idx_quotes_status ON quotes(org_id, status);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_extractions_org ON extractions(org_id);
CREATE INDEX idx_extractions_quote ON extractions(quote_id);
CREATE INDEX idx_invoices_org ON invoices(org_id);
CREATE INDEX idx_invoices_status ON invoices(org_id, status);
CREATE INDEX idx_invoices_due ON invoices(org_id, due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX idx_engineers_org ON engineers(org_id);
CREATE INDEX idx_certs_engineer ON certifications(engineer_id);
CREATE INDEX idx_certs_expiry ON certifications(org_id, expiry_date) WHERE status != 'expired';
CREATE INDEX idx_journal_org ON journal_entries(org_id);
CREATE INDEX idx_journal_project ON journal_entries(project_id);
CREATE INDEX idx_schedule_org ON schedule_events(org_id);
CREATE INDEX idx_schedule_date ON schedule_events(org_id, start_date);
CREATE INDEX idx_documents_org ON documents(org_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_activity_org ON activity_log(org_id);
CREATE INDEX idx_activity_recent ON activity_log(org_id, created_at DESC);
CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_suppliers_org ON suppliers(org_id);
CREATE INDEX idx_po_org ON purchase_orders(org_id);
CREATE INDEX idx_pricebook_org ON pricebook_items(org_id);
CREATE INDEX idx_learned_rules_org ON learned_rules(org_id);
CREATE INDEX idx_cis_org ON cis_returns(org_id);


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — tenant isolation
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cis_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricebook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's org_id from JWT
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS policies: users can only access their own org's data
-- Pattern: SELECT/INSERT/UPDATE/DELETE WHERE org_id = auth.user_org_id()

CREATE POLICY "Users see own org" ON users
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Org members see org" ON organizations
  FOR ALL USING (id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON clients
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON projects
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON quotes
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON quote_items
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON extractions
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON invoices
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON purchase_orders
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON engineers
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON certifications
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON suppliers
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON journal_entries
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON schedule_events
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON documents
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON cis_returns
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON pricebook_items
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON learned_rules
  FOR ALL USING (org_id = auth.user_org_id());

CREATE POLICY "Tenant isolation" ON activity_log
  FOR ALL USING (org_id = auth.user_org_id());


-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS — auto-update timestamps
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_purchase_orders_updated BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_engineers_updated BEFORE UPDATE ON engineers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_journal_entries_updated BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_schedule_events_updated BEFORE UPDATE ON schedule_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pricebook_items_updated BEFORE UPDATE ON pricebook_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_learned_rules_updated BEFORE UPDATE ON learned_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cis_returns_updated BEFORE UPDATE ON cis_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ═══════════════════════════════════════════════════════════════
-- PLAN LIMITS — enforced via application layer
-- ═══════════════════════════════════════════════════════════════
-- Starter:      2 users,  5 projects,  3 AI extractions/month
-- Professional: 5 users, 20 projects,  unlimited AI extractions
-- Business:     unlimited users, unlimited projects, unlimited AI

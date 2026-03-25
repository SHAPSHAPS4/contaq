-- PART 2: Indexes, RLS, and triggers (run this AFTER part 1)

-- Indexes
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
CREATE INDEX idx_engineers_org ON engineers(org_id);
CREATE INDEX idx_certs_engineer ON certifications(engineer_id);
CREATE INDEX idx_journal_org ON journal_entries(org_id);
CREATE INDEX idx_journal_project ON journal_entries(project_id);
CREATE INDEX idx_schedule_org ON schedule_events(org_id);
CREATE INDEX idx_schedule_date ON schedule_events(org_id, start_date);
CREATE INDEX idx_documents_org ON documents(org_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_activity_org ON activity_log(org_id);
CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_suppliers_org ON suppliers(org_id);
CREATE INDEX idx_po_org ON purchase_orders(org_id);
CREATE INDEX idx_pricebook_org ON pricebook_items(org_id);
CREATE INDEX idx_learned_rules_org ON learned_rules(org_id);
CREATE INDEX idx_cis_org ON cis_returns(org_id);

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

-- Auto-update timestamp trigger
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

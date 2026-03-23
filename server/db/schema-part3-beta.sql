-- PART 3: Beta access + feedback tables (run after parts 1 & 2)

-- Beta applications (from /beta landing page)
CREATE TABLE beta_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  trade TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  team_size TEXT,
  current_tools TEXT,
  project_size TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User feedback (in-app widget)
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  what_worked TEXT,
  what_didnt TEXT,
  would_pay BOOLEAN,
  price_range TEXT,
  page TEXT,  -- which page/panel they were on
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Extraction accuracy ratings (after each AI extraction)
CREATE TABLE extraction_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  extraction_id UUID REFERENCES extractions(id) ON DELETE CASCADE,
  accuracy TEXT NOT NULL CHECK (accuracy IN ('yes', 'partially', 'no')),
  corrections_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_beta_status ON beta_applications(status);
CREATE INDEX idx_beta_email ON beta_applications(email);
CREATE INDEX idx_feedback_org ON feedback(org_id);
CREATE INDEX idx_extraction_ratings_org ON extraction_ratings(org_id);

-- RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_ratings ENABLE ROW LEVEL SECURITY;
-- beta_applications: no RLS needed (public submit, admin read)

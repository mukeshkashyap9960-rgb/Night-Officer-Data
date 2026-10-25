-- Night Duty Monitoring System - Supabase Setup Script

-- 1. Table: NightOfficers (Personnel Registry)
CREATE TABLE IF NOT EXISTS "NightOfficers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT CHECK (category IN ('PI', 'PSI')),
    squad TEXT NOT NULL,
    name TEXT NOT NULL,
    rank TEXT,
    phone TEXT,
    branch TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: NightRoster (Duty Schedule)
CREATE TABLE IF NOT EXISTS "NightRoster" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TEXT NOT NULL UNIQUE,
    day_name TEXT,
    communal_pi TEXT,
    division_pi TEXT,
    cm_morcho_psi TEXT,
    campus_psi TEXT,
    vvip_psi TEXT,
    attendance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Security (Row Level Security)
ALTER TABLE "NightOfficers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NightRoster" ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Policies (Allow all operations for simplicity in this applet)
-- Note: In a production environment, you should restrict these based on authenticated users.
DROP POLICY IF EXISTS "Public All Officers" ON "NightOfficers";
CREATE POLICY "Public All Officers" ON "NightOfficers" FOR ALL USING (true);

DROP POLICY IF EXISTS "Public All Roster" ON "NightRoster";
CREATE POLICY "Public All Roster" ON "NightRoster" FOR ALL USING (true);

-- 5. Verification Queries (Useful for administrators)
-- Total Personnel: SELECT count(*) FROM "NightOfficers";
-- Roster Coverage: SELECT count(*) FROM "NightRoster";

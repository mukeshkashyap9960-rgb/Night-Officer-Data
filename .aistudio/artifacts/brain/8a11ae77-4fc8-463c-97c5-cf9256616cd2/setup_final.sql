-- ==============================================================================
-- GUJARAT POLICE NIGHT DUTY ROSTER - COMPLETE SUPABASE SQL SCRIPT
-- ==============================================================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE NightOfficers TABLE (Personnel Directory)
CREATE TABLE IF NOT EXISTS "NightOfficers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT CHECK (category IN ('PI', 'PSI')) NOT NULL,
    squad TEXT NOT NULL,
    name TEXT NOT NULL,
    rank TEXT,
    phone TEXT,
    branch TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE NightRoster TABLE (1 to 30 Duty Schedule)
CREATE TABLE IF NOT EXISTS "NightRoster" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TEXT NOT NULL UNIQUE,
    day_name TEXT NOT NULL,
    communal_pi TEXT,
    division_pi TEXT,
    cm_morcho_psi TEXT,
    campus_psi TEXT,
    vvip_psi TEXT,
    notes TEXT,
    attendance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE "NightOfficers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NightRoster" ENABLE ROW LEVEL SECURITY;

-- 5. PUBLIC ACCESS POLICIES (Full CRUD access for authorized application operations)
DROP POLICY IF EXISTS "Enable all access for everyone on Officers" ON "NightOfficers";
CREATE POLICY "Enable all access for everyone on Officers" ON "NightOfficers" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for everyone on Roster" ON "NightRoster";
CREATE POLICY "Enable all access for everyone on Roster" ON "NightRoster" FOR ALL USING (true) WITH CHECK (true);

-- 6. USEFUL VERIFICATION QUERIES (Run these in SQL Editor to check counts)

-- A. Count officers by Category (PI & PSI)
SELECT 
    count(*) AS "Total Officers", 
    count(*) FILTER (WHERE category = 'PI') AS "Total PI",
    count(*) FILTER (WHERE category = 'PSI') AS "Total PSI"
FROM "NightOfficers";

-- B. List all officers
SELECT category, squad, name, rank, phone 
FROM "NightOfficers" 
ORDER BY category, squad, name;

-- C. Count total roster days saved (e.g. 30 days)
SELECT count(*) AS "Total Saved Roster Days" 
FROM "NightRoster";

-- D. View all 1 to 30 dates and duty allocations
SELECT date, day_name, communal_pi, division_pi, cm_morcho_psi, campus_psi, vvip_psi 
FROM "NightRoster" 
ORDER BY created_at;

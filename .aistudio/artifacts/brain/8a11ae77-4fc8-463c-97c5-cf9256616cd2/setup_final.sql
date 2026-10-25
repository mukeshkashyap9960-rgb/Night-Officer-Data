-- GUJARAT POLICE NIGHT DUTY SYSTEM - FINAL SUPABASE SETUP SCRIPT

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE NightOfficers TABLE (Personnel)
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

-- 3. CREATE NightRoster TABLE (Duty Chart)
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

-- 4. ENABLE SECURITY (RLS)
ALTER TABLE "NightOfficers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NightRoster" ENABLE ROW LEVEL SECURITY;

-- 5. CREATE PUBLIC POLICIES (Allow All Operations for simplicity)
-- This ensures the 401 error is bypassed if the API key is correct.
DROP POLICY IF EXISTS "Enable all access for everyone on Officers" ON "NightOfficers";
CREATE POLICY "Enable all access for everyone on Officers" ON "NightOfficers" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for everyone on Roster" ON "NightRoster";
CREATE POLICY "Enable all access for everyone on Roster" ON "NightRoster" FOR ALL USING (true) WITH CHECK (true);

-- 6. VERIFICATION QUERIES (Optional)
-- SELECT * FROM "NightOfficers" LIMIT 5;
-- SELECT * FROM "NightRoster" LIMIT 5;

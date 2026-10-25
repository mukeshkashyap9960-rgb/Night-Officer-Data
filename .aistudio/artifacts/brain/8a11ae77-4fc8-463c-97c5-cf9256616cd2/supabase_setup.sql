-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: NightOfficers
CREATE TABLE IF NOT EXISTS "NightOfficers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad TEXT NOT NULL,
    category TEXT CHECK (category IN ('PI', 'PSI')),
    name TEXT NOT NULL,
    rank TEXT,
    phone TEXT,
    branch TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: NightRoster
CREATE TABLE IF NOT EXISTS "NightRoster" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TEXT NOT NULL UNIQUE,
    day_name TEXT,
    communal_pi TEXT,
    division_pi TEXT,
    cm_morcho_psi TEXT,
    campus_psi TEXT,
    vvip_psi TEXT,
    notes TEXT,
    attendance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: NightConfig
CREATE TABLE IF NOT EXISTS "NightConfig" (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Optional, but recommended. For now, we allow public read/write if anon key is used without strict policies)
ALTER TABLE "NightOfficers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NightRoster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NightConfig" ENABLE ROW LEVEL SECURITY;

-- Create simple public access policies (adjust as needed for security)
CREATE POLICY "Public Read Officers" ON "NightOfficers" FOR SELECT USING (true);
CREATE POLICY "Public Write Officers" ON "NightOfficers" FOR ALL USING (true);

CREATE POLICY "Public Read Roster" ON "NightRoster" FOR SELECT USING (true);
CREATE POLICY "Public Write Roster" ON "NightRoster" FOR ALL USING (true);

CREATE POLICY "Public Read Config" ON "NightConfig" FOR SELECT USING (true);
CREATE POLICY "Public Write Config" ON "NightConfig" FOR ALL USING (true);

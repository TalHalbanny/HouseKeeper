-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS residents (
    id BIGSERIAL PRIMARY KEY,
    household_id TEXT NOT NULL,
    resident_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    id_number TEXT NOT NULL,
    resident_type TEXT NOT NULL DEFAULT 'adult',
    school_schedule TEXT,
    workplace TEXT,
    work_hours TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for residents" ON residents;
CREATE POLICY "Allow all for residents" ON residents
    FOR ALL USING (true) WITH CHECK (true);

-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/aldyswzileqxvxciftmh/sql

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    household_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for events" ON events;
CREATE POLICY "Allow all for events" ON events
    FOR ALL USING (true) WITH CHECK (true);

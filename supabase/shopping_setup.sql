-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/aldyswzileqxvxciftmh/sql

CREATE TABLE IF NOT EXISTS shopping_lists (
    id BIGSERIAL PRIMARY KEY,
    household_id TEXT NOT NULL,
    list_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_items (
    id BIGSERIAL PRIMARY KEY,
    list_id BIGINT NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for shopping_lists" ON shopping_lists;
CREATE POLICY "Allow all for shopping_lists" ON shopping_lists
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for shopping_items" ON shopping_items;
CREATE POLICY "Allow all for shopping_items" ON shopping_items
    FOR ALL USING (true) WITH CHECK (true);

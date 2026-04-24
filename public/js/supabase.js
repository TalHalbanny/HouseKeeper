require('dotenv').config();
const {createClient} = require('@supabase/supabase-js');


const database_URL = process.env.SUPABASE_URL;
const database_ANON_url = process.env.SUPABASE_ANON_KEY;

//create connection to SUPABASE

const supabase = createClient(database_URL, database_ANON_url);

module.exports= supabase;

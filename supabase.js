const { createClient } = require('@supabase/supabase-js');

let _supabase = null;
let _supabasePublic = null;

function getSupabase() {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_URL === 'your_supabase_project_url') {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are not set in .env');
    }
    _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

function getSupabasePublic() {
  if (!_supabasePublic) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_URL === 'your_supabase_project_url') {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are not set in .env');
    }
    _supabasePublic = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }
  return _supabasePublic;
}

// Proxy objects — behave like the real clients but init lazily
const supabase = new Proxy({}, {
  get(_, prop) {
    return (...args) => getSupabase()[prop](...args);
  }
});

const supabasePublic = new Proxy({}, {
  get(_, prop) {
    return (...args) => getSupabasePublic()[prop](...args);
  }
});

module.exports = { supabase, supabasePublic };

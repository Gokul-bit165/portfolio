/**
 * Supabase Client Configuration for Public Portfolio
 */
window.SUPABASE_URL = (window.ENV && window.ENV.SUPABASE_URL) || window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || '';
window.SUPABASE_ANON_KEY = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || '';

if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase) {
  window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  console.log('[Supabase] Public client initialized successfully.');
} else {
  console.warn('[Supabase] Credentials missing in js/env.js or SDK not loaded. Running with fallback static data.');
}

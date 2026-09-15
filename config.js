// ============================================================
// Configuración de conexión a Supabase
// ------------------------------------------------------------
// SUPABASE_URL y SUPABASE_ANON_KEY se obtienen en:
// Supabase → tu proyecto → Project Settings → API
//
// La clave "anon / public" es segura para usar en el navegador
// SIEMPRE que la tabla tenga Row Level Security (RLS) activado
// con políticas adecuadas (ver schema.sql).
//
// NUNCA copies aquí la clave "service_role": esa es secreta y
// solo debe usarse en un servidor, nunca en código de cliente.
// ============================================================

const SUPABASE_URL = "https://tmbkzmwpwylwivrsrrft.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4d5dEHF4rIbFzD0sieR2Kw_TYTg_hyN";

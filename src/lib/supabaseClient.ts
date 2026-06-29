import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const LOCAL_USER_KEY = "aura.local.user";

function supabaseUrl() {
  return import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
}

function supabaseAnonKey() {
  return import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
}

// Circuit breaker: if the anon key is wrong/missing the schema, Supabase returns
// 401/403 on every call and spams the console (making local-first features look
// broken). After the first auth failure we disable Supabase for the session and
// quietly fall back to localStorage.
let authFailed = false;

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl() && supabaseAnonKey()) && !authFailed;
}

// Memoized supabase-js client used for Auth (session, OAuth, anonymous). Data
// reads/writes still go through the lightweight REST helpers below; this client
// owns the auth session (persisted to localStorage, auto-refreshed). Returns null
// when the project isn't configured so callers can degrade gracefully.
let _client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!supabaseUrl() || !supabaseAnonKey()) return null;
  if (!_client) {
    _client = createClient(supabaseUrl(), supabaseAnonKey(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return _client;
}

/** Cache the authenticated user id + access token (set by AuthProvider) so data
 *  writes can scope rows to the logged-in user and satisfy `auth.uid()` RLS. */
let authedUserId: string | null = null;
let authedAccessToken: string | null = null;
export function setAuthedUserId(id: string | null) {
  authedUserId = id;
}
export function setAuthedAccessToken(token: string | null) {
  authedAccessToken = token;
}

export function getLocalUserId() {
  // Prefer the authenticated user's id so their data is tied to them, not the
  // browser. Falls back to a stable per-device id for guests / pre-login.
  if (authedUserId) return authedUserId;
  let id = localStorage.getItem(LOCAL_USER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(LOCAL_USER_KEY, id);
  }
  return id;
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!hasSupabaseConfig()) throw new Error("Supabase is not configured");
  const url = `${supabaseUrl()}/rest/v1/${path.replace(/^\/+/, "")}`;
  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseAnonKey());
  // Use the signed-in user's access token so RLS `auth.uid()` policies see them;
  // fall back to the anon key for pre-login / guest-less data reads.
  headers.set("Authorization", `Bearer ${authedAccessToken ?? supabaseAnonKey()}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      authFailed = true;
      console.warn(
        `[AURA] Supabase auth failed (${response.status}) — disabling Supabase for this session and running local-first. ` +
          `Check VITE_SUPABASE_ANON_KEY and that the schema in /supabase has been applied.`
      );
    }
    const body = await response.text().catch(() => "");
    throw new Error(`Supabase ${response.status}: ${body || response.statusText}`);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function supabaseUpsert(table: string, rows: unknown[], conflictTarget = "id") {
  if (!rows.length || !hasSupabaseConfig()) return;
  await supabaseRest(`${table}?on_conflict=${encodeURIComponent(conflictTarget)}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
}

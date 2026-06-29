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

export function getLocalUserId() {
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
  headers.set("Authorization", `Bearer ${supabaseAnonKey()}`);
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

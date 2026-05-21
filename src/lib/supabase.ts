// Lightweight Supabase client — avoids the @supabase/supabase-js npm dependency
// which can fail to install in some deployment environments.
// Implements just the auth and postgrest features we need.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${path}: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

// --- Auth ---

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface AuthUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface AuthResponse {
  data: { user: AuthUser | null; session: AuthSession | null };
  error: { message: string } | null;
}

export type { AuthUser as User, AuthSession as Session };

let currentSession: AuthSession | null = null;

function getSessionFromStorage(): AuthSession | null {
  try {
    const raw = localStorage.getItem("sb-auth-session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSessionToStorage(session: AuthSession | null) {
  try {
    if (session) {
      localStorage.setItem("sb-auth-session", JSON.stringify(session));
    } else {
      localStorage.removeItem("sb-auth-session");
    }
  } catch {
    // ignore
  }
}

export const supabase = {
  auth: {
    async getSession() {
      if (currentSession) return { data: { session: currentSession } };
      const stored = getSessionFromStorage();
      if (stored) {
        currentSession = stored;
        return { data: { session: stored } };
      }
      return { data: { session: null } };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { data: { user: null, session: null }, error: { message: json.error_description || json.msg || json.error || "Sign in failed" } };
        }
        const session: AuthSession = {
          access_token: json.access_token,
          refresh_token: json.refresh_token,
          user: json.user,
        };
        currentSession = session;
        saveSessionToStorage(session);
        notifyListeners("SIGNED_IN", session);
        return { data: { user: session.user, session }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: { message: String(err) } };
      }
    },

    async signUp({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { data: { user: null, session: null }, error: { message: json.error_description || json.msg || json.error || "Sign up failed" } };
        }
        // Supabase with email confirmation disabled returns a session
        if (json.access_token) {
          const session: AuthSession = {
            access_token: json.access_token,
            refresh_token: json.refresh_token,
            user: json.user,
          };
          currentSession = session;
          saveSessionToStorage(session);
          notifyListeners("SIGNED_IN", session);
          return { data: { user: session.user, session }, error: null };
        }
        // Email confirmation required — no session yet
        return { data: { user: json.user ?? null, session: null }, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: { message: String(err) } };
      }
    },

    async signOut() {
      if (currentSession) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${currentSession.access_token}`,
            },
          });
        } catch {
          // ignore
        }
      }
      currentSession = null;
      saveSessionToStorage(null);
      notifyListeners("SIGNED_OUT", null);
    },

    onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => { listeners.delete(callback); } } } };
    },
  },

  from(table: string) {
    return {
      select(columns = "*") {
        return {
          eq(col: string, val: string) {
            return {
              maybeSingle() {
                return api<unknown>(`/rest/v1/${table}?select=${columns}&${col}=eq.${val}&limit=1`)
                  .then((data) => {
                    const arr = data as unknown[];
                    return { data: arr.length > 0 ? arr[0] : null };
                  });
              },
            };
          },
        };
      },
      upsert(body: Record<string, unknown>, opts?: { onConflict?: string }) {
        const conflict = opts?.onConflict ? `&on_conflict=${encodeURIComponent(opts.onConflict)}` : "";
        return {
          async run() {
            await api(`/rest/v1/${table}?${conflict}`, {
              method: "POST",
              body: JSON.stringify(body),
              headers: { Prefer: "resolution=merge-duplicates" },
            });
          },
        };
      },
      delete() {
        return {
          eq(col: string, val: string) {
            return {
              eq2(col2: string, val2: string) {
                return {
                  eq3(col3: string, val3: string) {
                    return {
                      eq4(col4: string, val4: string) {
                        return {
                          async run() {
                            await api(`/rest/v1/${table}?${col}=eq.${val}&${col2}=eq.${val2}&${col3}=eq.${val3}&${col4}=eq.${val4}`, {
                              method: "DELETE",
                            });
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    };
  },
};

// Auth state change listener support
const listeners = new Set<(event: string, session: AuthSession | null) => void>();

function notifyListeners(event: string, session: AuthSession | null) {
  for (const cb of listeners) {
    (async () => cb(event, session))();
  }
}

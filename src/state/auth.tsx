import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, setAuthedUserId, setAuthedAccessToken } from "../lib/supabaseClient";

interface AuthResult {
  error: string | null;
}

interface AuthState {
  /** Supabase is configured (URL + anon key present). When false, the app runs
   *  local-first and auth UIs explain that accounts are unavailable. */
  ready: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: (redirectPath?: string) => Promise<AuthResult>;
  continueAsGuest: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function messageFrom(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = supabase();
  const ready = Boolean(client);
  const [loading, setLoading] = useState(ready);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let active = true;
    const apply = (s: Session | null) => {
      setSession(s);
      setAuthedUserId(s?.user?.id ?? null);
      setAuthedAccessToken(s?.access_token ?? null);
    };
    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      apply(data.session);
      setLoading(false);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      apply(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  const api = useMemo<AuthState>(() => {
    const guard = async (run: () => Promise<{ error: unknown }>): Promise<AuthResult> => {
      if (!client) return { error: "Accounts are not configured for this deployment." };
      try {
        const { error } = await run();
        return { error: error ? messageFrom(error) : null };
      } catch (error) {
        return { error: messageFrom(error) };
      }
    };

    return {
      ready,
      loading,
      session,
      user: session?.user ?? null,
      isGuest: session?.user?.is_anonymous === true,
      signUp: (email, password) => guard(() => client!.auth.signUp({ email, password })),
      signIn: (email, password) =>
        guard(() => client!.auth.signInWithPassword({ email, password })),
      signInWithGoogle: (redirectPath = "/app/home") =>
        guard(() =>
          client!.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
            },
          })
        ),
      continueAsGuest: () => guard(() => client!.auth.signInAnonymously()),
      signOut: async () => {
        await client?.auth.signOut();
        setAuthedUserId(null);
        setAuthedAccessToken(null);
      },
    };
  }, [client, ready, loading, session]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

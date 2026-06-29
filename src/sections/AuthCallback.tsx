import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../state/auth";
import { AuthShell } from "../components/auth/AuthScaffold";

/**
 * OAuth return target. `detectSessionInUrl: true` makes supabase-js exchange the
 * code/hash for a session automatically; we just wait for `auth.session` to
 * appear, then forward to the intended path (`?next=`).
 */
export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/app/home";
  const error = params.get("error_description") || params.get("error");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (auth.session) {
      navigate(next, { replace: true });
      return;
    }
    if (!auth.loading) {
      const timer = window.setTimeout(() => setTimedOut(true), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [auth.session, auth.loading, navigate, next]);

  return (
    <AuthShell kicker="Signing you in" title="One moment" subtitle="Finishing your secure sign-in…">
      <div className="grid place-items-center gap-4 py-4 text-center">
        {error || timedOut ? (
          <>
            <p className="text-sm font-bold text-[#ff7d7d]">{error || "Sign-in didn't complete. Please try again."}</p>
            <button onClick={() => navigate("/login", { replace: true })} className="btn-blue">
              Back to log in
            </button>
          </>
        ) : (
          <Loader2 className="animate-spin text-[#1db954]" size={28} />
        )}
      </div>
    </AuthShell>
  );
}
